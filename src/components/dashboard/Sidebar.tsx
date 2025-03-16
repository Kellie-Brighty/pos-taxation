import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClose?: () => void;
  isExternal?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  isActive,
  onClose,
  isExternal,
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClose) {
      onClose();
    }
    if (isExternal) {
      window.open(to, "_blank");
    } else {
      navigate(to);
    }
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
        isActive
          ? "bg-white/10 text-white"
          : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Here you would typically clear any auth tokens or user data
    localStorage.clear();
    sessionStorage.clear();
    // Navigate to the registration type selection page
    navigate("/register");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-[240px] bg-[#4400B8] flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="px-6 py-8">
          <Link to="/dashboard" className="flex items-center">
            <span className="text-lg font-semibold text-white">
              POS Taxation
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <div className="space-y-1 mb-8">
            <p className="px-4 text-xs font-medium text-white/40 uppercase mb-2">
              Quick Links
            </p>
            <div className="space-y-1">
              <NavItem
                to="/dashboard"
                isActive={location.pathname === "/dashboard"}
                onClose={onClose}
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M3 11h6V3H3v8zm0 7h6v-5H3v5zm8 0h6v-8h-6v8zm0-15v5h6V3h-6z" />
                  </svg>
                }
                label="Dashboard"
              />
              <NavItem
                to="/dashboard/tax-summary"
                isActive={location.pathname === "/dashboard/tax-summary"}
                onClose={onClose}
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M16 3H4c-.9 0-1.7.7-1.7 1.7v11.7c0 .9.7 1.7 1.7 1.7h12c.9 0 1.7-.7 1.7-1.7V4.7c0-.9-.7-1.7-1.7-1.7zm0 13.3H4V4.7h12v11.6zM6 8.3h1.7v5.8H6V8.3zm3.3-2.5h1.7v8.3H9.3V5.8zm3.4 5h1.7v3.3h-1.7v-3.3z" />
                  </svg>
                }
                label="Tax Summary"
              />
              <NavItem
                to="/dashboard/invoices"
                isActive={location.pathname === "/dashboard/invoices"}
                onClose={onClose}
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M11.7 2H5c-.9 0-1.7.7-1.7 1.7L3.3 17c0 .9.7 1.7 1.7 1.7h10c.9 0 1.7-.7 1.7-1.7V6.7L11.7 2zM5 17V3.7h5.8v4.2h4.2v9.2H5z" />
                  </svg>
                }
                label="Invoices & Receipts"
              />
            </div>
          </div>

          <div className="space-y-1">
            <p className="px-4 text-xs font-medium text-white/40 uppercase mb-2">
              Account
            </p>
            <div className="space-y-1">
              <NavItem
                to="/dashboard/settings"
                isActive={location.pathname === "/dashboard/settings"}
                onClose={onClose}
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l2.04-1.58c.18-.14.23-.34.12-.51l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L.72 7.71c-.12.21-.08.47.12.61l2.03 1.58c-.05.25-.09.52-.09.78s.02.53.06.78L.78 13.04c-.18.14-.23.34-.12.51l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM10 13.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
                  </svg>
                }
                label="Settings"
              />
              <NavItem
                to="https://www.google.com"
                isExternal={true}
                onClose={onClose}
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.6 2C5.7 2 2.5 5.1 2.5 9c0 3.9 3.2 7 7.1 7h.4v2.5c4.1-2 6.7-5.8 6.7-9.5 0-3.9-3.2-7-7.1-7zm.8 12.1h-1.7v-1.7h1.7v1.7zm0-2.9h-1.7c0-2.7 2.5-2.5 2.5-4.2 0-.9-.8-1.7-1.7-1.7s-1.7.8-1.7 1.7H6.2c0-1.8 1.5-3.3 3.3-3.3s3.3 1.5 3.3 3.3c.1 2.1-2.4 2.3-2.4 4.2z" />
                  </svg>
                }
                label="Support & Help Center"
              />
            </div>
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-4 py-2 w-full"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M14.2 6.7l-1.1 1.1 2.1 2.1H6.7v1.7h8.5l-2.1 2.1 1.1 1.1 4.2-4.2-4.2-4.2zM3.3 4.2h6.7V2.5H3.3c-.9 0-1.7.7-1.7 1.7v11.7c0 .9.7 1.7 1.7 1.7h6.7v-1.7H3.3V4.2z" />
            </svg>
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
