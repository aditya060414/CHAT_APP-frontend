import { useEffect } from "react";
import { UseAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";

const ChatPage = () => {
  const navigate = useNavigate();
  const { loading, isAuth } = UseAppData();
  useEffect(() => {
    if (!isAuth && !loading) {
      navigate("/login");
    }
  }, [loading, isAuth, navigate]);

  if (loading) return <Loading />;
  return (
    <>
      <h2>Chat</h2>
    </>
  );
};

export default ChatPage;
