import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 mt-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium">
          (C) Noam Gold AI 2025
        </div>
        <div>
          <a 
            href="mailto:gold.noam@gmail.com" 
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"
          >
            <span>📧</span>
            שלח משוב
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;