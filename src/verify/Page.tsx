import React, { useEffect, useRef, useState } from "react";
import { LoaderCircle, ArrowRight, Lock, ChevronLeft } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { user_Service } from "../API/API";
import { UseAppData } from "../context/AppContext";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

const VerifyOtp = () => {
  const {
    isAuth,
    setIsAuth,
    setUser,
    loading: userLoading,
    fetchChats,
    fetchUsers,
  } = UseAppData();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleInputChange = (index: number, value: string): void => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteData = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const data = pastedData.replace(/\D/g, "").slice(0, 6);
    if (data.length == 6) {
      const newOtp = data.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (
    e: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      return setError("Please enter a valid 6-digit OTP");
    }
    setError("");
    try {
      setLoading(true);
      const { data } = await axios.post(`${user_Service}/api/v1/user/verify`, {
        email: email,
        otp: otpString,
      });
      toast.success(data.message);
      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setIsAuth(true);
      setUser(data.user);
      fetchChats();
      fetchUsers();
    } catch (error: any) {
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setOtp(["", "", "", "", "", ""]);
    try {
      const { data } = await axios.post(
        `${user_Service}/api/v1/user/loginUser`,
        {
          email,
        },
      );
      // Cookies.set
      setTimer(60);
      alert(data.message);
    } catch (error: any) {
      setTimer(60);
      alert(error.response.data.message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/login");
  };

  if (userLoading) return <Loading />;
  if (isAuth) navigate("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-lg">Back</span>
          </button>
          <div className="text-center mb-8 ">
            <div className="mx-auto w-20 h-20 bg-blue-500 rounded-lg flex justify-center items-center mb-6">
              <Lock size={40} className="text-white" />
            </div>
            <h2 className="text-4xl text-white font-semibold">
              Verify your email
            </h2>
            <p className="text-gray-300 mt-2">
              A 6-digit OTP has been sent to your email
            </p>
            <p className="text-blue-400">{email}</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                Enter your 6-digit OTP
              </label>
              <div className="flex justify-center in-checked: space-x-3">
                {otp.map((digit, index) => {
                  return (
                    <input
                      key={index}
                      ref={(el: HTMLInputElement | null) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={(e) =>
                        index === 0 ? handlePasteData(e) : undefined
                      }
                      className="w-12 h-12 text-center text-xl font-bold borde-2 border-gray-600 bg-gray-700 rounded-lg text-white"
                    />
                  );
                })}
              </div>
            </div>
            {error && (
              <div className="bg-red-700 border border-red-600 rounded-lg p-3">
                <p className="text-red-100 text-sm text-center">{error}</p>
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-3 py-5 rounded-2xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                  <span>...Verifying</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Verify</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-300 text-sm mb-4">
              Didn’t receive the OTP?
            </p>
            {timer > 0 ? (
              <p className="text-gray-400 text-sm">
                Resend OTP in {timer} seconds
              </p>
            ) : (
              <button
                className="text-blue-300 hover:text-blue-400 font-medium text-sm disabled:opacity:50"
                disabled={resendLoading}
                onClick={handleResendOtp}
              >
                {resendLoading ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
