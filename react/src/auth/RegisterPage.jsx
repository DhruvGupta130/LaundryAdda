import React, {useCallback, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { features } from "../utils/features.jsx";
import axios from "axios";
import {FETCH_USER_PROFILE, GET_OTP, OAUTH_URL, REGISTER_URL} from "../utils/config.js";
import {Loader} from "lucide-react";
import {validatePassword} from "../utils/Utility.js";

const RegisterPage = ({ setToast }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otpGenerated, setOtpGenerated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(60);
    const navigate = useNavigate();

    const fetchUserInfo = useCallback(async (token) => {
        setLoading(true);
        try {
            const response = await axios.get(FETCH_USER_PROFILE, {headers: {Authorization: `Bearer ${token}`}});
            localStorage.setItem("user", JSON.stringify(response.data));
            navigate("/restaurant");
        } catch (error) {
            console.log("Error fetching user profile: ", error);
            setToast({message: error.response ? error.response.data.message : error.message, type: "error"});
        }
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const rememberedEmail = localStorage.getItem("rememberedEmail");

        if (rememberedEmail) setEmail(rememberedEmail);
        if (token) {
            fetchUserInfo(token).then(user => user);
        }
    }, [fetchUserInfo]);

    useEffect(() => {
        if (!email) {
            navigate("/register");
        }

        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer === 1) {
                    clearInterval(interval);
                }
                return prevTimer - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [email, navigate]);

    const handleOtpGenerate = async (e) => {
        e.preventDefault();
        try {
            validatePassword(password);
        } catch (error) {
            setToast({ message: error.message, type: "error" });
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(GET_OTP, { name, email, password });
            if (response.data && response.data.message) {
                setToast({ message: response.data.message, type: "success" });
                setOtpGenerated(true);
            } else {
                setToast({ message: "Failed to generate OTP", type: "error" });
            }
        } catch (error) {
            const errorMessage = error.response
                ? error.response.data.message || error.message
                : error.message;
            setToast({ message: `OTP Failed: ${errorMessage}`, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            validatePassword(password);
        } catch (error) {
            setToast({ message: error.message, type: "error" });
            return;
        }
        try {
            const response = await axios.post(`${REGISTER_URL}?otp=${otp}`, { name, email, password });
            if (response.data && response.data.message) {
                setToast({ message: response.data.message, type: "success" });
                setTimeout(() => navigate("/login"), 1000);
            } else {
                setToast({ message: "Registration failed, something went wrong.", type: "error" });
            }
        } catch (error) {
            const errorMessage = error.response
                ? error.response.data.message || error.message
                : error.message;
            setToast({ message: `Registration failed: ${errorMessage}`, type: "error" });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-3">
            <div className="flex flex-col lg:flex-row bg-white rounded-xl overflow-hidden w-full lg:w-3/4 max-w-4xl">
                {/* Left Section */}
                <div className={`w-full lg:w-1/2 p-8`}>
                    {!otpGenerated ? (
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Create Account</h2>
                            <form onSubmit={handleOtpGenerate}>
                                <div className="name">
                                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                                        Owner Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter Your Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div className="email mt-3">
                                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                                        Email ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter Your Email ID"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div className="password mt-3">
                                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                                        Create Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-4 py-2 font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                    {loading ? (
                                        <div className="flex justify-center items-center">
                                            <svg
                                                className="animate-spin h-5 w-5 mr-3 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M12 2a10 10 0 0 1 10 10h-2a8 8 0 0 0-8-8V2z" />
                                            </svg>
                                            Loading...
                                        </div>
                                    ) : (
                                        "CONTINUE"
                                    )}
                                </button>
                            </form>
                            <p className="text-center my-2 text-gray-600">- or -</p>
                            <button
                                className="w-full py-2 border rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100"
                                onClick={() => window.location.href = OAUTH_URL}
                            >
                                <FcGoogle className="text-xl" />
                                Login with your Google account
                            </button>
                            <p className="text-center mt-6 text-gray-700 font-bold">Already have an account?</p>
                            <button
                                className="w-full mt-2 py-2 bg-purple-200 text-purple-700 rounded-lg hover:bg-purple-300"
                                onClick={() => navigate("/login")}>
                                Login
                            </button>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Create Account</h2>
                            <form onSubmit={handleRegister}>
                                <div className="name">
                                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                                        OTP <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="* * * * * * * * * *"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div className="flex flex-col md:flex-row justify-between items-center mt-2">
                                    <div className="text-gray-600 mb-2 md:mb-0">
                                        OTP sent to
                                        <span className="flex justify-between gap-2 font-semibold text-gray-800">
                                        {email.length > 25 ? `${email.slice(0, 25)}...` : email}
                                        <div
                                            className="text-purple-600 cursor-pointer"
                                            onClick={() => setOtpGenerated(false)}
                                        >
                                            Edit
                                        </div>
                                    </span>
                                    </div>
                                    <div className="flex text-right text-sm">
                                        {timer > 0 ? (
                                            <div className="text-gray-600">Resend OTP in {timer}</div>
                                        ) : (
                                            <div className="text-purple-600 cursor-pointer" onClick={handleOtpGenerate}>
                                                Resend OTP
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !name || !email || !password}
                                    className={`w-full mt-4 py-2 font-semibold text-white rounded-lg ${
                                        loading || !name || !email || !password
                                            ? "bg-purple-300 cursor-not-allowed"
                                            : "bg-purple-600 hover:bg-purple-700"
                                    }`}
                                >
                                    {loading ? <Loader className="w-full"/> : "CONTINUE"}
                                </button>
                            </form>
                            <p className="text-center mt-6 text-gray-700 font-bold">Already have an account?</p>
                            <button
                                className="w-full mt-2 py-2 bg-purple-200 text-purple-700 rounded-lg hover:bg-purple-300"
                                onClick={() => navigate("/login")}>
                                Login
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Section */}
                <div className="w-full lg:w-1/2 bg-gray-100 p-8 flex flex-col justify-center gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className="p-4 bg-white shadow rounded-lg flex items-center gap-4">
                            <div className="text-gray-700">{feature.icon}</div>
                            <div>
                                <h3 className="font-semibold text-lg">{feature.title}</h3>
                                <p className="text-gray-600 text-sm">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;