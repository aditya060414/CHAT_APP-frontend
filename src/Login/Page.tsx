import React, { useState } from "react";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LoaderCircle, ArrowRight } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/v1/user/loginUser`,
        {
          email,
        },
      );
      alert(data.message);
      navigate(`/verify?email=${email}`)
    } catch (error: any) {
      alert(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <div className="text-center mb-8 ">
            <div className="mx-auto w-20 h-20 bg-blue-500 rounded-lg flex justify-center items-center mb-6">
              <Mail size={40} className="text-white" />
            </div>
            <h2 className="text-4xl text-white font-semibold">Welcome to Chat App</h2>
            <p className="text-gray-300 mt-2">
              The best place to connect with friends and family
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                placeholder="Please enter your email address"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-3 py-5 rounded-2xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                  <span>...Sending OTP</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Send OTP</span>
                  <ArrowRight className="w-5 h-5"/>
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
