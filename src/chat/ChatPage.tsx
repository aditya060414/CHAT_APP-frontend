import { useEffect, useState } from "react";
import { UseAppData, type User } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import ChatSidebar from "../components/ChatSidebar";
import { chat_Services } from "../API/API";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
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

  if (loading) return <Loading />;
  return (
    <>
      <div className="min-h-screen bg-gray-800 text-white flex overflow-hidden">
        <div className="w-[30%] min-w-[280px] max-w-[384px]">
          {
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
          }
        </div>
        {/* selected chat after click */}
        <div className="flex flex-1 flex-col bg-[oklch(21%_0.034_264.660)]">
          {/* headerr */}
          <div className="flex relative p-2 top-0 w-full bg-transparent h-24 border-b border-[oklch(28.2%_0.091_267.935)] justify-center">
            <div></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
