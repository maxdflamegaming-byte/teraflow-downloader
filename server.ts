import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";

// ============================================================
// COOKIE POOL SYSTEM
// Reads cookies from env vars: TERABOX_COOKIE, TERABOX_COOKIE_1, TERABOX_COOKIE_2, etc.
// Auto-rotates on failure, tracks health per cookie.
// ============================================================

interface CookieEntry {
  value: string;
  label: string;
  failCount: number;
  lastFailTime: number;
  lastSuccessTime: number;
  isDisabled: boolean;
}

class CookiePool {
  private cookies: CookieEntry[] = [];
  private currentIndex: number = 0;

  constructor() {
    this.loadCookies();
  }

  private loadCookies() {
    const envCookies: { label: string; value: string }[] = [];

    // Read TERABOX_COOKIE (primary)
    if (process.env.TERABOX_COOKIE) {
      envCookies.push({ label: "TERABOX_COOKIE", value: process.env.TERABOX_COOKIE });
    }

    // Read TERABOX_COOKIE_1, TERABOX_COOKIE_2, ... TERABOX_COOKIE_20
    for (let i = 1; i <= 20; i++) {
      const key = `TERABOX_COOKIE_${i}`;
      const val = process.env[key];
      if (val) {
        envCookies.push({ label: key, value: val });
      }
    }

    this.cookies = envCookies.map((c) => ({
      value: c.value,
      label: c.label,
      failCount: 0,
      lastFailTime: 0,
      lastSuccessTime: 0,
      isDisabled: false,
    }));

    console.log(`[CookiePool] Loaded ${this.cookies.length} cookie(s): ${this.cookies.map(c => c.label).join(", ")}`);
  }

  get size(): number {
    return this.cookies.length;
  }

  get hasActiveCookies(): boolean {
    return this.cookies.some((c) => !c.isDisabled);
  }

  get activeCookieCount(): number {
    return this.cookies.filter((c) => !c.isDisabled).length;
  }

  get isDemo(): boolean {
    return this.cookies.length === 0;
  }

  /** Get the next available cookie, skipping disabled ones */
  getNext(): CookieEntry | null {
    if (this.cookies.length === 0) return null;

    // Re-enable cookies that have been disabled for > 10 minutes (auto-recovery)
    const TEN_MINUTES = 10 * 60 * 1000;
    for (const cookie of this.cookies) {
      if (cookie.isDisabled && Date.now() - cookie.lastFailTime > TEN_MINUTES) {
        console.log(`[CookiePool] Re-enabling ${cookie.label} after cooldown`);
        cookie.isDisabled = false;
        cookie.failCount = 0;
      }
    }

    // Try to find an active cookie starting from current index
    for (let i = 0; i < this.cookies.length; i++) {
      const idx = (this.currentIndex + i) % this.cookies.length;
      if (!this.cookies[idx].isDisabled) {
        this.currentIndex = (idx + 1) % this.cookies.length;
        return this.cookies[idx];
      }
    }

    return null; // All cookies disabled
  }

  /** Mark a cookie as successful */
  markSuccess(cookie: CookieEntry) {
    cookie.failCount = 0;
    cookie.lastSuccessTime = Date.now();
    console.log(`[CookiePool] ✅ ${cookie.label} succeeded`);
  }

  /** Mark a cookie as failed — disable after 3 consecutive failures */
  markFailed(cookie: CookieEntry, reason: string) {
    cookie.failCount++;
    cookie.lastFailTime = Date.now();
    console.log(`[CookiePool] ❌ ${cookie.label} failed (${cookie.failCount}/3): ${reason}`);

    if (cookie.failCount >= 3) {
      cookie.isDisabled = true;
      console.log(`[CookiePool] 🚫 ${cookie.label} disabled after 3 failures. Will retry in 10 min.`);
    }
  }

  /** Get pool health status */
  getStatus() {
    return {
      total: this.cookies.length,
      active: this.activeCookieCount,
      disabled: this.cookies.length - this.activeCookieCount,
      cookies: this.cookies.map((c) => ({
        label: c.label,
        active: !c.isDisabled,
        failCount: c.failCount,
        lastSuccess: c.lastSuccessTime ? new Date(c.lastSuccessTime).toISOString() : null,
        lastFail: c.lastFailTime ? new Date(c.lastFailTime).toISOString() : null,
      })),
    };
  }
}

// ============================================================
// TERABOX API HELPER — with retry across cookie pool
// ============================================================

const RETRYABLE_ERRORS = [400210, 400211, -6, -9]; // verify_v2, session expired, etc.

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function extractShorturl(url: string): string {
  try {
    const urlObj = new URL(url);
    if (url.includes("/s/")) {
      return url.split("/s/")[1].split("?")[0];
    } else if (urlObj.searchParams.has("surl")) {
      return urlObj.searchParams.get("surl") || "";
    }
  } catch {}
  return "";
}

