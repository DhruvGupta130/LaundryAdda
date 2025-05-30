import {Modal, Table, Descriptions, Divider} from 'antd';
import {deliveryColors, formatEnumString, formatSlotName} from "../../../utils/utility.js";
import {getStatusKey, OrderStatusConfig} from "../../../utils/features.jsx";
import {useEffect, useState} from "react";
import axios from "axios";
import {
    CANCEL_PICKUP_REQUEST, FETCH_SECRET_CODE, GET_ORDER_INVOICE
} from "../../../utils/config.js";
import PropTypes from "prop-types";
import {Button} from "@mui/material";
import ReviewModal from "./ReviewModal.jsx";

const formatAddress = (address) => {
    if (!address) return 'N/A';
    const { street, area, state, zip, landmark } = address;
    return `${street}, ${area.name}, ${landmark ? `${landmark}, ` : ''}${area?.city?.name}, ${state} ${zip}`;
};

const OrderDetailsModal = ({ visible, onCancel, order, setOrders, setToast }) => {
    const [loading, setLoading] = useState(false);
    const [secret, setSecret] = useState(false);
    const token = localStorage.getItem("token");
    const [open, setOpen] = useState(false);

    const openModal = () => {
        setOpen(true);
    }

    const closeModal = () => {
        setOpen(false);
    }

    const fetchSecretCode = async () => {
        try {
            const response = await axios.get(FETCH_SECRET_CODE(order.id), {headers: {Authorization: `Bearer ${token}`}});
            setSecret(response.data);
        } catch (error) {
            setToast({message: error?.response?.data?.message || error?.message, type: "error"});
            console.error("Error in fetching secret code: ", error);
        }
    }

    useEffect(() => {
        if (order.status === "AWAITING_PICKUP" || order.status === "OUT_FOR_DELIVERY") fetchSecretCode().then(r => r);
    }, []);

    const columns = [
        { title: 'Qty', dataIndex: 'quantity', key: 'quantity' },
        { title: 'Service', dataIndex: 'serviceName', key: 'serviceName' },
        { title: 'Cloth Type', dataIndex: 'clothType', key: 'clothType' },
        { title: 'Cloth', dataIndex: 'cloth', key: 'cloth' },
        { title: 'Price', dataIndex: 'price', key: 'price' },
        { title: 'Total', dataIndex: 'total', key: 'total' },
    ];

    const dataSource = order.items.map((item, index) => ({
        key: index,
        serviceName: formatEnumString(item.requests?.service) || 'Unknown Service',
        cloth: formatEnumString(item.requests?.cloth) || 'Unknown Cloth Type',
        clothType: formatEnumString(item.requests?.clothType) || 'Unknown Cloth Type',
        quantity: item.quantity || '--',
        price: `₹${item.requests?.price || 0}`,
        total: `₹${((item.requests?.price || 0) * (item.quantity || 0)).toFixed(2)}`,
    }));

    const cancelOrder = async () => {
        setLoading(true);
        try {
            const response = await axios.delete(CANCEL_PICKUP_REQUEST(order.id), {headers: {Authorization: `Bearer ${token}`}});
            setOrders(prevOrders =>
                prevOrders.map(or =>
                    or.id === order.id
                        ? { ...or, status: "CANCELLED_BY_CUSTOMER" }
                        : or
                )
            );
            setToast({message: response.data?.message, type: "success"});
            onCancel();
        } catch (error) {
            setToast({message: error?.response?.data?.message || error?.message, type: "error"});
            console.error("Error in updating order: ", error);
        } finally {
            setLoading(false);
        }
    }

    const getInvoice = async () => {
        setLoading(true);
        try {
            const response = await axios.get(GET_ORDER_INVOICE(order.id), {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data?.pdfUrl) {
                window.open(response.data.pdfUrl, "_blank");
            } else {
                throw new Error("Invoice not found for this order.");
            }
        } catch (error) {
            console.error("Error fetching invoice:", error);
            const errorMessage =
                error?.response?.data?.message || error.message || "Something went wrong while fetching the invoice.";
            setToast({
                message: errorMessage,
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={<h2 className="text-2xl font-bold">Order Summary</h2>}
            open={visible}
            onCancel={onCancel}
            width={1000}
            footer={
                <div className="flex justify-between gap-5 w-full pt-6">
                    {["PENDING_OWNER_CONFIRMATION", "AWAITING_PICKUP"]
                        .includes(order.status) && <Button
                        disabled={order.status.includes("CANCELLED")}
                        onClick={cancelOrder}
                        loading={loading}
                        variant="outlined"
                        color="error"
                        fullWidth
                    >
                        {order.status.includes("CANCELLED") ? "Cancelled" : `Request Cancellation`}
                    </Button>}
                    {order.status === "DELIVERED" && <Button
                        variant="contained"
                        color="success"
                        onClick={openModal}
                        fullWidth
                    >
                        Review
                    </Button>}
                    {["BILL_GENERATED", "PROCESSING", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED"]
                        .includes(order.status) &&  <Button
                        variant="contained"
                        color="primary"
                        onClick={getInvoice}
                        loading={loading}
                        fullWidth
                    >
                        Download Invoice
                    </Button>}
                </div>
            }
            styles={{
                body: {
                    maxHeight: '70vh',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    paddingRight: '12px',
                }
            }}
            centered
            destroyOnHidden
        >
            <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
                {/* Left Section */}
                <div className="md:flex-2 w-full">
                    <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Order ID">{order.id}</Descriptions.Item>
                        <Descriptions.Item label="Customer">
                            <div className="text-base font-medium">{order.customer?.user?.name || 'N/A'}</div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Shop">
                            <div className="text-base font-medium">{order.shop?.name}</div>
                            <div>{formatAddress(order.shop?.address)}</div>
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    {secret && (
                        <div className="flex flex-col justify-center items-center mb-4 p-2 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-lg shadow-md text-white font-semibold text-lg">
                            <span className="text-3xl flex flex-col items-center justify-center w-full"><p className="text-sm">Secret Code: </p>{secret}</span>
                            <p className="text-xs text-center">Share this with our delivery partner after verifying the package.</p>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <Table
                            columns={columns}
                            dataSource={dataSource}
                            pagination={false}
                            bordered
                            size="small"
                            className="min-w-[400px]"
                        />
                    </div>

                    <div className="text-right text-lg mt-3 font-semibold">
                        Grand Total: ₹{order.totalAmount || 0}
                    </div>
                </div>

                {/* Right Section */}
                <div className="md:flex-1 w-full space-y-5">
                    <div className="bg-blue-50 border p-4 rounded-md">
                        <div className="flex justify-between items-center mb-3">
                            <div className="font-medium text-lg">Order Status</div>
                        </div>
                        <div className="flex justify-between items-center">
                            {(() => {
                                const statusInfo = OrderStatusConfig[getStatusKey(order.status)];
                                return (
                                    <span className={`flex items-center text-sm gap-1 font-medium ${statusInfo?.color || "text-gray-500"}`}>
                                        {statusInfo?.icon || "⏳"}
                                        {statusInfo?.label || formatEnumString(order.status) || "Unknown"}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="flex flex-col justify-between items-center border border-gray-300 rounded-md">
                        <div className="p-2">
                            <div className="font-medium text-base mb-1">Pickup Address & Slot</div>
                            <p className="text-sm text-gray-700 break-words">{formatAddress(order.address)}</p>
                            <p className="text-sm">{order.pickupSlot?.date}</p>
                            <p className="text-sm">{formatSlotName(order.pickupSlot?.timeSlot)}</p>
                        </div>
                        <div className="border-t w-full border-gray-300" />
                        <div className="p-2">
                            <div className="font-medium text-base mb-1">Delivery Address & Slot</div>
                            <p className="text-sm text-gray-700 break-words">{formatAddress(order.address)}</p>
                            <p className="text-sm">{order.deliveryDate}</p>
                            <span
                                className={`inline-block mt-1 px-2 py-1 text-xs rounded-full font-medium ${
                                    deliveryColors[order.orderType] || "bg-gray-200 text-gray-600"
                                }`}
                            >
                                {order.orderType || "N/A"}
                            </span>
                        </div>
                    </div>

                    {order.instructions && (
                        <div className="border p-3 mb-2 rounded-md bg-white">
                            <p className="text-sm">
                                <span className="font-medium">Instructions:</span><br />
                                <span className="text-gray-700 text-sm">{order.instructions}</span>
                            </p>
                        </div>
                    )}
                    {order.notes && (
                        <div className="border p-3 mb-2 rounded-md bg-white">
                            <p className="text-sm">
                                <span className="font-medium">Notes:</span><br />
                                <span className="text-gray-700 text-sm">{order.notes}</span>
                            </p>
                        </div>
                    )}
                </div>
                <ReviewModal open={open} onClose={closeModal} setToast={setToast} orderId={order.id} />
            </div>
        </Modal>
    );
};

export default OrderDetailsModal;

OrderDetailsModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    order: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        customer: PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            user: PropTypes.shape({
                name: PropTypes.string,
            }),
        }),
        shop: PropTypes.shape({
            name: PropTypes.string,
        }),
        deliveryDate: PropTypes.string,
        orderType: PropTypes.string,
        status: PropTypes.string,
        items: PropTypes.arrayOf(
            PropTypes.shape({
                quantity: PropTypes.number,
                requests: PropTypes.shape({
                    service: PropTypes.string,
                    clothType: PropTypes.string,
                    cloth: PropTypes.string,
                    price: PropTypes.number,
                }),
            })
        ),
        address: PropTypes.shape({
            street: PropTypes.string,
            area: PropTypes.shape({
                name: PropTypes.string,
                city: PropTypes.shape({
                    name: PropTypes.string,
                })
            }),
            state: PropTypes.string,
            zip: PropTypes.string,
            landmark: PropTypes.string,
        }),
        pickupSlot: PropTypes.shape({
            date: PropTypes.string,
            timeSlot: PropTypes.string,
        }),
        deliverySlot: PropTypes.shape({
            date: PropTypes.string,
            timeSlot: PropTypes.string,
        }),
        instructions: PropTypes.string,
    }),
    setOrders: PropTypes.func.isRequired,
    setToast: PropTypes.func.isRequired,
};
