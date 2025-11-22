import React from "react";
import { Logo } from "../ui/Logo";

/**
 * Logo Examples and Test Component
 * This component demonstrates different logo configurations and fallback behaviors
 */
export const LogoExamples: React.FC = () => {
  const [simulateError, setSimulateError] = React.useState(false);

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Logo Component Examples
        </h1>

        {/* Error Simulation Toggle */}
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={simulateError}
              onChange={(e) => setSimulateError(e.target.checked)}
              className="rounded"
            />
            <span className="text-yellow-800">
              Simulate Logo Loading Error (for testing fallbacks)
            </span>
          </label>
        </div>

        {/* Size Variations */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Size Variations
          </h2>
          <div className="flex items-end space-x-8 p-6 bg-white rounded-lg shadow-sm border">
            <div className="text-center">
              <Logo size="sm" variant="dark" />
              <p className="mt-2 text-sm text-gray-600">Small</p>
            </div>
            <div className="text-center">
              <Logo size="md" variant="dark" />
              <p className="mt-2 text-sm text-gray-600">Medium</p>
            </div>
            <div className="text-center">
              <Logo size="lg" variant="dark" />
              <p className="mt-2 text-sm text-gray-600">Large</p>
            </div>
            <div className="text-center">
              <Logo size="xl" variant="dark" />
              <p className="mt-2 text-sm text-gray-600">Extra Large</p>
            </div>
          </div>
        </section>

        {/* Dark vs Light Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Dark vs Light Variants
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white rounded-lg shadow-sm border text-center">
              <Logo size="lg" variant="dark" />
              <p className="mt-2 text-sm text-gray-600">
                Dark variant (for light backgrounds)
              </p>
            </div>
            <div className="p-6 bg-gray-900 rounded-lg shadow-sm text-center">
              <Logo size="lg" variant="light" />
              <p className="mt-2 text-sm text-gray-300">
                Light variant (for dark backgrounds)
              </p>
            </div>
          </div>
        </section>

        {/* Fallback Options */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Fallback Options
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white rounded-lg shadow-sm border text-center">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Text Fallback
                </h3>
                <p className="text-sm text-gray-600">
                  Shows brand name when image fails
                </p>
              </div>
              {simulateError ? (
                <div className="font-display text-xl font-bold text-gray-900">
                  OMU FUSION
                </div>
              ) : (
                <Logo size="lg" variant="dark" fallbackType="text" />
              )}
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border text-center">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  SVG Fallback
                </h3>
                <p className="text-sm text-gray-600">
                  Shows custom SVG when image fails
                </p>
              </div>
              {simulateError ? (
                <svg
                  viewBox="0 0 120 40"
                  className="h-12 w-auto text-gray-900"
                  fill="currentColor">
                  <g>
                    <circle
                      cx="12"
                      cy="20"
                      r="10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      d="M30 10 L30 30 M30 10 L40 20 L50 10 M50 10 L50 30"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M58 10 L58 22 A8 8 0 0 0 74 22 L74 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </g>
                  <text
                    x="85"
                    y="26"
                    fontSize="14"
                    fontWeight="bold"
                    fill="currentColor">
                    FUSION
                  </text>
                </svg>
              ) : (
                <Logo size="lg" variant="dark" fallbackType="svg" />
              )}
            </div>
          </div>
        </section>

        {/* With Text Options */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Logo with Text
          </h2>
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <div className="flex justify-center space-x-8">
              <Logo size="md" variant="dark" showText={true} />
            </div>
          </div>
        </section>

        {/* Animation Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Animation Examples
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white rounded-lg shadow-sm border text-center">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  With Animation
                </h3>
                <p className="text-sm text-gray-600">Hover to see effects</p>
              </div>
              <Logo size="lg" variant="dark" animated={true} />
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border text-center">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Without Animation
                </h3>
                <p className="text-sm text-gray-600">Static logo</p>
              </div>
              <Logo size="lg" variant="dark" animated={false} />
            </div>
          </div>
        </section>

        {/* Real-world Usage Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Real-world Usage Examples
          </h2>

          {/* Header Example */}
          <div className="p-4 bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between">
              <Logo size="md" variant="light" animated={true} />
              <div className="text-white">Navigation Items</div>
            </div>
            <p className="text-gray-300 text-sm mt-2">
              Header/Navigation usage
            </p>
          </div>

          {/* Footer Example */}
          <div className="p-6 bg-gray-800 rounded-lg">
            <Logo size="md" variant="light" showText={true} animated={false} />
            <p className="text-gray-300 text-sm mt-2">Footer usage with text</p>
          </div>

          {/* Admin Panel Example */}
          <div className="p-4 bg-slate-900 rounded-lg">
            <Logo size="sm" variant="light" showText={true} animated={false} />
            <p className="text-gray-300 text-sm mt-2">Admin panel usage</p>
          </div>
        </section>
      </div>
    </div>
  );
};
