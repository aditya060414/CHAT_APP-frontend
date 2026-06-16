import { useEffect } from "react";
import ChatPage from "./chat/ChatPage";
import Login from "./Login/Page";
import VerifyPage from "./verify/Page";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Setting from "./components/Setting";

const App = () => {
  useEffect(() => {
    const themeId = localStorage.getItem("themeColor") || "indigo";
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
  }, []);

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/setting" element={<Setting />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
