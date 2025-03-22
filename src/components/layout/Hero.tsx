import React from "react";
import { useNavigate } from "react-router-dom";
import HeroPattern from "../../assets/hero-pattern.svg";
import DashboardPreview from "../../assets/pos-hero.svg";

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      className="relative w-full h-screen bg-[#E0EDFF] overflow-hidden pt-[10px] md:pt-[50px] px-[10px] md:px-[70px]"
    >
      {/* Hero Pattern */}
      <div className="absolute inset-0 z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] opacity-20">
          <img src={HeroPattern} alt="" className="w-full h-full" />
        </div>
      </div>

      <div className="container h-full z-40 absolute inset-0 top-20 px-[10px] md:px-[70px]">
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
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <button
                    onClick={onGetStarted}
                    className="btn-primary text-base px-8 py-3 w-full sm:w-auto"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="text-[15px] font-medium text-[#0066FF] hover:opacity-80 transition-opacity px-8 py-3 w-full md:w-auto flex items-center justify-center gap-2"
                  >
                    Login
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="transform rotate-180"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.707 4.293a1 1 0 0 1 0 1.414L6.414 9H17a1 1 0 1 1 0 2H6.414l3.293 3.293a1 1 0 0 1-1.414 1.414l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 0 1 1.414 0z"
                      />
                    </svg>
                  </button>
                </div>
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
