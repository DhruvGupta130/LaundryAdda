import { useEffect, useState, useCallback, useMemo } from "react";
import { FiTrendingUp, FiShoppingCart } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import { MdOutlineMoneyOff } from "react-icons/md";
import { deliveryColors, formatEnumString, formatSlotName } from "../../utils/utility.js";
import { getStatusKey, OrderStatusConfig } from "../../utils/features.jsx";
import { Button } from "@mui/material";
import axios from "axios";
import { FETCH_NEW_ORDERS, GET_DASHBOARD_DATA } from "../../utils/config.js";
import OrderSummaryModal from "./components/OrderSummaryModal.jsx";
import PropTypes from "prop-types";
import OrderDetails from "./OrderDetails.jsx";

const Dashboard = ({ setLoading, setToast }) => {
    const token = localStorage.getItem("token");

    const [selectedTab, setSelectedTab] = useState("week");
    const [newOrders, setNewOrders] = useState([]);
    const [visible, setVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        numberOfVisitors: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalProfit: 0,
        commissionPaid: 0,
    });
    const [error, setError] = useState(null);

    const apiHeaders = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` },
    }), [token]);

    const fetchDashboardInfo = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [ordersRes, dashboardRes] = await Promise.all([
                axios.get(FETCH_NEW_ORDERS, apiHeaders),
                axios.get(GET_DASHBOARD_DATA, {
                    ...apiHeaders,
                    params: { period: selectedTab }
                }),
            ]);
            setNewOrders(ordersRes.data || []);
            setDashboardData(dashboardRes.data || {});
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            const msg = err.response?.data?.message || err.message || "An error occurred";
            setToast({ message: msg, type: "error" });
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [apiHeaders, setLoading, setToast, selectedTab]);

    useEffect(() => {
        fetchDashboardInfo().then(r => r);
    }, [fetchDashboardInfo]);

    const tabs = {week: "This Week", month: "This Month", year: "This Year", overall: "Over All"};

    const metrics = [
        {
            label: "Number of visitors",
            icon: <FiTrendingUp size={20} className="text-blue-500" />,
            value: dashboardData?.numberOfVisitors ?? 0,
        },
        {
            label: "Orders",
            icon: <FiShoppingCart size={20} className="text-blue-500" />,
            value: dashboardData?.totalOrders ?? 0,
        },
        {
            label: "Total Revenue",
            icon: <FaRupeeSign size={20} className="text-green-500" />,
            value: dashboardData?.totalRevenue ?? 0,
        },
        {
            label: "Total Profit",
            icon: <FaRupeeSign size={20} className="text-green-400" />,
            value: dashboardData?.totalProfit ?? 0,
        },
        {
            label: "Commission paid",
            icon: <MdOutlineMoneyOff size={20} className="text-red-400" />,
            value: dashboardData?.commissionPaid ?? 0,
        },
    ];

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-white p-6 rounded-xl shadow text-center">
                    <h2 className="text-lg font-semibold mb-2">Error Loading Dashboard</h2>
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button variant="contained" onClick={fetchDashboardInfo}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 mt-10 px-4 md:px-10 w-full">
            <main className="py-4 md:py-10 mt-32 md:mt-10">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-sm text-gray-500">Your store analytics</p>

                {/* Tabs */}
                <div className="mt-4 flex gap-2 flex-wrap">
                    {Object.entries(tabs).map(([tab, value])  => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${
                                selectedTab === tab
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-700"
                            }`}
                        >
                            {value}
                        </button>
                    ))}
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
                    {metrics.map((metric, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-4 shadow flex flex-col items-start"
                        >
                            <div className="mb-2">{metric.icon}</div>
                            <div className="text-sm text-gray-600">{metric.label}</div>
                            <div className="font-semibold text-lg">{metric.value}</div>
                        </div>
                    ))}
                </div>

                {/* New Orders Section */}
                <div className="mt-10">
                    <h2 className="text-lg font-semibold mb-2">New Orders</h2>
                    {newOrders.length > 0 ? (
                        <div className="mt-4 bg-white rounded-xl shadow overflow-x-auto">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-blue-100 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">#</th>
                                    <th className="px-4 py-3 font-semibold">Order ID</th>
                                    <th className="px-4 py-3 font-semibold">Customer Name</th>
                                    <th className="px-4 py-3 font-semibold">Pickup Slot</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold">Delivery</th>
                                    <th className="px-4 py-3 font-semibold">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {newOrders.map((order, idx) => {
                                    const statusInfo = OrderStatusConfig[getStatusKey(order.status)] || {};
                                    return (
                                        <tr key={order.id} className="border-b">
                                            <td className="px-4 py-3">{idx + 1}</td>
                                            <td className="px-4 py-3 text-blue-600 font-medium">
                                                {order.id?.slice(0, 8)}...
                                            </td>
                                            <td className="px-4 py-3 font-bold text-blue-600">
                                                {order.customer?.user?.name || "N/A"}
                                            </td>
                                            <td className="px-4 py-3">
                                                {order.pickupSlot ? (
                                                    <div>
                                                        <div className="text-base">{order.pickupSlot.date}</div>
                                                        <div className="text-sm text-gray-600">({formatSlotName(order.pickupSlot.timeSlot)})</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </td>
                                            <td className={`px-4 py-3 flex items-center gap-1 font-medium ${statusInfo.color || "text-gray-500"}`}>
                                                {statusInfo.icon || "⏳"} {statusInfo.label || formatEnumString(order.status)}
                                            </td>
                                            <td className="px-4 py-3">
                                                    <span className="text-base mt-1 block">
                                                        {order.deliveryDate}
                                                    </span>
                                                <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full font-medium ${
                                                    deliveryColors[order.orderType] || "bg-gray-200 text-gray-600"
                                                }`}>
                                                        {order.orderType || "N/A"}
                                                    </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button
                                                    className="text-blue-500"
                                                    variant="contained"
                                                    onClick={() => {
                                                        setVisible(true);
                                                        setSelectedOrder(order);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px]">
                            <div className="text-5xl mb-2">😞</div>
                            <div className="font-bold text-gray-600 italic text-xl">LaundryAdda</div>
                            <div className="text-gray-500 mt-1 text-sm">No New orders received</div>
                        </div>
                    )}
                </div>

                <OrderSummaryModal
                    visible={visible}
                    onCancel={() => setVisible(false)}
                    order={selectedOrder}
                    setOrders={setNewOrders}
                    setToast={setToast}
                />
            </main>
        </div>
    );
};

export default Dashboard;

OrderDetails.propTypes = {
    setLoading: PropTypes.func.isRequired,
    setToast: PropTypes.func.isRequired,
};