import React from "react";

export const MinimalFooter: React.FC = () => {
  return (
    <footer className="bg-dark-primary border-t border-white border-opacity-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-gray-400 font-body text-sm">
            © {new Date().getFullYear()} OMU FUSION. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-300 font-body">
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-300 font-body">
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-300 font-body">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
