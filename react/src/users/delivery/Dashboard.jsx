import React, {useEffect, useState} from 'react';
import axios from "axios";
import {FETCH_DASHBOARD_DATA, FETCH_DELIVERY_AREAS} from "../../utils/config.js";

const Dashboard = ({ setLoading, setToast }) => {
    const token = localStorage.getItem('token');
    const [stats, setStats] = useState({
        totalOrders: 0,
        awaitingPickupOrders: 0,
        pickedUpOrders: 0,
        deliveredOrders: 0,
        outForDeliveryOrders: 0
    });
    const [deliveryAreas, setDeliveryAreas] = useState([]);

    const fetchDashboardAndDeliveryAreas = async () => {
        setLoading(true);
        try {
            const [dashboardResponse, areasResponse] = await Promise.all([
                axios.get(FETCH_DASHBOARD_DATA, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(FETCH_DELIVERY_AREAS, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setStats(dashboardResponse.data);
            setDeliveryAreas(areasResponse.data);
        } catch (error) {
            console.error('Error fetching dashboard or delivery areas: ', error);
            setToast({message: error?.response?.data?.message || error?.message, type: 'error',});
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchDashboardAndDeliveryAreas().then(l => l);
    }, []);

    return (
        <div className="bg-gray-100 mt-10 px-4 md:px-10 w-full">
            <main className="py-4 md:py-10 mt-32 md:mt-10">
                <h1 className="text-3xl font-bold text-blue-700 mb-5">Delivery Dashboard</h1>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-5">
                    <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
                        <div className="text-center">
                            <div className="md:md:text-5xl text-4xl font-bold text-blue-600">{stats.totalOrders}</div>
                            <div className="mt-2 text-lg font-semibold text-gray-700">Total Orders</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
                        <div className="text-center">
                            <div className="md:text-5xl text-4xl font-bold text-yellow-500">{stats.pickedUpOrders}</div>
                            <div className="mt-2 text-lg font-semibold text-gray-700">Orders Picked Up</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
                        <div className="text-center">
                            <div className="md:text-5xl text-4xl font-bold text-red-500">{stats.awaitingPickupOrders}</div>
                            <div className="mt-2 text-lg font-semibold text-gray-700">Pending Pickup</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
                        <div className="text-center">
                            <div className="md:text-5xl text-4xl font-bold text-green-600">{stats.deliveredOrders}</div>
                            <div className="mt-2 text-lg font-semibold text-gray-700">Orders Delivered</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
                        <div className="text-center">
                            <div className="md:text-5xl text-4xl font-bold text-orange-500">{stats.outForDeliveryOrders}</div>
                            <div className="mt-2 text-lg font-semibold text-gray-700">Pending Delivery</div>
                        </div>
                    </div>
                </div>

                {/* Delivery Areas Section */}
                <div className="bg-white rounded-2xl p-6 shadow">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Delivery Areas</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {deliveryAreas.map((area) => (
                            <div
                                key={area.id}
                                className="border border-gray-300 rounded-lg p-4 text-center"
                            >
                                <div className="text-xl font-semibold text-gray-700">{area.name}</div>
                                <div className="text-sm font-semibold text-gray-500">{area.city.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
}

export default Dashboard;
