import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Palette,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  LogOut,
  Check,
  Trash2,
  Lock,
} from "lucide-react";
import { UseAppData } from "../context/AppContext";
import Cookies from "js-cookie";
import axios from "axios";
import { user_Service } from "../API/API";
import toast from "react-hot-toast";

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robo",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Buster",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Lily",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Nala",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Smile",
];

const THEMES = [
  { id: "indigo", name: "Classic Indigo", primary: "#4f46e5", hover: "#6366f1" },
  { id: "cyberpunk", name: "Cyberpunk Neon", primary: "#d946ef", hover: "#f0abfc" },
  { id: "emerald", name: "Forest Emerald", primary: "#10b981", hover: "#34d399" },
  { id: "sunset", name: "Sunset Orange", primary: "#f97316", hover: "#fb923c" },
  { id: "sapphire", name: "Sapphire Blue", primary: "#2563eb", hover: "#60a5fa" },
];

const WALLPAPERS = [
  { id: "none", name: "Solid Dark" },
  { id: "dots", name: "Subtle Dots" },
  { id: "grid", name: "Modern Grid" },
];

const Setting = () => {
  const navigate = useNavigate();
  const { user, setUser, LogoutUser } = UseAppData();

  const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "chat" | "security">("profile");
  
  // Profile state
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Avatar Generator state
  const [avatarStyle, setAvatarStyle] = useState("adventurer");
  const [avatarSeed, setAvatarSeed] = useState("");
  
  // Customization preferences from localStorage
  const [theme, setTheme] = useState(localStorage.getItem("themeColor") || "indigo");
  const [wallpaper, setWallpaper] = useState(localStorage.getItem("chatWallpaper") || "none");
  const [fontSize, setFontSize] = useState(localStorage.getItem("chatFontSize") || "medium");
  const [enterToSend, setEnterToSend] = useState(localStorage.getItem("enterToSend") !== "false");

  // Confirmation Modals state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatar(user.avatar || "");
    }
  }, [user]);

  // Sync theme dynamically in setting page on change
  const applyTheme = (themeId: string) => {
    const root = document.documentElement;
    let accent = "#4f46e5";
    let hover = "#6366f1";
    let glow = "rgba(79, 70, 229, 0.15)";
    let glowStrong = "rgba(79, 70, 229, 0.3)";

    if (themeId === "cyberpunk") {
      accent = "#d946ef";
      hover = "#f0abfc";
      glow = "rgba(217, 70, 239, 0.15)";
      glowStrong = "rgba(217, 70, 239, 0.3)";
    } else if (themeId === "emerald") {
      accent = "#10b981";
      hover = "#34d399";
      glow = "rgba(16, 185, 129, 0.15)";
      glowStrong = "rgba(16, 185, 129, 0.3)";
    } else if (themeId === "sunset") {
      accent = "#f97316";
      hover = "#fb923c";
      glow = "rgba(249, 115, 22, 0.15)";
      glowStrong = "rgba(249, 115, 22, 0.3)";
    } else if (themeId === "sapphire") {
      accent = "#2563eb";
      hover = "#60a5fa";
      glow = "rgba(37, 99, 235, 0.15)";
      glowStrong = "rgba(37, 99, 235, 0.3)";
    }

    root.style.setProperty("--accent-color", accent);
    root.style.setProperty("--accent-hover", hover);
    root.style.setProperty("--accent-glow", glow);
    root.style.setProperty("--accent-glow-strong", glowStrong);
  };

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    localStorage.setItem("themeColor", themeId);
    applyTheme(themeId);
    toast.success(`${themeId.charAt(0).toUpperCase() + themeId.slice(1)} theme applied`);
  };

  const handleWallpaperChange = (wallpaperId: string) => {
    setWallpaper(wallpaperId);
    localStorage.setItem("chatWallpaper", wallpaperId);
    toast.success(`Wallpaper set to ${wallpaperId}`);
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    localStorage.setItem("chatFontSize", size);
    toast.success(`Font size set to ${size}`);
  };

  const handleEnterToSendToggle = () => {
    const nextVal = !enterToSend;
    setEnterToSend(nextVal);
    localStorage.setItem("enterToSend", String(nextVal));
    toast.success(nextVal ? "Enter will send messages" : "Enter will create a new line");
  };

  // Avatar Randomizer Helper
  const randomizeSeed = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(randomSeed);
    const generatedUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${randomSeed}`;
    setAvatar(generatedUrl);
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const style = e.target.value;
    setAvatarStyle(style);
    const seed = avatarSeed || "Felix";
    if (!avatarSeed) setAvatarSeed("Felix");
    setAvatar(`https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`);
  };

  const handleSeedInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seed = e.target.value;
    setAvatarSeed(seed);
    setAvatar(`https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${seed}`);
  };

  // Submit profile details to Backend
  const saveProfile = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setUpdatingProfile(true);
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${user_Service}/api/v1/user/update`,
        { name, avatar },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });
      setUser(data.user);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Simulated account settings
  const handleClearHistory = () => {
    setShowClearModal(false);
    toast.success("Chat history cleared successfully (Simulated)");
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    toast.success("Account deleted (Simulated)");
    LogoutUser();
    navigate("/login");
  };

  return (
    <div className="h-screen bg-[#0f1117] text-gray-100 flex flex-col overflow-hidden">
      {/* Settings Header */}
      <header className="flex items-center px-6 py-5 bg-[#13161f] border-b border-[#1f2230] flex-shrink-0">
        <button
          onClick={() => navigate("/")}
          className="mr-4 p-2 text-gray-400 hover:text-white hover:bg-[#1a1d29] rounded-xl transition-all cursor-pointer flex items-center justify-center"
          title="Back to chats"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-100">Settings</h1>
          <p className="text-xs text-gray-500 font-medium">Customize your messaging experience</p>
        </div>
      </header>

      {/* Main Settings Container */}
      <main className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden max-w-6xl w-full mx-auto p-4 md:p-6 gap-6">
        
        {/* Navigation Sidebar */}
        <section className="w-full md:w-64 flex-shrink-0 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible bg-[#13161f] border border-[#1f2230] p-2 md:p-3 rounded-2xl h-fit [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-auto md:w-full whitespace-nowrap flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-[#4f46e5]/10 text-indigo-400 border border-[#4f46e5]/30"
                : "text-gray-400 hover:bg-[#1a1d29] hover:text-gray-200 border border-transparent"
            }`}
          >
            <User size={18} />
            Profile Info
          </button>
          
          <button
            onClick={() => setActiveTab("appearance")}
            className={`w-auto md:w-full whitespace-nowrap flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "appearance"
                ? "bg-[#4f46e5]/10 text-indigo-400 border border-[#4f46e5]/30"
                : "text-gray-400 hover:bg-[#1a1d29] hover:text-gray-200 border border-transparent"
            }`}
          >
            <Palette size={18} />
            Appearance
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`w-auto md:w-full whitespace-nowrap flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "chat"
                ? "bg-[#4f46e5]/10 text-indigo-400 border border-[#4f46e5]/30"
                : "text-gray-400 hover:bg-[#1a1d29] hover:text-gray-200 border border-transparent"
            }`}
          >
            <MessageSquare size={18} />
            Chat Preferences
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-auto md:w-full whitespace-nowrap flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "security"
                ? "bg-[#4f46e5]/10 text-indigo-400 border border-[#4f46e5]/30"
                : "text-gray-400 hover:bg-[#1a1d29] hover:text-gray-200 border border-transparent"
            }`}
          >
            <ShieldAlert size={18} />
            Account & Security
          </button>

          <hr className="hidden md:block border-[#1f2230] my-2" />

          <button
            onClick={LogoutUser}
            className="w-auto md:w-full whitespace-nowrap flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all cursor-pointer border border-transparent"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </section>

        {/* Setting Panel Content */}
        <section className="flex-1 bg-[#13161f] border border-[#1f2230] rounded-2xl flex flex-col overflow-y-auto p-5 md:p-6 chat-scroll">
          
          {/* PROFILE PANEL */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-200">Profile Details</h2>
                <p className="text-sm text-gray-500">Update your avatar and account name</p>
              </div>

              {/* Avatar Configuration */}
              <div className="flex flex-col sm:flex-row gap-6 items-center border border-[#1f2230] bg-[#0c0e14] p-5 rounded-2xl">
                {/* Large Preview Frame */}
                <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#13161f] border-2 border-indigo-500/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {avatar ? (
                    <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-gray-600" size={48} />
                  )}
                </div>

                <div className="flex-1 w-full space-y-4">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Configure Profile Avatar</span>
                  
                  {/* Option 1: Preset Avatars */}
                  <div className="space-y-2">
                    <span className="text-xs text-gray-400 block font-medium">Choose a preset avatar:</span>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          onClick={() => setAvatar(url)}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 cursor-pointer transition-all hover:scale-110 ${
                            avatar === url ? "border-[#4f46e5] scale-105 bg-indigo-500/15" : "border-transparent bg-[#13161f]"
                          }`}
                        >
                          <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Option 2: Dicebear Generator */}
                  <div className="border-t border-[#1f2230]/50 pt-3 space-y-3">
                    <span className="text-xs text-gray-400 block font-medium flex items-center gap-1">
                      <Sparkles size={12} className="text-indigo-400" />
                      Or generate a custom avatar seed:
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        onChange={handleStyleChange}
                        value={avatarStyle}
                        className="bg-[#13161f] border border-[#1f2230] text-sm text-gray-300 rounded-xl px-3 py-2 outline-none focus:border-[#4f46e5] transition-colors"
                      >
                        <option value="adventurer">Adventurer</option>
                        <option value="bottts">Bots</option>
                        <option value="lorelei">Lorelei</option>
                        <option value="fun-emoji">Fun Emoji</option>
                        <option value="pixel-art">Pixel Art</option>
                      </select>
                      
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          placeholder="Type avatar seed (e.g. Felix)"
                          value={avatarSeed}
                          onChange={handleSeedInputChange}
                          className="flex-1 bg-[#13161f] text-gray-200 border border-[#1f2230] text-sm rounded-xl px-3 py-2 outline-none focus:border-[#4f46e5] transition-colors"
                        />
                        <button
                          onClick={randomizeSeed}
                          className="px-3 bg-[#1a1d29] border border-[#1f2230] hover:bg-[#202433] rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-400 transition-colors cursor-pointer"
                          title="Randomize Seed"
                        >
                          <RefreshCw size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name and Email Details */}
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Display Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[#0c0e14] text-gray-100 border border-[#1f2230] rounded-xl px-4 py-3 outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] text-sm transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2 opacity-75">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock size={12} />
                    Registered Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-[#0c0e14]/50 text-gray-500 border border-[#1f2230]/50 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Save profile details */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={updatingProfile}
                  className="px-6 py-3 bg-[#4f46e5] text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-2"
                >
                  {updatingProfile ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* APPEARANCE PANEL */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-200">Customization & Themes</h2>
                <p className="text-sm text-gray-500">Personalize the styling and layout of your chat interface</p>
              </div>

              {/* Accent Theme Selection */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Accent Color Palette</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                        theme === t.id
                          ? "bg-[#0c0e14] border-[#4f46e5]/40 shadow-lg"
                          : "bg-[#0c0e14]/50 border-[#1f2230] hover:bg-[#0c0e14] hover:border-[#2a2d3d]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: t.primary }}
                        ></span>
                        <span className="text-sm font-medium text-gray-200">{t.name}</span>
                      </div>
                      {theme === t.id && (
                        <div className="w-5 h-5 rounded-full bg-[#4f46e5]/20 text-indigo-400 flex items-center justify-center border border-[#4f46e5]/30">
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallpaper Pattern */}
              <div className="space-y-3 border-t border-[#1f2230]/50 pt-5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Chat Wallpaper Overlay</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {WALLPAPERS.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => handleWallpaperChange(w.id)}
                      className={`flex flex-col items-center justify-center p-5 rounded-xl border text-center transition-all cursor-pointer ${
                        wallpaper === w.id
                          ? "bg-[#0c0e14] border-[#4f46e5]/40"
                          : "bg-[#0c0e14]/50 border-[#1f2230] hover:bg-[#0c0e14] hover:border-[#2a2d3d]"
                      }`}
                    >
                      {/* Pattern Mini Preview */}
                      <div
                        className={`w-full h-10 rounded-lg bg-[#13161f] border border-[#1f2230] mb-2 ${
                          w.id === "dots" ? "bg-pattern-dots" : w.id === "grid" ? "bg-pattern-grid" : ""
                        }`}
                      ></div>
                      <span className="text-xs font-medium text-gray-200">{w.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CHAT PREFERENCES PANEL */}
          {activeTab === "chat" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-200">Chat Preferences</h2>
                <p className="text-sm text-gray-500">Manage input preferences and bubble sizing</p>
              </div>

              {/* Text Sizing */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Message Bubble Font Size</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["small", "medium", "large"].map((size) => (
                    <button
                      key={size}
                      onClick={() => handleFontSizeChange(size)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                        fontSize === size
                          ? "bg-[#0c0e14] border-[#4f46e5]/40"
                          : "bg-[#0c0e14]/50 border-[#1f2230] hover:bg-[#0c0e14] hover:border-[#2a2d3d]"
                      }`}
                    >
                      <span
                        className={`font-semibold text-gray-200 mb-1 ${
                          size === "small" ? "text-xs" : size === "large" ? "text-lg" : "text-sm"
                        }`}
                      >
                        Aa
                      </span>
                      <span className="text-xs text-gray-400 capitalize">{size}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enter to Send Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#1f2230] bg-[#0c0e14] mt-4">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-gray-200 block">Enter key sends message</span>
                  <span className="text-xs text-gray-500">Disable to use Enter for adding a new line</span>
                </div>
                
                {/* Custom Switch Toggle */}
                <button
                  onClick={handleEnterToSendToggle}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer relative flex items-center ${
                    enterToSend ? "bg-[#4f46e5]" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out absolute ${
                      enterToSend ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* SECURITY & DESTRUCTIVE ACTIONS PANEL */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-200">Account Safety</h2>
                <p className="text-sm text-gray-500">Manage sensitive or destructive account actions</p>
              </div>

              <div className="space-y-4">
                {/* Clear Local Chats */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-[#1f2230] bg-[#0c0e14] gap-4">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-gray-200 block">Clear Messages History</span>
                    <span className="text-xs text-gray-500">Deletes all messages locally from your interface</span>
                  </div>
                  <button
                    onClick={() => setShowClearModal(true)}
                    className="px-4 py-2 border border-orange-500/30 text-orange-400 text-xs font-semibold rounded-lg hover:bg-orange-500/10 transition-colors cursor-pointer"
                  >
                    Clear History
                  </button>
                </div>

                {/* Delete Account */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-red-500/20 bg-red-500/5 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-red-400 block">Delete User Account</span>
                    <span className="text-xs text-gray-500">Permanently delete your profile and message data</span>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 size={13} />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

        </section>
      </main>

      {/* MODALS */}

      {/* Clear Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#13161f] border border-[#2a2d3d] rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-100">Clear chat history?</h3>
            <p className="text-sm text-gray-400">This will delete all conversations locally. This action cannot be undone.</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-[#1a1d29] hover:bg-[#202433] text-gray-300 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#13161f] border border-[#2a2d3d] rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-red-400">Permanently delete account?</h3>
            <p className="text-sm text-gray-400">All your personal profile data, contacts and message history will be destroyed. This is irreversible.</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-[#1a1d29] hover:bg-[#202433] text-gray-300 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Setting;