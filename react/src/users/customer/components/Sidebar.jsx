import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    FiShoppingCart,
    FiHelpCircle, FiLogOut
} from "react-icons/fi";
import {MdOutlineLocationOn, MdOutlinePerson} from "react-icons/md";
import { IoClose, IoOptions } from "react-icons/io5";
import {BsStars} from "react-icons/bs";

const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: "Orders", icon: <FiShoppingCart size={20} />, path: "/customer/orders" },
        { name: "Profile", icon: <MdOutlinePerson size={20} />, path: "/customer/profile" },
        { name: "Addresses", icon: <MdOutlineLocationOn size={20} />, path: "/customer/addresses" },
        { name: "Reviews", icon: <BsStars size={20} />, path: "/customer/reviews" },
        { name: "Help Centre", icon: <FiHelpCircle size={20} />, path: "/customer/help-centre" },
        { name: "Log out", icon: <FiLogOut size={20} />, path: "/logout" },
    ];

    const handleNavigation = (path) => {
        navigate(path);
        setIsSidebarOpen(false); // Close sidebar on mobile after navigation
    };

    return (
        <div>
            {/* Fixed Sidebar */}
            <aside
                className={`fixed md:top-26 top-40 md:left-5 h-screen md:h-fit p-5 rounded-xl w-60 bg-white shadow-lg transition-transform duration-300 z-50 md:translate-x-0 ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Sidebar Menu */}
                <nav className="space-y-2 px-3">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handleNavigation(item.path)}
                            className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                                location.pathname === item.path
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <span>{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Mobile Sidebar Toggle Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden fixed top-5 right-4 z-49 p-2 bg-blue-500 text-white rounded-xl shadow-lg"
            >
                {isSidebarOpen ? <IoClose size={30} /> : <IoOptions size={30} />}
            </button>

            {/* Main Content Wrapper */}
            <div className="md:ml-64 transition-all duration-300">
                {/* Your other components will go here */}
            </div>
        </div>
    );
};

export default Sidebar;