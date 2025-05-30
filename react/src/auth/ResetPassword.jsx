import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {OAUTH_URL, RESET_PASSWORD_URL, VERIFY_TOKEN_URL} from "../utils/config.js";
import {features} from "../utils/features.jsx";
import {FcGoogle} from "react-icons/fc";
import {validatePassword} from "../utils/Utility.js";

const ResetPassword = ({ setToast, setLoad }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isTokenValid, setIsTokenValid] = useState(true);
    const [loading, setLoading] = useState(false);
    const urlParams = new URLSearchParams(location.search);
    const tokenFromUrl = urlParams.get("token");
    const emailFromUrl = urlParams.get("email");

    const verifyToken = async (token, email) => {
        setLoad(true);
        try {
            const response = await axios.post(`${VERIFY_TOKEN_URL}?token=${token}&email=${email}`);
            console.log(response.data);
            setIsTokenValid(response.data);
        } catch (error) {
            const errorMessage = error.response
                ? error.response.data.message || error.message
                : error.message;
            setIsTokenValid(false);
            setToast({ message: `Error verifying link: ${errorMessage}`, type: "error" });
        } finally {
            setLoad(false);
        }
    };

    useEffect(() => {
        if (tokenFromUrl) {
            verifyToken(tokenFromUrl, emailFromUrl).then(r => r);
        }
    }, [emailFromUrl, location, tokenFromUrl]);

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setToast({ message: "Passwords do not match", type: "error" });
            return;
        }
        try {
            validatePassword(newPassword);
        } catch (error) {
            setToast({ message: error.message, type: "error" });
            return;
        }
        setLoading(true);
        try {
            const response = await axios.put(`${RESET_PASSWORD_URL}?password=${newPassword}&email=${emailFromUrl}&token=${tokenFromUrl}`);
            if (response.data && response.data.message) {
                setToast({ message: response.data.message, type: "success" }); // Show success toast
                navigate("/login");
            } else {
                setToast({ message: response.data.message || "Error resetting password", type: "error" });
            }
        } catch (error) {
            const errorMessage = error.response
                ? error.response.data.message || error.message
                : error.message;
            setToast({ message: `Error resetting password: ${errorMessage}`, type: "error" });
        } finally {
            setLoading(false);
        }
    };
    if (!isTokenValid) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-4">
                <div className="bg-white p-8 shadow-lg rounded-xl max-w-md mx-auto text-center border border-purple-300">
                    <div className="flex flex-col items-center">
                        <svg
                            className="w-16 h-16 text-purple-500 mb-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M8.93 5.93a10 10 0 0114.14 14.14M3.93 3.93a10 10 0 0114.14 14.14M3 12h18M12 3v18" />
                        </svg>
                        <h2 className="text-2xl font-bold text-purple-700">Invalid or Expired Link</h2>
                        <p className="text-gray-600 mt-2">
                            The password reset link is invalid or has expired. Please request a new one.
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.href = "/"}
                        className="mt-6 w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-3">
            <div className="flex flex-col md:flex-row bg-white rounded-xl overflow-hidden w-full max-w-4xl">
                <div className="w-full md:w-1/2 p-8">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Reset Your Password</h2>
                    <form onSubmit={handlePasswordReset}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Email ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                disabled={true}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-not-allowed"
                                required
                                value={emailFromUrl}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                New Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter your new password"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your new password"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 py-2 font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
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
                                "RESET PASSWORD"
                            )}
                        </button>
                    </form>
                    <p className="text-center my-2 text-gray-600">- or -</p>
                    <button
                        className="w-full py-2 border rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100"
                        onClick={() => window.location.href = OAUTH_URL}
                    >
                        <FcGoogle className="text-xl"/>
                        Login with your Google account
                    </button>
                </div>
                <div className="w-full md:w-1/2 bg-gray-100 p-8 flex flex-col justify-center gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className="p-4 bg-white rounded-xl flex items-center gap-4">
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

export default ResetPassword;