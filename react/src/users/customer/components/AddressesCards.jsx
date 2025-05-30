import React from "react";
import { MapPin, Trash2, LocateFixed, Map } from "lucide-react";
import { Button } from "@mui/material";

const AddressesCards = ({ addresses, handleRemoveAddress, loading }) => {

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {addresses.map((addr) => (
                <div
                    key={addr.id}
                    className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-xl transition"
                >
                    {/* Header */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                                {addr.addressType}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-800 flex items-center mb-1">
                            <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                            {addr.street}
                        </h3>

                        {addr.landmark && (
                            <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Landmark:</span> {addr.landmark}
                            </p>
                        )}
                    </div>

                    {/* Body */}
                    <div className="text-sm text-gray-700 mb-4 space-y-1">
                        <p>
                            <span className="font-medium">Area:</span> {addr.area?.name}
                        </p>
                        <p>
                            <span className="font-medium">City:</span> {addr.area?.city?.name}
                        </p>
                        <p>
                            <span className="font-medium">State:</span> {addr.state}
                        </p>
                        <p>
                            <span className="font-medium">Zip:</span> {addr.zip}
                        </p>
                        {addr.latitude && addr.longitude && (
                            <p className="flex items-center">
                                <LocateFixed className="w-4 h-4 mr-1 text-green-500" />
                                {addr.latitude}, {addr.longitude}
                            </p>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex flex-col md:flex-row justify-between items-center space-x-2 gap-2">
                        <Button
                            startIcon={<Map className="w-4 h-4" />}
                            color="primary"
                            disabled={loading === addr.id}
                            variant="outlined"
                            onClick={() => {
                                const mapUrl = `https://www.google.com/maps?q=${addr.latitude},${addr.longitude}`;
                                window.open(mapUrl, "_blank");
                            }}
                            className="w-full"
                        >
                            View on Map
                        </Button>

                        <Button
                            startIcon={<Trash2 className="w-4 h-4" />}
                            color="error"
                            loading={loading === addr.id}
                            variant="outlined"
                            onClick={() => handleRemoveAddress(addr.id)}
                            className="w-full"
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AddressesCards;
