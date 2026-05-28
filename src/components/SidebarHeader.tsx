import React from "react";
import { UserRound, MessageCirclePlus, X } from "lucide-react";
import type { User } from "../context/AppContext";

interface SidebarHeaderProps {
  loggedInUser: User | null;
  userSearch: boolean;
  onToggleSearch: () => void;
  toggleButtonRef: React.RefObject<HTMLButtonElement | null>;
}

const SidebarHeader = ({
  loggedInUser,
  userSearch,
  onToggleSearch,
  toggleButtonRef,
}: SidebarHeaderProps) => {
  return (
    <div className="flex relative py-6 px-4 gap-4 justify-center items-center border-b border-[#1f2230]">
      <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex justify-center items-center border border-indigo-500/30 flex-shrink-0">
        <UserRound size={24} />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-lg font-semibold truncate">
          {loggedInUser?.name || "Username"}
        </span>
        <span className="text-xs text-indigo-400 font-medium">Online</span>
      </div>
      <div className="flex justify-end gap-2 flex-shrink-0">
        <button
          ref={toggleButtonRef}
          className={`flex w-10 h-10 justify-center items-center rounded-lg text-gray-400 hover:text-white transition-all duration-300 border-none cursor-pointer ${
            userSearch
              ? "bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 rotate-90"
              : "hover:bg-[#4f46e5]"
          }`}
          onClick={onToggleSearch}
          aria-label="Toggle user search"
        >
          {userSearch ? <X size={20} /> : <MessageCirclePlus size={20} />}
        </button>
      </div>
    </div>
  );
};

export default SidebarHeader;
