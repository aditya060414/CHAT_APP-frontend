import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Cookies from "js-cookie";
import { chat_Services, user_Service } from "../API/API";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Chat {
  _id: string;
  users: [];
  latestMessage: {
    text: string;
    sender: string;
  };
  createdAt: string;
  updatedAt: string;
  unseenCount?: number;
}

export interface Chats {
  _id: string;
  user: User;
  chat: Chat;
}

export interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  LogoutUser: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchChats: () => Promise<void>;
  chats: Chats[] | null;
  users: User[] | null;
  setChats: React.Dispatch<React.SetStateAction<Chats[] | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProp {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProp> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      const token = Cookies.get("token");

      if (!token) {
        setLoading(false);
        return;
      }
      const { data } = await axios.get(`${user_Service}/api/v1/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(data.user);
      setIsAuth(true);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function LogoutUser() {
    Cookies.remove("token");
    setIsAuth(false);
    setUser(null);
    toast.success("User logged out.");
  }

  const [chats, setChats] = useState<Chats[] | null>(null);
  async function fetchChats() {
    const token = Cookies.get("token");
    if (!token) {
      return;
    }
    try {
      const { data } = await axios.get(
        `${chat_Services}/api/v1/chat/allChats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setChats(data.chats);
    } catch (error) {
      console.log(error);
    }
  }

  const [users, setUsers] = useState<User[] | null>(null);
  async function fetchUsers() {
    const token = Cookies.get("token");
    try {
      const { data } = await axios.get(`${user_Service}/api/v1/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(data.users);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    fetchUser();
  }, []);
  useEffect(() => {
    if (isAuth) {
      fetchChats();
      fetchUsers();
    }
  }, [isAuth]);
  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuth,
        setIsAuth,
        loading,
        LogoutUser,
        fetchChats,
        fetchUsers,
        chats,
        setChats,
        users,
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export const UseAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("UseAppData must be used in AppProvider");
  }
  return context;
};
