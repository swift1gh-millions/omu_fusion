import React from "react";
import { motion } from "framer-motion";
import { HiShieldCheck, HiLightBulb, HiUsers, HiHeart } from "react-icons/hi";
import { Button } from "../components/ui/Button";

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
      icon: HiShieldCheck,
    },
    {
      title: "Sustainability",
      description:
        "Environmental responsibility is at the core of everything we do.",
      icon: HiHeart,
    },
    {
      title: "Innovation",
      description:
        "We continuously push boundaries to create products that improve lives.",
      icon: HiLightBulb,
    },
    {
      title: "Community",
      description:
        "Building meaningful connections with our customers and partners.",
      icon: HiUsers,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden pt-32 pb-40">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent-gold opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500 opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 pt-4 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-20 relative"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-sm"></div>
            <div className="relative z-10">
              <motion.h1
                className="text-5xl lg:text-7xl font-black text-white mb-8 bg-gradient-to-r from-white via-accent-gold to-white bg-clip-text text-transparent"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}>
                About OMU FUSION
              </motion.h1>
              <motion.p
                className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}>
                We're on a mission to create products that seamlessly blend
                innovation, sustainability, and exceptional design to enhance
                your everyday life.
              </motion.p>
            </div>
          </motion.div>

          {/* Story Section */}
          <motion.div
            className="mb-24 relative"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}>
            {/* Section Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 to-gray-700/20 rounded-3xl blur-sm -z-10"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center md:p-8">
              <motion.div variants={itemVariants}>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full shadow-2xl">
                  <motion.h2
                    className="text-4xl lg:text-5xl font-bold text-white mb-8 bg-gradient-to-r from-white to-accent-gold bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}>
                    Our Story
                  </motion.h2>
                  <div className="space-y-6">
                    <p className="text-gray-300 leading-relaxed text-lg">
                      Omu Fusion was born at the intersection of street culture
                      and refined craftsmanship. What started as a passion for
                      bold self-expression turned into a movement. Our style
                      lives in contrast. raw yet polished, familiar yet
                      forward-thinking. Every drop is designed with intention,
                      crafted to empower individuality and elevate everyday
                      wear.
                    </p>
                    <p className="text-gray-300 leading-relaxed text-lg">
                      Our journey has been driven by a relentless pursuit of
                      excellence and an unwavering commitment to our customers.
                      Every product we create is a testament to our belief that
                      great design should be accessible to everyone.
                    </p>
                    <p className="text-gray-300 leading-relaxed text-lg">
                      Today, we continue to push boundaries, explore new
                      possibilities, and create products that inspire and
                      empower people around the world.
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600"
                  alt="Our team at work"
                  className="relative rounded-2xl shadow-2xl w-full h-full object-cover min-h-[500px] border border-white/10 group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            className="mb-24 relative"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}>
            {/* Section Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-800/10 to-transparent rounded-3xl"></div>

            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white via-accent-gold to-white bg-clip-text text-transparent">
                Our Values
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                These core principles guide everything we do and shape the
                products we create.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  variants={itemVariants}
                  whileHover={{ y: -15, scale: 1.05 }}
                  className="group relative">
                  {/* Card Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center h-full shadow-2xl group-hover:border-white/20 transition-all duration-300">
                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 text-accent-gold">
                      <value.icon className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-accent-gold transition-colors duration-300">
                      {value.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-lg">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            className="mb-24 relative"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}>
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white via-accent-gold to-white bg-clip-text text-transparent">
                Meet Our Team
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                The passionate individuals behind OMU FUSION who make our vision
                a reality.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  variants={itemVariants}
                  whileHover={{ y: -15, rotateY: 5 }}
                  className="group relative">
                  {/* Card Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl group-hover:border-white/20 transition-all duration-300">
                    <div className="relative overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-80 object-cover transition-all duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {member.name}
                        </h3>
                        <p className="text-accent-gold font-semibold text-lg">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-300 leading-relaxed text-lg">
                        {member.bio}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            className="mb-24 relative"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}>
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/10 via-transparent to-blue-500/10 rounded-3xl"></div>

            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.1 }}
                  className="group">
                  <div className="text-4xl lg:text-6xl font-black text-accent-gold mb-4 group-hover:text-white transition-colors duration-300">
                    500K+
                  </div>
                  <p className="text-gray-300 text-lg font-medium">
                    Happy Customers
                  </p>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.1 }}
                  className="group">
                  <div className="text-4xl lg:text-6xl font-black text-accent-gold mb-4 group-hover:text-white transition-colors duration-300">
                    150+
                  </div>
                  <p className="text-gray-300 text-lg font-medium">Products</p>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.1 }}
                  className="group">
                  <div className="text-4xl lg:text-6xl font-black text-accent-gold mb-4 group-hover:text-white transition-colors duration-300">
                    50+
                  </div>
                  <p className="text-gray-300 text-lg font-medium">Countries</p>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.1 }}
                  className="group">
                  <div className="text-4xl lg:text-6xl font-black text-accent-gold mb-4 group-hover:text-white transition-colors duration-300">
                    7
                  </div>
                  <p className="text-gray-300 text-lg font-medium">
                    Years of Excellence
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="text-center relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}>
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-2xl"></div>

            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-16 shadow-2xl">
              <motion.h2
                className="text-4xl lg:text-5xl font-black text-white mb-6 bg-gradient-to-r from-white via-accent-gold to-white bg-clip-text text-transparent"
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6 }}>
                Join Our Journey
              </motion.h2>
              <motion.p
                className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}>
                Be part of our story and discover products that will transform
                your daily experience.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-6 justify-center"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}>
                <Button
                  variant="primary"
                  size="lg"
                  className="px-12 py-4 text-lg"
                  onClick={() => (window.location.href = "/shop")}>
                  Shop Our Collection
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="px-12 py-4 text-lg"
                  onClick={() => (window.location.href = "/contact")}>
                  Contact Us
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
