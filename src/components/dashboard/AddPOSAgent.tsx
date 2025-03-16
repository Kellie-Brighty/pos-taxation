import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AddPOSAgent: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    agentName: "",
    businessName: "",
    phoneNumber: "",
    emailAddress: "",
    businessRegistrationNumber: "",
    businessAddress: "",
    agreeToTerms: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically submit the form data to your backend
    console.log("Form submitted:", formData);
    // Navigate back to the POS agents list
    navigate("/bank/dashboard/pos-agents");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Register a New POS Agent
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter the agent's details below. Ensure all information is accurate as
          it will be used for tax records and compliance monitoring.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Agent Name */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Agent's Full Name (Required)
          </label>
          <input
            type="text"
            name="agentName"
            value={formData.agentName}
            onChange={handleChange}
            required
            placeholder="John Doe Smith"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#4400B8] focus:border-[#4400B8] text-sm"
          />
        </div>

        {/* Business Name */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Agent Business Name (Required)
          </label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            required
            placeholder="JD POS Service"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#4400B8] focus:border-[#4400B8] text-sm"
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Agent Phone Number (Required)
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            placeholder="+234 81 8368 8917"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#4400B8] focus:border-[#4400B8] text-sm"
          />
        </div>

        {/* Email Address */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Agent Email Address (Optional)
          </label>
          <input
            type="email"
            name="emailAddress"
            value={formData.emailAddress}
            onChange={handleChange}
            placeholder="johndoe@gmail.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#4400B8] focus:border-[#4400B8] text-sm"
          />
        </div>

        {/* Business Registration Number */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Business Registration Number (Optional for POS agents without
            corporate registration)
          </label>
          <input
            type="text"
            name="businessRegistrationNumber"
            value={formData.businessRegistrationNumber}
            onChange={handleChange}
            placeholder="RC123456"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#4400B8] focus:border-[#4400B8] text-sm"
          />
        </div>

        {/* Business Address */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Business Address (Required)
          </label>
          <textarea
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleChange}
            required
            placeholder="15, Bank Street, Akure, Ondo State"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#4400B8] focus:border-[#4400B8] text-sm"
          />
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#4400B8] focus:ring-[#4400B8]"
          />
          <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
            I confirm that the details provided are accurate and up to date.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={!formData.agreeToTerms}
            className="px-6 py-2 bg-[#4400B8] text-white rounded-lg text-sm font-medium hover:bg-[#4400B8]/90 focus:outline-none focus:ring-2 focus:ring-[#4400B8]/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Agent
          </button>
          <Link
            to="/bank/dashboard/pos-agents"
            className="px-6 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AddPOSAgent;
