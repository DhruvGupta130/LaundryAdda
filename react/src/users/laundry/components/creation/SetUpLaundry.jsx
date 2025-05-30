import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import { FaImage } from "react-icons/fa";
import { UPLOAD_URL } from "../../../../utils/config.js";
import {compressImageFile} from "../../../../utils/utility.js";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {Close, MyLocation} from "@mui/icons-material";
import AddAddressModal from "./AddAddressModal.jsx";
import {Spinner} from "../../../../utils/features.jsx";

const SetupLaundry = ({ laundry, setLaundry, setToast }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const [uploading, setUploading] = useState({logo: false, coverPhoto: false, images: false});
    const [modalOpen, setModalOpen] = useState(false);
    const handleModalOpen = () => {
        setModalOpen(true);
    }

    const handleModalClose = () => {
        setModalOpen(false);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLaundry((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = useCallback(
        async (event, key) => {
            const file = event.target.files[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) {
                alert("Please upload a valid image file.");
                return;
            }
            setUploading((prev) => ({ ...prev, [key]: true }));
            const compressedFile = await compressImageFile(file, 1);
            const formData = new FormData();
            formData.append("file", compressedFile);
            try {
                const { data } = await axios.post(UPLOAD_URL, formData);
                if (data) {
                    setLaundry((prev) => ({
                        ...prev,
                        [key]: key === "images"
                            ? [...(prev.images || []), data]
                            : data
                    }));
                } else {
                    setToast({ message: "Image upload failed", type: "error" });
                }
            } catch (error) {
                console.error("Image upload error:", error);
                setToast({ message: "Something went wrong while uploading the image.", type: "error" });
            } finally {
                setUploading((prev) => ({ ...prev, [key]: false }));
            }
        },
        [setLaundry, setToast]
    );

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    // Helper component to move a map to a new position
    const RecenterMap = ({ lat, lng }) => {
        const map = useMap();
        useEffect(() => {
            if (lat && lng) {
                map.setView([lat, lng], 15); // Zoom closer on location
            }
        }, [lat, lng, map]);
        return null;
    };

    // Initialize lat/lng somewhere in India if not present
    const [position, setPosition] = useState({
        lat: laundry?.latitude || 20.5937,
        lng: laundry?.longitude || 78.9629,
    });

    // On clicking button, get current location
    const fetchLiveLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const {latitude, longitude} = pos.coords;
                setPosition({lat: latitude, lng: longitude});
                setLaundry((prev) => ({
                    ...prev,
                    latitude,
                    longitude,
                }));
            },
            (err) => {
                alert("Unable to retrieve your location");
                console.error(err);
            }
        );
    };

    useEffect(() => {
        if (laundry.address?.latitude && laundry.address?.longitude) {
            setPosition({lat: laundry.address?.latitude, lng: laundry.address?.longitude});
        } else fetchLiveLocation();
    }, [laundry]);

    return (
        <div className="flex justify-center items-center">
            <main className="w-full bg-white shadow-lg rounded-2xl mt-2">
                {/* Image Upload Section */}
                <div className="relative">
                    <div className="flex items-center md:flex-row flex-col">
                        {/* Cover Photo Upload */}
                        <label className="flex flex-col items-center justify-center bg-gray-300 rounded-t-lg cursor-pointer hover:scale-y-110 transition w-full md:h-80 h-50 relative">
                            {laundry?.coverPhoto ? (
                                <img
                                    src={laundry.coverPhoto}
                                    alt="Cover"
                                    className="h-80 w-full object-cover rounded-t-lg shadow-sm"
                                />
                            ) : uploading.coverPhoto ? (
                                Spinner
                            ) : (
                                <>
                                    <FaImage className="text-white mb-2 text-8xl" />
                                    <span className="absolute top-8 right-10 bg-white text-blue-600 border border-blue-600 rounded-lg font-semibold p-1 text-sm">
                                        + Add Cover Pic
                                    </span>
                                </>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "coverPhoto")} />
                        </label>

                        {/* Logo Upload */}
                        <label className="md:w-35 md:h-35 h-25 w-25 flex flex-col bg-white absolute md:bottom-12 bottom-2 md:left-16 left-2 items-center justify-center rounded-full cursor-pointer hover:scale-125 transition shadow-md">
                            {laundry?.logo ? (
                                <img src={laundry.logo} alt="Logo" className="w-full h-full border-white border-2 object-cover rounded-full" />
                            ) : uploading.logo ? (
                                Spinner
                            ) : (
                                <>
                                    <FaImage className="text-gray-300 m-4 text-4xl" />
                                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white text-blue-600 border border-blue-600 rounded-lg font-semibold text-sm p-1 text-nowrap">
                                        + Add Logo
                                    </span>
                                </>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "logo")} />
                        </label>
                    </div>
                </div>

                {/* Laundry Details Form */}
                <div className="mb-6 md:p-8 p-4">
                    <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-8">
                        {/* Laundry Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Laundry Name (Brand Name) <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={laundry?.name || ""}
                                onChange={handleChange}
                                className="mt-2 p-3 w-full border border-gray-400 rounded-md outline-blue-500"
                                placeholder="Your laundry name"
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Address <span className="text-red-600">*</span>
                            </label>

                            <button
                                type="button"
                                onClick={handleModalOpen}
                                className="mt-2 p-3 w-full border focus:border-none border-gray-400 outline-blue-500 focus:outline-2 rounded-md text-left text-gray-700 flex items-center hover:bg-gray-50"
                            >
                                <span className="truncate w-full">
                                  {laundry?.address && laundry.address.street && laundry.address.area && laundry.address.area.city && laundry.address.state && laundry.address.zip ? (
                                      `${laundry.address.street}, ${laundry?.address?.area?.name}, ${laundry.address?.area?.city?.name}, ${laundry.address.state} - ${laundry.address.zip}`
                                  )  : (
                                      <div className="flex items-center justify-between gap-1">
                                          <span className="text-gray-400">Using GPS</span>
                                          <MyLocation className="text-blue-600" />
                                      </div>
                                  )}
                                </span>
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Add few words about your laundry <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={laundry?.description || ""}
                                onChange={handleChange}
                                rows={4}
                                className="h-30 mt-2 p-3 w-full border border-gray-400 rounded-md resize-none outline-blue-500"
                                placeholder="About your laundry"
                            />
                        </div>

                        {/* Map */}
                        <div className="flex-1 flex flex-col relative">
                            <label className="block text-sm font-medium text-gray-700">
                                Pick your location on map <span className="text-red-600">*</span>
                            </label>

                            <MapContainer
                                center={[position.lat, position.lng]}
                                zoom={5}
                                className="h-30 mt-2 p-3 rounded-md border border-gray-400 focus:border-2 focus:border-blue-500 !z-0"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[position.lat, position.lng]}>
                                    <Popup>Your Laundry Location</Popup>
                                </Marker>
                                <RecenterMap lat={position.lat} lng={position.lng}/>

                                {/* Button positioned at bottom-right inside a map */}
                                <button
                                    onClick={fetchLiveLocation}
                                    type="button"
                                    aria-label="Fetch Live Location"
                                    className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md shadow-md transition focus:outline-none focus:ring-indigo-400 z-[1000]"
                                >
                                    <MyLocation/>
                                </button>
                            </MapContainer>
                        </div>

                        {/* Images */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Upload Images of Your Laundry <span className="text-red-600">*</span>
                            </label>
                            <div className="mt-2 grid md:grid-cols-5 grid-cols-2 gap-4">
                                {laundry?.images?.map((image, index) => (
                                    <div key={index} className="relative h-40">
                                    <img
                                            src={image}
                                            alt={`Laundry ${index + 1}`}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={() => {
                                                setLaundry(prev => ({
                                                    ...prev,
                                                    images: prev.images.filter((_, i) => i !== index)
                                                }));
                                            }}
                                            className="absolute top-2 right-2 bg-red-400 text-white rounded-lg hover:bg-red-600"
                                        >
                                            <Close/>
                                        </button>
                                    </div>
                                ))}
                                <label className="border-2 border-dashed p-2 border-gray-300 rounded-lg h-40 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                                    {uploading.images ? (
                                        Spinner
                                    ) : (
                                        <>
                                            <FaImage className="text-gray-400 text-3xl mb-2"/>
                                            <span className="text-sm text-gray-600">Add Image</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={async (e) => {
                                            const files = Array.from(e.target.files);
                                            setUploading(prev => ({...prev, images: true}));
                                            try {
                                                for (const file of files) {
                                                    await handleFileChange({target: {files: [file]}}, "images");
                                                }
                                            } finally {
                                                setUploading(prev => ({...prev, images: false}));
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="col-span-2">
                            <hr className="my-6 border-t border-gray-300"/>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                        </div>

                        {/* Manager Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Manager Name <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                name="managerName"
                                value={laundry?.managerName || ""}
                                onChange={handleChange}
                                className="mt-2 p-3 w-full border-gray-400 border rounded-md outline-blue-500"
                                placeholder="Manager's full name"
                            />
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Phone Number <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                name="mobile"
                                maxLength={10}
                                value={laundry?.mobile || ""}
                                onChange={handleChange}
                                className="mt-2 p-3 w-full border border-gray-400 outline-blue-500 rounded-md"
                                placeholder="Contact number"
                            />
                        </div>

                        {/* Email (Read-Only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={user?.email || ""}
                                className="mt-2 p-3 w-full border border-gray-400 outline-blue-500 rounded-md bg-gray-100"
                                readOnly
                            />
                        </div>

                        {/* Laundry Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Laundry Email <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={laundry?.email || ""}
                                onChange={handleChange}
                                className="mt-2 p-3 w-full border border-gray-400 outline-blue-500 rounded-md"
                                placeholder="Business email address"
                            />
                        </div>

                        <AddAddressModal open={modalOpen} setToast={setToast} handleClose={handleModalClose} setLaundry={setLaundry}/>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SetupLaundry;