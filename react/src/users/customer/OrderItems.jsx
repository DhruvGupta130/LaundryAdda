import {useCallback, useEffect, useState} from "react";
import OrderDetailsModal from "./components/OrderDetailsModal.jsx";
import axios from "axios";
import {FETCH_CUSTOMER_ORDERS} from "../../utils/config.js";
import {deliveryColors, formatEnumString, formatSlotName} from "../../utils/utility.js";
import {getStatusKey, OrderStatusConfig} from "../../utils/features.jsx";
import {Button, Pagination} from "@mui/material";

const OrderItems = ({ setLoading, setToast }) => {
    const token = localStorage.getItem("token");
    const [visible, setVisible] = useState(false);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);

    const fetchOrders = useCallback(async (pageNumber) => {
        setLoading(true);
        try {
            const response = await axios.get(FETCH_CUSTOMER_ORDERS(pageNumber, 10), {headers: {Authorization: `Bearer ${token}`}});
            setOrders(response.data?.content);
            setTotalPages(response.data?.page?.totalPages);
            setPage(pageNumber + 1);
        } catch (error) {
            console.error("Error fetching orders: ", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders(0).then(res => res);
    }, [fetchOrders]);

    const handleOpen = (order) => {
        setVisible(true);
        setSelectedOrder(order);
    }

    const handleClose = () => {
        setVisible(false);
    }

    return (
        <div className="bg-gray-100 mt-10 px-10 w-full">
            <main className="py-4 md:py-10 lg:py-12 mt-32 md:mt-10">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Orders</h1>
                        <p className="text-sm text-gray-500">Your order analytics</p>
                    </div>
                </div>

                {/* Table */}
                <div className="mt-4 bg-white rounded-xl shadow overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-blue-100 text-gray-700">
                        <tr>
                            <th className="px-4 py-3 font-semibold">#</th>
                            <th className="px-4 py-3 font-semibold">Order ID</th>
                            <th className="px-4 py-3 font-semibold">Laundry Name</th>
                            <th className="px-4 py-3 font-semibold">Pickup Slot</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold">Delivery</th>
                            <th className="px-4 py-3 font-semibold">Amount</th>
                            <th className="px-4 py-3 font-semibold"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.length > 0 ? orders.map((order, idx) => (
                            <tr key={order.id} className="border-b">
                                <td className="px-4 py-3">{idx + 1}</td>
                                <td className="px-4 py-3 text-blue-600 font-medium">
                                    {order.id.slice(0, 8)}....
                                    <br />
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-blue-600 font-bold">
                                      {order.shop?.name || "N/A"}
                                    </span>
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
                                <td className="px-4 py-3 flex items-center gap-2">
                                    {(() => {
                                        const statusInfo = OrderStatusConfig[getStatusKey(order.status)];
                                        return (
                                            <span className={`flex items-center gap-1 font-medium ${statusInfo?.color || "text-gray-500"}`}>
                                                {statusInfo?.icon || "⏳"}
                                                {statusInfo?.label || formatEnumString(order.status) || "Unknown"}
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-base mt-1 block">
                                        {order.deliveryDate}
                                    </span>
                                    <span
                                        className={`inline-block mt-1 px-2 py-1 text-xs rounded-full font-medium ${
                                            deliveryColors[order.orderType] || "bg-gray-200 text-gray-600"
                                        }`}
                                    >
                                        {order.orderType || "N/A"}
                                      </span>
                                    <br />
                                </td>
                                <td className="px-4 py-3">₹{order.totalAmount ?? 0}</td>
                                <td className="px-4 py-3">
                                    <Button
                                        className="text-blue-500 cursor-pointer"
                                        variant="contained"
                                        onClick={() => {
                                            handleOpen(order);
                                        }}
                                    >
                                        View
                                    </Button>
                                </td>
                            </tr>
                        )) : (<tr>
                            <td colSpan={8} className="text-center text-base py-4 text-gray-500">
                                No Orders Found
                            </td>
                        </tr>)}
                        </tbody>
                    </table>
                    {totalPages > 0 && <div className="flex justify-end p-4 bg-white rounded-b-xl">
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, value) => fetchOrders(value - 1)}
                            color="primary"
                        />
                    </div>}
                </div>
            </main>
            {selectedOrder && <OrderDetailsModal visible={visible} onCancel={handleClose} fetchOrders={fetchOrders} order={selectedOrder} setOrders={setOrders} setToast={setToast}/>}
        </div>
    );
};

export default OrderItems;