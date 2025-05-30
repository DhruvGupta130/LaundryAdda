import axios from "axios";
import React, {useCallback, useEffect, useState} from "react";
import {FETCH_LAUNDRY, LAUNDRY_KYC, PRICING, VALIDATE_LAUNDRY_PROFILE} from "../utils/config.js";
import {Route, Routes, useLocation, useNavigate} from "react-router-dom";
import NotFound from "../pages/NotFound.jsx";
import Header from "../users/laundry/components/Header.jsx";
import Sidebar from "../users/laundry/components/Sidebar.jsx";
import Dashboard from "../users/laundry/Dashboard.jsx";
import CreateLaundry from "../users/laundry/CreateLaundry.jsx";
import OrderDetails from "../users/laundry/OrderDetails.jsx";
import ManageServices from "../users/laundry/components/ManageServices.jsx";
import StoreDetails from "../users/laundry/StoreDetails.jsx";

const initialState = {
    name: '',
    description: "",
    logo: '',
    coverPhoto:'',
    images: [],
    address: {
        street: "",
        city: "",
        state: "",
        zip: "",
        landmark: "",
        addressType: "",
        latitude: "",
        longitude: ""
    },
    deliveryAndPickup: {},
    mobile: "",
    email: "",
    managerName: "",
};

const initialKycDocs = {
    panCard: "",
    labourLicense: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
};

const initialDeliveryAndPickup = {
    semiExpress: false,
    express: false,
    pickupSlots: [],
    serviceRadius: 5,
}

const LaundryRoutes = ({ setLoading, setToast }) => {
    const token = localStorage.getItem("token");
    const [laundry, setLaundry] = useState(initialState);
    const [kycDocs, setKycDocs] = useState(initialKycDocs);
    const [prices, setPrices] = useState([]);
    const [services, setServices] = useState([]);
    const [delivery, setDelivery] = useState(initialDeliveryAndPickup);
    const navigate = useNavigate();
    const location = useLocation();

    const validateLaundry = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(VALIDATE_LAUNDRY_PROFILE, {headers: { Authorization: `Bearer ${token}` },});
            const code = response.data;
            const currentPath = location.pathname;
            if (code === 0) {
                if (currentPath === "/laundry") navigate("/laundry/dashboard", {replace: true});
                await fetchLaundry();
            } else if (code >= 1 && code <= 4 && currentPath !== "/laundry") {
                navigate("/laundry", {replace: true});
            }
        } catch (error) {
            console.error("Error validating laundry: ", error);
            setToast({
                message: error?.response?.data?.message || error?.message || "Validation failed. Please try again.",
                type: "error",
            });
            navigate("/login");
        } finally {
            setLoading(false);
        }
    }, [location, navigate, token]);

    const fetchLaundry = async () => {
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [laundryRes, pricingRes, kycRes] = await Promise.all([
                axios.get(FETCH_LAUNDRY, { headers }),
                axios.get(PRICING, { headers }),
                axios.get(LAUNDRY_KYC, { headers }),
            ]);
            setLaundry(laundryRes.data);
            setKycDocs(kycRes.data);
            setPrices(pricingRes.data);
            setServices([...new Set(pricingRes.data.map(item => item.service))]);
            setDelivery(laundryRes.data?.deliveryAndPickup);
        } catch (error) {
            console.error("Error fetching laundry: ", error);
            setToast({ message: error?.response?.data?.message || error?.message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        validateLaundry().then(l => l);
    }, [validateLaundry]);

    return (
        <div className="flex min-h-screen bg-gray-100 justify-center">
            <Header />
            <Sidebar/>
            <Routes>
                <Route path="/" element={<CreateLaundry  setToast={setToast} setLoading={setLoading} fetchLaundry={fetchLaundry} laundry={laundry} setLaundry={setLaundry} setDelivery={setDelivery} delivery={delivery} setKycDocs={setKycDocs} kycDocs={kycDocs} setPrices={setPrices} prices={prices} setServices={setServices} services={services} />} />
                <Route path="/dashboard" element={<Dashboard setLoading={setLoading} setToast={setToast} />} />
                <Route path="/orders" element={<OrderDetails setLoading={setLoading} setToast={setToast} />} />
                <Route path="/store" element={<StoreDetails laundry={laundry} setLaundry={setLaundry} setToast={setToast} />} />
                <Route path="/services" element={<ManageServices prices={prices} setPrices={setPrices} fetchLaundry={fetchLaundry} setServices={setServices} setToast={setToast} />} />
                <Route path="/*" element={<NotFound />} />
            </Routes>
        </div>
    );
};

export default LaundryRoutes;