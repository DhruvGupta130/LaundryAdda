import React, {useCallback, useEffect, useState} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FETCH_USER_PROFILE } from "../utils/config.js";

const OauthSuccess = ({ setToast }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const fetchUserInfo = useCallback(async (token) => {
        setLoading(true);
        try {
            const response = await axios.get(FETCH_USER_PROFILE, {headers: {Authorization: `Bearer ${token}`}});
            localStorage.setItem("user", JSON.stringify(response.data));
            setSuccess(true);
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
            setSuccess(false);
            console.error("Error fetching user profile:", error);
            setToast({message: error.response?.data?.message || "Something went wrong!", type: "error"});
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get("token");

        if (token) {
            localStorage.setItem("token", token);
            fetchUserInfo(token).then(user => user);
        } else {
            setSuccess(false);
            console.error("No token found in URL");
            setToast({ message: "Invalid login attempt. Redirecting to login...", type: "error" });
            navigate("/login");
        }
    }, [fetchUserInfo, location, navigate]);

    return (
        <div className="mt-32 text-center">
            <h2 className="text-xl font-semibold">
                {loading ? "Logging you in..." : !success ? "Redirecting to login..." : "Processing..."}
            </h2>
        </div>
    );
};

export default OauthSuccess;