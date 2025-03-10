import React from "react";
import POSDevice from "../../assets/pos-image.svg";

interface FeatureItemProps {
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ title, description }) => (
  <div className="flex gap-3">
    <div className="flex-shrink-0 mt-1">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z"
          fill="#0066FF"
        />
      </svg>
    </div>
    <div className="space-y-1">
      <h3 className="text-[17px] font-medium text-gray-900">{title}</h3>
      <p className="text-[15px] text-gray-500 leading-relaxed">{description}</p>
    </div>
  </div>
);

const WhatIs: React.FC = () => {
  return (
    <section id="about" className="py-16 sm:py-20 lg:py-28">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Image */}
          <div className="relative flex justify-center lg:justify-start order-2 lg:order-1">
            <img
              src={POSDevice}
              alt="POS Device"
              className="w-full max-w-[480px] h-auto"
            />
          </div>

          {/* Right Column - Content */}
          <div className="space-y-8 order-1 lg:order-2">
            <div className="space-y-4 text-center lg:text-left">
              <h2 className="text-[28px] sm:text-[32px] font-bold text-gray-900">
                What is the Ondo POS Taxation Platform?
              </h2>
              <p className="text-base sm:text-lg text-gray-600">
                The Ondo POS Taxation Platform helps banks and POS agents comply
                with state tax regulations through:
              </p>
            </div>

            <div className="space-y-6">
              <FeatureItem
                title="Automated tax deductions"
                description="Tax is automatically calculated and deducted from POS transactions."
              />
              <FeatureItem
                title="Transparent income and agent reporting"
                description="Banks declare agent counts and earnings directly on the platform."
              />
              <FeatureItem
                title="Real-time compliance monitoring"
                description="View, download, and track all invoices and payment receipts."
              />
              <FeatureItem
                title="Easy access to tax invoices and receipts"
                description="Stay updated with compliance status and overdue alerts."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIs;
