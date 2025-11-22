import React, { useState, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { HiMail, HiPhone, HiLocationMarker, HiClock } from "react-icons/hi";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { FormFieldError } from "../components/ui/FormFieldError";
import { LazyLoadWrapper } from "../components/ui/LazyLoadWrapper";
import { useAnimationVariants, useDebounce } from "../hooks/usePerformance";
import { EmailService } from "../utils/emailService";

export const ContactPage: React.FC = memo(() => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const { containerVariants, itemVariants, fadeInUp } = useAnimationVariants();

  // Form validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Send contact form email
      await EmailService.sendContactFormEmail({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTouched({});
      setErrors({});
    } catch (error) {
      console.error("Form submission error:", error);
      // Set error state to show user
      setErrors({
        submit:
          "Failed to send message. Please try again or contact us directly at omufusion@gmail.com",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: HiMail,
      title: "Email Us",
      details: "omufusion@gmail.com",
      description: "Send us an email anytime",
    },
    {
      icon: HiPhone,
      title: "Call Us",
      details: "+233 248 397 962",
      description: "Mon-Fri from 8am to 5pm",
    },
    {
      icon: HiLocationMarker,
      title: "Locate Us",
      details: "Dansoman, Accra - Ghana",
    },
    {
      icon: HiClock,
      title: "Work Hours",
      details: "Monday - Friday: 8:00 AM - 5:00 PM",
      description: "Weekend: By appointment only",
    },
  ];

  // Use debounced validation for better performance
  const debouncedValidation = useDebounce(validateForm, 300);

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
          {/* Header */}
          <motion.div
            className="text-center mb-16 relative"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-sm"></div>
            <div className="relative z-10">
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white via-accent-gold to-white bg-clip-text text-transparent">
                Get In Touch
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                We'd love to hear from you. Send us a message and we'll respond
                as soon as possible.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            {/* Contact Form */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}>
              <GlassCard className="p-8">
                <h2 className="text-2xl font-bold text-gray-100 mb-6">
                  Send Message
                </h2>

                {isSubmitted ? (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}>
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Thank you for contacting us. We'll get back to you within
                      24 hours.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => setIsSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          onBlur={() => handleBlur("name")}
                          className={`w-full px-4 py-3 border ${
                            errors.name && touched.name
                              ? "border-red-500"
                              : "border-gray-200"
                          } rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-all duration-300`}
                          placeholder="Enter your full name"
                        />
                        <FormFieldError
                          error={errors.name}
                          touched={touched.name}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={() => handleBlur("email")}
                          className={`w-full px-4 py-3 border ${
                            errors.email && touched.email
                              ? "border-red-500"
                              : "border-gray-200"
                          } rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-all duration-300`}
                          placeholder="Enter your email address"
                        />
                        <FormFieldError
                          error={errors.email}
                          touched={touched.email}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-300 mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        onBlur={() => handleBlur("subject")}
                        className={`w-full px-4 py-3 border ${
                          errors.subject && touched.subject
                            ? "border-red-500"
                            : "border-gray-200"
                        } rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-all duration-300`}>
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Customer Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                      <FormFieldError
                        error={errors.subject}
                        touched={touched.subject}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-300 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={() => handleBlur("message")}
                        className={`w-full px-4 py-3 border ${
                          errors.message && touched.message
                            ? "border-red-500"
                            : "border-gray-200"
                        } rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-all duration-300 resize-none`}
                        placeholder="Tell us how we can help you..."
                      />
                      <FormFieldError
                        error={errors.message}
                        touched={touched.message}
                      />
                    </div>

                    {errors.submit && (
                      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {errors.submit}
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full">
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>

                    {/* 24-hour response notice */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <HiClock className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Response Time</p>
                          <p className="mb-2">
                            We typically respond within 24 hours during business
                            days.
                          </p>
                          <p>
                            <strong>
                              Didn't get a response after 24 hours?
                            </strong>
                            <br />
                            Please contact us directly at{" "}
                            <a
                              href="mailto:omufusion@gmail.com"
                              className="text-blue-700 hover:text-blue-900 font-medium underline">
                              omufusion@gmail.com
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </GlassCard>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  className="group">
                  <GlassCard className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-accent-gold/20 rounded-lg group-hover:bg-accent-gold/30 transition-colors duration-300">
                        <info.icon className="h-6 w-6 text-accent-gold" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {info.title}
                        </h3>
                        <p className="text-gray-300 font-medium mb-1">
                          {info.details}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}

              {/* Social Media */}
              <motion.div variants={fadeInUp}>
                <GlassCard className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">
                    Follow Us
                  </h3>
                  <div className="flex flex-col items-center space-y-3">
                    <a
                      href="https://instagram.com/omu_fusion"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full transition-all duration-300 transform hover:scale-105">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </div>
                      <span className="font-medium">@omu_fusion</span>
                    </a>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          </div>

          {/* Map Section */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}>
            <GlassCard className="overflow-hidden">
              <div className="h-64 sm:h-72 lg:h-80 relative">
                {/* Google Maps Embed for Dansoman, Accra, Ghana */}
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.8686920947147!2d-0.2527!3d5.5444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9084b2b7a773%3A0x5c3b1c0b0a4b1c0b!2sDansoman%2C%20Accra%2C%20Ghana!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Omu Fusion Location - Dansoman, Accra, Ghana"
                  className="absolute inset-0"
                />

                {/* Overlay with business information */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="flex items-center space-x-3 text-white">
                    <HiLocationMarker className="h-6 w-6 text-accent-gold" />
                    <div>
                      <h3 className="font-semibold">Omu Fusion</h3>
                      <p className="text-sm opacity-90">
                        Dansoman, Accra - Ghana
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive controls overlay */}
                <div className="absolute top-4 right-4">
                  <a
                    href="https://www.google.com/maps/search/Dansoman,+Accra,+Ghana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/90 hover:bg-white text-gray-800 px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-all duration-300 hover:shadow-xl flex items-center space-x-2">
                    <HiLocationMarker className="h-4 w-4" />
                    <span>View Larger Map</span>
                  </a>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

ContactPage.displayName = "ContactPage";
