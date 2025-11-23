import React from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "../ui/GlassCard";
import { Logo } from "../ui/Logo";
import logoWhite from "../../assets/logo_white.png";

export const Footer: React.FC = () => {
  const footerLinks = {
    shop: [
      { name: "New Arrivals", href: "/shop?filter=new" },
      { name: "Best Sellers", href: "/shop?filter=bestsellers" },
      { name: "Sale", href: "/shop?filter=sale" },
      { name: "Gift Cards", href: "/shop?category=gift-cards" },
    ],
    categories: [
      { name: "Hoodies", href: "/shop?category=Hoodies" },
      { name: "T-Shirts", href: "/shop?category=T-Shirts" },
      { name: "Jeans", href: "/shop?category=Jeans" },
      { name: "Accessories", href: "/shop?category=Accessories" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact Us", href: "/contact" },
    ],
  };

  return (
    <footer className="bg-dark-primary border-t border-white border-opacity-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-6">
            <Logo
              variant="light"
              size="md"
              showText={true}
              animated={false}
              fallbackType="text"
            />

            <p className="text-gray-400 font-body max-w-md leading-relaxed">
              Redefining modern streetwear with premium quality, innovative
              design, and sustainable practices. Join our community of style
              enthusiasts.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/omufusion"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 hover:scale-110"
                aria-label="Follow us on Instagram">
                <div className="relative z-10">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </a>
            </div>
          </div>

          {/* Link Sections */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 font-body text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 font-body text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">
              Categories
            </h4>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 font-body text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="mt-12 pt-8 border-t border-white border-opacity-20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-center md:text-left">
              <h4 className="font-display text-lg font-semibold text-white mb-2">
                Follow Our Journey
              </h4>
              <p className="text-gray-400 font-body text-sm">
                Stay connected with us on social media
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/omufusion"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 hover:scale-110"
                aria-label="Follow us on Instagram">
                <div className="relative z-10">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white border-opacity-20">
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
      </div>

      {/* 
        Developer Attribution (Code Level Only)
        Designed and Developed by Prince Yekunya
        Portfolio: https://swift1dev.netlify.app
        Full Stack Developer & UI/UX Designer
        
        This attribution is preserved in:
        - HTML meta tags (index.html)
        - HTTP response headers (netlify.toml)
        - Source code comments
      */}
    </footer>
  );
};
