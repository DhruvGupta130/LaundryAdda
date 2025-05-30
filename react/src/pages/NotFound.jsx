import React from "react";
import { Link } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-6 text-center">
            <div className="bg-white shadow-lg rounded-xl p-8 md:p-12">
                <div className="flex flex-col items-center justify-center px-6">
                    <div className="text-red-500 text-6xl mb-4 animate-bounce">
                        <FaExclamationTriangle />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-2">404 - Not Found</h1>
                </div>
                <p className="text-gray-600 mb-6">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>
                <Link
                    to="/"
                    className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-full transition duration-300"
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
