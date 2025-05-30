import React, {useEffect, useState} from "react";
import {Route, Routes, useLocation, useNavigate} from "react-router-dom";
import NotFound from "../pages/NotFound.jsx";
import Sidebar from "../users/delivery/components/Sidebar.jsx";
import Header from "../users/delivery/components/Header.jsx";
import Dashboard from "../users/delivery/Dashboard.jsx";
import CreateDelivery from "../users/delivery/CreateDelivery.jsx";
import axios from "axios";
import {FETCH_DELIVERY_PROFILE, VALIDATE_DELIVERY_PROFILE} from "../utils/config.js";
import DeliveryOrders from "../users/delivery/DeliveryOrders.jsx";

const initialDelivery = {
    mobile: '',
    gender: '',
    dob: '',
    aadharNumber: '',
    aadharImage: '',
    area: []
}

const DeliveryRoutes = ({ setLoading, setToast }) => {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const [delivery, setDelivery] = useState(initialDelivery);
    const location = useLocation();

    const validateDeliveryProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.get(VALIDATE_DELIVERY_PROFILE, {headers: {Authorization: `Bearer ${token}`}});
            if (!response.data && location.pathname !== "/delivery"){
                navigate("/delivery", {replace: true});
            } else if (response.data) {
                if (location.pathname === "/delivery") navigate("/delivery/dashboard", {replace: true});
                await fetchDeliveryProfile();
            }
        } catch (error) {
            console.error("Error validating delivery profile: ", error);
            setToast({ message: error?.response?.data?.message || error?.message, type: "error" });
        } finally {
            setLoading(false);
        }
    }

    const fetchDeliveryProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.get(FETCH_DELIVERY_PROFILE, {headers: {Authorization: `Bearer ${token}`}});
            setDelivery(response.data);
        } catch (error) {
            console.error("Error fetching delivery profile: ", error);
            setToast({ message: error?.response?.data?.message || error?.message, type: "error" });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        validateDeliveryProfile().then(l => l);
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-100 justify-center">
            <Header />
            <Sidebar/>
            <Routes>
                <Route path="/" element={<CreateDelivery delivery={delivery} setDelivery={setDelivery} setToast={setToast} />} />
                <Route path="/dashboard" element={<Dashboard setLoading={setLoading} setToast={setToast} />} />
                <Route path="/orders" element={<DeliveryOrders delivery={delivery} setDelivery={setDelivery} setLoading={setLoading} setToast={setToast} />} />
                <Route path="/profile" element={<CreateDelivery delivery={delivery} setDelivery={setDelivery} setToast={setToast} />} />
                <Route path="/*" element={<NotFound />} />
            </Routes>
        </div>
    );
};

export default DeliveryRoutes;