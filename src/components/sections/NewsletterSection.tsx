import React, { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSubmitted(true);
    setEmail("");

    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  const socialLinks = [
    {
      name: "Instagram",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.987 11.987 11.987s11.987-5.366 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.393-3.34-1.059l.372-.343c.8.569 1.769.902 2.968.902 2.28 0 4.118-1.838 4.118-4.118 0-2.28-1.838-4.118-4.118-4.118-2.28 0-4.118 1.838-4.118 4.118 0 .343.043.675.115.994l-.372.343C3.69 13.154 3.33 12.6 3.33 11.987c0-2.625 2.126-4.751 4.751-4.751s4.751 2.126 4.751 4.751c0 2.625-2.126 4.751-4.751 4.751l.368-.749z" />
        </svg>
      ),
      href: "#",
      followers: "50K",
    },
    {
      name: "Twitter",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
      href: "#",
      followers: "25K",
    },
    {
      name: "TikTok",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
      href: "#",
      followers: "100K",
    },
    {
      name: "YouTube",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      href: "#",
      followers: "30K",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-dark-primary to-dark-secondary relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-gold rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-orange rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative">
        <GlassCard className="p-8 md:p-12 text-center">
          {!isSubmitted ? (
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <h2 className="font-display text-3xl md:text-5xl font-bold text-gradient">
                  Stay in Style
                </h2>
                <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-body leading-relaxed">
                  Join our exclusive community and be the first to discover new
                  collections, special offers, and style inspiration.
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 my-8">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-accent-gold bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-6 h-6 text-accent-gold"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-display font-semibold text-white">
                    Early Access
                  </h4>
                  <p className="text-sm text-gray-400 font-body">
                    Get exclusive access to new collections
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-12 h-12 bg-accent-gold bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-6 h-6 text-accent-gold"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-display font-semibold text-white">
                    Special Offers
                  </h4>
                  <p className="text-sm text-gray-400 font-body">
                    Exclusive discounts and promotions
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-12 h-12 bg-accent-gold bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-6 h-6 text-accent-gold"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-display font-semibold text-white">
                    Style Tips
                  </h4>
                  <p className="text-sm text-gray-400 font-body">
                    Curated styling advice and trends
                  </p>
                </div>
              </div>

              {/* Newsletter Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(""); // Clear error on input change
                      }}
                      placeholder="Enter your email address"
                      className={`glass w-full px-4 py-3 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 border-0 transition-all duration-300 ${
                        error
                          ? "focus:ring-red-500 ring-2 ring-red-500"
                          : "focus:ring-accent-gold"
                      }`}
                    />
                    {error && (
                      <p className="text-red-400 text-sm mt-2 font-body">
                        {error}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    className="px-8 py-3"
                    loading={isLoading}
                    disabled={isLoading}>
                    {isLoading ? "Joining..." : "Join Now"}
                  </Button>
                </div>

                {/* Success Message */}
                {isSubmitted && (
                  <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-2xl p-4 flex items-center justify-center space-x-2">
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-green-400 font-medium">
                      Successfully subscribed! Welcome to OMU FUTION.
                    </span>
                  </div>
                )}

                <p className="text-xs text-gray-500 font-body">
                  By subscribing, you agree to our privacy policy and terms of
                  service.
                </p>
              </form>

              {/* Social Media Links */}
              <div className="space-y-6 pt-8 border-t border-white border-opacity-20">
                <h4 className="font-display text-lg font-semibold text-white">
                  Follow Our Journey
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      className="glass p-4 rounded-2xl hover:glass-strong transition-all duration-300 group">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-white group-hover:text-accent-gold transition-colors duration-300">
                          {social.icon}
                        </div>
                        <div className="text-center">
                          <div className="font-display font-semibold text-white text-sm">
                            {social.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {social.followers} followers
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold text-white">
                  Welcome to the OMU FUTION Family!
                </h3>
                <p className="text-gray-300 font-body">
                  Check your inbox for a special welcome offer.
                </p>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </section>
  );
};
