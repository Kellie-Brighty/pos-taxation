import React from "react";
import HeroPattern from "../../assets/hero-pattern.svg";
import DashboardPreview from "../../assets/pos-hero.svg";

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <section
      id="home"
      className="relative w-full h-screen bg-[#E0EDFF] overflow-hidden pt-[10px] md:pt-[50px] px-[10px] md:px-[70px]"
    >
      {/* Hero Pattern */}
      <div className="absolute inset-0">
        <div className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] opacity-[0.15]">
          <img src={HeroPattern} alt="" className="w-full h-full" />
        </div>
      </div>

      <div className="container h-full">
        <div className="flex min-h-screen items-center">
          <div className="grid w-full grid-cols-1 lg:grid-cols-[1fr,1.2fr] gap-8 lg:gap-16 items-center py-20">
            {/* Left Column - Text Content */}
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-[32px] sm:text-[40px] leading-[1.2] lg:text-[56px] font-bold text-gray-900">
                Simplifying POS
                <br />
                Taxation in Ondo State
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-[520px] mx-auto lg:mx-0 leading-relaxed">
                A secure platform for POS Agents and Banks to report, manage,
                and comply with Ondo State's POS taxation policies.
              </p>
              <div className="pt-4">
                <button
                  onClick={onGetStarted}
                  className="btn-primary text-base px-8 py-3 w-full sm:w-auto"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Right Column - Dashboard Preview */}
            <div className="relative w-full flex items-center">
              <div className="w-full">
                <img
                  src={DashboardPreview}
                  alt="POS Dashboard Preview"
                  className="w-full h-auto rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
