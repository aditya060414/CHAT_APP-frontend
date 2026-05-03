import { useEffect, useState } from "react";
import { UseAppData, type User } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import ChatSidebar from "../components/ChatSidebar";
import { chat_Services } from "../API/API";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { UserCircle, Video, MessageSquareDashed, Send } from "lucide-react";
export interface Message {
  chatId: string;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: string;
  createdAt: string;
}

const ChatPage = () => {
  const navigate = useNavigate();
  const {
    loading,
    isAuth,
    LogoutUser,
    user: loggedInUser,
    fetchChats,
    setChats,
    chats,
    users,
  } = UseAppData();

  const [isModal, setIsModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [toggleChats, setToggleChats] = useState("chats");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  useEffect(() => {
    if (!isAuth && !loading) {
      navigate("/login");
    }
  }, [loading, isAuth, navigate]);

  const handleLogout = () => LogoutUser();

  const handleCreateChat = async (u: User) => {
    const token = Cookies.get("token");
    try {
      const { data } = await axios.post(
        `${chat_Services}/api/v1/chat/new`,
        {
          userId: loggedInUser?._id,
          otherUserId: u._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSelectedUser(data.chatId);
      await fetchChats();
      toast.success("User added to chat.");
    } catch (error) {
      toast.error("Failed to add user to chat.");
    }
  };

  async function fetchChat() {
    const token = Cookies.get("token");
    const { data } = await axios.get(
      `${chat_Services}/api/v1/chat/message/${selectedUser}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    setMessages(data.messages);
    setUser(data.user.user);
    await fetchChats();
  }
  useEffect(() => {
    if (selectedUser) {
      fetchChat();
    }
  }, [selectedUser]);
  if (loading) return <Loading />;

  return (
    <div className="h-screen bg-[#0f1117] text-gray-100 flex overflow-hidden">
      <div className="w-[300px] flex-shrink-0 border-r border-[#1f2230] bg-[#13161f] z-20">
        <ChatSidebar
          isModal={isModal}
          setIsModal={setIsModal}
          toggleChats={toggleChats}
          setToggleChats={setToggleChats}
          users={users}
          loggedInUser={loggedInUser}
          chats={chats}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          handleLogout={handleLogout}
          createChat={handleCreateChat}
        />
      </div>

      {/* Main Panel */}
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
                  <span className="font-semibold text-gray-100">{user?.name || "Unknown"}</span>
                  <span className="text-xs text-indigo-400 font-medium">
                    {isTyping ? "typing..." : "Online"}
                  </span>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                <Video size={20} />
              </button>
            </div>

            {/* Message Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages?.map((msg, idx) => {
                const isMine = msg.sender === loggedInUser?._id;
                return (
                  <div key={idx} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isMine 
                        ? "bg-[#4f46e5] text-white rounded-br-none" 
                        : "bg-[#13161f] text-gray-200 border border-[#1f2230] rounded-bl-none"
                    }`}>
                      {msg.text && <p className="text-sm leading-relaxed break-words">{msg.text}</p>}
                      {msg.image && (
                        <img 
                          src={msg.image.url} 
                          alt="Attachment" 
                          className="max-w-full rounded-lg mt-2 mb-1" 
                        />
                      )}
                      <div className={`text-[10px] mt-1 ${isMine ? "text-indigo-200 text-right" : "text-gray-500 text-left"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
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
                    if (e.key === 'Enter' && message.trim()) {
                      // Send logic handled elsewhere
                    }
                  }}
                />
                <button 
                  className="p-3 bg-[#4f46e5] text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={!message.trim()}
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
            <h3 className="text-xl font-semibold text-gray-100 mb-2">No Chat Selected</h3>
            <p className="text-gray-500 max-w-sm">
              Choose a conversation from the sidebar to start messaging, or create a new chat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
