import React, {useEffect, useState} from 'react';
import {compressImageFile, validateDeliveryPersonProfile} from "../../utils/utility.js";
import axios from "axios";
import {UPDATE_DELIVERY_PROFILE, UPLOAD_URL} from "../../utils/config.js";
import {useNavigate} from "react-router-dom";

const CreateDelivery = ({ delivery, setDelivery, setToast }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const [aadharPreview, setAadharPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (delivery) setAadharPreview(delivery?.aadharImage);
    }, [delivery]);

    const handleChange = async (e) => {
        const { name, value, files } = e.target;

        if (name === 'aadharImage') {
            const file = files[0] || null;

            if (!file) {
                setAadharPreview(null);
                setDelivery((prev) => ({ ...prev, aadharImage: null }));
                return;
            }

            if (file.type.startsWith('image/')) {
                const compressedFile = await compressImageFile(file, 1);
                const formData = new FormData();
                formData.append("file", compressedFile);

                try {
                    const { data } = await axios.post(UPLOAD_URL, formData);
                    if (data) {
                        setDelivery((prev) => ({ ...prev, aadharImage: data }));
                        const reader = new FileReader();
                        reader.onloadend = () => setAadharPreview(reader.result);
                        reader.readAsDataURL(file);
                    } else {
                        setToast({ message: "Image upload failed", type: "error" });
                    }
                } catch (error) {
                    console.error("Image upload error:", error);
                    setToast({ message: "Something went wrong while uploading the image.", type: "error" });
                }
            }
        } else {
            setDelivery((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            validateDeliveryPersonProfile(delivery);
            const response = await axios.post(UPDATE_DELIVERY_PROFILE, delivery, {headers: {Authorization: `Bearer ${token}`}});
            setToast({message: response.data?.message, type: "success"});
            navigate('/delivery/dashboard', {replace: true});
        } catch (error) {
            console.error("Error updating delivery person profile: ", error);
            setToast({message: error.response?.data?.message || error.message, type: "error"});
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 mt-10 px-4 md:px-10 w-full">
            <main className="py-4 md:py-10 mt-32 md:mt-10">
                <h2 className="text-3xl font-bold text-blue-700 mb-4">
                    Update Your Information
                </h2>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-4 md:p-10 max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/*name*/}
                        <div>
                            <label htmlFor="name" className="block font-semibold mb-2">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={user.name}
                                className={`w-full px-4 py-3 text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                required
                                readOnly
                            />
                        </div>

                        {/*email*/}
                        <div>
                            <label htmlFor="email" className="block font-semibold mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={user.email}
                                className={`w-full px-4 py-3 text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                required
                                readOnly
                            />
                        </div>

                        {/* Mobile */}
                        <div>
                            <label htmlFor="mobile" className="block font-semibold mb-2">
                                Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="mobile"
                                name="mobile"
                                placeholder="Contact number"
                                value={delivery.mobile}
                                onChange={handleChange}
                                maxLength={10}
                                className={`w-full px-4 py-3 text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                required
                            />
                        </div>

                        {/*DOB*/}
                        <div>
                            <label htmlFor="dob" className="block font-semibold mb-2">
                                Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="dob"
                                name="dob"
                                value={delivery.dob}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                required
                            />
                        </div>

                        {/* Aadhar Number */}
                        <div>
                            <label htmlFor="aadharNumber" className="block font-semibold mb-2">
                                Aadhar Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="aadharNumber"
                                name="aadharNumber"
                                placeholder="123412341234"
                                value={delivery.aadharNumber}
                                onChange={handleChange}
                                maxLength={12}
                                className={`w-full px-4 py-3 text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                required
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block font-semibold mb-2">
                                Gender <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-6">
                                {Object.entries({MALE: 'Male', FEMALE: 'Female', OTHER: 'Other'}).map(([key, value]) => (
                                    <label key={key} className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={key}
                                            checked={delivery.gender === key}
                                            onChange={handleChange}
                                            className="form-radio text-blue-600 focus:ring-blue-500"
                                            required
                                        />
                                        <span className="ml-2 text-base">{value}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Aadhar Upload */}
                    <div className="mt-8">
                        <label className="block font-semibold mb-2">
                            Aadhar Image <span className="text-red-500">*</span>
                        </label>

                        <input
                            type="file"
                            id="aadharImage"
                            name="aadharImage"
                            accept="image/*"
                            onChange={handleChange}
                            className="hidden"
                            required
                        />

                        <label
                            htmlFor="aadharImage"
                            className="cursor-pointer w-full h-56 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-xl hover:border-blue-600 transition"
                        >
                            {aadharPreview ? (
                                <img
                                    src={`${aadharPreview}`}
                                    alt="Aadhar Preview"
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <svg
                                        className="w-12 h-12 mb-2"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M7 16V4m0 0L3 8m4-4l4 4m6 8v-4m0 0l4 4m-4-4l-4 4"
                                        />
                                    </svg>
                                    <span className="text-lg font-medium">
                                        Click to upload Aadhar image
                                    </span>
                                </div>
                            )}

                        </label>
                    </div>

                    {/* Submit */}
                    <div className="text-center mt-10">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-blue-600 text-white text-lg font-semibold px-12 py-3 rounded-full shadow-md transition ${
                                loading
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-blue-700 hover:shadow-lg'
                            }`}
                        >
                            {loading ? 'Updating...' : 'Update Info'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CreateDelivery;
