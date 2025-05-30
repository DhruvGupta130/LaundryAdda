import {createRef, useEffect, useState} from 'react';
import axios from 'axios';
import {
    FETCH_CUSTOMER_PICKUPS,
    FETCH_SHOP_DELIVERIES,
    FETCH_SHOP_PICKUPS,
    FETCH_CUSTOMER_DELIVERIES,
    UPDATE_CUSTOMER_PICKUP,
    UPDATE_SHOP_DELIVERY,
    UPDATE_SHOP_PICKUP,
    UPDATE_CUSTOMER_DELIVERY
} from "../../utils/config.js";
import { FaPhoneAlt, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaStickyNote } from 'react-icons/fa';
import {formatSlotName} from "../../utils/utility.js";
import {Modal, Input} from "antd";

const OrderCard = ({ orderId, title, name, mobile, address, slot, date, instructions, onAction, actionLabel }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-700">{title}</h2>
        <p className="text-sm text-gray-500 mb-2"><span className="font-semibold">Order ID:</span> {orderId}</p>

        <div className="space-y-2 text-gray-700 text-base">
            <p><span className="font-semibold">Name:</span> {name}</p>

            <p className="flex items-center space-x-2">
                <FaPhoneAlt className="text-blue-600" />
                <a href={`tel:${mobile}`} className="text-blue-600 underline hover:text-blue-800">
                    {mobile}
                </a>
            </p>

            <p className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-red-500" />
                <span>{address}</span>
            </p>

            {slot && (
                <p className="flex items-center space-x-2">
                    <FaClock className="text-gray-500" />
                    <span><strong>Slot:</strong> {slot}</span>
                </p>
            )}

            {date && (
                <p className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-green-600" />
                    <span><strong>Date:</strong> {date}</span>
                </p>
            )}

            {instructions && (
                <p className="flex items-center space-x-2">
                    <FaStickyNote className="text-yellow-600" />
                    <span><strong>Instructions:</strong> {instructions}</span>
                </p>
            )}
        </div>

        <button
            onClick={onAction}
            className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold py-3 rounded-lg shadow-md hover:from-indigo-700 hover:to-indigo-600 transition-colors duration-300"
        >
            {actionLabel}
        </button>
    </div>
);

