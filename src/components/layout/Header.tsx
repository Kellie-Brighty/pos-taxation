import React, { useState } from "react";
import Logo from "../../assets/logo.svg";
import { ScrollLink } from "../shared";

interface HeaderProps {
  onGetStarted: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="absolute w-full top-0 left-0 z-50">
      <div className="container py-6">
        <nav className="flex items-center justify-between">
          <ScrollLink to="home" className="flex items-center z-50">
            <img src={Logo} alt="POS Taxation Logo" className="h-8 w-8" />
          </ScrollLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            <ScrollLink
              to="home"
              className="text-[15px] font-medium text-gray-900 hover:text-[#0066FF] transition-colors"
            >
              Home
            </ScrollLink>
            <ScrollLink
              to="about"
              className="text-[15px] font-medium text-gray-900 hover:text-[#0066FF] transition-colors"
            >
              About
            </ScrollLink>
            <ScrollLink
              to="how-it-works"
              className="text-[15px] font-medium text-gray-900 hover:text-[#0066FF] transition-colors"
            >
              How it works
            </ScrollLink>
            <ScrollLink
              to="contact"
              className="text-[15px] font-medium text-gray-900 hover:text-[#0066FF] transition-colors"
            >
              Contact
            </ScrollLink>
          </div>

          {/* Desktop CTA Button */}
          <button
            onClick={onGetStarted}
            className="hidden md:block btn-primary text-[15px] font-medium px-6 py-2"
          >
            Get Started
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden z-50 p-2"
            aria-label="Toggle menu"
          >
            <div className="w-6 flex flex-col gap-1.5">
              <span
                className={`block h-0.5 w-full bg-gray-900 transition-all duration-300 ${
                  isMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-gray-900 transition-all duration-300 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-gray-900 transition-all duration-300 ${
                  isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>

          {/* Mobile Menu */}
          <div
            className={`
            fixed inset-0 bg-white transition-transform duration-300 md:hidden
            ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
          `}
          >
            <div className="container pt-24">
              <div className="flex flex-col gap-8">
                <ScrollLink
                  to="home"
                  className="text-2xl font-medium text-gray-900 hover:text-[#0066FF] transition-colors"
                  onClick={closeMenu}
                >
                  Home
                </ScrollLink>
                <ScrollLink
                  to="about"
                  className="text-2xl font-medium text-gray-900 hover:text-[#0066FF] transition-colors"
                  onClick={closeMenu}
                >
                  About
                </ScrollLink>
                <ScrollLink
                  to="how-it-works"
                  className="text-2xl font-medium text-gray-900 hover:text-[#0066FF] transition-colors"
                  onClick={closeMenu}
                >
                  How it works
                </ScrollLink>
                <ScrollLink
                  to="contact"
                  className="text-2xl font-medium text-gray-900 hover:text-[#0066FF] transition-colors"
                  onClick={closeMenu}
                >
                  Contact
                </ScrollLink>
                <button
                  onClick={() => {
                    closeMenu();
                    onGetStarted();
                  }}
                  className="btn-primary text-[15px] font-medium px-6 py-3 mt-4"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
