import { useState, useEffect } from "react";
import axios from "axios";
import { FETCH_NEARBY_SHOPS } from "../utils/config.js";
import LaundryShop from "./LaundryShop.jsx";
import Header from "../components/Header.jsx";

const HomePage = ({ setToast, setLoading }) => {
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState(null);

    const fetchShops = async (lat, lon, rad) => {
        setLoading(true);
        try {
            const response = await axios.get(FETCH_NEARBY_SHOPS(lat, lon, rad));
            setShops(response.data);
        } catch (error) {
            console.error("Error fetching shops: ", error);
            setToast({ message: error?.response?.data?.message || error?.message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocationAndFetch = () => {
        if (!navigator.geolocation) {
            setToast({ message: "Geolocation is not supported by your browser.", type: "error" });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setTimeout(() => {
                    fetchShops(latitude, longitude, 8).then(r => r);
                }, 800);
            },
            (error) => {
                console.error("Error getting location: ", error);
                setToast({ message: "Unable to retrieve your location.", type: "error" });
            }
        );
    };

    useEffect(() => {
        setLoading(true);
        getCurrentLocationAndFetch();
    }, []);

    const handleShopSelect = (shop) => {
        setSelectedShop(shop);
    };

    const handleBackToList = () => {
        setSelectedShop(null);
    };

    return (
        <>
            <Header/>
            <main className="max-w-6xl mx-auto px-4 py-8 my-32 md:my-22 font-sans">
            {!selectedShop ? (
                <>
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Nearby Laundry</h1>

                    {shops.length === 0 ? (
                        <p className="text-center text-gray-500">No nearby laundry shops found.</p>
                    ) : (
                        <ul className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 list-none p-0">
                            {shops.map((shop) => (
                                <li
                                    key={shop.id}
                                    className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-transform duration-200"
                                    onClick={() => handleShopSelect(shop)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleShopSelect(shop)}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`View details of ${shop.name}`}
                                >
                                    {/* Cover Photo */}
                                    <div className="h-40 overflow-hidden">
                                        <img
                                            src={shop.coverPhoto || "/default-cover.jpg"}
                                            alt={`${shop.name} cover`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Shop Info */}
                                    <div className="p-4 flex flex-col flex-grow">
                                        <div className="flex items-center mb-4">
                                            <img
                                                src={shop.logo || "/default-profile.jpg"}
                                                alt={`${shop.name} logo`}
                                                className="w-14 h-14 rounded-full object-cover mr-4 flex-shrink-0"
                                            />
                                            <h2 className="text-xl font-semibold text-gray-700">{shop.name}</h2>
                                        </div>
                                        <address className="not-italic text-gray-500 text-sm leading-relaxed mb-2">
                                            {shop.address.street}, {shop.address.landmark && `${shop.address.landmark}, `}
                                            {shop.address.area.name}, {shop.address.state} - {shop.address.zip}
                                            <br />
                                            City: {shop.address.area.city.name}
                                        </address>
                                        <p className="text-teal-600 font-medium mt-auto">
                                            Distance: {shop.distance?.toFixed(2)} km
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            ) : (
                <section>
                    <button
                        onClick={handleBackToList}
                        className="mb-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
                        aria-label="Back to laundry shop list"
                    >
                        ← Back to list
                    </button>
                    <LaundryShop shop={selectedShop} setLoading={setLoading} setToast={setToast} />
                </section>
            )}
        </main>
        </>
    );
};

export default HomePage;