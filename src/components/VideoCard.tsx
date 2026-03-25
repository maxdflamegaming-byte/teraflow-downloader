import React, { useState } from 'react';
import { Download, FileVideo, ChevronDown, Check, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QualityOption {
  quality: string;
  resolution: string;
  fileSize: string;
  downloadUrl: string;
}

interface VideoInfo {
  videoId: string;
  title: string;
  thumbnail: string;
  size: string;
  previewUrl?: string;
  availableQualities: QualityOption[];
  availableFormats: string[];
}

interface VideoCardProps {
  video: VideoInfo;
  onDownload: (quality: string, format: string, onProgress: (p: number) => void) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {
  const [selectedQuality, setSelectedQuality] = useState(video.availableQualities[0]);
  const [selectedFormat, setSelectedFormat] = useState(video.availableFormats[0]);
  const [isQualityOpen, setIsQualityOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleDownloadClick = () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    onDownload(selectedQuality.quality, selectedFormat, (p) => {
      setDownloadProgress(p);
      if (p >= 100) {
        setTimeout(() => {
          setIsDownloading(false);
          setDownloadProgress(null);
        }, 2000);
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl shadow-zinc-200/40 dark:shadow-none overflow-hidden"
    >
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-2/5 aspect-video md:aspect-auto bg-zinc-100 dark:bg-zinc-800 relative group overflow-hidden">
          {isPreviewOpen && video.previewUrl ? (
            <div className="absolute inset-0 z-20 bg-black">
              <video
                src={video.previewUrl}
                className="w-full h-full"
                controls
                autoPlay
              />
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all z-30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <button 
                  onClick={() => setIsPreviewOpen(true)}
                  className="w-16 h-16 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 transition-all transform hover:scale-110 active:scale-95"
                >
                  <Play className="w-8 h-8 fill-current" />
                </button>
              </div>
            </>
          )}
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-mono font-bold text-white uppercase tracking-wider border border-white/10">
            {video.size}
          </div>
          {video.previewUrl && !isPreviewOpen && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600/80 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-widest border border-blue-400/30">
              Preview Available
            </div>
          )}
        </div>

        <div className="flex-1 p-5 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg md:text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight line-clamp-2">
              {video.title}
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
              <span>ID: {video.videoId}</span>
              <span className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full"></span>
              <span>MP4 / MKV / AVI</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 block">Quality</label>
              <button 
                disabled={isDownloading}
                onClick={() => setIsQualityOpen(!isQualityOpen)}
                className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between hover:border-blue-500 transition-colors disabled:opacity-50"
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{selectedQuality.quality}</span>
                  <span className="text-[10px] font-mono text-zinc-500">{selectedQuality.fileSize}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isQualityOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isQualityOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-10 top-full left-0 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
                  >
                    {video.availableQualities.map((q) => (
                      <button 
                        key={q.quality}
                        onClick={() => {
                          setSelectedQuality(q);
                          setIsQualityOpen(false);
                        }}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{q.quality}</span>
                          <span className="text-[10px] font-mono text-zinc-500">{q.fileSize}</span>
                        </div>
                        {selectedQuality.quality === q.quality && <Check className="w-4 h-4 text-blue-500" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 block">Format</label>
              <div className="flex h-12 p-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                {video.availableFormats.map((f) => (
                  <button 
                    key={f}
                    disabled={isDownloading}
                    onClick={() => setSelectedFormat(f)}
                    className={`flex-1 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                      selectedFormat === f 
                        ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200 dark:border-zinc-700' 
                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleDownloadClick}
              disabled={isDownloading}
              className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${
                isDownloading 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
              }`}
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-zinc-300 border-t-emerald-500 rounded-full animate-spin" />
                  <span>Downloading... {downloadProgress}%</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Download {selectedQuality.quality} {selectedFormat}</span>
                </>
              )}
            </button>

            {isDownloading && downloadProgress !== null && (
              <div className="space-y-2">
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${downloadProgress}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  <span>Progress</span>
                  <span>{downloadProgress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCard;
