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
import { useSocketData } from "../context/SocketContext";

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

  const { onlineUsers, socket } = useSocketData();

  const [isModal, setIsModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [toggleChats, setToggleChats] = useState("chats");
  const [typingChats, setTypingChats] = useState<Record<string, string[]>>({});

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
    setUser(data.user?.user || data.user);
    await fetchChats();
  }
  useEffect(() => {
    if (socket && chats) {
      chats.forEach((chat) => {
        socket.emit("joinChat", chat.chat._id);
      });
    }
  }, [socket, chats]);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = (data: any) => {
      console.log("Received userTyping from backend:", data);
      if (data.userId === loggedInUser?._id) return;
      setTypingChats((prev) => {
        const chatTyping = prev[data.chatId] || [];
        if (!chatTyping.includes(data.userId)) {
          console.log("Adding user to typingChats state");
          return { ...prev, [data.chatId]: [...chatTyping, data.userId] };
        }
        return prev;
      });
    };

    const handleStopTyping = (data: any) => {
      console.log("Received userStoppedTyping from backend:", data);
      setTypingChats((prev) => {
        const chatTyping = prev[data.chatId] || [];
        if (chatTyping.includes(data.userId)) {
          console.log("Removing user from typingChats state");
          return {
            ...prev,
            [data.chatId]: chatTyping.filter((id) => id !== data.userId),
          };
        }
        return prev;
      });
    };

    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStopTyping);

    return () => {
      socket.off("userTyping", handleTyping);
      socket.off("userStoppedTyping", handleStopTyping);
    };
  }, [socket, loggedInUser?._id]);

  useEffect(() => {
    if (selectedUser) {
      fetchChat();
      return () => {
        setMessages(null);
      };
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
          onlineUsers={onlineUsers}
          typingChats={typingChats}
        />
      </div>

      {/* ChatBody*/}
      <ChatBody
        selectedUser={selectedUser}
        user={user}
        messages={messages}
        loggedInUser={loggedInUser}
        onlineUsers={onlineUsers}
        socket={socket}
        typingChats={typingChats}
      />
    </div>
  );
};

export default ChatPage;
