import React, { useState } from "react";
import type { User } from "../context/AppContext";

import {
  UserRound,
  X,
  MessageCirclePlus,
  Search,
  UserCircle,
  LogOut,
  Settings,
  MessageCircle,
} from "lucide-react";

interface ChatSidebarProps {
  isModal: boolean;
  setIsModal: React.Dispatch<React.SetStateAction<boolean>>;
  users: User[] | null;
  loggedInUser: User | null;
  chats: any[] | null;
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  handleLogout: () => void;
  createChat: (u: User) => void;
  toggleChats: string;
  setToggleChats: React.Dispatch<React.SetStateAction<string>>;
}

const ChatSidebar = ({
  isModal,
  setIsModal,
  toggleChats,
  setToggleChats,
  users,
  loggedInUser,
  chats,
  selectedUser,
  setSelectedUser,
  handleLogout,
  createChat,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <aside className="h-full">
      <div
        className={`fixed z-20 sm:static top-0 left-0 h-full w-[300px] sm:w-full bg-[#13161f] border-r border-[#1f2230] transform ${isModal ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0 transition-transform duration-300 flex flex-col text-gray-100`}
      >
        {/* header */}
        <div className="flex relative py-6 px-4 gap-4 justify-center items-center border-b border-[#1f2230]">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex justify-center items-center border border-indigo-500/30 flex-shrink-0">
            <UserRound size={24} />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-lg font-semibold truncate">{loggedInUser?.name || "Username"}</span>
            <span className="text-xs text-indigo-400 font-medium">Online</span>
          </div>
          <div className="flex justify-end gap-2 flex-shrink-0">
            <button className="flex bg-[#0f1117] w-10 h-10 justify-center items-center rounded-lg hover:bg-[#4f46e5] text-gray-400 hover:text-white transition-colors border border-[#1f2230]">
              <MessageCirclePlus size={20} />
            </button>
            <button
              className="sm:hidden flex bg-[#0f1117] w-10 h-10 justify-center items-center rounded-lg hover:bg-red-600 text-gray-400 hover:text-white transition-colors border border-[#1f2230]"
              onClick={() => setIsModal(false)}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* search bar, chats, and all users*/}
        <div className="flex flex-col relative w-full border-b border-[#1f2230] pb-4">
          <div className="flex relative p-4 w-full justify-center items-center">
            <Search className="absolute left-7 text-gray-500" size={18} />
            <input
              type="search"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0f1117] text-gray-100 placeholder-gray-500 w-full pl-10 pr-10 h-11 text-sm rounded-xl appearance-none border border-[#1f2230] focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all"
            />
            {searchQuery && (
              <button
                className="absolute right-7 text-gray-400 hover:text-gray-200"
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
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <UserCircle size={24} />
                      </div>
                      <div className="text-sm font-medium text-gray-200">{u.name}</div>
                    </div>
                  </button>
                ))}
            </div>
          )}

          <div className="flex gap-3 px-4 mt-1">
            <button
              className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${toggleChats === "chats" ? "bg-[#4f46e5] text-white" : "bg-[#0f1117] text-gray-400 hover:bg-[#1a1d29] border border-[#1f2230]"}`}
              onClick={() => setToggleChats("chats")}
            >
              Chats
            </button>
            <button
              className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${toggleChats === "allUsers" ? "bg-[#4f46e5] text-white" : "bg-[#0f1117] text-gray-400 hover:bg-[#1a1d29] border border-[#1f2230]"}`}
              onClick={() => setToggleChats("allUsers")}
            >
              All Users
            </button>
          </div>
        </div>

        {/* content- RECENT */}
        <div className="flex flex-col flex-1 overflow-y-auto bg-[#13161f] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="px-4 py-3 sticky top-0 bg-[#13161f] z-10">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Recent</span>
          </div>

          {chats && chats.length > 0 ? (
            <div className="flex flex-col pb-2">
              {chats.map((chat) => {
                const latestMessage = chat.chat.latestMessage;
                const isSelected = selectedUser === chat.chat._id;
                const unseenCount = chat.chat.unseenCount;
                
                const formatTime = (timestamp: string) => {
                  const now = new Date();
                  const past = new Date(timestamp);
                  const diffMs = now.getTime() - past.getTime();
                  const diffMins = Math.floor(diffMs / (1000 * 60));

                  if (diffMins < 1) return "Just now";
                  if (diffMins < 60) return `${diffMins}m`;

                  const diffHours = Math.floor(diffMins / 60);
                  if (diffHours < 24) return `${diffHours}h`;

                  const diffDays = Math.floor(diffHours / 24);
                  return `${diffDays}d`;
                };

                return (
                  <button
                    key={chat.chat._id}
                    onClick={() => setSelectedUser(chat.chat._id)}
                    className="w-full"
                  >
                    <div
                      className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-colors ${isSelected ? "bg-[#1a1d29] border border-[#1f2230]" : "hover:bg-[#1a1d29] border border-transparent"}`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                          <UserCircle size={28} />
                        </div>
                        {/* online status */}
                        {/* {isOnline > 0 && (
                          <div className="absolute -top-0 -right-1 w-3.5 h-3.5 bg-[#4f46e5] border-2 border-[#13161f] rounded-full">
                          </div>
                        )} */}
                      </div>

                      {/* username and latest message */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[15px] font-medium text-gray-100 truncate pr-2">
                            {chat.user.user.name}
                          </span>
                          <span className={`text-xs whitespace-nowrap ${unseenCount > 0 ? "text-indigo-400 font-medium" : "text-gray-500"}`}>
                            {latestMessage ? formatTime(chat.chat.updatedAt) : ""}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm truncate pr-2 ${unseenCount > 0 ? "text-gray-200 font-medium" : "text-gray-500"}`}>
                            {latestMessage?.text
                              ? latestMessage.text
                              : latestMessage?.image
                                ? "📷 Image"
                                : "No messages yet"}
                          </span>
                          {unseenCount > 0 && (
                            <span className="flex-shrink-0 min-w-[20px] h-[20px] px-1.5 rounded-full bg-[#4f46e5] flex items-center justify-center text-[10px] font-bold text-white">
                              {unseenCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col flex-1 items-center justify-center px-4 text-center pb-10">
              <div className="w-16 h-16 bg-[#1a1d29] border border-[#1f2230] text-[#4f46e5] flex rounded-2xl justify-center items-center mb-4">
                <MessageCircle size={32} />
              </div>
              <p className="text-gray-200 font-medium mb-1">No chats yet</p>
              <p className="text-sm text-gray-500 max-w-[200px]">
                Start a new conversation and connect with others.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1f2230] bg-[#13161f] mt-auto flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group min-w-0">
               <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex justify-center items-center group-hover:bg-indigo-500/30 transition-colors flex-shrink-0">
                 <UserRound size={16} />
               </div>
               <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100 truncate">{loggedInUser?.name || "Profile"}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#4f46e5] hover:bg-[#1a1d29] transition-all">
                <Settings size={18} />
              </button>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                onClick={handleLogout}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
