import React from "react";
import { PageBackground } from "../components/ui/PageBackground";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";

export const CookiesPage: React.FC = () => {
  return (
    <PageBackground variant="light">
      <div className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Cookie Policy
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn about how we use cookies and similar technologies on our
              website.
            </p>
          </div>

          <GlassCard className="p-8 mb-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What Are Cookies
              </h2>
              <p className="text-gray-700 mb-6">
                Cookies are small text files that are placed on your computer or
                mobile device when you visit our website. They help us provide
                you with a better experience.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How We Use Cookies
              </h2>
              <p className="text-gray-700 mb-6">
                We use cookies to remember your preferences, understand how you
                use our website, and improve your experience.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Types of Cookies We Use
              </h2>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>
                  <strong>Essential Cookies:</strong> Required for the website
                  to function properly
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand how
                  visitors interact with our website
                </li>
                <li>
                  <strong>Marketing Cookies:</strong> Used to deliver relevant
                  advertisements
                </li>
                <li>
                  <strong>Preference Cookies:</strong> Remember your settings
                  and preferences
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Managing Cookies
              </h2>
              <p className="text-gray-700 mb-6">
                You can control and manage cookies through your browser
                settings. Please note that removing or blocking cookies may
                impact your user experience.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about our use of cookies, please
                contact us through our contact page.
              </p>
            </div>
          </GlassCard>

          <div className="text-center">
            <Link to="/">
              <Button variant="primary" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageBackground>
  );
};
