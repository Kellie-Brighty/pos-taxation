import React from "react";
import { useNavigate } from "react-router-dom";
import { Header, Hero, WhatIs, HowItWorks, Footer } from "../components/layout";
import { ScrollToTop } from "../components/shared";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/register");
  };

  return (
    <div className="relative w-full min-h-screen mx-auto max-w-[1440px]">
      <Header onGetStarted={handleGetStarted} />
      <main className="w-full">
        <Hero onGetStarted={handleGetStarted} />
        <section className="px-[10px] md:px-[70px]">
          <WhatIs />
          <HowItWorks />
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default LandingPage;
