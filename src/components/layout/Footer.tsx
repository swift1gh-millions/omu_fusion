import React from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "../ui/GlassCard";
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
    support: [
      { name: "Contact Us", href: "/contact" },
      { name: "Size Guide", href: "/size-guide" },
      { name: "Shipping Info", href: "/shipping" },
      { name: "Returns", href: "/returns" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
      { name: "Sustainability", href: "/sustainability" },
    ],
  };

  return (
    <footer className="bg-dark-primary border-t border-white border-opacity-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <img src={logoWhite} alt="OMU FUSION" className="h-10 w-auto" />
              <span className="font-display text-2xl font-bold text-white">
                OMU FUSION
              </span>
            </div>

            <p className="text-gray-400 font-body max-w-md leading-relaxed">
              Redefining modern streetwear with premium quality, innovative
              design, and sustainable practices. Join our community of style
              enthusiasts.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {[
                {
                  name: "Instagram",
                  icon: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.987 11.987 11.987s11.987-5.366 11.987-11.987C24.014 5.367 18.647.001 12.017.001z",
                },
                {
                  name: "Twitter",
                  icon: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z",
                },
                {
                  name: "YouTube",
                  icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
                },
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className="glass rounded-full p-3 text-white hover:text-accent-gold transition-colors duration-300">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link Sections */}
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

          <div>
            <h4 className="font-display font-semibold text-white mb-4">
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
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
              {[
                {
                  name: "Instagram",
                  icon: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.987 11.987 11.987s11.987-5.366 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.393-3.34-1.059l.372-.343c.8.569 1.769.902 2.968.902 2.28 0 4.118-1.838 4.118-4.118 0-2.28-1.838-4.118-4.118-4.118-2.28 0-4.118 1.838-4.118 4.118 0 .343.043.675.115.994l-.372.343C3.69 13.154 3.33 12.6 3.33 11.987c0-2.625 2.126-4.751 4.751-4.751s4.751 2.126 4.751 4.751c0 2.625-2.126 4.751-4.751 4.751l.368-.749z",
                  href: "https://instagram.com/omufusion",
                },
                {
                  name: "Twitter",
                  icon: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z",
                  href: "https://twitter.com/omufusion",
                },
                {
                  name: "YouTube",
                  icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
                  href: "https://youtube.com/@omufusion",
                },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-full p-3 text-white hover:text-accent-gold transition-colors duration-300"
                  aria-label={`Follow us on ${social.name}`}>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
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
