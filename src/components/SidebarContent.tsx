import React from "react";
import { MessageCircle, UserCircle, CheckCheck, Check } from "lucide-react";
import type { User } from "../context/AppContext";

interface SidebarContentProps {
  toggleChats: string;
  setToggleChats: React.Dispatch<React.SetStateAction<string>>;
  chats: any[] | null;
  users: User[] | null;
  loggedInUser: User | null;
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  onlineUsers: string[] | null;
  typingChats: Record<string, string[]>;
  createChat: (u: User) => void;
}

const SidebarContent = ({
  toggleChats,
  setToggleChats,
  chats,
  users,
  loggedInUser,
  selectedUser,
  setSelectedUser,
  onlineUsers,
  typingChats,
  createChat,
}: SidebarContentProps) => {
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
    <>
      {/* chats and all users section */}
      <div className="flex gap-3 px-4 mt-1">
        <button
          className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${
            toggleChats === "chats"
              ? "bg-[#4f46e5] text-white"
              : "bg-[#0f1117] text-gray-400 hover:bg-[#1a1d29] border border-[#1f2230]"
          }`}
          onClick={() => setToggleChats("chats")}
        >
          Chats
        </button>
        <button
          className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${
            toggleChats === "allUsers"
              ? "bg-[#4f46e5] text-white"
              : "bg-[#0f1117] text-gray-400 hover:bg-[#1a1d29] border border-[#1f2230]"
          }`}
          onClick={() => setToggleChats("allUsers")}
        >
          All Users
        </button>
      </div>

      {/* content- RECENT */}
      <div className="flex flex-col flex-1 overflow-y-auto bg-[#13161f] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="px-4 py-3 sticky top-0 bg-[#13161f] z-10">
          <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            {toggleChats === "chats" ? "Recent" : "All Users"}
          </span>
        </div>

        {toggleChats === "chats" ? (
          chats && chats.length > 0 ? (
            <div className="flex flex-col pb-2">
              {chats.map((chat) => {
                const latestMessage = chat.chat.latestMessage;
                const isSelected = selectedUser === chat.chat._id;
                const unseenCount = chat.chat.unseenCount;

                return (
                  <button
                    key={chat.chat._id}
                    onClick={() => setSelectedUser(chat.chat._id)}
                    className="w-full"
                  >
                    <div
                      className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-colors ${
                        isSelected
                          ? "bg-[#1a1d29] border border-[#1f2230]"
                          : "hover:bg-[#1a1d29] border border-transparent"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {chat.user?.avatar || chat.user?.user?.avatar ? (
                          <img
                            src={chat.user?.avatar || chat.user?.user?.avatar}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full object-cover border border-indigo-500/30"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                            <UserCircle size={28} />
                          </div>
                        )}
                        {/* online status */}
                        {onlineUsers?.includes(
                          chat.user?._id || chat.user?.user?._id,
                        ) && (
                          <div className="absolute -top-0 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#13161f] rounded-full"></div>
                        )}
                      </div>

                      {/* username and latest message */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[15px] font-medium text-gray-100 truncate pr-2">
                            {chat.user?.name ||
                              chat.user?.user?.name ||
                              "Unknown"}
                          </span>
                          <span
                            className={`text-xs whitespace-nowrap ${
                              unseenCount > 0
                                ? "text-indigo-400 font-medium"
                                : "text-gray-500"
                            }`}
                          >
                            {latestMessage
                              ? formatTime(chat.chat.updatedAt)
                              : ""}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          {typingChats &&
                          typingChats[chat.chat._id]?.length > 0 &&
                          !isSelected ? (
                            <span className="text-sm truncate pr-2 text-indigo-400 font-medium italic">
                              typing...
                            </span>
                          ) : (
                            <span
                              className={`text-sm truncate pr-2 flex items-center gap-1 ${
                                unseenCount > 0
                                  ? "text-gray-200 font-medium"
                                  : "text-gray-500"
                              }`}
                            >
                              {latestMessage?.sender === loggedInUser?._id && (
                                <span className="flex items-center flex-shrink-0">
                                  {latestMessage.status === "seen" ? (
                                    <CheckCheck
                                      size={14}
                                      className="text-blue-400"
                                    />
                                  ) : latestMessage.status === "delivered" ||
                                    (latestMessage.status === "sent" &&
                                      onlineUsers?.includes(
                                        chat.user?._id || chat.user?.user?._id,
                                      )) ? (
                                    <CheckCheck
                                      size={14}
                                      className="text-gray-400"
                                    />
                                  ) : (
                                    <Check
                                      size={14}
                                      className="text-gray-400"
                                    />
                                  )}
                                </span>
                              )}
                              <span className="truncate">
                                {latestMessage?.text
                                  ? latestMessage.text
                                  : latestMessage?.image
                                  ? "📷 Image"
                                  : "No messages yet"}
                              </span>
                            </span>
                          )}
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
          )
        ) : users &&
          users.filter((u) => u._id !== loggedInUser?._id).length > 0 ? (
          <div className="flex flex-col pb-2">
            {users
              .filter((u) => u._id !== loggedInUser?._id)
              .map((u) => {
                const isOnline = onlineUsers?.includes(u._id);
                return (
                  <button
                    key={u._id}
                    onClick={() => createChat(u)}
                    className="w-full"
                  >
                    <div className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl hover:bg-[#1a1d29] transition-colors">
                      <div className="relative flex-shrink-0">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-12 h-12 rounded-full object-cover border border-indigo-500/30"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                            <UserCircle size={28} />
                          </div>
                        )}
                        {isOnline && (
                          <div className="absolute -top-0 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#13161f] rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[15px] font-medium text-gray-100 truncate pr-2">
                            {u.name}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              isOnline
                                ? "bg-green-500/20 text-green-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {isOnline ? "Online" : "Offline"}
                          </span>
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
              <UserCircle size={32} />
            </div>
            <p className="text-gray-200 font-medium mb-1">No users found</p>
            <p className="text-sm text-gray-500 max-w-[200px]">
              There are no other users registered yet.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default SidebarContent;
