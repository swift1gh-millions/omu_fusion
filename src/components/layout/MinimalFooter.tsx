import React from "react";
import { Link } from "react-router-dom";

export const MinimalFooter: React.FC = () => {
  return (
    <footer className="bg-dark-primary border-t border-white border-opacity-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-gray-400 font-body text-sm">
            © {new Date().getFullYear()} OMU FUSION. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-white transition-colors duration-300 font-body">
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-gray-400 hover:text-white transition-colors duration-300 font-body">
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              className="text-gray-400 hover:text-white transition-colors duration-300 font-body">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
