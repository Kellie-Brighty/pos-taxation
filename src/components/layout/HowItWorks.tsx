import React from "react";
import POSTransaction from "../../assets/how-it.svg";

interface StepItemProps {
  title: string;
  description: string;
}

const StepItem: React.FC<StepItemProps> = ({ title, description }) => (
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

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-28">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-[28px] sm:text-[32px] font-bold text-gray-900">
                How it Works
              </h2>
            </div>

            <div className="space-y-6">
              <StepItem
                title="Banks Declare POS Agents & Income"
                description="Banks submit agent numbers and earnings for each tax period"
              />
              <StepItem
                title="Admin Reviews & Sends Tax Invoice"
                description="The government reviews the submission and issues a tax invoice."
              />
              <StepItem
                title="POS Agents Stay Compliant Automatically"
                description="Banks pay their taxes online and receive instant receipts."
              />
              <StepItem
                title="Banks Pay Directly on the Platform"
                description="POS agents' tax compliance is automatically tracked and updated."
              />
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative flex justify-center lg:justify-end">
            <img
              src={POSTransaction}
              alt="POS Transaction"
              className="w-full max-w-[520px] h-auto rounded-2xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
