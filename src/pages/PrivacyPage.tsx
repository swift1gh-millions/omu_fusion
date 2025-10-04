import React from "react";
import { PageBackground } from "../components/ui/PageBackground";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";

export const PrivacyPage: React.FC = () => {
  return (
    <PageBackground variant="light">
      <div className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we
              collect, use, and protect your information.
            </p>
          </div>

          <GlassCard className="p-8 mb-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Information We Collect
              </h2>
              <p className="text-gray-700 mb-6">
                We collect information you provide directly to us, such as when
                you create an account, make a purchase, or contact us for
                support.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How We Use Your Information
              </h2>
              <p className="text-gray-700 mb-6">
                We use the information we collect to provide, maintain, and
                improve our services, process transactions, and communicate with
                you.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Information Sharing
              </h2>
              <p className="text-gray-700 mb-6">
                We do not sell, trade, or otherwise transfer your personal
                information to third parties without your consent, except as
                described in this policy.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Data Security
              </h2>
              <p className="text-gray-700 mb-6">
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about this Privacy Policy, please
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
