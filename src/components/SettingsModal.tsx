import React from 'react';
import { X, Moon, Sun, Monitor, Bell, Shield, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 dark:text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Appearance Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Appearance</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
                      {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Dark Mode</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Toggle between light and dark themes</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={toggleTheme}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                      theme === 'dark' ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                        theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </section>

              {/* Other Settings (Placeholders) */}
              <section className="space-y-4 opacity-50">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  <Globe className="w-3.5 h-3.5" />
                  <span>General</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Notifications</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Off</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Privacy Mode</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Standard</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-medium">
                TeraFlow v1.2.0 &bull; Built with ❤️ for TeraBox Users
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
