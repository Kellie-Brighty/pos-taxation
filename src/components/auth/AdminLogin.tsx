import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically authenticate with your backend
    // For now, we'll just simulate a login
    if (formData.email && formData.password) {
      // Navigate to admin dashboard on successful login
      navigate("/admin/dashboard");
    } else {
      setError("Please fill in all fields");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Section - Scrollable */}
      <div className="min-h-screen overflow-y-auto">
        <div className="p-8 lg:p-12 xl:p-16">
          <div className="max-w-[440px] mx-auto">
            {/* Brand */}
            <div className="space-y-16">
              <div>
                <p className="text-[#4400B8] text-sm">POS Taxation</p>
              </div>

              {/* Form Section */}
              <div className="space-y-6">
                <div className="space-y-1">
                  <h1 className="text-[28px] font-bold text-[#4400B8]">
                    Admin Portal
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Sign in to access the administrative dashboard for POS tax
                    management.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-sm"
                        placeholder="Enter your email address"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-sm"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="remember"
                        className="h-4 w-4 text-[#4400B8] focus:ring-[#4400B8] border-gray-300 rounded"
                      />
                      <label
                        htmlFor="remember"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Remember me
                      </label>
                    </div>
                    <Link
                      to="/admin/forgot-password"
                      className="text-sm text-[#4400B8] hover:text-[#4400B8]/80"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#4400B8] hover:bg-[#4400B8]/90 text-white py-3 px-6 rounded-lg transition-colors text-base"
                  >
                    Sign In
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Fixed */}
      <div className="hidden lg:block bg-[#4400B8] fixed top-0 right-0 w-1/2 h-screen">
        <div className="h-full flex items-center p-8 lg:p-12 xl:p-16">
          <div className="max-w-[480px] space-y-6">
            <h2 className="text-[48px] leading-tight font-bold text-white">
              POS Tax Management System
            </h2>
            <p className="text-white/90 text-xl leading-relaxed">
              Access administrative tools to manage POS agents, monitor tax
              compliance, and oversee revenue collection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
