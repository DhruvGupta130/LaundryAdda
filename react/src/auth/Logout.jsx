import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        }, 800);

        return () => clearTimeout(timeout);
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white animate-fade-in">
            <AiOutlineLoading3Quarters className="text-4xl text-purple-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-700">Logging you out...</p>
        </div>
    );
};

export default Logout;