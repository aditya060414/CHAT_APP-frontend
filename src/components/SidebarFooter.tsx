import { useEffect, useState } from "react";
import { UserRound, Settings, LogOut } from "lucide-react";
import type { User } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
interface SidebarFooterProps {
  loggedInUser: User | null;
  handleLogout: () => void;
}

const SidebarFooter = ({ loggedInUser, handleLogout }: SidebarFooterProps) => {
  const navigate = useNavigate();
  const [isSettingModal, setIsSettingModal] = useState(false);

  const handleSetting = () => {
    setIsSettingModal(true);
  };
  useEffect(() => {
    if (isSettingModal) {
      navigate("/setting");
    }
  }, [isSettingModal]);
  return (
    <div className="p-4 border-t border-[#1f2230] bg-[#13161f] mt-auto flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group min-w-0">
          {loggedInUser?.avatar ? (
            <img
              src={loggedInUser.avatar}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-indigo-500/20"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex justify-center items-center group-hover:bg-indigo-500/30 transition-colors flex-shrink-0">
              <UserRound size={16} />
            </div>
          )}
          <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100 truncate">
            {loggedInUser?.name || "Profile"}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#4f46e5] hover:bg-[#1a1d29] transition-all cursor-pointer">
            <Settings size={18} onClick={handleSetting} />
          </button>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidebarFooter;
