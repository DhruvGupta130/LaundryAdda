import React, { useEffect, useState } from 'react';
import { Modal, Select, Input, Spin, Steps, message } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { FETCH_TIME_SLOTS, REQUEST_PICKUP } from "../utils/config.js";
import { formatSlotName } from "../utils/utility.js";
import {Button} from "@mui/material";
import AddAddressModal from "../users/customer/components/AddAddressModal.jsx";

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const PickupRequestModal = ({ visible, onClose, shopId, shopName, addresses, setAddresses, setToast }) => {
    const [current, setCurrent] = useState(0);
    const [addressId, setAddressId] = useState("");
    const [date, setDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [orderType, setOrderType] = useState("");
    const [instructions, setInstructions] = useState('');
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [open, setOpen] = useState(false);

    const fetchTimeSlots = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(FETCH_TIME_SLOTS);
            setTimeSlots(data);
        } catch (error) {
            console.error(error);
            setToast({ message: error?.response?.data?.message || error?.message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible)
            fetchTimeSlots().then(r => r);
    }, [visible]);

    const handleClose = () => {
        setAddressId("");
        setDate("");
        setTimeSlot("");
        setOrderType("");
        setInstructions('');
        setCurrent(0);
        onClose();
    }

    const next = () => {
        if (current === 0 && !addressId) return message.error('Please select an address');
        if (current === 1) {
            if (!date) return message.error('Please select a date');
            if (dayjs(date).isBefore(dayjs().startOf('day'))) return message.error('Date must be today or later');
            if (!timeSlot) return message.error('Please select a pickup time slot');
        }
        if (current === 2 && !orderType) return message.error('Please select an order type');
        setCurrent(current + 1);
    };

    const prev = () => setCurrent(current - 1);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                shopId,
                addressId,
                pickupSlot: { date, timeSlot },
                orderType,
                instructions,
            };
            const response = await axios.post(REQUEST_PICKUP, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setToast({ message: response.data.message, type: "success" });
            handleClose();
        } catch (err) {
            console.error(err);
            setToast({ message: err?.response?.data?.message || err?.message, type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    const steps = [
        {
            title: 'Address',
            content: (
                <div>
                    <label style={{ fontWeight: '600' }}>Select Address <span className="text-red-600">*</span></label>
                    <Select
                        placeholder="Select your address"
                        value={addressId}
                        onChange={setAddressId}
                        showSearch
                        optionFilterProp="children"
                        style={{ width: '100%', marginBottom: 24 }}
                    >
                        <Option value="" disabled>Choose an Address</Option>
                        {addresses.map(addr => (
                            <Option key={addr.id} value={addr.id}>
                                {addr.street}, {addr.area.name}, {addr.area.city.name}, {addr.state} - {addr.zip}
                            </Option>
                        ))}
                    </Select>

                    <Button onClick={() => setOpen(true)} variant="outlined" color="secondary">Add New Address</Button>
                </div>
            ),
        },
        {
            title: 'Date & Time',
            content: (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontWeight: '600' }}>Pickup Date <span className="text-red-600">*</span></label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={dayjs().format('YYYY-MM-DD')}
                        />
                    </div>
                    <div>
                        <label style={{ fontWeight: '600' }}>Pickup Time <span className="text-red-600">*</span></label>
                        <Select
                            placeholder="Select pickup time"
                            value={timeSlot}
                            onChange={setTimeSlot}
                            style={{ width: '100%' }}
                        >
                            <option value="" disabled>Choose a Time</option>
                            {timeSlots.map(slot => (
                                <Option key={slot} value={slot}>
                                    {formatSlotName(slot)}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </>
            ),
        },
        {
            title: 'Delivery Type',
            content: (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontWeight: '600' }}>Delivery Type <span className="text-red-600">*</span></label>
                        <Select
                            placeholder="Select delivery type"
                            value={orderType}
                            onChange={setOrderType}
                            style={{ width: '100%' }}
                        >
                            <Option value="" disabled>Choose an Delivery Type</Option>
                            <Option value="STANDARD">Standard</Option>
                            <Option value="EXPRESS">Express</Option>
                            <Option value="SEMI_EXPRESS">Semi Express</Option>
                        </Select>
                    </div>
                    <div>
                        <label style={{ fontWeight: '600' }}>Special Instructions</label>
                        <TextArea
                            rows={3}
                            placeholder="Any special instructions?"
                            value={instructions}
                            onChange={e => setInstructions(e.target.value)}
                        />
                    </div>
                </>
            ),
        },
        {
            title: 'Confirm',
            content: (
                <div>
                    <p><strong>Shop:</strong> {shopName}</p>
                    <p><strong>Address:</strong> {addresses.find(a => a.id === addressId)?.street}, {addresses.find(a => a.id === addressId)?.area?.name}</p>
                    <p><strong>Date:</strong> {date}</p>
                    <p><strong>Time Slot:</strong> {timeSlot && formatSlotName(timeSlot)}</p>
                    <p><strong>Order Type:</strong> {orderType}</p>
                    <p><strong>Instructions:</strong> {instructions || '-'}</p>
                </div>
            ),
        },
    ];

    return (
        <Modal
            title={<h2 className="text-2xl font-bold">Request Pickup</h2>}
            open={visible}
            onCancel={handleClose}
            footer={<div className="flex justify-between gap-10 w-full">
                <Button variant="outlined" color="error" disabled={current === 0} fullWidth onClick={prev}>
                    Previous
                </Button>
                {current < steps.length - 1 && (
                    <Button type="primary" variant="contained" fullWidth onClick={next}>
                        Next
                    </Button>
                )}
                {current === steps.length - 1 && (
                    <Button variant="contained" color="success" fullWidth onClick={handleSubmit} loading={submitting}>
                        Submit
                    </Button>
                )}
            </div>}
            centered
            width={800}
            destroyOnHidden
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    <Steps current={current} size="small" style={{ marginBottom: 24, marginTop: 24 }}>
                        {steps.map((item) => (
                            <Step
                                key={item.title}
                                title={<div className="text-lg font-medium">{item.title}</div>}
                            />
                        ))}
                    </Steps>
                    <div style={{ minHeight: 150, marginBottom: 24 }}>{steps[current].content}</div>
                </>
            )}
            <AddAddressModal open={open} handleClose={() => setOpen(false)} setToast={setToast} setAddresses={setAddresses} />
        </Modal>
    );
};

export default PickupRequestModal;
