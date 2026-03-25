import React from 'react';
import { Clock, Download, FileVideo, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react';

interface DownloadRecord {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  size: string;
  quality: string;
  format?: string;
  downloadUrl?: string;
  downloadedAt: any;
}

interface DownloadHistoryProps {
  downloads: DownloadRecord[];
  onDelete?: (id: string) => void;
}

const DownloadHistory: React.FC<DownloadHistoryProps> = ({ downloads, onDelete }) => {
  const handleRedownload = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (downloads.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
        <Clock className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm font-medium">No recent downloads found</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <span>Recent Downloads</span>
        </h3>
        <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
          {downloads.length} Records
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {downloads.map((d, index) => (
          <motion.div 
            key={d.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-lg shadow-zinc-200/20 dark:shadow-none hover:border-blue-500/50 transition-all hover:-translate-y-1"
          >
            <div className="aspect-video relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <img 
                src={d.thumbnail} 
                alt={d.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute bottom-2 right-2 flex gap-1">
                <div className="px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-mono font-bold text-white uppercase tracking-wider border border-white/10">
                  {d.quality}
                </div>
                {d.format && (
                  <div className="px-1.5 py-0.5 bg-blue-600/80 backdrop-blur-md rounded text-[9px] font-mono font-bold text-white uppercase tracking-wider border border-white/10">
                    {d.format}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {d.title}
                </h4>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  <span>{d.size}</span>
                  <span>{d.downloadedAt?.toDate ? formatDistanceToNow(d.downloadedAt.toDate(), { addSuffix: true }) : 'Just now'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleRedownload(d.downloadUrl)}
                  className="flex-1 h-8 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Redownload</span>
                </button>
                {onDelete && (
                  <button 
                    onClick={() => onDelete(d.id)}
                    className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DownloadHistory;
