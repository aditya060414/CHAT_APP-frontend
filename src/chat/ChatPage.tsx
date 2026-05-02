import { useEffect, useState } from "react";
import { UseAppData, type User } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import ChatSidebar from "../components/ChatSidebar";

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

  if (loading) return <Loading />;
  return (
    <>
      <div className="min-h-screen bg-gray-800 text-white relative overflow-hidden">
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
        />
      </div>
    </>
  );
};

export default ChatPage;
