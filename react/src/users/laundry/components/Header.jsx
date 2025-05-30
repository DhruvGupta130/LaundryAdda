import { Avatar } from "@mui/material";
import React, {useRef, useState} from "react";

function stringToColor(string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
}

function stringAvatar(name) {
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: name.split(' ').map(word => word[0]).join('').toUpperCase(),
    };
}

import { IoMdNotificationsOutline } from "react-icons/io";
import logo from "../../../assets/logoP.png"
import {FiLogOut} from "react-icons/fi";
import {useNavigate} from "react-router-dom";
import {initialToastState} from "../../../utils/utility.js";
import Toast from "../../../utils/Toast.jsx";

const Header = () => {
    // const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const [isOnline, setIsOnline] = useState(false);
    const [showLogout, setShowLogout] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const [toast, setToast] = useState(initialToastState);
    const [loading, setLoading] = useState(false);

    return (
        <header className="bg-white shadow-md rounded-lg p-4 flex flex-col md:flex-row items-center justify-between w-full fixed top-0 left-0 right-0 z-45">
            {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "" })} />}

            <a href="/" className="text-xl md:text-2xl font-bold text-gray-800 text-center md:text-left w-full md:w-auto md:mx-20">
                <img src={`${logo}`} alt="logo" className="h-14"/>
            </a>

            {/* Right Section: Notifications & Profile */}
            <div className="flex items-center gap-3 md:gap-4 mt-4 md:mt-0 w-full md:w-auto justify-center md:justify-end">

                {/* Notification Icon */}
                <IoMdNotificationsOutline size={40} className="text-blue-800 cursor-pointer bg-blue-200 rounded-full p-2" />

                {/* Online/Offline Toggle */}
                <div className={`flex items-center gap-2 p-2 rounded-lg shadow-lg border ${isOnline ? "border-green-400" : "border-red-400"} bg-white/80 backdrop-blur-md`}>
                    {/* Status Indicator */}
                    <span className={`text-xs font-medium ${isOnline ? "text-green-600" : "text-red-500"}`}>
                        {isOnline ? "Online" : "Offline"}
                    </span>

                    {/* Toggle Switch */}
                    <button
                        disabled={loading}
                        onClick={() => alert("Not Implemented Yet!")}
                        className={`relative w-11 h-6 flex items-center justify-start rounded-full transition-all duration-300 ease-in-out cursor-pointer ${
                            isOnline
                                ? loading
                                    ? "bg-green-300"
                                    : "bg-green-500 shadow-green-300"
                                : loading
                                    ? "bg-red-300"
                                    : "bg-red-500 shadow-red-300"
                        }`}
                    >
                        {loading && (
                            <span className="absolute left-1/2 top-1/2 w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin transform -translate-x-1/2 -translate-y-1/2 z-10" />
                        )}
                        {!loading && (
                            <span
                                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 ease-in-out ${
                                    isOnline ? "translate-x-5" : "translate-x-0"
                                }`}
                            />
                        )}
                    </button>

                </div>

                {/* Avatar Box */}
                <div
                    className="relative w-48"
                    ref={dropdownRef}
                    onMouseEnter={() => setShowLogout(true)}
                    onMouseLeave={() => setShowLogout(false)}
                >
                    <div
                        className="flex items-center justify-between bg-white px-3 py-2 rounded-lg shadow-md w-full cursor-pointer hover:bg-gray-100 transition-all"
                        onClick={() => setShowLogout(!showLogout)}
                    >
                        <Avatar
                            {...stringAvatar(user?.name || 'User Name')}
                            variant="circle"
                            className="w-10 h-10 md:w-12 md:h-12 border border-gray-300 shadow-sm"
                            sx={{
                                ...stringAvatar(user?.name || 'User Name').sx,
                                fontWeight: 'bold',
                                fontSize: '1.2rem'
                            }}
                        />
                        <div className="text-xs md:text-base">
                            <div className="font-semibold text-gray-800">{user?.name}</div>
                            <div className="text-gray-500 text-xs">LA ID: {user.id.substring(0, 6)}...</div>
                        </div>
                        <span className="border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-indigo-500 transition-transform duration-300 transform"
                              style={{ transform: showLogout ? "rotate(180deg)" : "rotate(0deg)" }}>
                        </span>
                    </div>

                    {/* Logout Dropdown (Smooth Transition) */}
                    <div
                        className={`absolute right-0 w-full bg-gray-100 border-t-2 border-gray-300 rounded-b-lg shadow-lg p-2 transition-all duration-300 ease-in-out ${
                            showLogout ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                        }`}
                    >
                        <button
                            onClick={() => {
                                navigate("/logout");
                            }}
                            className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-red-50 text-red-600 font-semibold rounded-md transition-all"
                        >
                            <FiLogOut className="text-xl" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;