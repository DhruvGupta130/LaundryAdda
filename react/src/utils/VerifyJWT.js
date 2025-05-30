import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const VerifyJWT = () => {
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const { exp } = jwtDecode(token);
            const timeout = exp * 1000 - Date.now();

            if (timeout <= 0) {
                window.alert("Session expired");
                window.location.href = "/logout";
            } else {
                const timer = setTimeout(() => {
                    window.alert("Session expired");
                    window.location.href = "/logout";
                }, timeout);

                return () => clearTimeout(timer);
            }
        } catch (err) {
            console.error("Invalid token", err);
            window.location.href = "/logout";
        }
    }, []);

    return null;
};

export default VerifyJWT;