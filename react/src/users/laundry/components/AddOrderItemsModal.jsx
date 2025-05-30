import {Modal, InputNumber, Select, Button, Space, Form, Input} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {useEffect, useMemo, useState} from 'react';
import axios from 'axios';
import { FETCH_SERVICES } from '../../../utils/config.js';
import {formatEnumString} from "../../../utils/utility.js";

const { Option } = Select;

const clothTypes = ['MEN', 'WOMEN', 'HOUSEHOLD', 'OTHER'];

const AddOrderItemsModal = ({ isOpen, onClose, setToast, form, submittedItems, setSubmittedItems, notes, setNotes, orderType, onSubmit }) => {
    const [serviceData, setServiceData] = useState([]);
    const [loading, setLoading] = useState(false);

    const priceMap = useMemo(() => {
        const map = {};
        serviceData.forEach(({ service, clothType, cloth, price }) => {
            const key = `${service}-${clothType}-${cloth}`;
            map[key] = price;
        });
        return map;
    }, [serviceData]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await axios.get(FETCH_SERVICES, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setServiceData(response.data);
        } catch (error) {
            setToast({ message: error.response?.data?.message || error?.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices().then(r => r);
    }, []);

    const onValuesChange = (_, allValues) => {
        const items = allValues.items || [];
        const multiplier = orderType === 'EXPRESS'
            ? 2
            : orderType === 'SEMI_EXPRESS'
                ? 1.5
                : 1;

        const updatedItems = items.map((item) => {
            if (!item) return item;
            const service = item?.requests?.service;
            const clothType = item?.requests?.clothType;
            const cloth = item?.requests?.cloth;
            const quantity = item?.quantity;

            if (service && clothType && cloth) {
                const key = `${service}-${clothType}-${cloth}`;
                const price = priceMap[key];
                const qty = Number(quantity) || 0;

                if (price !== undefined) {
                    const finalPrice = Math.round(price * multiplier * 100) / 100;
                    const total = qty > 0 ? Math.round(finalPrice * qty * 100) / 100 : 0;
                    return {
                        ...item,
                        total,
                        requests: {
                            ...item.requests,
                            price: finalPrice,
                        },
                    };
                } else {
                    return {
                        ...item,
                        requests: {
                            ...item.requests,
                            price: undefined,
                        },
                    total: undefined,
                    };
                }
            } else {
                return {
                    ...item,
                    requests: {
                        ...item.requests,
                        price: undefined,
                    },
                    total: undefined,
                };
            }
        });

        setNotes(items.notes);
        form.setFieldsValue({ items: updatedItems });
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setSubmittedItems(values.items);
        } catch (error) {
            console.error('Validate Failed:', error);
        }
    };

    return (
        <Modal
            title={<h2 className="text-xl font-bold">Add Order Items</h2>}
            open={isOpen}
            onCancel={onClose}
            onOk={handleOk}
            width={900}
            footer={
                <div className="flex justify-between gap-5 w-full">
                    {submittedItems.length > 0 ? (
                        <Button key="edit" style={{width: '100%'}} danger type="default" onClick={() => setSubmittedItems([])}>
                            Edit
                        </Button>
                    ): (
                        <Button loading={loading} key="cancel" style={{width: '100%'}} danger type="default" onClick={onClose}>
                            Cancel
                        </Button>
                    )}
                    {submittedItems.length > 0 ? (
                        <Button loading={loading} key="save" type="primary" style={{width: '100%'}} onClick={onSubmit}>
                            Submit
                        </Button>
                    ) : (
                        <Button key="save" type="primary" style={{width: '100%'}} onClick={handleOk}>
                            Save
                        </Button>
                    )}
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
            destroyOnHidden
            centered
        >
            {submittedItems.length > 0 ? (
                    <>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, marginBottom: 10 }}>
                            <thead>
                            <tr>
                                <th style={{ border: '1px solid #ddd', padding: 8 }}>Service</th>
                                <th style={{ border: '1px solid #ddd', padding: 8 }}>Cloth Type</th>
                                <th style={{ border: '1px solid #ddd', padding: 8 }}>Cloth</th>
                                <th style={{ border: '1px solid #ddd', padding: 8 }}>Quantity</th>
                                <th style={{ border: '1px solid #ddd', padding: 8 }}>Price</th>
                                <th style={{ border: '1px solid #ddd', padding: 8 }}>Total</th>
                            </tr>
                            </thead>
                            <tbody>
                            {submittedItems.map((item, idx) => {
                                const req = item.requests || {};
                                return (
                                    <tr key={idx}>
                                        <td style={{ border: '1px solid #ddd', padding: 8 }}>{formatEnumString(req.service)}</td>
                                        <td style={{ border: '1px solid #ddd', padding: 8 }}>{formatEnumString(req.clothType)}</td>
                                        <td style={{ border: '1px solid #ddd', padding: 8 }}>{formatEnumString(req.cloth)}</td>
                                        <td style={{ border: '1px solid #ddd', padding: 8 }}>{item.quantity}</td>
                                        <td style={{ border: '1px solid #ddd', padding: 8 }}>{req.price}</td>
                                        <td style={{ border: '1px solid #ddd', padding: 8 }}>{item.total}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>

                        {/* Notes section below the table */}
                        {notes && (
                            <div style={{ marginTop: 10, padding: 10, border: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
                                <strong>Notes:</strong>
                                <div>{notes}</div>
                            </div>
                        )}
                    </>
                ) : (
                <Form form={form} name="order_items_form" autoComplete="off" onValuesChange={onValuesChange}>
                    <Form.List name="items" initialValue={[{}]}>
                        {(fields, { add, remove }) => (
                            <>
                                <Space
                                    style={{ display: 'flex', marginBottom: 8, gap: 8, paddingLeft: 8 }}
                                    align="baseline"
                                    className="hide-on-mobile"
                                >
                                    <div style={{ width: 140, fontWeight: 'bold' }}>Service</div>
                                    <div style={{ width: 140, fontWeight: 'bold' }}>Cloth Type</div>
                                    <div style={{ width: 140, fontWeight: 'bold' }}>Cloth</div>
                                    <div style={{ width: 'auto', minWidth: 80, fontWeight: 'bold' }}>Quantity</div>
                                    <div style={{ width: 120, fontWeight: 'bold' }}>Price</div>
                                    <div style={{ width: 120, fontWeight: 'bold' }}>Total</div>
                                    <div style={{ width: 24 }}></div> {/* For remove icon spacing */}
                                </Space>

                                {fields.map(({ key, name, ...restField }) => {
                                    // Get current values to control disabling
                                    const currentService = form.getFieldValue(['items', name, 'requests', 'service']);
                                    const currentClothType = form.getFieldValue(['items', name, 'requests', 'clothType']);

                                    return (
                                        <Space
                                            key={key}
                                            style={{ display: 'flex', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}
                                            align="baseline"
                                        >
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'requests', 'service']}
                                                rules={[{ required: true, message: 'Select service' }]}
                                            >
                                                <Select
                                                    placeholder="Service"
                                                    style={{ width: 130 }}
                                                    allowClear
                                                >
                                                    {Array.from(new Set(serviceData.map((s) => s.service))).map((s) => (
                                                        <Option key={s} value={s}>
                                                            {formatEnumString(s)}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                name={[name, 'requests', 'clothType']}
                                                rules={[{ required: true, message: 'Select cloth type' }]}
                                            >
                                                <Select
                                                    placeholder="Cloth Type"
                                                    style={{ width: 130 }}
                                                    disabled={!currentService}
                                                    allowClear
                                                >
                                                    {clothTypes.map((ct) => (
                                                        <Option key={ct} value={ct}>
                                                            {formatEnumString(ct)}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                name={[name, 'requests', 'cloth']}
                                                rules={[{ required: true, message: 'Select cloth' }]}
                                            >
                                                <Select
                                                    placeholder="Cloth"
                                                    style={{ width: 130 }}
                                                    disabled={!currentService || !currentClothType}
                                                    showSearch
                                                    allowClear
                                                    filterOption={(input, option) =>
                                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                    }
                                                >
                                                    {(() => {
                                                        if (!currentService || !currentClothType) return null;

                                                        const usedCombinations = form.getFieldValue('items')
                                                            ?.filter((_, idx) => idx !== name)
                                                            ?.map((item) => ({
                                                                service: item?.requests?.service,
                                                                clothType: item?.requests?.clothType,
                                                                cloth: item?.requests?.cloth,
                                                            })) || [];

                                                        const filteredCloths = serviceData
                                                            .filter(
                                                                (item) =>
                                                                    item.service === currentService &&
                                                                    item.clothType === currentClothType &&
                                                                    item.cloth &&
                                                                    !usedCombinations.some(
                                                                        (used) =>
                                                                            used.service === item.service &&
                                                                            used.clothType === item.clothType &&
                                                                            used.cloth === item.cloth
                                                                    )
                                                            )
                                                            .map((item) => item.cloth);

                                                        const uniqueCloths = [...new Set(filteredCloths)];

                                                        return uniqueCloths.map((cloth) => (
                                                            <Option key={cloth} value={cloth}>
                                                                {formatEnumString(cloth)}
                                                            </Option>
                                                        ));
                                                    })()}
                                                </Select>
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                name={[name, 'quantity']}
                                                rules={[{ required: true, message: 'Missing quantity' }]}
                                            >
                                                <InputNumber
                                                    placeholder="Quantity"
                                                    style={{ width: 130 }}
                                                    min={1}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                name={[name, 'requests', 'price']}
                                            >
                                                <InputNumber
                                                    readOnly
                                                    placeholder="Price"
                                                    formatter={(value) => (value !== undefined ? `₹ ${value}` : '')}
                                                    parser={(value) => value?.replace(/₹\s?|(,*)/g, '')}
                                                    style={{ width: 120 }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                name={[name, 'total']}
                                            >
                                                <InputNumber
                                                    readOnly
                                                    placeholder="Total"
                                                    formatter={(value) => (value !== undefined ? `₹ ${value}` : '')}
                                                    parser={(value) => value?.replace(/₹\s?|(,*)/g, '')}
                                                    style={{ width: 120 }}
                                                />
                                            </Form.Item>

                                            <MinusCircleOutlined
                                                onClick={() => remove(name)}
                                                style={{ fontSize: 20, color: 'red' }}
                                            />
                                        </Space>
                                    );
                                })}

                                <Form.Item>
                                    <Button type="dashed" style={{color: 'green'}} onClick={() => add()} icon={<PlusOutlined />} block>
                                        Add Item
                                    </Button>
                                </Form.Item>

                                <Form.Item
                                    name="notes"
                                    label="Notes"
                                    initialValue={notes}
                                    rules={[{ required: false, max: 250, message: 'Notes cannot exceed 250 characters' }]}
                                >
                                    <Input.TextArea
                                        maxLength={250}
                                        placeholder="Enter your notes (max 250 characters)"
                                        rows={2}
                                        showCount
                                    />
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form>
            )}
        </Modal>
    );
};

export default AddOrderItemsModal;
