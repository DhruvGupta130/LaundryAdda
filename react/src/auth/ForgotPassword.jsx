import React, {useEffect, useState} from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { features } from "../utils/features.jsx";
import axios from "axios";
import {FORGOT_PASSWORD_URL, OAUTH_URL} from "../utils/config.js";

const ForgotPassword = ({ setToast }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        setTimeout(() => {
            setSuccess(null);
            navigate("/login");
        }, 10000);
    }, [navigate, setSuccess]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${FORGOT_PASSWORD_URL}?email=${email}`);
            if (response.data && response.data.message) {
                setToast({ message: response.data.message, type: "success" }); // Show success toast
                setSuccess(response.data.message);
            } else {
                setToast({ message: "Error while sending reset link", type: "error" }); // Show error toast
            }
        } catch (error) {
            const errorMessage = error.response
                ? error.response.data.message || error.message
                : error.message;
            setToast({ message: `Error Occurred: ${errorMessage}`, type: "error" }); // Show error toast
        } finally {
            setLoading(false);
        }
    };

    return  (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-3">
            <div className="flex flex-col md:flex-row bg-white rounded-xl overflow-hidden w-full max-w-4xl">
                <div className="w-full md:w-1/2 p-8">
                    {!success ? <form className="flex flex-col justify-center" onSubmit={handleSubmit}>
                        <h2 className="text-2xl font-semibold mb-4">Reset Password</h2>
                        <div className="email">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Email ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                required={true}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter Your Email ID"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div className="flex justify-self-auto items-center mt-4">
                            <a href="/login" className="text-purple-600 hover:underline">Remembered Your Password?</a>
                        </div>
                        <button
                            className="w-full mt-4 py-2 font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            disabled={loading}
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
                                "CONTINUE"
                            )}
                        </button>
                    </form> : (<div className="text-green-700 p-4 rounded-md shadow-md w-full max-w-md text-center">
                        <h2 className="font-semibold text-lg">{success}</h2>
                        <p>If you don't see the reset email, please check your spam folder.</p>
                    </div>)}
                    <p className="text-center my-2 text-gray-600">- or -</p>
                    <button
                        className="w-full py-2 border rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100"
                        onClick={() => window.location.href = OAUTH_URL}
                    >
                        <FcGoogle className="text-xl"/>
                        Login with your Google account
                    </button>
                    <p className="text-center mt-6 text-gray-700 font-bold">Don’t have an account?</p>
                    <button
                        className="w-full mt-2 py-2 bg-purple-200 text-purple-700 rounded-lg hover:bg-purple-300"
                        onClick={() => navigate("/register")}>
                        Create Account
                    </button>
                </div>
                <div className="w-full md:w-1/2 bg-gray-100 p-8 flex flex-col justify-center gap-6">
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

export default ForgotPassword;