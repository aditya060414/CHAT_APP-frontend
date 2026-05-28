import React, { useState, useRef, useEffect } from "react";
import type { User } from "../context/AppContext";

import SidebarHeader from "./SidebarHeader";
import SidebarSearch from "./SidebarSearch";
import SidebarContent from "./SidebarContent";
import SidebarFooter from "./SidebarFooter";

interface ChatSidebarProps {
  isModal: boolean;
  setIsModal: React.Dispatch<React.SetStateAction<boolean>>;
  users: User[] | null;
  loggedInUser: User | null;
  chats: any[] | null;
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  handleLogout: () => void;
  createChat: (u: User) => void;
  toggleChats: string;
  setToggleChats: React.Dispatch<React.SetStateAction<string>>;
  onlineUsers: string[] | null;
  typingChats: Record<string, string[]>;
}

const ChatSidebar = ({
  isModal,
  setIsModal,
  toggleChats,
  setToggleChats,
  users,
  loggedInUser,
  chats,
  selectedUser,
  setSelectedUser,
  handleLogout,
  createChat,
  onlineUsers,
  typingChats,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearch, setUserSearch] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggleSearch = () => {
    setUserSearch((prev) => {
      const nextState = !prev;
      if (!nextState) {
        setSearchQuery("");
      }
      return nextState;
    });
  };

  // handle outside click and close the search bar
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        userSearch &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(e.target as Node)
      ) {
        setUserSearch(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [userSearch]);

  // handle smart focus on search bar input
  useEffect(() => {
    if (userSearch) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [userSearch]);

  return (
    <aside className="h-full w-full">
      <div className="h-full w-full bg-[#13161f] flex flex-col text-gray-100">
        {/* header */}
        <SidebarHeader
          loggedInUser={loggedInUser}
          userSearch={userSearch}
          onToggleSearch={handleToggleSearch}
          toggleButtonRef={toggleButtonRef}
        />

        {/* search bar & dropdown overlay */}
        <SidebarSearch
          userSearch={userSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          users={users}
          loggedInUser={loggedInUser}
          createChat={createChat}
          onlineUsers={onlineUsers}
          searchRef={searchRef}
          inputRef={inputRef}
        />

        {/* chats and all users navigation + lists */}
        <SidebarContent
          toggleChats={toggleChats}
          setToggleChats={setToggleChats}
          chats={chats}
          users={users}
          loggedInUser={loggedInUser}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          onlineUsers={onlineUsers}
          typingChats={typingChats}
          createChat={createChat}
        />

        {/* footer */}
        <SidebarFooter
          loggedInUser={loggedInUser}
          handleLogout={handleLogout}
        />
      </div>
    </aside>
  );
};

export default ChatSidebar;
