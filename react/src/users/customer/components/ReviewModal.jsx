import React, {useEffect, useState} from 'react';
import { Modal, Rate, Input, Form } from 'antd';
import {Button} from "@mui/material";
import axios from "axios";
import {FETCH_ORDER_REVIEW, UPDATE_SERVICE_REVIEW} from "../../../utils/config.js";

const ReviewModal = ({ open, onClose, setToast, orderId }) => {
    const token = localStorage.getItem("token");
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const fetchReview = async () => {
        setLoading(true);
        try {
            const response = await axios.get(FETCH_ORDER_REVIEW(orderId), {headers: {Authorization: `Bearer ${token}`} });
            const reviewData = response.data;
            form.setFieldsValue({
                service: reviewData.service,
                time: reviewData.time,
                clothing: reviewData.clothing,
                value: reviewData.value,
                feedback: reviewData.feedback,
            });
        } catch (error) {
            console.log('Review Failed:', error);
            setToast({ message: error?.response?.data?.message || error?.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchReview().then(f => f);
    }, []);

    const handleSubmit = async () => {
        const values = await form.validateFields();
        setLoading(true);
        try {
            const response = await axios.put(UPDATE_SERVICE_REVIEW(orderId), values, {headers: {Authorization: `Bearer ${token}`} });
            setToast({ message: response?.data?.message, type: 'success' });
            onClose();
            form.resetFields();
        } catch (error) {
            console.log('Review Failed:', error);
            setToast({ message: error?.response?.data?.message || error?.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={<h2 className="text-2xl font-bold">Submit Your Review</h2>}
            footer={[
                <div className="flex justify-between gap-10 w-full" key="footer">
                    <Button
                        variant="contained"
                        color="error"
                        key="cancel"
                        fullWidth
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        key="submit"
                        type="submit"
                        variant="contained"
                        loading={loading}
                        onClick={handleSubmit}
                        fullWidth
                    >
                        Submit
                    </Button>
                </div>
            ]}
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
            <Form form={form} layout="vertical">
                <Form.Item
                    label={<span className="text-base font-semibold">Service</span>}
                    name="service"
                    rules={[{ required: true, message: 'Please rate the service!' }]}
                >
                    <Rate style={{ fontSize: 30 }} />
                </Form.Item>

                <Form.Item
                    label={<span className="text-base font-semibold">Time</span>}
                    name="time"
                    rules={[{ required: true, message: 'Please rate the time!' }]}
                >
                    <Rate style={{ fontSize: 30 }} />
                </Form.Item>

                <Form.Item
                    label={<span className="text-base font-semibold">Clothing Quality</span>}
                    name="clothing"
                    rules={[{ required: true, message: 'Please rate the clothing!' }]}
                >
                    <Rate style={{ fontSize: 30 }} />
                </Form.Item>

                <Form.Item
                    label={<span className="text-base font-semibold">Value for Money</span>}
                    name="value"
                    rules={[{ required: true, message: 'Please rate the value!' }]}
                >
                    <Rate style={{ fontSize: 30 }} />
                </Form.Item>

                <Form.Item
                    label={<span className="text-base font-semibold">Feedback</span>}
                    name="feedback"
                    rules={[{ required: true, message: 'Please enter your feedback!' }]}
                >
                    <Input.TextArea rows={4} placeholder="Share your experience..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ReviewModal;