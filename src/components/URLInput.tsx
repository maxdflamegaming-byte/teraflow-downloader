import React, { useState, useRef } from 'react';
import { Link as LinkIcon, Clipboard, ArrowRight, Info, Layers, FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface URLInputProps {
  onFetch: (urls: string[]) => void;
  isLoading: boolean;
}

const URLInput: React.FC<URLInputProps> = ({ onFetch, isLoading }) => {
  const [url, setUrl] = useState('');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (isBatchMode) {
        setUrl(prev => prev ? `${prev}\n${text}` : text);
      } else {
        setUrl(text);
      }
      toast.success('URL pasted from clipboard');
    } catch (err) {
      toast.error('Failed to read clipboard');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setUrl(content);
      setIsBatchMode(true);
      toast.success('URLs loaded from file');
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Please enter TeraBox URL(s)');
      return;
    }

    const teraboxDomains = ['terabox.com', 'teraboxapp.com', '1024tera.com', 'terabox.app', 'dubox.com'];
    const urls = url.split('\n')
      .map(u => u.trim())
      .filter(u => u)
      .map(u => {
        // If it looks like a share ID (alphanumeric, no dots, long enough), wrap it in a URL
        if (!u.includes('.') && u.length >= 10 && !u.includes('/')) {
          return `https://www.terabox.com/s/${u}`;
        }
        return u;
      })
      .filter(u => teraboxDomains.some(domain => u.includes(domain)));

    if (urls.length === 0) {
      toast.error('No valid TeraBox URLs or IDs found. Please check your input.');
      return;
    }

    onFetch(urls);
  };

  const detectedCount = url.split('\n').filter(u => u.trim()).length;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => setIsBatchMode(false)}
            className={`text-xs font-bold uppercase tracking-widest transition-colors ${!isBatchMode ? 'text-blue-600' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            Single Link / ID
          </button>
          <button 
            type="button"
            onClick={() => setIsBatchMode(true)}
            className={`text-xs font-bold uppercase tracking-widest transition-colors ${isBatchMode ? 'text-blue-600' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            Batch Mode
          </button>
        </div>
        <div className="flex items-center gap-4">
          {url && (
            <button 
              type="button"
              onClick={() => setUrl('')}
              className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest"
            >
              Clear
            </button>
          )}
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload TXT</span>
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept=".txt" 
          className="hidden" 
        />
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        {isBatchMode && detectedCount > 0 && (
          <div className="absolute -top-6 right-2 text-[10px] font-mono font-bold text-blue-500 uppercase tracking-widest animate-pulse">
            {detectedCount} {detectedCount === 1 ? 'Item' : 'Items'} Detected
          </div>
        )}

        <div className={`absolute ${isBatchMode ? 'top-4' : 'inset-y-0'} left-0 pl-4 flex items-center pointer-events-none`}>
          {isBatchMode ? <Layers className="w-5 h-5 text-zinc-400" /> : <LinkIcon className="w-5 h-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />}
        </div>
        
        {isBatchMode ? (
          <textarea
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste multiple TeraBox links or IDs here (one per line)..."
            className="w-full h-40 pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-zinc-200/20 dark:shadow-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-zinc-900 dark:text-zinc-50 resize-none font-mono text-sm"
          />
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste TeraBox link or ID here..."
                className="w-full h-14 pl-12 pr-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-zinc-200/20 dark:shadow-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-zinc-900 dark:text-zinc-50"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <button
                  type="button"
                  onClick={handlePaste}
                  className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-5 h-5" />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Get Video</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {isBatchMode && (
          <div className="absolute bottom-4 right-4">
            <button
              type="submit"
              disabled={isLoading}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Fetch All</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {isBatchMode && (
        <div className="flex items-center gap-2 px-4 py-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          <span>Batch mode: Enter one TeraBox link or ID per line. Supports all TeraBox domains.</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 px-2">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Info className="w-3.5 h-3.5" />
          <span>Supports 1080p, 720p, 480p & 360p</span>
        </div>
      </div>
    </div>
  );
};

export default URLInput;

