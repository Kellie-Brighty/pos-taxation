import React from "react";

interface UserAvatarProps {
  displayName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * A reusable avatar component that displays a user SVG icon
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  displayName,
  size = "md",
  className = "",
}) => {
  // Size classes
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  // Calculate initials for the avatar if a name is provided
  const getInitials = (): string => {
    if (!displayName) return "";

    const names = displayName.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  };

  const hasInitials = displayName && displayName.trim().length > 0;

  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center bg-[#4400B8]/10 text-[#4400B8] font-medium ${className}`}
    >
      {hasInitials ? (
        <span>{getInitials()}</span>
      ) : (
        <svg
          className="w-5/8 h-5/8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      )}
    </div>
  );
};

export default UserAvatar;
