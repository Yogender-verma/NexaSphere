import { useState } from 'react';
import { Shield, EyeOff, Users, Bell, AlertTriangle, UserX, X } from 'lucide-react';

export default function PrivacySettings() {
  const [privacySettings, setPrivacySettings] = useState({
    hideContactInfo: false,
    hidePortfolioFromNonMembers: false,
    disableRecommendations: false,
  });

  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [newBlockedUser, setNewBlockedUser] = useState('');

  const [notificationPreferences, setNotificationPreferences] = useState({
    hackathons: true,
    webinars: true,
    workshops: true,
    meetups: true,
  });

  const handleTogglePrivacy = (key: keyof typeof privacySettings) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleNotification = (key: keyof typeof notificationPreferences) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAddBlockedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBlockedUser.trim() && !blockedUsers.includes(newBlockedUser.trim())) {
      setBlockedUsers([...blockedUsers, newBlockedUser.trim()]);
      setNewBlockedUser('');
    }
  };

  const handleRemoveBlockedUser = (user: string) => {
    setBlockedUsers(blockedUsers.filter((u) => u !== user));
  };

  return (
    <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden mb-8">
      <div className="p-5 border-b border-[#2A2A2A] flex items-center gap-2">
        <Shield className="h-5 w-5 text-[#CC1111]" />
        <div>
          <h3 className="text-lg font-semibold text-white">Privacy Settings</h3>
          <p className="text-sm text-gray-500 mt-1">
            Granular privacy controls for profile visibility and data
          </p>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Profile Visibility Controls */}
        <div>
          <h4 className="text-md font-medium text-white mb-3 flex items-center gap-2">
            <EyeOff size={16} className="text-gray-400" /> Profile Visibility
          </h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-[#222222] rounded-lg cursor-pointer hover:bg-[#2A2A2A] transition-colors">
              <div>
                <p className="text-white text-sm font-medium">Hide Contact Information</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  Hide email and phone number from public view
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.hideContactInfo}
                onChange={() => handleTogglePrivacy('hideContactInfo')}
                className="w-4 h-4 text-[#CC1111] bg-[#1A1A1A] border-[#2A2A2A] rounded focus:ring-[#CC1111] focus:ring-offset-[#1A1A1A]"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#222222] rounded-lg cursor-pointer hover:bg-[#2A2A2A] transition-colors">
              <div>
                <p className="text-white text-sm font-medium">Hide Portfolio from Non-Members</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  Only allow registered NexaSphere members to view your portfolio
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.hidePortfolioFromNonMembers}
                onChange={() => handleTogglePrivacy('hidePortfolioFromNonMembers')}
                className="w-4 h-4 text-[#CC1111] bg-[#1A1A1A] border-[#2A2A2A] rounded focus:ring-[#CC1111] focus:ring-offset-[#1A1A1A]"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#222222] rounded-lg cursor-pointer hover:bg-[#2A2A2A] transition-colors">
              <div>
                <p className="text-white text-sm font-medium">Disable Portfolio Recommendations</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  Opt out of having your portfolio recommended to other users
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.disableRecommendations}
                onChange={() => handleTogglePrivacy('disableRecommendations')}
                className="w-4 h-4 text-[#CC1111] bg-[#1A1A1A] border-[#2A2A2A] rounded focus:ring-[#CC1111] focus:ring-offset-[#1A1A1A]"
              />
            </label>
          </div>
        </div>

        {/* Blocked Users */}
        <div>
          <h4 className="text-md font-medium text-white mb-3 flex items-center gap-2">
            <UserX size={16} className="text-gray-400" /> Blocked Users
          </h4>
          <div className="bg-[#222222] rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-3">
              Block specific users from viewing your profile.
            </p>
            <form onSubmit={handleAddBlockedUser} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter username to block..."
                value={newBlockedUser}
                onChange={(e) => setNewBlockedUser(e.target.value)}
                className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CC1111]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#CC1111] text-white rounded-lg text-sm font-medium hover:bg-[#aa0f0f] transition-colors"
              >
                Block
              </button>
            </form>

            {blockedUsers.length > 0 ? (
              <ul className="space-y-2">
                {blockedUsers.map((user) => (
                  <li
                    key={user}
                    className="flex items-center justify-between bg-[#1A1A1A] px-3 py-2 rounded border border-[#2A2A2A]"
                  >
                    <span className="text-white text-sm">{user}</span>
                    <button
                      onClick={() => handleRemoveBlockedUser(user)}
                      className="text-gray-500 hover:text-[#CC1111] transition-colors"
                      title="Unblock user"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500 italic">No users blocked yet.</p>
            )}
          </div>
        </div>

        {/* Notification Preferences */}
        <div>
          <h4 className="text-md font-medium text-white mb-3 flex items-center gap-2">
            <Bell size={16} className="text-gray-400" /> Event Notification Preferences
          </h4>
          <div className="bg-[#222222] rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-4">
              Control notification preferences per event type.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(notificationPreferences).map(([eventType, enabled]) => (
                <label key={eventType} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() =>
                      handleToggleNotification(eventType as keyof typeof notificationPreferences)
                    }
                    className="w-4 h-4 text-[#CC1111] bg-[#1A1A1A] border-[#2A2A2A] rounded focus:ring-[#CC1111] focus:ring-offset-[#1A1A1A]"
                  />
                  <span className="text-white text-sm capitalize">{eventType}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
