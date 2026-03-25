import React from 'react';
import { Shield, Zap, Download, Users, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const AboutUs: React.FC = () => {
  const features = [
    { icon: <Zap className="w-6 h-6 text-blue-500" />, title: "Lightning Fast", description: "Get your TeraBox videos in seconds with our optimized fetching engine." },
    { icon: <Shield className="w-6 h-6 text-emerald-500" />, title: "Secure & Private", description: "We don't store your personal data or TeraBox credentials on our servers." },
    { icon: <Download className="w-6 h-6 text-purple-500" />, title: "100% Free", description: "No hidden costs, no subscriptions. TeraFlow is and will always be free." },
    { icon: <Users className="w-6 h-6 text-cyan-500" />, title: "User Friendly", description: "Simple, clean, and intuitive interface designed for everyone." }
  ];

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 space-y-24">
      <section className="max-w-4xl mx-auto text-center space-y-6">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Our Mission
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed"
        >
          TeraFlow was built to solve a simple problem: the difficulty of downloading your own content from TeraBox. We believe in a free and open internet where users have full control over their digital assets.
        </motion.p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl shadow-zinc-200/20 dark:shadow-none space-y-4"
          >
            <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex items-center justify-center">
              {f.icon}
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{f.title}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </section>

      <section className="max-w-4xl mx-auto bg-blue-600 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex-1 space-y-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
          <div className="space-y-4">
            {[
              "Paste your TeraBox share link into the input field.",
              "Select your preferred video quality and format.",
              "Click download and save the video to your device."
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0 text-sm font-bold">
                  {i + 1}
                </div>
                <p className="text-blue-50 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full md:w-1/3 aspect-square bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center relative z-10">
          <Download className="w-24 h-24 text-white animate-bounce" />
        </div>
      </section>

      <section className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Contact Information</h2>
        <div className="p-8 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl inline-flex flex-col items-center gap-4">
          <p className="text-zinc-600 dark:text-zinc-400">Have questions or feedback? Reach out to us at:</p>
          <a href="mailto:support@teraflow.com" className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:underline">support@teraflow.com</a>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
