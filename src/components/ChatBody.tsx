import React, { useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import {
  UserCircle,
  Video,
  MessageSquareDashed,
  Send,
  Phone,
  EllipsisVertical,
} from "lucide-react";
import type { User } from "../context/AppContext";
import type { Message } from "../chat/ChatPage";
import toast from "react-hot-toast";
import { chat_Services } from "../API/API";
import axios from "axios";

interface ChatBodyProps {
  selectedUser: string | null;
  isTyping: boolean;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;
  messages: Message[] | null;
  loggedInUser: User | null;
}

const ChatBody = ({
  selectedUser,
  isTyping,
  setIsTyping,
  user,
  messages,
  loggedInUser,
}: ChatBodyProps) => {
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // use websocket for real time update
  const handleSendMessage = async () => {
    const token = Cookies.get("token");
    try {
      await axios.post(
        `${chat_Services}/api/v1/chat/message`,
        {
          chatId: messages?.[0]?.chatId,
          text: message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      toast.success("sent");
    } catch (error) {
      toast.error("Message not sent.");
    } finally {
      setMessage("");
    }
  };
  const processedMessages = useMemo(() => {
    return (
      messages?.map((msg) => ({
        ...msg,
        isMine: msg.sender === loggedInUser?._id,
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      })) ?? []
    );
  }, [messages, loggedInUser]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className="flex flex-1 flex-col h-full bg-[#0f1117]">
      {selectedUser ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#13161f] border-b border-[#1f2230]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <UserCircle size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-100">
                  {user?.name || "Unknown"}
                </span>
                {/* socket */}
                {/* <span className="text-xs text-indigo-400 font-medium">
                  {isTyping ? "typing..." : "Online"}
                </span> */}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                <Phone size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                <Video size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                <EllipsisVertical size={20} />
              </button>
            </div>
          </div>

          {/* Message Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 chat-scroll">
            {processedMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 flex flex-col gap-1 shadow-sm ${
                    msg.isMine
                      ? "bg-[#4f46e5] text-white rounded-2xl rounded-br-sm"
                      : "bg-[#1f2230] text-gray-100 rounded-2xl rounded-bl-sm border border-[#2a2d3d]"
                  }`}
                >
                  {msg.text && (
                    <p className="leading-relaxed whitespace-pre-wrap text-[15px]">
                      {msg.text}
                    </p>
                  )}
                  <span
                    className={`text-[11px] font-medium self-end ${
                      msg.isMine ? "text-indigo-200" : "text-gray-400"
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Footer Input */}
          <div className="p-4 bg-[#13161f] border-t border-[#1f2230]">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-[#0f1117] text-gray-100 placeholder-gray-500 rounded-lg px-4 py-3 outline-none border border-[#1f2230] focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (message.trim()) {
                      handleSendMessage();
                    }
                  }
                }}
              />
              <button
                className="p-3 bg-[#4f46e5] text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={!message.trim()}
                onClick={handleSendMessage}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-[#13161f] border border-[#1f2230] flex items-center justify-center mb-4 text-[#4f46e5]">
            <MessageSquareDashed size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">
            No Chat Selected
          </h3>
          <p className="text-gray-500 max-w-sm">
            Choose a conversation from the sidebar to start messaging, or create
            a new chat.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatBody;
