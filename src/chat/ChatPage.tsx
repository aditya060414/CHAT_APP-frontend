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
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: { url: string; publicId: string; };
  video?: { url: string; publicId: string; };
  file?: { url: string; publicId: string; name: string; mimeType: string; };
  messageType: "text" | "image" | "video" | "file";
  seen: boolean;
  status?: "sent" | "delivered" | "seen";
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
    if (socket) {
      socket.emit("setActiveChat", selectedUser);
    }
  }, [selectedUser, socket]);

  useEffect(() => {
    if (!socket) return;
    socket?.on("newMessage", (message) => {
      if (selectedUser === message.chatId) {
        setMessages((prev) => {
          const currentMsg = prev || [];
          const messageExist = currentMsg.some(
            (msg: any) => msg?._id === message._id,
          );
          if (!messageExist) {
            return [...currentMsg, message];
          }
          return currentMsg;
        });
      }

      setChats((prevChats: any) => {
        if (!prevChats) return prevChats;
        
        const updatedChats = prevChats.map((c: any) => {
          if (c.chat._id === message.chatId) {
            return {
              ...c,
              chat: {
                ...c.chat,
                latestMessage: {
                  text: message.text || (message.image ? "📷 Image" : ""),
                  sender: message.sender,
                  status: message.status,
                  seenAt: message.seenAt,
                },
                updatedAt: message.createdAt,
                unseenCount: message.sender !== loggedInUser?._id && selectedUser !== message.chatId 
                  ? (c.chat.unseenCount || 0) + 1 
                  : c.chat.unseenCount,
              }
            };
          }
          return c;
        });
        
        return updatedChats.sort((a: any, b: any) => 
          new Date(b.chat.updatedAt).getTime() - new Date(a.chat.updatedAt).getTime()
        );
      });
    });
    const handleTyping = (data: any) => {
      if (data.userId === loggedInUser?._id) return;
      setTypingChats((prev) => {
        const chatTyping = prev[data.chatId] || [];
        if (!chatTyping.includes(data.userId)) {
          return { ...prev, [data.chatId]: [...chatTyping, data.userId] };
        }
        return prev;
      });
    };

    const handleStopTyping = (data: any) => {
      setTypingChats((prev) => {
        const chatTyping = prev[data.chatId] || [];
        if (chatTyping.includes(data.userId)) {
          return {
            ...prev,
            [data.chatId]: chatTyping.filter((id) => id !== data.userId),
          };
        }
        return prev;
      });
    };

    const handleMessagesSeen = (data: any) => {
      setMessages((prev) => {
        if (!prev) return prev;
        return prev.map((msg) => {
          if (data.messageIds.includes(msg._id)) {
            return { ...msg, seen: true, status: "seen", seenAt: new Date().toISOString() };
          }
          return msg;
        });
      });
      setChats((prevChats: any) => {
        if (!prevChats) return prevChats;
        return prevChats.map((c: any) => {
          if (c.chat._id === data.chatId) {
            return {
              ...c,
              chat: {
                ...c.chat,
                latestMessage: {
                  ...c.chat.latestMessage,
                  status: "seen",
                  seenAt: new Date().toISOString()
                },
                unseenCount: 0,
              }
            };
          }
          return c;
        });
      });
    };

    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStopTyping);
    socket.on("messagesSeen", handleMessagesSeen);

    return () => {
      socket?.off("newMessage");
      socket?.off("userTyping", handleTyping);
      socket?.off("userStoppedTyping", handleStopTyping);
      socket?.off("messagesSeen", handleMessagesSeen);
    };
  }, [selectedUser, socket, setChats, loggedInUser?._id]);

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
      {/* Sidebar Container */}
      <div className={`
        ${selectedUser ? "hidden md:flex" : "flex w-full"} 
        md:w-[350px] md:flex-shrink-0 border-r border-[#1f2230] bg-[#13161f] z-20 flex-col h-full
      `}>
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

      {/* ChatBody Container */}
      <div className={`
        flex-1 h-full
        ${selectedUser ? "flex" : "hidden md:flex"}
      `}>
        <ChatBody
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          user={user}
          messages={messages}
          loggedInUser={loggedInUser}
          onlineUsers={onlineUsers}
          socket={socket}
          typingChats={typingChats}
        />
      </div>
    </div>
  );
};

export default ChatPage;
