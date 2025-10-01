import React from "react";
import { motion } from "framer-motion";
import { HiMail, HiPhone, HiLocationMarker, HiClock } from "react-icons/hi";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";

export const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400",
      bio: "Passionate about creating products that inspire and empower people to live their best lives.",
    },
    {
      name: "Michael Chen",
      role: "Design Director",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      bio: "Award-winning designer with 15+ years of experience in creating beautiful, functional products.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Innovation",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      bio: "Leading our research and development team to push the boundaries of what's possible.",
    },
  ];

  const values = [
    {
      title: "Quality",
      description:
        "We never compromise on quality. Every product is crafted with meticulous attention to detail.",
      icon: "🎯",
    },
    {
      title: "Sustainability",
      description:
        "Environmental responsibility is at the core of everything we do.",
      icon: "🌱",
    },
    {
      title: "Innovation",
      description:
        "We continuously push boundaries to create products that improve lives.",
      icon: "💡",
    },
    {
      title: "Community",
      description:
        "Building meaningful connections with our customers and partners.",
      icon: "🤝",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            About OMU FUSION
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to create products that seamlessly blend
            innovation, sustainability, and exceptional design to enhance your
            everyday life.
          </p>
        </motion.div>

        {/* Story Section */}
        <motion.div
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants}>
              <GlassCard className="p-8 h-full">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Story
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Founded in 2018, OMU FUSION began as a simple idea: to create
                  products that don't just meet needs, but exceed expectations.
                  What started as a small team of passionate designers and
                  engineers has grown into a global brand trusted by millions.
                </p>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Our journey has been driven by a relentless pursuit of
                  excellence and an unwavering commitment to our customers.
                  Every product we create is a testament to our belief that
                  great design should be accessible to everyone.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Today, we continue to push boundaries, explore new
                  possibilities, and create products that inspire and empower
                  people around the world.
                </p>
              </GlassCard>
            </motion.div>
            <motion.div variants={itemVariants}>
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600"
                alt="Our team at work"
                className="rounded-lg shadow-2xl w-full h-full object-cover min-h-[400px]"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}>
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do and shape the
              products we create.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="group">
                <GlassCard className="p-6 text-center h-full">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-accent-gold transition-colors duration-300">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}>
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The passionate individuals behind OMU FUSION who make our vision a
              reality.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="group">
                <GlassCard className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-accent-gold font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}>
          <GlassCard className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <motion.div variants={itemVariants}>
                <div className="text-3xl lg:text-4xl font-bold text-accent-gold mb-2">
                  500K+
                </div>
                <p className="text-gray-600">Happy Customers</p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <div className="text-3xl lg:text-4xl font-bold text-accent-gold mb-2">
                  150+
                </div>
                <p className="text-gray-600">Products</p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <div className="text-3xl lg:text-4xl font-bold text-accent-gold mb-2">
                  50+
                </div>
                <p className="text-gray-600">Countries</p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <div className="text-3xl lg:text-4xl font-bold text-accent-gold mb-2">
                  7
                </div>
                <p className="text-gray-600">Years of Excellence</p>
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}>
          <GlassCard className="p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join Our Journey
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Be part of our story and discover products that will transform
              your daily experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg">
                Shop Our Collection
              </Button>
              <Button variant="secondary" size="lg">
                Contact Us
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};
