import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePOSAgents } from "../../context/POSAgentContext";
import { useAuth } from "../../context/AuthContext";

// Add interface for InputField props
interface InputFieldProps {
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
}

const AddPOSAgent: React.FC = () => {
  const navigate = useNavigate();
  const { addAgent, loading, error } = usePOSAgents();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "John Doe Elijah",
    businessName: "JD POS Service",
    phoneNumber: "+ 234 81 3749 6017",
    email: "johndoe@gmail.com",
    businessRegNumber: "BN1234567",
    businessAddress: "15, Bank Street, Akure, Ondo State",
  });
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validate form
    if (
      !formData.fullName ||
      !formData.businessName ||
      !formData.phoneNumber ||
      !formData.businessAddress
    ) {
      setFormError("Please fill in all required fields");
      return;
    }

    if (!confirmAccuracy) {
      setFormError("Please confirm that the details provided are accurate");
      return;
    }

    try {
      setIsSubmitting(true);

      // Add bankId to link the agent to the current bank
      await addAgent({
        ...formData,
        bankId: currentUser?.uid,
      });

      // Redirect back to POS Agents list
      navigate("/bank/dashboard/pos-agents");
    } catch (err) {
      console.error("Error adding POS agent:", err);
      setFormError("Failed to add POS agent. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom input field component with icon
  const InputField: React.FC<InputFieldProps> = ({
    id,
    name,
    type = "text",
    value,
    onChange,
    label,
    required = false,
    icon = null,
  }) => (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label} {required && <span className="text-[#4400B8]">*</span>}
      </label>
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`block w-full ${
            icon ? "pl-10" : "pl-4"
          } pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#4400B8] focus:border-[#4400B8] transition-all duration-200 hover:border-gray-400`}
        />
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Register a New POS Agent
      </h1>
      <p className="text-gray-600 mb-8 text-lg">
        Enter the agent's details below. Ensure all information is accurate, as
        it will be used for tax records and compliance monitoring.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Show error message if any */}
        {(formError || error) && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{formError || error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {/* Agent Full Name */}
          <InputField
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            label="Agent Full Name"
            required={true}
            icon={
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            }
          />

          {/* Agent Business Name */}
          <InputField
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            label="Agent Business Name"
            required={true}
            icon={
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                  clipRule="evenodd"
                />
              </svg>
            }
          />

          {/* Agent Phone Number */}
          <InputField
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            label="Agent Phone Number"
            required={true}
            icon={
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            }
          />

          {/* Agent Email Address */}
          <InputField
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            label="Agent Email Address (Optional)"
            icon={
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            }
          />
        </div>

        {/* Business Registration Number */}
        <InputField
          id="businessRegNumber"
          name="businessRegNumber"
          value={formData.businessRegNumber}
          onChange={handleChange}
          label="Business Registration Number (Optional for POS agents without corporate registration)"
          icon={
            <svg
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
          }
        />

        {/* Business Address */}
        <InputField
          id="businessAddress"
          name="businessAddress"
          value={formData.businessAddress}
          onChange={handleChange}
          label="Business Address"
          required={true}
          icon={
            <svg
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
          }
        />

        {/* Confirmation Checkbox */}
        <div className="flex items-start mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id="confirmAccuracy"
              checked={confirmAccuracy}
              onChange={() => setConfirmAccuracy(!confirmAccuracy)}
              className="w-4 h-4 rounded border-gray-300 text-[#4400B8] focus:ring-[#4400B8]"
            />
          </div>
          <label
            htmlFor="confirmAccuracy"
            className="ml-3 block text-sm font-medium text-gray-700"
          >
            I confirm that the details provided are accurate and up to date.
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={isSubmitting || loading || !confirmAccuracy}
            className="px-8 py-3 bg-[#4400B8] text-white text-lg font-medium rounded-lg hover:bg-[#4400B8]/90 disabled:opacity-50 transition-colors duration-200 shadow-md"
          >
            {isSubmitting || loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding Agent...
              </span>
            ) : (
              "Add Agent"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPOSAgent;
