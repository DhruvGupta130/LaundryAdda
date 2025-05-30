import {useState} from "react";
import Services from "./creation/Services.jsx";
import {Button} from "antd";
import {validateItemPricing} from "../../../utils/utility.js";
import axios from "axios";
import {PRICING} from "../../../utils/config.js";

const ManageServices = ({ prices, setPrices, fetchLaundry, setToast, setServices }) => {
    const token = localStorage.getItem("token");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            validateItemPricing(prices);
            const response = await axios.put(PRICING, prices, {headers: {Authorization: `Bearer ${token}`}});
            setToast({ message: response?.data?.message, type: "success" });
            setServices([...new Set(prices.map(item => item.service))]);
        } catch (error) {
            console.error("Error updating prices: ", error);
            setToast({ message: error?.response?.data?.message || error?.message, type: "error" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex-1 p-4 md:p-10 mt-40 md:mt-17">
            <Services prices={prices} setPrices={setPrices} fetchLaundry={fetchLaundry} />
            <div className="mt-6 flex justify-end">
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={loading}
                    size="large"
                    className="w-48 py-4 text-lg font-semibold"
                >
                    Submit
                </Button>
            </div>
        </main>
    );
}

export default ManageServices