const DeliveryOrders = ({ setLoading, setToast }) => {
    const token = localStorage.getItem("token");
    const [customerPickups, setCustomerPickups] = useState([]);
    const [shopDeliveries, setShopDeliveries] = useState([]);
    const [shopPickups, setShopPickups] = useState([]);
    const [customerDeliveries, setCustomerDeliveries] = useState([]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const [cp, sd, sp, cd] = await Promise.all([
                axios.get(FETCH_CUSTOMER_PICKUPS, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(FETCH_SHOP_DELIVERIES, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(FETCH_SHOP_PICKUPS, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(FETCH_CUSTOMER_DELIVERIES, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setCustomerPickups(cp.data);
            setShopDeliveries(sd.data);
            setShopPickups(sp.data);
            setCustomerDeliveries(cd.data);
        } catch (error) {
            setToast({ message: error?.response?.data?.message || error.message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders().then(l => l);
    }, []);

    const formatAddress = (address) =>
        `${address.street}, ${address.state} - ${address.zip}${address.landmark ? ` (Landmark: ${address.landmark})` : ''}`;

    const showSecretCodeModal = () =>
        new Promise((resolve, reject) => {
            const inputRef = createRef();

            const getValue = () => inputRef.current?.input?.value.trim();

            const modal = Modal.confirm({
                title: 'Enter Secret Code',
                content: (
                    <Input.OTP
                        ref={inputRef}
                        placeholder="Secret Code"
                        onPressEnter={() => {
                            const val = getValue();
                            if (!val) return setToast({ message: 'Please enter the secret code.', type: 'error' });
                            modal.destroy();
                            resolve(val);
                        }}
                    />
                ),
                okText: 'Submit',
                cancelText: 'Cancel',
                onOk: () => {
                    const val = getValue();
                    if (!val) {
                        setToast({ message: 'Please enter the secret code.', type: 'error' });
                        return Promise.reject();
                    }
                    resolve(val);
                },
                onCancel: () => reject(new Error('Cancelled')),
            });

            setTimeout(() => inputRef.current?.focus(), 0);
        });

    const handleMarkAction = async (orderId, type) => {
        const updateUrls = {
            customerPickup: UPDATE_CUSTOMER_PICKUP,
            shopDelivery: UPDATE_SHOP_DELIVERY,
            shopPickup: UPDATE_SHOP_PICKUP,
            customerDelivery: UPDATE_CUSTOMER_DELIVERY,
        };

        const updateUrlFunc = updateUrls[type];
        if (!updateUrlFunc) {
            setToast({ message: 'Unknown order type', type: 'error' });
            return;
        }

        let secretCode = null;
        if (['customerPickup', 'customerDelivery'].includes(type)) {
            try {
                secretCode = await showSecretCodeModal();
            } catch {
                setToast({ message: 'Action cancelled by user.', type: 'error' });
                return;
            }
        }

        try {
            const { data } = await axios.put(updateUrlFunc(orderId, secretCode), {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setToast({ message: data.message, type: 'success' });
            await fetchOrders();
        } catch (error) {
            setToast({ message: error?.response?.data?.message || error.message, type: 'error' });
        }
    };

    const renderGrid = (orders, type) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => {
                const isShopOrder = type.includes('shop');
                const isCustomerDelivery = type === 'customerDelivery';
                const isShopDelivery = type === 'shopDelivery';
                const isShopPickup = type === 'shopPickup';

                let date = null;
                if (isCustomerDelivery) {
                    date = order?.deliveryDate;
                } else if (type === 'customerPickup') {
                    date = order.pickupSlot?.date;
                } else if (isShopDelivery) {
                    date = order?.pickupSlot?.date;  // NEW: show pickup date when delivering to shop
                } else if (isShopPickup) {
                    date = order?.deliveryDate;  // NEW: show delivery date when picking up from the shop
                }

                const slot = (type === 'customerPickup') ? formatSlotName(order.pickupSlot?.timeSlot) : null;
                const instructions = (type === 'customerPickup') ? order.pickupSlot?.instructions : null;

                return (
                    <OrderCard
                        key={order.id}
                        orderId={order.id}
                        title={
                            type === 'customerPickup' ? `Pickup from Customer: ${order.customer?.user?.name}` :
                                type === 'shopDelivery' ? `Deliver to Laundry Shop: ${order.shop?.name}` :
                                    type === 'shopPickup' ? `Pickup from Laundry Shop: ${order.shop?.name}` :
                                        `Deliver to Customer: ${order.customer?.user?.name}`
                        }
                        name={isShopOrder ? order.shop?.managerName : order.customer?.user?.name}
                        mobile={isShopOrder ? order.shop?.mobile : order.customer?.mobile}
                        address={formatAddress(isShopOrder ? order.shop?.address : order.address)}
                        date={date}
                        slot={slot}
                        instructions={instructions}
                        onAction={() => handleMarkAction(order.id, type)}
                        actionLabel={type.includes('Pickup') ? "Mark as Picked" : "Mark as Delivered"}
                    />
                )
            })}
        </div>
    );



    return (
        <div className="bg-gray-100 mt-10 px-4 md:px-10 w-full">
            <main className="py-4 md:py-10 mt-32 md:mt-10">
                <h1 className="text-3xl font-bold mb-6">Orders Dashboard</h1>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">🧺 1. Pickup Clothes from Customers</h2>
                    {customerPickups.length === 0 ? <p>No pickups scheduled.</p> : renderGrid(customerPickups, 'customerPickup')}
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">🏬 2. Deliver Clothes to Shops</h2>
                    {shopDeliveries.length === 0 ? <p>No deliveries scheduled.</p> : renderGrid(shopDeliveries, 'shopDelivery')}
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">🧼 3. Pickup Cleaned Clothes from Shops</h2>
                    {shopPickups.length === 0 ? <p>No pickups scheduled.</p> : renderGrid(shopPickups, 'shopPickup')}
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">📦 4. Deliver Clean Clothes to Customers</h2>
                    {customerDeliveries.length === 0 ? <p>No deliveries scheduled.</p> : renderGrid(customerDeliveries, 'customerDelivery')}
                </section>
            </main>
        </div>
    );
};

export default DeliveryOrders;
