import React from "react";

interface ResponsiveTableProps {
  children: React.ReactNode;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ children }) => {
  return (
    <div className="relative z-10">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTable;
