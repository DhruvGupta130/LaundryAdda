import { Person, Phone, Cake, Wc } from "@mui/icons-material";
import {Button} from "@mui/material";
import {useState} from "react";
import axios from "axios";
import {UPDATE_CUSTOMER_PROFILE} from "../../utils/config.js";
import {useNavigate} from "react-router-dom";

const CompleteProfile = ({ customer, setCustomer, setToast }) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomer((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!customer.mobile || !customer.dob || !customer.gender) {
            setToast({ message: "Please fill all required fields!", type: "error" });
            return;
        }
        setLoading(true);
        try {
            const response = await axios.put(UPDATE_CUSTOMER_PROFILE, customer, {headers: {Authorization: `Bearer ${token}`}});
            setCustomer((prev) => ({...prev, customer}));
            setToast({ message: response?.data?.message, type: "success" });
            navigate("/customer/orders", {replace: true});
        } catch (error) {
            console.error("Error updating customer profile: ", error);
            setToast({ message: error.response?.data?.message || error.message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 mt-10 px-4 md:px-10 w-full">
            <main className="py-4 md:py-10 mt-32 md:mt-10 max-w-4xl">
                <h2 className="text-3xl font-bold text-indigo-700 mb-6 relative">
                    Update Your Profile
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="grid bg-white p-8 rounded-xl grid-cols-1 md:grid-cols-2 gap-8"
                    noValidate
                >
                    {/* Name (Read-only) */}
                    <div>
                        <label className="flex items-center text-sm font-semibold mb-2 text-gray-700">
                            <Person className="mr-2 text-indigo-500" /> Name *
                        </label>
                        <input
                            type="text"
                            value={user.name}
                            readOnly
                            className="w-full border border-gray-300 rounded-lg px-5 py-3 bg-gray-100 text-gray-600 text-base shadow-sm"
                        />
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                        <label className="flex items-center text-sm font-semibold mb-2 text-gray-700">
                            <Person className="mr-2 text-indigo-500" /> Email *
                        </label>
                        <input
                            type="email"
                            value={user.email}
                            readOnly
                            className="w-full border border-gray-300 rounded-lg px-5 py-3 bg-gray-100 text-gray-600 text-base shadow-sm"
                        />
                    </div>

                    {/* Mobile */}
                    <div>
                        <label className="flex items-center text-sm font-semibold mb-2 text-gray-700">
                            <Phone className="mr-2 text-indigo-500" /> Mobile *
                        </label>
                        <input
                            type="tel"
                            name="mobile"
                            value={customer.mobile}
                            onChange={handleChange}
                            placeholder="Enter your mobile number"
                            maxLength={10}
                            pattern="[0-9]{10}"
                            required
                            className="w-full border border-gray-300 rounded-lg px-5 py-3 text-base focus:outline-none focus:ring-4 focus:ring-indigo-300 shadow-sm transition"
                        />
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="flex items-center text-sm font-semibold mb-2 text-gray-700">
                            <Cake className="mr-2 text-indigo-500" /> Date of Birth *
                        </label>
                        <input
                            type="date"
                            name="dob"
                            value={customer.dob}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-5 py-3 text-base focus:outline-none focus:ring-4 focus:ring-indigo-300 shadow-sm transition"
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="flex items-center text-sm font-semibold mb-2 text-gray-700">
                            <Wc className="mr-2 text-indigo-500" /> Gender *
                        </label>
                        <select
                            name="gender"
                            value={customer.gender || ""}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-5 py-3 text-base focus:outline-none focus:ring-4 focus:ring-indigo-300 shadow-sm transition"
                        >
                            <option value="" disabled>
                                Select Gender
                            </option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    {/* Submit Button - full width on both columns */}
                    <div className="md:col-span-2">
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            loading={loading}
                            fullWidth
                        >
                            Save Profile
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CompleteProfile;
