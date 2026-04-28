import React from "react";
import ChatPage from "./chat/ChatPage";
import Login from "./Login/Page";
import VerifyPage from "./verify/Page";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<VerifyPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
