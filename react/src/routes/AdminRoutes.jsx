import axios from "axios";
import {useCallback, useEffect} from "react";
import {FETCH_USER_PROFILE} from "../utils/config.js";
import {Route, Routes} from "react-router-dom";
import NotFound from "../pages/NotFound.jsx";

const AdminRoutes = ({ setToast, setLoading }) => {

    const verifyUser = useCallback(async () => {
        const response = await axios.get(FETCH_USER_PROFILE, {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}});
        localStorage.setItem("user", JSON.stringify(response.data));
        if(response.data.role !== "ADMIN") {
            window.location.href = "https://getemenu.com/";
        }
    }, []);

    useEffect(() => {
        verifyUser().then(r => r);
    }, [verifyUser]);

    return (
        <div className="flex min-h-screen bg-gray-100 justify-center">
            <Routes>

                <Route path="/*" element={<NotFound />} />
            </Routes>
        </div>
    );
};

export default AdminRoutes;