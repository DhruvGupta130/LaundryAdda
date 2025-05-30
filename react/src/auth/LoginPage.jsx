import React, {useCallback, useEffect, useState} from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { features } from "../utils/features.jsx";
import axios from "axios";
import {FETCH_USER_PROFILE, LOGIN_URL, OAUTH_URL} from "../utils/config.js";

const LoginPage = ({ setToast }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const fetchUserInfo = useCallback(async (token) => {
        setLoading(true);
        try {
            const response = await axios.get(FETCH_USER_PROFILE, {headers: {Authorization: `Bearer ${token}`}});
            localStorage.setItem("user", JSON.stringify(response.data));
            if(response.data.role === "ADMIN") {
                navigate("/laundry-adda");
            } else if(response.data.role === "LAUNDRY") {
                navigate("/laundry");
            } else if(response.data.role === "CUSTOMER") {
                navigate("/customer");
            } else if(response.data.role === "DELIVERY") {
                navigate("/delivery");
            } else {
                navigate("/error-page");
            }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(LOGIN_URL, { email, password });
            if (response.data && response.data.token && response.data.role) {
                localStorage.setItem("token", response.data.token);
                if (rememberMe) {
                    localStorage.setItem("rememberedEmail", email);
                } else {
                    localStorage.removeItem("rememberedEmail");
                }
                setToast({ message: response.data.message, type: "success" });
                fetchUserInfo(response.data.token).then(p => p);
            } else {
                setToast({ message: "Login failed, invalid credentials.", type: "error" });
            }
        } catch (error) {
            const errorMessage = error.response
                ? error.response.data.message || error.message
                : error.message;
            setToast({ message: `Login failed: ${errorMessage}`, type: "error" });
            console.error("Error logging in: ",error);
        } finally {
            setLoading(false);
        }
    };

    return  (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-3">
            <div className="flex flex-col md:flex-row bg-white rounded-xl overflow-hidden w-full max-w-4xl">
                <div className="w-full md:w-1/2 p-8">
                    <form className="flex flex-col justify-center" onSubmit={handleSubmit}>
                        <h2 className="text-2xl font-semibold mb-4">Log in</h2>
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
                        <div className="password mt-3">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                required={true}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    onChange={() => setRememberMe(!rememberMe)}
                                    className="form-checkbox text-blue-600"
                                />
                                <span className="text-gray-700">Remember Me</span>
                            </label>
                            <a href="/forgot-password" className="text-purple-600 hover:underline">Forgot Password?</a>
                        </div>
                        <button
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
                                "LOGIN"
                            )}
                        </button>
                    </form>
                    <p className="text-center my-2 text-gray-600">- or -</p>
                    <button
                        className="w-full py-2 border rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100"
                        onClick={() => window.location.href = OAUTH_URL} // External link for OAuth
                    >
                        <FcGoogle className="text-xl" />
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

export default LoginPage;
