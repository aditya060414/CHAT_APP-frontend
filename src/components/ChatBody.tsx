import React, { useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import {
  UserCircle,
  Video,
  MessageSquareDashed,
  Send,
  Phone,
  EllipsisVertical,
  Check,
  CheckCheck,
  X,
  LogOut,
  Paperclip,
  FileText,
  ArrowLeft,
} from "lucide-react";
import type { User } from "../context/AppContext";
import type { Message } from "../chat/ChatPage";
import toast from "react-hot-toast";
import { chat_Services } from "../API/API";
import axios from "axios";
import { Socket } from "socket.io-client";

interface ChatBodyProps {
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  typingChats: Record<string, string[]>;
  user: User | null;
  messages: Message[] | null;
  loggedInUser: User | null;
  onlineUsers: string[] | null;
  socket: Socket | null;
}

const ChatBody = ({
  selectedUser,
  setSelectedUser,
  typingChats,
  user,
  messages,
  loggedInUser,
  onlineUsers,
  socket,
}: ChatBodyProps) => {
  const wallpaper = localStorage.getItem("chatWallpaper") || "none";
  const fontSize = localStorage.getItem("chatFontSize") || "medium";
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [sending, setSending] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevSelectedUserRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // use websocket for real time update

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) return;
    const previews = incoming.map((f) =>
      f.type.startsWith("image/") || f.type.startsWith("video/")
        ? URL.createObjectURL(f)
        : ""
    );
    setSelectedFiles((prev) => {
      const merged = [...prev, ...incoming];
      setActiveFileIndex(merged.length - incoming.length); // focus first new file
      return merged;
    });
    setFilePreviews((prev) => [...prev, ...previews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setFilePreviews([]);
    setActiveFileIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) clearFiles();
      return next;
    });
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
    setActiveFileIndex((prev) => Math.max(0, prev >= index ? prev - 1 : prev));
  };

  const handleSendMessage = async () => {
    if (!selectedUser) return;
    if (!message.trim() && selectedFiles.length === 0) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
      socket?.emit("stopTyping", { chatId: selectedUser, userId: loggedInUser?._id });
    }

    const token = Cookies.get("token");
    setSending(true);
    try {
      if (selectedFiles.length > 0) {
        // Send one request per file, caption only on first message
        for (let i = 0; i < selectedFiles.length; i++) {
          const formData = new FormData();
          formData.append("chatId", selectedUser);
          if (i === 0 && message.trim()) formData.append("text", message);
          formData.append("image", selectedFiles[i]);
          await axios.post(`${chat_Services}/api/v1/chat/message`, formData, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } else {
        const formData = new FormData();
        formData.append("chatId", selectedUser);
        formData.append("text", message);
        await axios.post(`${chat_Services}/api/v1/chat/message`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || "Message not sent.";
      toast.error(serverMessage);
    } finally {
      setMessage("");
      clearFiles();
      setSending(false);
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
    if (selectedUser !== prevSelectedUserRef.current) {
      isInitialLoadRef.current = true;
      prevSelectedUserRef.current = selectedUser;
    }
  }, [selectedUser]);

  useEffect(() => {
    if (messages) {
      if (isInitialLoadRef.current) {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
        isInitialLoadRef.current = false;
      } else {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);

  const handleTyping = (value: string) => {
    setMessage(value);
    if (!selectedUser || !socket) return;

    if (value.trim()) {
      socket.emit("typing", {
        chatId: selectedUser,
        userId: loggedInUser?._id,
      });
    } else {
      socket.emit("stopTyping", {
        chatId: selectedUser,
        userId: loggedInUser?._id,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        chatId: selectedUser,
        userId: loggedInUser?._id,
      });
      typingTimeoutRef.current = null;
    }, 2000);
  };
  return (
    <div className="flex flex-1 flex-col h-full bg-[#0f1117] relative">
      {selectedUser ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-[#13161f] border-b border-[#1f2230]">
            <div className="flex items-center gap-3">
              {/* Mobile Back Button */}
              <button
                onClick={() => setSelectedUser(null)}
                className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-100 hover:bg-[#1a1d29] rounded-lg transition-all"
                title="Back to chats"
              >
                <ArrowLeft size={20} />
              </button>

              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || "User"}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-500/30 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <UserCircle size={24} />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-gray-100">
                  {user?.name || "Unknown"}
                </span>
                {/* socket */}
                {selectedUser && typingChats[selectedUser]?.includes(user?._id as string) ? (
                  <span className="text-xs text-indigo-400 font-medium">
                    typing...
                  </span>
                ) : user?._id && onlineUsers?.includes(user._id) ? (
                  <span className="text-xs text-green-500 font-medium">
                    Online
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 font-medium">
                    Offline
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                <Phone size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                <Video size={20} />
              </button>
              {/* Dropdown Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <EllipsisVertical size={20} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-10 w-44 bg-[#1a1d29] border border-[#2a2d3d] rounded-xl shadow-2xl z-50 overflow-hidden">
                    <button
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      onClick={() => {
                        setSelectedUser(null);
                        setMenuOpen(false);
                      }}
                    >
                      <LogOut size={15} />
                      Close Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message Body */}
          <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 chat-scroll ${
            wallpaper === "dots" ? "bg-pattern-dots" : wallpaper === "grid" ? "bg-pattern-grid" : ""
          }`}>
            {processedMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 flex flex-col gap-1 shadow-sm ${
                    msg.isMine
                      ? "bg-[#4a41f0] text-white rounded-2xl rounded-br-sm"
                      : "bg-[#1f223057] text-gray-100 rounded-2xl rounded-bl-sm border border-[#2a2d3d]"
                  }`}
                >
                  {msg.messageType === "image" && msg.image && (
                    <img
                      src={msg.image.url}
                      alt="sent image"
                      className="max-w-full sm:max-w-[280px] rounded-xl mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setImageModalUrl(msg.image!.url)}
                    />
                  )}
                  {msg.messageType === "video" && msg.video && (
                    <video
                      src={msg.video.url}
                      controls
                      className="max-w-full sm:max-w-[280px] rounded-xl mb-1"
                    />
                  )}
                  {msg.messageType === "file" && msg.file && (
                    <a
                      href={msg.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2 mb-1 hover:bg-black/30 transition-colors max-w-full"
                    >
                      <FileText size={20} className="flex-shrink-0" />
                      <span className="text-sm truncate max-w-[130px] sm:max-w-[200px]">{msg.file.name}</span>
                    </a>
                  )}
                  {msg.text && (
                    <p className={`leading-relaxed whitespace-pre-wrap ${
                      fontSize === "small" ? "text-xs" : fontSize === "large" ? "text-[17px]" : "text-[15px]"
                    }`}>
                      {msg.text}
                    </p>
                  )}
                  <div
                    className={`flex items-center gap-1 text-[11px] font-medium self-end ${
                      msg.isMine ? "text-indigo-200" : "text-gray-400"
                    }`}
                  >
                    <span>
                      {msg.time}
                    </span>
                    {msg.isMine && (
                      <span className="ml-0.5 flex items-center">
                        {(msg.status === "seen" || msg.seen) ? (
                          <CheckCheck size={14} className="text-blue-500" />
                        ) : msg.status === "delivered" || (msg.status === "sent" && selectedUser && onlineUsers?.includes(selectedUser)) ? (
                          <CheckCheck size={14} className="text-indigo-300" />
                        ) : (
                          <Check size={14} className="text-indigo-200" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Footer Input */}
          <div className="px-4 pt-2 pb-4 bg-[#13161f] border-t border-[#1f2230]">
            {/* Rich Multi-File Preview Panel */}
            {selectedFiles.length > 0 && (
              <div className="absolute inset-0 z-30 flex flex-col bg-[#0c0e14]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2230] bg-[#13161f]">
                  <span className="text-sm font-semibold text-gray-200">
                    Send {selectedFiles.length} {selectedFiles.length === 1 ? "File" : "Files"}
                  </span>
                  <button
                    onClick={clearFiles}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500/20 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Active File Preview */}
                <div className="flex-1 flex items-center justify-center overflow-hidden p-6">
                  {filePreviews[activeFileIndex] && selectedFiles[activeFileIndex]?.type.startsWith("image/") && (
                    <img
                      src={filePreviews[activeFileIndex]}
                      alt="preview"
                      className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
                    />
                  )}
                  {filePreviews[activeFileIndex] && selectedFiles[activeFileIndex]?.type.startsWith("video/") && (
                    <video
                      src={filePreviews[activeFileIndex]}
                      controls
                      className="max-h-full max-w-full rounded-2xl shadow-2xl"
                    />
                  )}
                  {!filePreviews[activeFileIndex] && selectedFiles[activeFileIndex] && (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-24 h-24 rounded-3xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                        <FileText size={40} className="text-indigo-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-gray-100 font-medium">{selectedFiles[activeFileIndex].name}</p>
                        <p className="text-gray-500 text-sm mt-1">{(selectedFiles[activeFileIndex].size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip */}
                <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveFileIndex(idx)}
                      className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        idx === activeFileIndex ? "border-indigo-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      {filePreviews[idx] && file.type.startsWith("image/") && (
                        <img src={filePreviews[idx]} alt="" className="w-full h-full object-cover" />
                      )}
                      {filePreviews[idx] && file.type.startsWith("video/") && (
                        <video src={filePreviews[idx]} className="w-full h-full object-cover" />
                      )}
                      {!filePreviews[idx] && (
                        <div className="w-full h-full bg-indigo-500/15 flex items-center justify-center">
                          <FileText size={20} className="text-indigo-400" />
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                      >
                        <X size={9} />
                      </button>
                    </div>
                  ))}
                  {/* Add More button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 w-14 h-14 rounded-xl border-2 border-dashed border-[#2a2d3d] flex items-center justify-center text-gray-500 hover:text-indigo-400 hover:border-indigo-500 transition-all"
                    title="Add more files"
                  >
                    <Paperclip size={18} />
                  </button>
                </div>

                {/* Caption + Send */}
                <div className="px-4 pb-4 pt-2 border-t border-[#1f2230] flex items-center gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a caption..."
                    className="flex-1 bg-[#1a1d29] text-gray-100 placeholder-gray-500 rounded-xl px-4 py-3 outline-none border border-[#2a2d3d] focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        const enterToSend = localStorage.getItem("enterToSend") !== "false";
                        if (enterToSend) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }
                    }}
                  />
                  <button
                    className="p-3 bg-[#4f46e5] text-white rounded-xl hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={sending}
                    onClick={handleSendMessage}
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
                className="hidden"
              />
              <button
                className="p-3 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
              >
                <Paperclip size={20} />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-[#0f1117] text-gray-100 placeholder-gray-500 rounded-lg px-4 py-3 outline-none border border-[#1f2230] focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    const enterToSend = localStorage.getItem("enterToSend") !== "false";
                    if (enterToSend) {
                      e.preventDefault();
                      if (message.trim() || selectedFiles) {
                        handleSendMessage();
                      }
                    }
                  }
                }}
              />
              <button
                className="p-3 bg-[#4f46e5] text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={(!message.trim() && !selectedFiles) || sending}
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

      {/* Image Preview Modal */}
      {imageModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setImageModalUrl(null)}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-3 -right-3 w-8 h-8 bg-[#1a1d29] border border-[#2a2d3d] rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-500/80 transition-all z-10"
              onClick={() => setImageModalUrl(null)}
            >
              <X size={15} />
            </button>
            <img
              src={imageModalUrl}
              alt="Full preview"
              className="max-w-[90vw] max-h-[90vh] rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBody;
