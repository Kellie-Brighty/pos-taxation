import React, { useState } from "react";

interface BankProfile {
  bankName: string;
  bankCode: string;
  primaryContact: string;
  contactEmail: string;
  contactPhone: string;
  headOfficeAddress: string;
}

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<BankProfile>({
    bankName: "Zenith Bank",
    bankCode: "XYZ123",
    primaryContact: "Mr. Akinwale Ajayi",
    contactEmail: "compliance@zenithbank.com",
    contactPhone: "+234 812 345 6789",
    headOfficeAddress: "10 Bank Road, Akure, Ondo State",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    // Here you would typically save the changes to your backend
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setProfile({
      bankName: "Zenith Bank",
      bankCode: "XYZ123",
      primaryContact: "Mr. Akinwale Ajayi",
      contactEmail: "compliance@zenithbank.com",
      contactPhone: "+234 812 345 6789",
      headOfficeAddress: "10 Bank Road, Akure, Ondo State",
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-8">
              <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                </svg>
              </button>
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search for anything..."
                  className="w-[300px] pl-10 pr-4 py-2 bg-[#F8F9FE] rounded-lg text-sm focus:outline-none"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8.5 3a5.5 5.5 0 014.227 9.02l4.127 4.126a.5.5 0 01-.638.765l-.07-.057-4.126-4.127A5.5 5.5 0 118.5 3zm0 1a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3B3B] rounded-full"></span>
              </button>
              <button className="w-8 h-8 rounded-full bg-gray-200"></button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8 bg-[#F8F9FE] min-h-[calc(100vh-4rem)]">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Profile Page
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your bank's profile, key contact details, and payment
                preferences. Keeping this information accurate helps ensure
                smooth communication and processing of tax invoices.
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-[#4400B8] text-sm font-medium hover:opacity-80 transition-opacity flex items-center gap-1"
              >
                Edit Profile
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-6 space-y-6"
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="bankName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Bank Name
                </label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={profile.bankName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4400B8]/20 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label
                  htmlFor="bankCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Bank Code
                </label>
                <input
                  type="text"
                  id="bankCode"
                  name="bankCode"
                  value={profile.bankCode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4400B8]/20 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label
                  htmlFor="primaryContact"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Primary Contact Person
                </label>
                <input
                  type="text"
                  id="primaryContact"
                  name="primaryContact"
                  value={profile.primaryContact}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4400B8]/20 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label
                  htmlFor="contactEmail"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={profile.contactEmail}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4400B8]/20 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label
                  htmlFor="contactPhone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={profile.contactPhone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4400B8]/20 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label
                  htmlFor="headOfficeAddress"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Head Office Address
                </label>
                <input
                  type="text"
                  id="headOfficeAddress"
                  name="headOfficeAddress"
                  value={profile.headOfficeAddress}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4400B8]/20 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4400B8] text-white rounded-lg text-sm font-medium hover:bg-[#4400B8]/90 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default Settings;
