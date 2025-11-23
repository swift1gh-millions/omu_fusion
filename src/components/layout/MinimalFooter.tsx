import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "../ui/Logo";

export const MinimalFooter: React.FC = () => {
  const footerLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Cart", href: "/cart" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <footer className="bg-dark-primary border-t border-white border-opacity-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Logo Section */}
          <div>
            <Logo
              variant="light"
              size="md"
              showText={true}
              animated={false}
              fallbackType="text"
            />
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center md:justify-end gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-gray-400 hover:text-white transition-colors duration-300 font-body text-sm">
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-white border-opacity-20">
          <div className="flex flex-row justify-between items-center space-x-4">
            <div className="text-gray-400 font-body text-xs sm:text-sm flex-shrink-0">
              © {new Date().getFullYear()} OMU FUSION. All rights reserved.
            </div>

            {/* Instagram Link */}
            <div className="flex items-center space-x-4">
              <a
                href="https://instagram.com/omufusion"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl p-3 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 hover:scale-110"
                aria-label="Follow us on Instagram">
                <div className="relative z-10">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
