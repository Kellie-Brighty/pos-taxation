import React, { useState } from "react";
import Logo from "../../assets/logo.svg";
import { ScrollLink } from "../shared";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onGetStarted: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

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

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="text-[15px] font-medium text-[#0066FF] hover:opacity-80 transition-opacity px-6 py-2"
            >
              Login
            </button>
          <button
            onClick={onGetStarted}
              className="btn-primary text-[15px] font-medium px-6 py-2"
          >
            Get Started
          </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isMenuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
            )}
          </button>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden fixed inset-0 z-40 bg-white">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4">
                  <ScrollLink to="home" className="flex items-center">
                    <img
                      src={Logo}
                      alt="POS Taxation Logo"
                      className="h-8 w-8"
                    />
                  </ScrollLink>
                  <button
                    onClick={closeMenu}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex flex-col gap-4">
                <ScrollLink
                  to="home"
                      className="text-[15px] font-medium text-gray-900 hover:text-[#0066FF] transition-colors py-2"
                  onClick={closeMenu}
                >
                  Home
                </ScrollLink>
                <ScrollLink
                  to="about"
                      className="text-[15px] font-medium text-gray-900 hover:text-[#0066FF] transition-colors py-2"
                  onClick={closeMenu}
                >
                  About
                </ScrollLink>
                <ScrollLink
                  to="how-it-works"
                      className="text-[15px] font-medium text-gray-900 hover:text-[#0066FF] transition-colors py-2"
                  onClick={closeMenu}
                >
                  How it works
                </ScrollLink>
                <ScrollLink
                  to="contact"
                      className="text-[15px] font-medium text-gray-900 hover:text-[#0066FF] transition-colors py-2"
                  onClick={closeMenu}
                >
                  Contact
                </ScrollLink>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <button
                    onClick={() => {
                      closeMenu();
                      navigate("/login");
                    }}
                    className="w-full text-[15px] font-medium text-[#0066FF] hover:opacity-80 transition-opacity px-6 py-2"
                  >
                    Login
                  </button>
                <button
                  onClick={() => {
                    closeMenu();
                    onGetStarted();
                  }}
                    className="w-full btn-primary text-[15px] font-medium px-6 py-2"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
