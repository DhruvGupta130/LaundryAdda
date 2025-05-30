import SetUpLaundry from "./components/creation/SetUpLaundry.jsx";
import React, {useState} from "react";
import {Button} from "antd";
import {validateLaundryData} from "../../utils/utility.js";
import axios from "axios";
import {CREATE_LAUNDRY} from "../../utils/config.js";

const StoreDetails = ({ laundry, setLaundry, setToast}) => {
    const token = localStorage.getItem("token");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            validateLaundryData(laundry);
            const response = await axios.post(CREATE_LAUNDRY, laundry, {headers: {Authorization: `Bearer ${token}`}});
            setToast({ message: response?.data?.message, type: "success" });
        } catch (error) {
            console.error("Error creating laundry: ", error);
            setToast({ message: error?.response?.data?.message || error?.message, type: "error" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex-1 p-4 md:p-10 mt-40 md:mt-17">
            <SetUpLaundry setToast={setToast} setLaundry={setLaundry} laundry={laundry}/>
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

export default StoreDetails;