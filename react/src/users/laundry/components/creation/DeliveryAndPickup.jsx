import React, { useEffect, useState } from 'react';
import StoreDistanceCircle from "./StoreDistanceCircle.jsx";
import { Divider } from "@mui/material";
import {formatEnumString, formatSlotName} from "../../../../utils/utility.js";
import {FETCH_TIME_SLOTS} from "../../../../utils/config.js";
import axios from "axios";

const DeliveryAndPickup = ({ services, setToast, delivery, setDelivery }) => {
    const [timeSlots, setTimeSlots] = useState({});
    const [loading, setLoading] = useState(false);

    const fetchTimeSlots = async () => {
        setLoading(true);
        try {
            const response = await axios.get(FETCH_TIME_SLOTS);
            setTimeSlots(response.data);
        } catch (error) {
            console.error("Error fetching time slots: ", error);
            setToast({ message: error?.response?.data?.message || error?.message, type: "error" });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTimeSlots().then(r => r);
    }, []);

    const handleDeliveryTypeChange = (type) => {
        if (type === 'standard') return;
        setDelivery(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const handleDistanceChange = (value) => {
        setDelivery(prev => ({
            ...prev,
            serviceRadius: Number(value)
        }));
    };

    return (
        <div className="flex justify-center items-center">
            {loading && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            <main className="w-full bg-white shadow-lg rounded-2xl mt-2 md:p-8 p-4">
                <h2 className="text-2xl font-bold mb-2">Select delivery slots that you provide</h2>
                <p className="text-gray-600 px-2 font-semibold">
                    Please select the delivery slots you provide for customers. This helps in managing orders efficiently and ensuring timely pickups and deliveries.
                </p>

                <div className="my-4">
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-3">
                            {services.map((service) => (
                                <span
                                    key={service}
                                    className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                >
                                  {formatEnumString(service)}
                                </span>
                            ))}
                        </div>
                    </div>

                    <label className="block my-2 font-medium">Delivery Type</label>
                    <div className="space-y-2 p-2">
                        {Object.entries({
                            standard: 'Standard Delivery (72hrs, No extra price)',
                            semiExpress: 'Semi Express (48hrs, Extra 1.5x price)',
                            express: 'Express Delivery (24hrs, Extra 2x price)'
                        }).map(([type, label]) => (
                            <label key={type} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={type === 'standard' ? true : delivery[type]}
                                    disabled={type === 'standard'}
                                    onChange={() => handleDeliveryTypeChange(type)}
                                    className="mr-2 h-4 w-4 rounded border-gray-300"
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>

                <Divider />

                <div className="my-4">
                    <label className="block mb-2 font-medium">Available pickup slot</label>
                    <div className="flex gap-4 flex-wrap p-2">
                        {Object.entries(timeSlots).map(([key, slot]) => (
                            <label key={key} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={delivery.pickupSlots.includes(key)}
                                    onChange={(e) => {
                                        let newSlots = [...delivery.pickupSlots];
                                        if (e.target.checked) {
                                            newSlots.push(key);
                                        } else {
                                            newSlots = newSlots.filter(s => s !== key);
                                        }
                                        setDelivery(prev => ({ ...prev, pickupSlots: newSlots }));
                                    }}
                                    className="mr-2 h-4 w-4 rounded border-gray-300"
                                />
                                {formatSlotName(slot)}
                            </label>
                        ))}
                    </div>
                </div>

                <Divider />

                <div className="my-4">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Setup Service Distance</h3>
                    <p className="font-semibold text-gray-500 mb-2 px-2">
                        Please select the maximum distance (in km) you're willing to provide services.
                        Based on the location of your store, we will share your service availability with customers.
                    </p>

                    <div className="relative w-full px-2">
                        <input
                            type="range"
                            min="1"
                            max="25"
                            value={delivery?.serviceRadius || 0}
                            onChange={(e) => handleDistanceChange(e.target.value)}
                            className="w-full h-2 bg-blue-200 rounded-full appearance-auto focus:outline-none
                                accent-blue-600 transition-all duration-200"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                            <span>1 km</span>
                            <span>25 km</span>
                        </div>
                    </div>

                    <p className="text-lg font-semibold text-blue-600 text-center">
                        🚚 Up to {delivery?.serviceRadius || 0} km
                    </p>

                    <div className="mt-4 flex gap-6">
                        <div className="flex-1">
                            <div className="w-full">
                                <h4 className="font-bold text-green-600 my-2">✅ Do’s:</h4>
                                <ul className="list-disc ml-5 text-sm text-gray-700 flex flex-col gap-1 font-semibold px-2">
                                    <li>Select a realistic service distance you can manage efficiently.</li>
                                    <li>Ensure you have the resources to cover pickups and deliveries within your chosen radius.</li>
                                    <li>Consider traffic, fuel, staffing, and delivery time before finalizing the distance.</li>
                                    <li>Update your service area as your business expands or if you face operational challenges.</li>
                                </ul>
                            </div>
                            <div className="w-full">
                                <h4 className="font-bold text-red-600 my-2">✘ Don’ts:</h4>
                                <ul className="list-disc ml-5 text-sm text-gray-700 flex flex-col gap-1 font-semibold px-2">
                                    <li>Don’t select a larger service area than you can handle, as it may lead to delays.</li>
                                    <li>Don’t change your service distance frequently, as it may confuse customers.</li>
                                    <li>Don’t accept orders from locations beyond your selected distance, as it may affect your reliability.</li>
                                    <li>Don’t ignore customer feedback regarding delivery time within your service area.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex-1 px-10">
                            <StoreDistanceCircle distance={delivery.serviceRadius} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DeliveryAndPickup;
