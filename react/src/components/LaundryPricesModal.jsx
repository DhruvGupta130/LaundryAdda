import { Modal, Button } from 'antd';
import { formatEnumString } from '../utils/utility.js';
import {useEffect, useState} from 'react';
import axios from "axios";
import {FETCH_LAUNDRY_PRICING} from "../utils/config.js";

const services = ['WASH_AND_FOLD', 'WASH_AND_IRON', 'STEAM_IRON', 'DRY_CLEAN', 'CLEANING'];

const LaundryPricesModal = ({ visible, onClose, shopId, setLoading, setToast }) => {
    const [selectedService, setSelectedService] = useState(services[0]);
    const [activeCategory, setActiveCategory] = useState('MEN');
    const [prices, setPrices] = useState([]);

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const response = await axios.get(FETCH_LAUNDRY_PRICING(shopId));
            setPrices(response.data);
        } catch (error) {
            console.error("Error fetching prices: ", error);
            setToast({message: error.response?.data?.message || error.message, type: "error"});
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPrices().then(f => f);
    }, []);

    const toggleService = (service) => {
        setSelectedService(service);
    };

    return (
        <Modal
            title="Service Price List"
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    Close
                </Button>
            ]}
            width={1000}
            style={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
            <div className="flex flex-col md:flex-row justify-center gap-0.5">
                <aside className="md:w-64 w-full bg-white border-r md:rounded-2xl md:rounded-r-none rounded-t-2xl border-gray-200 p-4 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold">Services</h2>
                    <p className="text-sm text-gray-500 mb-4">Select a service to view prices</p>

                    <div className="grid grid-cols-2 gap-3 md:space-y-3 md:block">
                        {services.map((service, index) => (
                            <label key={index} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    checked={selectedService === service}
                                    onChange={() => toggleService(service)}
                                    className="accent-blue-600 w-4 h-4"
                                />
                                <span className="text-sm md:text-base">{formatEnumString(service)}</span>
                            </label>
                        ))}
                    </div>
                </aside>


                {/* Main Content */}
                <main className="w-full bg-white md:rounded-2xl md:rounded-l-none rounded-b-2xl md:p-8 p-4">
                    <h2 className="text-xl md:text-2xl font-bold mb-4">
                        Pricing for <span className="capitalize">{formatEnumString(selectedService)}</span>
                    </h2>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {['MEN', 'WOMEN', 'HOUSEHOLD', 'OTHER'].map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium ${activeCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                {category.charAt(0) + category.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-2xl border-2 border-black">
                        <table className="w-full rounded-2xl bg-white">
                            <thead>
                            <tr className="bg-black border-b-2 border-black">
                                <th className="text-left px-6 md:px-10 w-2/5 py-3 text-xs md:text-sm font-semibold text-white">Item</th>
                                <th className="text-left px-6 md:px-10 w-2/5 py-3 text-xs md:text-sm font-semibold text-white">Price (₹)</th>
                            </tr>
                            </thead>
                            <tbody>
                            {prices.filter(item => item.clothType === activeCategory && item.service === selectedService).length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="px-6 md:px-8 py-4 text-center text-base text-gray-500">
                                        No items available.
                                    </td>
                                </tr>
                            ) : (
                                prices
                                    .filter(item => item.clothType === activeCategory && item.service === selectedService)
                                    .sort((a, b) => {
                                        if (a.service !== b.service) {
                                            return a.service.localeCompare(b.service);
                                        }
                                        if (a.clothType !== b.clothType) {
                                            return a.clothType.localeCompare(b.clothType);
                                        }
                                        return a.cloth.localeCompare(b.cloth);
                                    })
                                    .map((item, index) => (
                                        <tr
                                            key={index}
                                            className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                        >
                                            <td className="px-6 md:px-8 py-4 text-sm font-medium text-gray-800">
                                                {item.cloth.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                                            </td>
                                            <td className="px-6 md:px-8 py-4 text-sm text-gray-700">
                                                ₹ {item.price}
                                            </td>
                                        </tr>
                                    ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </Modal>
    );
};

export default LaundryPricesModal;