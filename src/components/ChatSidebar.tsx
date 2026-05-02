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
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <aside>
      <div
        className={`fixed z-20 sm:static top-0 left-0 h-screen w-96 bg-gray-900 border-r border-gray-600 transform ${isModal ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0 transition-transform duration-300 flex flex-col`}
      >
        {/* header */}
        <div
          className={`flex relative border-b-gray-400 py-6 px-2 gap-4 border-b border-gray-900 justify-center items-center`}
        >
          <div
            className={`w-12 h-12 rounded-full bg-transparent flex justify-center items-center border border-gray-700`}
          >
            <UserRound size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold">username</span>
            <span className="text-sm font-mono">Online</span>
          </div>
          <div className="flex justify-end mb-0 ml-auto gap-5">
            <button className="flex bg-gray-700 w-10 h-10 justify-center items-center rounded-lg hover:bg-green-600 cursor-pointer">
              <MessageCirclePlus size={30} />
            </button>
            <button
              className="sm:hidden flex bg-gray-700 w-10 h-10 justify-center items-center rounded-lg hover:bg-red-600 cursor-pointer"
              onClick={() => setIsModal(false)}
            >
              <X size={30} />
            </button>
          </div>
        </div>
        {/* search bar, chats, and all users*/}
        <div className="flex flex-col relative justify-center items-center ">
          <div className="flex relative p-4 w-92 justify-center items-center ">
            <Search className="absolute left-6 text-gray-400" size={18} />
            <input
              type="search"
              placeholder="Search chats..."
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-700 w-full pl-10 pr-3 h-12 text-lg rounded-xl appearance-none"
            />
            {searchQuery && (
              <button
                className="absolute right-6"
                onClick={() => setSearchQuery("")}
              >
                <X size={18} />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="absolute top-full mt-2 w-84 h-12 max-h-60 overflow-y-auto bg-gray-800 rounded-lg shadow-lg z-30">
              {users
                ?.filter(
                  (u) =>
                    u._id !== loggedInUser?._id &&
                    u.name.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((u) => (
                  <button key={u._id} className="cursor-pointer">
                    <div className="flex flex-1 relative p-3 gap-4">
                      <div className="relative items-center">
                        <UserCircle size={30} />
                      </div>
                      <div className="text-xl">{u.name}</div>
                    </div>
                  </button>
                ))}
            </div>
          )}
          <div className="w-92 flex gap-5 pl-5">
            <button
              className={`${toggleChats === "chats" ? "bg-blue-700" : "bg-gray-600"} w-38 h-12 rounded-lg cursor-pointer`}
              onClick={() => setToggleChats("chats")}
            >
              chats
            </button>
            <button
              className={`${toggleChats === "allUsers" ? "bg-blue-700" : "bg-gray-600"} w-38 h-12 rounded-lg cursor-pointer`}
              onClick={() => setToggleChats("allUsers")}
            >
              All users
            </button>
          </div>
        </div>
        {/* content- RECENT */}
        <div className="flex flex-col pt-3 pl-4 overfloy-y-auto flex-1">
          <span className="text-lg text-slate-400 font-medium">Chats</span>
          {/* show all users */}

          {chats && chats.length > 0 ? (
            <div className="flex flex-col h-full overflow-y-auto">
              {chats.map((chat) => {
                const latestMessage = chat.chat.latestMessage;
                const isSelected = selectedUser === chat.chat._id;
                const isSentByMe = latestMessage.sender === loggedInUser?._id;
                const unseenCount = chat.chat.unseenCount;
                const formatTime = (timestamp: string) => {
                  const now = new Date();
                  const past = new Date(timestamp);

                  const diffMs = now.getTime() - past.getTime();
                  const diffMins = Math.floor(diffMs / (1000 * 60));

                  if (diffMins < 1) return "Just now";

                  if (diffMins < 60) return `${diffMins} min ago`;

                  const diffHours = Math.floor(diffMins / 60);
                  if (diffHours < 24) return `${diffHours} hr ago`;

                  const diffDays = Math.floor(diffHours / 24);
                  return `${diffDays} d ago`;
                };
                return (
                  <button
                    key={chat.chat._id}
                    onClick={() => {
                      setSelectedUser(chat.chat._id);
                    }}
                  >
                    <div
                      className={`w-88 text-left p-4 rounded-lg transition-colors hover:bg-[oklch(28.2%_0.091_267.935)]`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full flex items-center justify-center gap-4">
                          <div>
                            <UserCircle className="text-gray-400" size={48} />
                            {/* show whether user is online or not */}
                          </div>
                        </div>
                        {/* username and latest message */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col">
                            <span className="text-xl font-medium truncate">
                              {chat.user.user.name}
                            </span>
                            <span className="text-sm text-gray-400 truncate">
                              {latestMessage?.text
                                ? latestMessage.text
                                : "image"}
                            </span>
                          </div>
                        </div>
                        {/* time and unseencount */}
                        <div className="flex justify-end gap-2">
                          <div className="flex relative bottom-2">
                            <span className="text-[oklch(70.7%_0.165_254.624)] text-xs">
                              {unseenCount > 0
                                ? formatTime(chat.chat.updatedAt)
                                : ""}
                            </span>
                          </div>
                          <div>
                            {unseenCount > 0 && (
                              <span className="flex w-6 h-6 rounded-full bg-[oklch(37.9%_0.146_265.522)] items-center justify-center text-xs">
                                {unseenCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col flex-1 gap-1 mt-20 items-center">
              <div className="w-24 h-24 bg-gray-700 text-gray-300 flex rounded-full justify-center items-center">
                <MessageCircle size={56} />
              </div>
              <div className="flex flex-col justify-center items-center">
                <p className="text-gray-300">No chats available right now.</p>
                <p className="text-gray-500">
                  Start a new conversation and connect with others.
                </p>
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="border-t border-gray-500 p-4">
          <div className="flex relative justify-between">
            <div className="h-6 w-6">
              <button className="cursor-pointer">
                <UserCircle size={24} />
              </button>
            </div>
            <div className="flex relative gap-5 justify-center items-center">
              <div className="flex w-8 h-8 rounded-full items-center justify-center">
                <button className="cursor-pointer hover:text-[oklch(37.9%_0.146_265.522)]">
                  <Settings />
                </button>
              </div>
              <div className="flex w-8 h-8 rounded-full items-center justify-center">
                <button className="cursor-pointer hover:text-red-500" onClick={handleLogout}>
                  <LogOut />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