function buildVideoResponse(videoFile: any) {
  return {
    video_id: videoFile.fs_id,
    title: videoFile.server_filename,
    thumbnail:
      videoFile.thumbs?.url3 ||
      videoFile.thumbs?.url2 ||
      videoFile.thumbs?.url1 ||
      "https://picsum.photos/seed/video/800/450",
    size: `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB`,
    download_url: videoFile.dlink,
    preview_url: videoFile.dlink,
    quality: "Original",
    available_qualities: [
      {
        quality: "Original",
        resolution: "Auto",
        fileSize: `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB`,
        downloadUrl: videoFile.dlink,
      },
    ],
    available_formats: [
      videoFile.server_filename.split(".").pop()?.toUpperCase() || "MP4",
    ],
  };
}

interface FetchResult {
  success: boolean;
  data?: any;
  error?: string;
  errorCode?: string;
}

async function fetchFromTeraBox(
  shorturl: string,
  cookiePool: CookiePool
): Promise<FetchResult> {
  
  const maxRetries = Math.min(cookiePool.size, 5); // Try up to 5 cookies

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const cookie = cookiePool.getNext();
    if (!cookie) {
      return {
        success: false,
        error: "All cookies are currently expired or disabled. Please update your TeraBox cookies.",
        errorCode: "ALL_COOKIES_EXHAUSTED",
      };
    }

    try {
      const targetUrl = `https://www.terabox.com/api/shorturlinfo?shorturl=${shorturl}&root=1`;
      const requestUrl = process.env.SCRAPERAPI_KEY
        ? `http://api.scraperapi.com?api_key=${process.env.SCRAPERAPI_KEY}&url=${encodeURIComponent(targetUrl)}&keep_headers=true`
        : targetUrl;

      console.log(`[TeraBox] Attempt ${attempt + 1}/${maxRetries} using ${cookie.label}`);

      const response = await axios.get(requestUrl, {
        headers: {
          Cookie: cookie.value.includes('=') ? cookie.value : `ndus=${cookie.value}`,
          "User-Agent": getRandomUserAgent(),
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: "https://www.terabox.com/",
        },
        timeout: 30000,
      });

      const data = response.data;

      // Check for retryable errors
      if (data.errno !== 0) {
        if (RETRYABLE_ERRORS.includes(data.errno)) {
          cookiePool.markFailed(cookie, `errno ${data.errno}: ${data.errmsg || "verification required"}`);
          continue; // Try next cookie
        }
        // Non-retryable error (bad URL, etc)
        return {
          success: false,
          error: `TeraBox error: ${data.errmsg || `Code ${data.errno}`}`,
          errorCode: `TERABOX_${data.errno}`,
        };
      }

      // Success!
      cookiePool.markSuccess(cookie);

      const fileList = data.list || [];
      // Try to find video first, fall back to any file
      const videoFile =
        fileList.find((f: any) => f.category === 1 || f.category === "1") ||
        fileList[0];

      if (!videoFile) {
        return {
          success: false,
          error: "No downloadable file found in this link",
          errorCode: "NO_FILE",
        };
      }

      return { success: true, data: buildVideoResponse(videoFile) };
    } catch (error: any) {
      const statusCode = error.response?.status;
      // If it's a network/proxy error, might be worth retrying with another cookie
      if (statusCode === 403 || statusCode === 429 || !statusCode) {
        cookiePool.markFailed(cookie, `HTTP ${statusCode || "NETWORK_ERROR"}: ${error.message}`);
        continue;
      }
      // Other errors, don't retry
      return {
        success: false,
        error: `Request failed: ${error.message}`,
        errorCode: "REQUEST_FAILED",
      };
    }
  }

  return {
    success: false,
    error: "Failed after trying all available cookies. Sessions may have expired.",
    errorCode: "ALL_RETRIES_FAILED",
  };
}

// ============================================================
// DEMO DATA
// ============================================================

function getDemoData() {
  return {
    video_id: "demo_12345",
    title: "Sample TeraBox Video - Nature Documentary",
    thumbnail: "https://picsum.photos/seed/nature/800/450",
    size: "125.5 MB",
    download_url: "https://example.com/download",
    preview_url:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    quality: "1080p",
    available_qualities: [
      { quality: "1080p", resolution: "1920x1080", fileSize: "125.5 MB", downloadUrl: "https://example.com/1080p" },
      { quality: "720p", resolution: "1280x720", fileSize: "75.2 MB", downloadUrl: "https://example.com/720p" },
      { quality: "480p", resolution: "854x480", fileSize: "42.8 MB", downloadUrl: "https://example.com/480p" },
      { quality: "360p", resolution: "640x360", fileSize: "25.1 MB", downloadUrl: "https://example.com/360p" },
    ],
    available_formats: ["MP4", "MKV", "AVI"],
  };
}

