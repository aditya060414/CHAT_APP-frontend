import { use, useEffect, useState } from "react";
import { UseAppData, type User } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import ChatSidebar from "../components/ChatSidebar";
import { chat_Services } from "../API/API";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import ChatBody from "../components/ChatBody";
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

      {/* ChatBody*/}
      <ChatBody
        selectedUser={selectedUser}
        isTyping={isTyping}
        setIsTyping={setIsTyping}
        user={user}
        messages={messages}
        loggedInUser={loggedInUser}
      />
    </div>
  );
};

export default ChatPage;
