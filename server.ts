import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "TeraFlow API active" });
  });

  app.get("/api/cookie-status", (req, res) => {
    const cookieSet = !!process.env.TERABOX_COOKIE;
    res.json({
      cookie_set: cookieSet,
      mode: cookieSet ? "real" : "demo",
      instructions: "To get your TeraBox cookie, follow the instructions in the UI."
    });
  });

  app.post("/api/fetch-video", async (req, res) => {
    const { url } = req.body;
    
    const cookie = process.env.TERABOX_COOKIE;
    const isDemo = !cookie;
    
    if (isDemo) {
      // Return demo data
      return res.json({
        video_id: "demo_12345",
        title: "Sample TeraBox Video - Nature Documentary",
        thumbnail: "https://picsum.photos/seed/nature/800/450",
        size: "125.5 MB",
        download_url: "https://example.com/download",
        preview_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        quality: "1080p",
        available_qualities: [
          { quality: "1080p", resolution: "1920x1080", fileSize: "125.5 MB", downloadUrl: "https://example.com/1080p" },
          { quality: "720p", resolution: "1280x720", fileSize: "75.2 MB", downloadUrl: "https://example.com/720p" },
          { quality: "480p", resolution: "854x480", fileSize: "42.8 MB", downloadUrl: "https://example.com/480p" },
          { quality: "360p", resolution: "640x360", fileSize: "25.1 MB", downloadUrl: "https://example.com/360p" }
        ],
        available_formats: ["MP4", "MKV", "AVI"]
      });
    }

    try {
      // Real logic: Extract shorturl from TeraBox link
      const urlObj = new URL(url);
      let shorturl = "";
      
      // Handle different TeraBox URL formats
      if (url.includes("/s/")) {
        shorturl = url.split("/s/")[1].split("?")[0];
      } else if (urlObj.searchParams.has("surl")) {
        shorturl = urlObj.searchParams.get("surl") || "";
      }

      if (!shorturl) {
        return res.status(400).json({ error: "Invalid TeraBox URL format" });
      }

      // Fetch info from TeraBox API
      const response = await axios.get(`https://www.terabox.com/api/shorturlinfo?shorturl=${shorturl}&root=1`, {
        headers: {
          'Cookie': `ndus=${cookie}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      const data = response.data;
      if (data.errno !== 0) {
        return res.status(400).json({ error: `TeraBox API Error: ${data.errno}`, details: data });
      }

      const fileList = data.list || [];
      const videoFile = fileList.find((f: any) => f.category === 1 || f.category === "1"); // 1 is usually video

      if (!videoFile) {
        return res.status(404).json({ error: "No video file found in this link" });
      }

      // Construct response
      res.json({
        video_id: videoFile.fs_id,
        title: videoFile.server_filename,
        thumbnail: videoFile.thumbs?.url3 || videoFile.thumbs?.url2 || videoFile.thumbs?.url1 || "https://picsum.photos/seed/video/800/450",
        size: `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB`,
        download_url: videoFile.dlink,
        preview_url: videoFile.dlink, // In a real app, you might need a separate preview link
        quality: "Original",
        available_qualities: [
          { 
            quality: "Original", 
            resolution: "Auto", 
            fileSize: `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB`, 
            downloadUrl: videoFile.dlink 
          }
        ],
        available_formats: [videoFile.server_filename.split('.').pop()?.toUpperCase() || "MP4"]
      });
    } catch (error: any) {
      console.error("TeraBox Fetch Error:", error.message);
      res.status(500).json({ error: "Failed to fetch video from TeraBox", details: error.message });
    }
  });

  app.post("/api/fetch-video-batch", async (req, res) => {
    const { urls } = req.body;
    
    if (!Array.isArray(urls)) {
      return res.status(400).json({ error: "URLs must be an array" });
    }

    const cookie = process.env.TERABOX_COOKIE;
    const isDemo = !cookie;
    
    // Simulate network delay for batch processing
    const results = await Promise.all(urls.map(async (url, index) => {
      try {
        if (isDemo) {
          // Small artificial delay for each item
          await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
          return {
            url,
            success: true,
            data: {
              video_id: `demo_${index}_${Math.random().toString(36).substr(2, 5)}`,
              title: `Batch Video ${index + 1} - ${url.split('/').pop() || 'Untitled'}`,
              thumbnail: `https://picsum.photos/seed/batch${index}/800/450`,
              size: `${(Math.random() * 500 + 50).toFixed(1)} MB`,
              download_url: "https://example.com/download",
              preview_url: index % 2 === 0 
                ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
              quality: "1080p",
              available_qualities: [
                { quality: "1080p", resolution: "1920x1080", fileSize: "125.5 MB", downloadUrl: "https://example.com/1080p" },
                { quality: "720p", resolution: "1280x720", fileSize: "75.2 MB", downloadUrl: "https://example.com/720p" }
              ],
              available_formats: ["MP4", "MKV"]
            }
          };
        }

        // Real logic: Extract shorturl from TeraBox link
        const urlObj = new URL(url);
        let shorturl = "";
        
        if (url.includes("/s/")) {
          shorturl = url.split("/s/")[1].split("?")[0];
        } else if (urlObj.searchParams.has("surl")) {
          shorturl = urlObj.searchParams.get("surl") || "";
        }

        if (!shorturl) {
          return { url, success: false, error: "Invalid TeraBox URL format" };
        }

        // Fetch info from TeraBox API
        const response = await axios.get(`https://www.terabox.com/api/shorturlinfo?shorturl=${shorturl}&root=1`, {
          headers: {
            'Cookie': `ndus=${cookie}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        const data = response.data;
        if (data.errno !== 0) {
          return { url, success: false, error: `TeraBox API Error: ${data.errno}` };
        }

        const fileList = data.list || [];
        const videoFile = fileList.find((f: any) => f.category === 1 || f.category === "1");

        if (!videoFile) {
          return { url, success: false, error: "No video file found" };
        }

        return {
          url,
          success: true,
          data: {
            video_id: videoFile.fs_id,
            title: videoFile.server_filename,
            thumbnail: videoFile.thumbs?.url3 || videoFile.thumbs?.url2 || videoFile.thumbs?.url1 || "https://picsum.photos/seed/video/800/450",
            size: `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB`,
            download_url: videoFile.dlink,
            preview_url: videoFile.dlink,
            quality: "Original",
            available_qualities: [
              { 
                quality: "Original", 
                resolution: "Auto", 
                fileSize: `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB`, 
                downloadUrl: videoFile.dlink 
              }
            ],
            available_formats: [videoFile.server_filename.split('.').pop()?.toUpperCase() || "MP4"]
          }
        };
      } catch (error: any) {
        return { url, success: false, error: error.message };
      }
    }));

    res.json({ results });
  });

  // Store active download simulations
  const activeDownloads = new Map<string, number>();

  app.get("/api/download-stream", (req, res) => {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).send("Missing download ID");
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        res.write(`data: ${JSON.stringify({ progress: 100, status: 'completed' })}\n\n`);
        clearInterval(interval);
        activeDownloads.delete(id);
        res.end();
      } else {
        res.write(`data: ${JSON.stringify({ progress: Math.floor(progress), status: 'downloading' })}\n\n`);
        activeDownloads.set(id, progress);
      }
    }, 800);

    req.on('close', () => {
      clearInterval(interval);
      activeDownloads.delete(id);
    });
  });

  // Vite middleware for development
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
  });
}

startServer();
