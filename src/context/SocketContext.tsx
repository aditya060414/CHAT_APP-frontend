import { Socket, io } from "socket.io-client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { UseAppData } from "./AppContext";
import { chat_Services } from "../API/API";
import { Users } from "lucide-react";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
});

interface ProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: ProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = UseAppData();
  const [onlineUser, setOnlineUser] = useState<string[]>([]);

  useEffect(() => {
    if (!user?._id) return;

    const newSocket = io(chat_Services, {
      query: {
        userId: user._id,
      },
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUser", (Users: string[]) => {
      setOnlineUser(Users);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers: onlineUser }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketData = () => useContext(SocketContext);
