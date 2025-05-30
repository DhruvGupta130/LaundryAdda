import axios from "axios";
import {useEffect, useState} from "react";
import {
    FETCH_CUSTOMER_PROFILE,
    VALIDATE_CUSTOMER_PROFILE
} from "../utils/config.js";
import {Route, Routes, useNavigate} from "react-router-dom";
import NotFound from "../pages/NotFound.jsx";
import Header from "../users/customer/components/Header.jsx";
import Sidebar from "../users/customer/components/Sidebar.jsx";
import CompleteProfile from "../users/customer/CompleteProfile.jsx";
import Address from "../users/customer/Address.jsx";
import OrderItems from "../users/customer/OrderItems.jsx";

const CustomerRoutes = ({ setLoading, setToast }) => {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const [customer, setCustomer] = useState({});

    const validateCustomerProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.get(VALIDATE_CUSTOMER_PROFILE, {headers: {Authorization: `Bearer ${token}`}});
            if (!response.data && location.pathname !== "/customer"){
                navigate("/customer", {replace: true});
            } else if (response.data) {
                if (location.pathname === "/customer") navigate("/customer/orders", {replace: true});
                await fetchCustomerProfile();
            }
        } catch (error) {
            console.error("Error validating delivery profile: ", error);
            setToast({ message: error?.response?.data?.message || error?.message, type: "error" });
        } finally {
            setLoading(false);
        }
    }

    const fetchCustomerProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.get(FETCH_CUSTOMER_PROFILE, {headers: {Authorization: `Bearer ${token}`}});
            setCustomer(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching delivery profile: ", error);
            setToast({ message: error?.response?.data?.message || error?.message, type: "error" });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        validateCustomerProfile().then(l => l);
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-100 justify-center">
            <Header />
            <Sidebar />
            <Routes>
                <Route path="/" element={<CompleteProfile customer={customer} setCustomer={setCustomer} setToast={setToast} />} />
                <Route path="/orders" element={<OrderItems setLoading={setLoading} setToast={setToast} />} />
                <Route path="/profile" element={<CompleteProfile customer={customer} setCustomer={setCustomer} setToast={setToast} />} />
                <Route path="/addresses" element={<Address setLoading={setLoading} setToast={setToast} />} />
                <Route path="/*" element={<NotFound />} />
            </Routes>
        </div>
    );
};

export default CustomerRoutes;