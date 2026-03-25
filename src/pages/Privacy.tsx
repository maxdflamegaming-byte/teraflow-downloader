import React from 'react';
import { motion } from 'motion/react';

const Privacy: React.FC = () => {
  const sections = [
    { title: "Information We Collect", content: "We collect information you provide directly to us, such as your name, email address, and any other information you choose to provide. We also collect information about your use of the service, such as your IP address, browser type, and operating system." },
    { title: "How We Use Your Information", content: "We use your information to provide and improve our services, communicate with you, and personalize your experience. We do not sell your personal information to third parties." },
    { title: "Data Storage and Security", content: "We use industry-standard security measures to protect your information from unauthorized access, disclosure, or destruction. However, no method of transmission over the internet is 100% secure." },
    { title: "Data Sharing and Disclosure", content: "We may share your information with third-party service providers who perform services on our behalf. We may also disclose your information if required by law or to protect our rights or the safety of others." },
    { title: "Cookies and Tracking", content: "We use cookies and similar tracking technologies to collect information about your use of the service and to provide a more personalized experience. You can disable cookies in your browser settings, but this may limit your use of the service." },
    { title: "Third-Party Services", content: "TeraFlow may contain links to third-party websites or services that are not owned or controlled by us. We are not responsible for the privacy practices of these third parties." },
    { title: "Your Rights", content: "You have the right to access, correct, or delete your personal information. You also have the right to object to or restrict certain types of data processing." },
    { title: "Children's Privacy", content: "TeraFlow is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13." },
    { title: "Data Retention", content: "We retain your information for as long as necessary to provide our services and to comply with our legal obligations." },
    { title: "Changes to Privacy Policy", content: "We reserve the right to modify this Privacy Policy at any time. We will notify you of any changes by posting the new policy on our website." },
    { title: "Contact Us", content: "If you have any questions about this Privacy Policy, please contact us at support@teraflow.com." }
  ];

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-4xl space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Privacy Policy</h1>
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

export default Privacy;
