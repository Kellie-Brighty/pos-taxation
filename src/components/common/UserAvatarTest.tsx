import React from "react";
import UserAvatar from "./UserAvatar";

const UserAvatarTest: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">User Avatar Component Test</h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Sizes</h3>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <UserAvatar size="sm" />
              <p className="mt-2 text-sm">Small</p>
            </div>
            <div className="text-center">
              <UserAvatar size="md" />
              <p className="mt-2 text-sm">Medium (default)</p>
            </div>
            <div className="text-center">
              <UserAvatar size="lg" />
              <p className="mt-2 text-sm">Large</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">With Names</h3>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <UserAvatar displayName="John Doe" size="md" />
              <p className="mt-2 text-sm">John Doe</p>
            </div>
            <div className="text-center">
              <UserAvatar displayName="Access Bank" size="md" />
              <p className="mt-2 text-sm">Access Bank</p>
            </div>
            <div className="text-center">
              <UserAvatar displayName="T" size="md" />
              <p className="mt-2 text-sm">Single Letter</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAvatarTest;
