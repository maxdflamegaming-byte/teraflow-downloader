import React from 'react';
import { motion } from 'motion/react';

const Terms: React.FC = () => {
  const sections = [
    { title: "Acceptance of Terms", content: "By accessing and using TeraFlow, you agree to comply with and be bound by these Terms and Conditions. If you do not agree, please refrain from using our services." },
    { title: "Use of Service", content: "TeraFlow is provided for personal, non-commercial use only. You are responsible for ensuring that your use of the service complies with all applicable laws and regulations." },
    { title: "Intellectual Property", content: "All content and software provided by TeraFlow are the property of TeraFlow or its licensors and are protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express permission." },
    { title: "Disclaimer of Warranties", content: "TeraFlow is provided 'as is' without any warranties, express or implied. We do not guarantee that the service will be uninterrupted, error-free, or secure." },
    { title: "Limitation of Liability", content: "In no event shall TeraFlow be liable for any direct, indirect, incidental, or consequential damages arising out of your use of the service." },
    { title: "User Responsibilities", content: "You are solely responsible for the content you download and for ensuring you have the right to download such content. TeraFlow does not host any content and is not responsible for the content of third-party websites." },
    { title: "Service Modifications", content: "We reserve the right to modify or discontinue the service at any time without notice. We are not liable to you or any third party for such modifications." },
    { title: "Termination", content: "We reserve the right to terminate your access to the service at our sole discretion, without notice, for any reason, including violation of these terms." },
    { title: "Governing Law", content: "These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which TeraFlow operates, without regard to its conflict of law principles." },
    { title: "Contact Information", content: "If you have any questions about these Terms and Conditions, please contact us at support@teraflow.com." }
  ];

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-4xl space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Terms and Conditions</h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-mono text-sm uppercase tracking-widest">Last Updated: March 24, 2026</p>
      </motion.div>

      <div className="space-y-8">
        {sections.map((s, i) => (
          <motion.section 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="space-y-3 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-zinc-200/20 dark:shadow-none"
          >
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                {i + 1}
              </span>
              {s.title}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed pl-11">{s.content}</p>
          </motion.section>
        ))}
      </div>
    </div>
  );
};

export default Terms;
