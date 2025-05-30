import {Modal, Table, Button, Descriptions, Divider, Form} from 'antd';
import {deliveryColors, formatEnumString, formatSlotName} from "../../../utils/utility.js";
import {getStatusKey, OrderStatusConfig} from "../../../utils/features.jsx";
import {useState} from "react";
import axios from "axios";
import {
    ACCEPT_ORDER,
    CANCEL_ORDER,
    GENERATE_BILL,
    PROCESS_ORDER,
    READY_ORDER_FOR_DELIVERY
} from "../../../utils/config.js";
import PropTypes from "prop-types";
import AddOrderItemsModal from "./AddOrderItemsModal.jsx";

const formatAddress = (address) => {
    if (!address) return 'N/A';
    const { street, area, state, zip, landmark } = address;
    return `${street}, ${area.name}, ${landmark ? `${landmark}, ` : ''}${area?.city?.name}, ${state} ${zip}`;
};

const OrderSummaryModal = ({ visible, onCancel, order, setOrders, setToast }) => {
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const token = localStorage.getItem("token");
    const [orderItems, setOrderItems] = useState([]);
    const [note, setNotes] = useState("");
    const [form] = Form.useForm();
    if (!order) return null;

    const { id, customer, shop, totalAmount, status, items, address, pickupSlot, deliveryDate, orderType, instructions, notes } = order;

    const columns = [
        { title: 'Qty', dataIndex: 'quantity', key: 'quantity' },
        { title: 'Service', dataIndex: 'serviceName', key: 'serviceName' },
        { title: 'Cloth Type', dataIndex: 'clothType', key: 'clothType' },
        { title: 'Cloth', dataIndex: 'cloth', key: 'cloth' },
        { title: 'Price', dataIndex: 'price', key: 'price' },
        { title: 'Total', dataIndex: 'total', key: 'total' },
    ];

    const dataSource = items.map((item, index) => ({
        key: index,
        serviceName: formatEnumString(item.requests?.service) || 'Unknown Service',
        cloth: formatEnumString(item.requests?.cloth) || 'Unknown Cloth Type',
        clothType: formatEnumString(item.requests?.clothType) || 'Unknown Cloth Type',
        quantity: item.quantity || '--',
        price: `₹${item.requests?.price || 0}`,
        total: `₹${((item.requests?.price || 0) * (item.quantity || 0)).toFixed(2)}`,
    }));

    const updateOrder = async () => {
        setLoading(true);
        if (status === "PENDING_OWNER_CONFIRMATION"){
            try {
                const response = await axios.put(ACCEPT_ORDER(id), {}, {headers: {Authorization: `Bearer ${token}`}});
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === id
                            ? { ...order, status: "AWAITING_PICKUP" }
                            : order
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
        } else if (status === "COUNTING"){
            try {
                if (orderItems.length > 0){
                    const response = await axios.put(GENERATE_BILL(id, note), orderItems, {headers: {Authorization: `Bearer ${token}`}});
                    setOrderItems([]);
                    setModalOpen(false);
                    const total = orderItems.reduce((sum, item) => sum + (item.total || 0), 0);
                    form.resetFields();
                    setOrders(prevOrders =>
                        prevOrders.map(order =>
                            order.id === id
                                ? { ...order, status: "BILL_GENERATED", items: orderItems, notes: note, totalAmount: total }
                                : order
                        )
                    );
                    setToast({message: response.data?.message, type: "success"});
                    onCancel();
                }
                else setModalOpen(true);
            } catch (error) {
                setToast({message: error?.response?.data?.message || error?.message, type: "error"});
                console.error("Error in updating order: ", error);
            } finally {
                setLoading(false);
            }
        } else if (status === "BILL_GENERATED"){
            try {
                const response = await axios.put(PROCESS_ORDER(id),{}, {headers: {Authorization: `Bearer ${token}`}});
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === id
                            ? { ...order, status: "PROCESSING" }
                            : order
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
        } else if (status === "PROCESSING"){
            try {
                const response = await axios.put(READY_ORDER_FOR_DELIVERY(id),{}, {headers: {Authorization: `Bearer ${token}`}});
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === id
                            ? { ...order, status: "READY_FOR_DELIVERY" }
                            : order
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
        }else {
            setToast({message: "Waiting for delivery team to update status", type: "error"});
            setLoading(false);
        }
    }

    const cancelOrder = async () => {
        setLoading(true);
        try {
            const response = await axios.delete(CANCEL_ORDER(id), {headers: {Authorization: `Bearer ${token}`}});
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === id
                        ? { ...order, status: "CANCELLED_BY_OWNER" }
                        : order
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

    const closeModal = () => {
        setModalOpen(false);
        form.resetFields();
        setOrderItems([]);
        setNotes("");
    }

    return (
        <Modal
            title={<h2 className="text-2xl font-bold">Order Summary</h2>}
            open={visible}
            onCancel={onCancel}
            width={1000}
            footer={
                <div className="flex justify-between gap-5 w-full pt-6">
                    <Button
                        disabled={status.includes("CANCELLED")}
                        onClick={cancelOrder}
                        loading={loading}
                        danger block
                    >
                        {status.includes("CANCELLED") ? "Cancelled" : `Reject Request`}
                    </Button>
                    {!status.includes("CANCELLED") &&  <Button
                        type="primary" block
                        loading={loading}
                        onClick={updateOrder}
                    >
                        {status === "PENDING_OWNER_CONFIRMATION" ? `Accept Request` : 'Update Status'}
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
                        <Descriptions.Item label="Order ID">{id}</Descriptions.Item>
                        <Descriptions.Item label="Customer">
                            CID: {customer?.id}<br />
                            {customer?.user?.name || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Shop">
                            {shop?.name || 'N/A'}
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

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
                        Grand Total: ₹{totalAmount || 0}
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
                                const statusInfo = OrderStatusConfig[getStatusKey(status)];
                                return (
                                    <span className={`flex items-center text-sm gap-1 font-medium ${statusInfo?.color || "text-gray-500"}`}>
                                        {statusInfo?.icon || "⏳"}
                                        {statusInfo?.label || formatEnumString(status) || "Unknown"}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="flex flex-col justify-between items-center border border-gray-300 rounded-md">
                        <div className="p-2">
                            <div className="font-medium text-base mb-1">Pickup Address & Slot</div>
                            <p className="text-sm text-gray-700 break-words">{formatAddress(address)}</p>
                            <p className="text-sm">{pickupSlot?.date}</p>
                            <p className="text-sm">{formatSlotName(pickupSlot?.timeSlot)}</p>
                        </div>
                        <div className="border-t w-full border-gray-300" />
                        <div className="p-2">
                            <div className="font-medium text-base mb-1">Delivery Address & Slot</div>
                            <p className="text-sm text-gray-700 break-words">{formatAddress(address)}</p>
                            <p className="text-sm">{deliveryDate}</p>
                            <span
                                className={`inline-block mt-1 px-2 py-1 text-xs rounded-full font-medium ${
                                    deliveryColors[orderType] || "bg-gray-200 text-gray-600"
                                }`}
                            >
                                {orderType || "N/A"}
                            </span>
                        </div>
                    </div>

                    {instructions && (
                        <div className="border p-3 mb-2 rounded-md bg-white">
                            <p className="text-sm">
                                <span className="font-medium">Instructions:</span><br />
                                <span className="text-gray-700 text-sm">{instructions}</span>
                            </p>
                        </div>
                    )}
                    {notes && (
                        <div className="border p-3 mb-2 rounded-md bg-white">
                            <p className="text-sm">
                                <span className="font-medium">Notes:</span><br />
                                <span className="text-gray-700 text-sm">{notes}</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <AddOrderItemsModal
                isOpen={modalOpen}
                setToast={setToast}
                form={form}
                submittedItems={orderItems}
                setSubmittedItems={setOrderItems}
                notes={note}
                setNotes={setNotes}
                onSubmit={updateOrder}
                onClose={closeModal}
            />
        </Modal>
    );
};

export default OrderSummaryModal;

OrderSummaryModal.propTypes = {
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
