import React from "react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { OptimizedImage } from "../ui/OptimizedImage";
import { useDarkBackground } from "../../utils/backgroundUtils";

export const BrandStorySection: React.FC = () => {
  const darkBg = useDarkBackground("BrandStorySection", 0.75);
  const values = [
    {
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      title: "Innovation",
      description:
        "Pushing boundaries in fashion with cutting-edge design and premium materials.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      title: "Craftsmanship",
      description:
        "Every piece is meticulously crafted with attention to detail and passion for excellence.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Sustainability",
      description:
        "Committed to responsible fashion that respects our planet and future generations.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: "Community",
      description:
        "Building a global community of individuals who share our vision for authentic style.",
    },
  ];

  return (
    <section
      className={`py-20 px-4 sm:px-6 lg:px-8 ${darkBg.className} relative overflow-hidden`}
      style={darkBg.style}>
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-accent-gold rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-accent-orange rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Main Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-gradient mb-6">
                Our Story
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-accent-gold to-accent-orange rounded-full mb-8"></div>
            </div>

            <div className="space-y-6 text-lg leading-relaxed">
              <p className="text-gray-300 font-body">
                Born from a vision to redefine modern streetwear,{" "}
                <span className="text-accent-gold font-semibold">
                  OMU FUSION
                </span>{" "}
                represents the fusion of contemporary design with timeless
                craftsmanship. We believe that fashion is more than just
                clothing—it's a form of self-expression, a statement of
                individuality.
              </p>

              <p className="text-gray-300 font-body">
                Since our inception, we've been committed to creating pieces
                that not only look exceptional but feel extraordinary. Each item
                in our collection tells a story of innovation, quality, and the
                relentless pursuit of excellence.
              </p>

              <p className="text-gray-300 font-body">
                Our mission extends beyond fashion. We're building a community
                of like-minded individuals who appreciate authentic design,
                sustainable practices, and the power of personal style to
                transform not just how you look, but how you feel.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="lg">
                Join Our Story
              </Button>
              <Button variant="glass" size="lg">
                Learn More
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div
            className="relative animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}>
            <GlassCard className="overflow-hidden h-96 lg:h-[500px]">
              <OptimizedImage
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                alt="OMU FUSION Brand Story"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                loading="lazy"
                fallbackSrc="https://via.placeholder.com/1200x500/1a1a1a/ffffff?text=OMU+FUSION+Story"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <GlassCard className="p-4">
                  <p className="text-white font-body text-sm">
                    "Fashion fades, but style is eternal. We create pieces that
                    transcend trends."
                  </p>
                  <p className="text-accent-gold text-xs mt-2 font-medium">
                    — OMU FUSION Design Team
                  </p>
                </GlassCard>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Values Section */}
        <div className="space-y-12">
          <div className="text-center">
            <h3 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
              Our Values
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-body">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {values.map((value, index) => (
              <GlassCard
                key={value.title}
                className="p-6 text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="text-accent-gold mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h4 className="font-display text-xl font-bold text-white mb-3">
                  {value.title}
                </h4>
                <p className="text-gray-300 font-body text-sm leading-relaxed">
                  {value.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20">
          <GlassCard className="p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-accent-gold font-display">
                  2018
                </div>
                <div className="text-gray-300 font-body text-sm">Founded</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-accent-gold font-display">
                  50K+
                </div>
                <div className="text-gray-300 font-body text-sm">
                  Happy Customers
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-accent-gold font-display">
                  200+
                </div>
                <div className="text-gray-300 font-body text-sm">
                  Unique Products
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-accent-gold font-display">
                  25+
                </div>
                <div className="text-gray-300 font-body text-sm">
                  Countries Worldwide
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
};
