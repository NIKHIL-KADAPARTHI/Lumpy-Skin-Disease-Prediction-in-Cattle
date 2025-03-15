import React from 'react';
import { Github, Activity, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0f172a] py-6 border-t border-blue-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row items-center justify-center gap-10">
          {/* FarmFriend Section */}
          <div className="flex items-center">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
              <Activity className="h-6 w-6 text-blue-500 mr-2" />
            </motion.div>
            <span className="text-lg font-semibold text-white">FarmFriend</span>
          </div>

          {/* Made with ... Section (Middle) */}
          <p className="flex items-center text-sm text-gray-400">
            Made with
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
              className="mx-1"
            >
              <Heart className="h-4 w-4 text-red-500" />
            </motion.span>
            for cattle health monitoring
          </p>

          {/* Documentation Section */}
          <motion.a
            href="https://github.com/NIKHIL-KADAPARTHI/lsd-bolt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-gray-300 hover:text-blue-400 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Github className="h-5 w-5 mr-2" />
            <span>Documentation</span>
          </motion.a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