function getBatchDemoData(url: string, index: number) {
  return {
    video_id: `demo_${index}_${Math.random().toString(36).substr(2, 5)}`,
    title: `Batch Video ${index + 1} - ${url.split("/").pop() || "Untitled"}`,
    thumbnail: `https://picsum.photos/seed/batch${index}/800/450`,
    size: `${(Math.random() * 500 + 50).toFixed(1)} MB`,
    download_url: "https://example.com/download",
    preview_url:
      index % 2 === 0
        ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    quality: "1080p",
    available_qualities: [
      { quality: "1080p", resolution: "1920x1080", fileSize: "125.5 MB", downloadUrl: "https://example.com/1080p" },
      { quality: "720p", resolution: "1280x720", fileSize: "75.2 MB", downloadUrl: "https://example.com/720p" },
    ],
    available_formats: ["MP4", "MKV"],
  };
}

// ============================================================
// EXPRESS SERVER
// ============================================================

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const cookiePool = new CookiePool();

  app.use(express.json());

  // -- Health Check --
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      message: "TeraFlow API active",
      cookiePool: {
        total: cookiePool.size,
        active: cookiePool.activeCookieCount,
        mode: cookiePool.isDemo ? "demo" : "live",
      },
    });
  });

  // -- Cookie Status --
  app.get("/api/cookie-status", (req, res) => {
    const mode = cookiePool.isDemo ? "demo" : cookiePool.hasActiveCookies ? "real" : "degraded";
    res.json({
      cookie_set: !cookiePool.isDemo,
      mode,
      pool_size: cookiePool.size,
      active_cookies: cookiePool.activeCookieCount,
      instructions: "To get your TeraBox cookie, follow the instructions in the UI.",
    });
  });

  // -- Cookie Pool Status (admin endpoint) --
  app.get("/api/pool-status", (req, res) => {
    res.json(cookiePool.getStatus());
  });

  // -- Fetch Single Video --
  app.post("/api/fetch-video", async (req, res) => {
    const { url } = req.body;

    if (cookiePool.isDemo) {
      return res.json(getDemoData());
    }

    const shorturl = extractShorturl(url);
    if (!shorturl) {
      return res.status(400).json({
        error: "Invalid TeraBox URL format",
        errorCode: "INVALID_URL",
        suggestion: "Make sure you paste a valid TeraBox share link (e.g., https://teraboxapp.com/s/...)",
      });
    }

    const result = await fetchFromTeraBox(shorturl, cookiePool);

    if (result.success) {
      return res.json(result.data);
    } else {
      const statusCode = result.errorCode === "ALL_COOKIES_EXHAUSTED" || result.errorCode === "ALL_RETRIES_FAILED" ? 503 : 400;
      return res.status(statusCode).json({
        error: result.error,
        errorCode: result.errorCode,
        suggestion: getSuggestion(result.errorCode),
      });
    }
  });

  // -- Fetch Batch Videos --
  app.post("/api/fetch-video-batch", async (req, res) => {
    const { urls } = req.body;

    if (!Array.isArray(urls)) {
      return res.status(400).json({ error: "URLs must be an array" });
    }

    if (cookiePool.isDemo) {
      const results = await Promise.all(
        urls.map(async (url, index) => {
          await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));
          return { url, success: true, data: getBatchDemoData(url, index) };
        })
      );
      return res.json({ results });
    }

    // Process in series (to avoid hammering all cookies at once)
    const results = [];
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const shorturl = extractShorturl(url);

      if (!shorturl) {
        results.push({ url, success: false, error: "Invalid TeraBox URL format" });
        continue;
      }

      const result = await fetchFromTeraBox(shorturl, cookiePool);
      if (result.success) {
        results.push({ url, success: true, data: result.data });
      } else {
        results.push({ url, success: false, error: result.error });
      }

      // Small delay between requests to avoid rate limiting
      if (i < urls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));
      }
    }

    res.json({ results });
  });

  // -- Download Stream (SSE progress) --
  const activeDownloads = new Map<string, number>();

  app.get("/api/download-stream", (req, res) => {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).send("Missing download ID");
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        res.write(`data: ${JSON.stringify({ progress: 100, status: "completed" })}\n\n`);
        clearInterval(interval);
        activeDownloads.delete(id);
        res.end();
      } else {
        res.write(`data: ${JSON.stringify({ progress: Math.floor(progress), status: "downloading" })}\n\n`);
        activeDownloads.set(id, progress);
      }
    }, 800);

    req.on("close", () => {
      clearInterval(interval);
      activeDownloads.delete(id);
    });
  });

  // -- Vite / Static Serving --
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Cookie Pool: ${cookiePool.size} cookie(s), ${cookiePool.activeCookieCount} active`);
  });
}

// -- Helper: User-friendly suggestions based on error codes --
function getSuggestion(errorCode?: string): string {
  switch (errorCode) {
    case "ALL_COOKIES_EXHAUSTED":
    case "ALL_RETRIES_FAILED":
      return "All session cookies have expired. The admin needs to update the TeraBox cookies.";
    case "NO_FILE":
      return "The link might be expired, or the file was removed by its owner.";
    case "INVALID_URL":
      return "Make sure you paste a valid TeraBox share link (e.g., https://teraboxapp.com/s/...)";
    default:
      return "Try again in a few moments. If the issue persists, the link may be invalid.";
  }
}

startServer();
