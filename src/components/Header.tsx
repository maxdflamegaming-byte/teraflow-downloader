import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Moon, Sun, User, Menu, X, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { auth, signInWithGoogle } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion, AnimatePresence } from 'motion/react';
import SettingsModal from './SettingsModal';

const Header: React.FC = () => {
  const { theme } = useTheme();
  const [user] = useAuthState(auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-all"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Download className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">TeraFlow</span>
              <span className="text-[10px] font-mono font-medium tracking-widest text-blue-600 dark:text-blue-400 uppercase leading-none hidden sm:inline">Video Downloader</span>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-8">
          <Link to="/about" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</Link>
          <Link to="/terms" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms</Link>
          <Link to="/privacy" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy</Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <img 
                src={user.photoURL || ''} 
                alt={user.displayName || 'User'} 
                className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700"
                referrerPolicy="no-referrer"
              />
              <span className="hidden sm:inline text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[100px]">
                {user.displayName?.split(' ')[0]}
              </span>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-full text-sm font-medium hover:opacity-90 transition-all active:scale-95"
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-4">
              <button 
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-widest text-left"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
              <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-widest">About</Link>
              <Link to="/terms" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-widest">Terms</Link>
              <Link to="/privacy" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-widest">Privacy</Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
