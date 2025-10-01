import React from "react";
import { GlassCard } from "../ui/GlassCard";
import logoWhite from "../../assets/logo_white.png";

export const Footer: React.FC = () => {
  const footerLinks = {
    shop: [
      { name: "New Arrivals", href: "#" },
      { name: "Best Sellers", href: "#" },
      { name: "Sale", href: "#" },
      { name: "Gift Cards", href: "#" },
    ],
    categories: [
      { name: "Hoodies", href: "#" },
      { name: "T-Shirts", href: "#" },
      { name: "Jeans", href: "#" },
      { name: "Accessories", href: "#" },
    ],
    support: [
      { name: "Contact Us", href: "#" },
      { name: "Size Guide", href: "#" },
      { name: "Shipping Info", href: "#" },
      { name: "Returns", href: "#" },
    ],
    company: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Press", href: "#" },
      { name: "Sustainability", href: "#" },
    ],
  };

  return (
    <footer className="bg-dark-primary border-t border-white border-opacity-10">
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
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 font-body text-sm">
                    {link.name}
                  </a>
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
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 font-body text-sm">
                    {link.name}
                  </a>
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
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 font-body text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-white border-opacity-20">
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div>
                <h4 className="font-display text-lg font-semibold text-white">
                  Get 10% off your first order
                </h4>
                <p className="text-gray-400 font-body text-sm">
                  Subscribe to our newsletter for exclusive offers
                </p>
              </div>
              <div className="flex space-x-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="glass px-4 py-2 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-gold"
                />
                <button className="btn-primary px-6 py-2 rounded-xl text-white font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white border-opacity-20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 font-body text-sm">
              © {new Date().getFullYear()} OMU FUTION. All rights reserved.
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
      </div>
    </footer>
  );
};
