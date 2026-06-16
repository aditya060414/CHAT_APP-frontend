import React from "react";
import { Search, X, UserCircle } from "lucide-react";
import type { User } from "../context/AppContext";

interface SidebarSearchProps {
  userSearch: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  users: User[] | null;
  loggedInUser: User | null;
  createChat: (u: User) => void;
  onlineUsers: string[] | null;
  searchRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const SidebarSearch = ({
  userSearch,
  searchQuery,
  setSearchQuery,
  users,
  loggedInUser,
  createChat,
  onlineUsers,
  searchRef,
  inputRef,
}: SidebarSearchProps) => {
  return (
    <div
      ref={searchRef}
      className={`transition-all duration-300 ease-in-out ${
        userSearch
          ? "max-h-[76px] opacity-100 border-b border-[#1f2230] pb-4 pointer-events-auto"
          : "max-h-0 opacity-0 border-b border-transparent pb-0 pointer-events-none overflow-hidden"
      }`}
    >
      <div className="flex flex-col relative w-full">
        <div className="flex relative p-4 w-full justify-center items-center">
          <Search className="absolute left-7 text-gray-500" size={18} />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            tabIndex={userSearch ? 0 : -1}
            className="bg-[#0f1117] text-gray-100 placeholder-gray-500 w-full pl-10 pr-10 h-11 text-sm rounded-xl appearance-none border border-[#1f2230] focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all duration-200"
          />
          {searchQuery && (
            <button
              className="absolute right-7 text-gray-400 hover:text-gray-200 hover:scale-110 active:scale-95 transition-transform duration-150 cursor-pointer"
              onClick={() => setSearchQuery("")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {searchQuery && (
          <div className="absolute top-16 left-4 right-4 mt-1 max-h-60 overflow-y-auto bg-[#13161f] border border-[#1f2230] rounded-lg shadow-xl z-30 flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {users
              ?.filter(
                (u) =>
                  u._id !== loggedInUser?._id &&
                  u.name.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map((u) => (
                <button
                  key={u._id}
                  className="cursor-pointer w-full text-left hover:bg-[#1a1d29] transition-colors border-b border-[#1f2230] last:border-0"
                  onClick={() => {
                    createChat(u);
                    setSearchQuery("");
                  }}
                >
                  <div className="flex relative p-3 gap-3 items-center">
                    <div className="relative flex-shrink-0">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border border-indigo-500/30"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                          <UserCircle size={24} />
                        </div>
                      )}
                      {onlineUsers?.includes(u._id) && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#13161f] rounded-full"></div>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-200">
                      {u.name}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarSearch;
