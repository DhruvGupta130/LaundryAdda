import React, { useState, useRef, useEffect } from "react";
import {FaChevronDown, FaChevronUp} from "react-icons/fa";

const Dropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState("Today");
    const dropdownRef = useRef(null);

    const options = ["Today", "Yesterday", "This Week", "Last 7 Days", "This Month"];

    const handleSelect = (option) => {
        setSelected(option);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center bg-white gap-2 border-2 font-semibold border-blue-500 text-blue-500 px-4 py-2 rounded-md text-sm"
            >
                <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-sliders"
                    viewBox="0 0 16 16"
                >
                    <path d="M11 2a.5.5 0 0 1 .5.5V4h3a.5.5 0 0 1 0 1h-3v1.5a.5.5 0 0 1-1 0V5H2a.5.5 0 0 1 0-1h8V2.5A.5.5 0 0 1 11 2zM4 8a.5.5 0 0 1 .5.5V10h9a.5.5 0 0 1 0 1h-9v1.5a.5.5 0 0 1-1 0V11H2a.5.5 0 0 1 0-1h1V8.5A.5.5 0 0 1 4 8z" />
                </svg>
                {selected} {isOpen ? <FaChevronUp size={12} className="font-bold"/> : <FaChevronDown size={12} className="font-bold"/>}
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 z-10 mt-2 w-40 origin-top-right border-2 border-blue-500 rounded-md bg-white shadow-lg
               transition-all duration-200 ease-out transform opacity-100 scale-100"
                >
                    <div className="py-1">
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleSelect(option)}
                                className="block w-full px-4 py-2 font-semibold text-sm text-gray-700 hover:bg-blue-100 hover:text-blue-600 text-left"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dropdown;