import React from "react";
import { PageBackground } from "../components/ui/PageBackground";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";

export const TermsPage: React.FC = () => {
  return (
    <PageBackground variant="light">
      <div className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Please read these terms carefully before using our services.
            </p>
          </div>

          <GlassCard className="p-8 mb-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Acceptance of Terms
              </h2>
              <p className="text-gray-700 mb-6">
                By accessing and using this website, you accept and agree to be
                bound by the terms and provision of this agreement.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Use License
              </h2>
              <p className="text-gray-700 mb-6">
                Permission is granted to temporarily download one copy of the
                materials on OMU FUSION's website for personal, non-commercial
                transitory viewing only.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Disclaimer
              </h2>
              <p className="text-gray-700 mb-6">
                The materials on OMU FUSION's website are provided on an 'as is'
                basis. OMU FUSION makes no warranties, expressed or implied.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Limitations
              </h2>
              <p className="text-gray-700 mb-6">
                In no event shall OMU FUSION or its suppliers be liable for any
                damages arising out of the use or inability to use the materials
                on our website.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Governing Law
              </h2>
              <p className="text-gray-700 mb-6">
                These terms and conditions are governed by and construed in
                accordance with the laws and you irrevocably submit to the
                exclusive jurisdiction of the courts.
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
