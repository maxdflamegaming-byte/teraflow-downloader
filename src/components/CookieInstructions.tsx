import React, { useState } from 'react';
import { ChevronDown, Cookie, Info, ShieldAlert, Key, Globe, Layout, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CookieInstructions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    { icon: <Globe className="w-4 h-4" />, text: "Open terabox.com and login to your account" },
    { icon: <Layout className="w-4 h-4" />, text: "Press F12 (or Right Click -> Inspect) to open DevTools" },
    { icon: <Key className="w-4 h-4" />, text: "Go to 'Application' tab -> 'Cookies' -> 'https://www.terabox.com'" },
    { icon: <Cookie className="w-4 h-4" />, text: "Find the cookie named 'ndus' and copy its value" },
    { icon: <RefreshCw className="w-4 h-4" />, text: "Go to Settings -> Secrets in AI Studio and add TERABOX_COOKIE" }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-zinc-200/20 dark:shadow-none overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">How to get TeraBox Cookie?</span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Real Download Mode Setup</span>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                    <div className="w-6 h-6 shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md flex items-center justify-center text-zinc-600 dark:text-zinc-400 text-[10px] font-bold">
                      {i + 1}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {step.icon}
                      <span>{step.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Privacy Warning</p>
                  <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                    The 'ndus' cookie contains your session information. Never share it with anyone. TeraFlow uses it only to fetch direct download links from TeraBox on your behalf.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CookieInstructions;
