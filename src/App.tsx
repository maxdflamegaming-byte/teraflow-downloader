import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import axios from 'axios';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Background3D from './components/Background3D';
import Header from './components/Header';
import URLInput from './components/URLInput';
import VideoCard from './components/VideoCard';
import DownloadHistory from './components/DownloadHistory';
import CookieInstructions from './components/CookieInstructions';

import AboutUs from './pages/AboutUs';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

const HomePage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(false);
  const [videoResults, setVideoResults] = useState<any[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(true);

  useEffect(() => {
    const checkCookieStatus = async () => {
      try {
        const res = await axios.get('/api/cookie-status');
        setIsDemoMode(res.data.mode === 'demo');
      } catch (err) {
        console.error('Failed to check cookie status', err);
      }
    };
    checkCookieStatus();
  }, []);

  useEffect(() => {
    if (!user) {
      setDownloads([]);
      return;
    }

    const q = query(
      collection(db, 'downloads'),
      where('uid', '==', user.uid),
      orderBy('downloadedAt', 'desc'),
      limit(6)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDownloads(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'downloads');
    });

    return () => unsubscribe();
  }, [user]);

  const handleDeleteDownload = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'downloads', id));
      toast.success('Download record removed');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'downloads');
    }
  };

  const handleFetchVideo = async (urls: string[]) => {
    setIsLoading(true);
    setVideoResults([]);
    try {
      if (urls.length === 1) {
        const res = await axios.post('/api/fetch-video', { url: urls[0] });
        setVideoResults([{ success: true, data: res.data }]);
        toast.success('Video info fetched successfully');
      } else {
        const res = await axios.post('/api/fetch-video-batch', { urls });
        setVideoResults(res.data.results);
        toast.success(`Batch fetch complete: ${res.data.results.length} videos found`);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch video info';
      const suggestion = err.response?.data?.suggestion;
      toast.error('Failed to fetch video. See details below.');
      if (urls.length === 1) {
        setVideoResults([{ success: false, url: urls[0], error: errorMsg, suggestion }]);
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (video: any, quality: string, format: string, onProgress: (p: number) => void) => {
    const downloadId = Math.random().toString(36).substr(2, 9);
    
    // Start SSE listener
    const eventSource = new EventSource(`/api/download-stream?id=${downloadId}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onProgress(data.progress);
      
      if (data.status === 'completed') {
        eventSource.close();
        toast.success(`Download complete: ${video.title}`);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      toast.error('Download stream interrupted');
    };

    if (!user) {
      toast.error('Please login to save your download history');
      // Still simulate progress for guest
      return;
    }

    try {
      const selectedQualityData = video.available_qualities.find((aq: any) => aq.quality === quality);
      const finalDownloadUrl = selectedQualityData?.downloadUrl || video.download_url;

      await addDoc(collection(db, 'downloads'), {
        videoId: video.video_id,
        title: video.title,
        thumbnail: video.thumbnail,
        size: video.size,
        quality: quality,
        format: format,
        downloadUrl: finalDownloadUrl,
        downloadedAt: serverTimestamp(),
        uid: user.uid
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'downloads');
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 space-y-12 md:space-y-16 relative z-10">
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Download TeraBox Videos <span className="text-blue-600">Instantly</span>
        </h1>
        <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400">
          Fast, secure, and high-quality video downloader for TeraBox. Supports 1080p Full HD.
        </p>
      </section>

      <URLInput onFetch={handleFetchVideo} isLoading={isLoading} />
      
      {isDemoMode && <CookieInstructions />}

      <div className="space-y-8">
        {videoResults.map((result, idx) => (
          result.success ? (
            <VideoCard 
              key={result.data.video_id + idx}
              video={{
                videoId: result.data.video_id,
                title: result.data.title,
                thumbnail: result.data.thumbnail,
                size: result.data.size,
                previewUrl: result.data.preview_url,
                availableQualities: result.data.available_qualities.map((q: any) => ({
                  quality: q.quality,
                  resolution: q.resolution,
                  fileSize: q.fileSize,
                  downloadUrl: q.downloadUrl
                })),
                availableFormats: result.data.available_formats
              }} 
              onDownload={(q, f, p) => handleDownload(result.data, q, f, p)} 
            />
          ) : (
            <div key={idx} className="w-full max-w-4xl mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 space-y-2">
              <p className="font-bold text-sm">Failed to fetch video: {result.url}</p>
              {result.error && <p className="text-sm opacity-90">{result.error}</p>}
              {result.suggestion && (
                <p className="text-xs bg-red-500/10 p-2.5 rounded-xl border border-red-500/20 mt-2 font-medium">
                  💡 {result.suggestion}
                </p>
              )}
            </div>
          )
        ))}
      </div>

      <DownloadHistory downloads={downloads} onDelete={handleDeleteDownload} />
    </main>
  );
};

const AppContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Background3D theme={theme} />
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </div>
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            &copy; 2026 TeraFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="/about" className="text-sm text-zinc-500 hover:text-blue-600 transition-colors">About</a>
            <a href="/terms" className="text-sm text-zinc-500 hover:text-blue-600 transition-colors">Terms</a>
            <a href="/privacy" className="text-sm text-zinc-500 hover:text-blue-600 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
      <Toaster position="top-center" richColors />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}
