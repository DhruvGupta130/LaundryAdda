import React, {useEffect, useState} from "react";
import AddressesCards from "./components/AddressesCards";
import {Button} from "@mui/material";
import axios from "axios";
import {DELETE_ADDRESS, FETCH_ADDRESSES} from "../../utils/config.js";
import AddAddressModal from "./components/AddAddressModal.jsx";

const Address = ({ setLoading, setToast }) => {
    const token = localStorage.getItem("token");
    const [addresses, setAddresses] = useState([]);
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const response = await axios.get(FETCH_ADDRESSES, {headers: {Authorization: `Bearer ${token}`}});
            setAddresses(response.data);
        } catch (error) {
            console.error('Error fetching addresses: ', error);
            setToast({ message: error?.response?.data?.message || error?.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAddresses().then(l => l);
    }, []);

    const handleRemoveAddress = async (id) => {
        setDeleting(id);
        try {
            const response = await axios.delete(DELETE_ADDRESS(id), {headers: {Authorization: `Bearer ${token}`}});
            setAddresses((prev) => prev.filter((address) => address.id !== id));
            setToast({ message: response?.data?.message, type: 'success' });
        } catch (error) {
            console.error('Error deleting address: ', error);
            setToast({ message: error?.response?.data?.message || error?.message, type: 'error' });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="bg-gray-100 mt-10 px-4 md:px-10 w-full">
            <main className="py-4 md:py-10 mt-32 md:mt-10">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-indigo-600">
                        My Addresses
                    </h1>
                    <Button onClick={() => setOpen(true)} variant="contained" color="primary">Add Address</Button>
                </div>
                <AddressesCards
                    loading={deleting}
                    addresses={addresses}
                    handleRemoveAddress={handleRemoveAddress}
                />

                <AddAddressModal handleClose={() => setOpen(false)} open={open} setToast={setToast} setAddresses={setAddresses}/>
            </main>
        </div>
    );
};

export default Address;