import Button from '@mui/material/Button';
import React, {useEffect, useState} from "react";
import PickupRequestModal from "../components/PickupRequestModal.jsx";
import axios from "axios";
import {FETCH_ADDRESSES, FETCH_SHOP_RATING, FETCH_SHOP_REVIEWS} from "../utils/config.js";
import {formatEnumString} from "../utils/utility.js";
import {CheckIcon, Star} from "lucide-react";
import LaundryPricesModal from "../components/LaundryPricesModal.jsx";
import {serviceIcons} from "../utils/features.jsx";
import {FaTshirt} from "react-icons/fa";
import {useNavigate} from "react-router-dom";
import {StarFilled} from "@ant-design/icons";

const LaundryShop = ({ shop, setLoading, setToast }) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [visible, setVisible] = useState(false);
    const [rating, setRating] = useState({});
    const [reviews, setReviews] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

    const fetchRatings = async () => {
        setLoading(true);
        try {
            const response = await axios.get(FETCH_SHOP_RATING(shop.id));
            const res = await axios.get(FETCH_SHOP_REVIEWS(shop.id));
            setRating(response?.data);
            setReviews(res?.data);
            console.log(res?.data);
        } catch (error) {
            console.error("Error fetching shop ratings: ", error);
            setToast({ message: error.response?.data?.message || error.message, type: "error" });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRatings().then(f => f);
    }, []);

    const openModal = () => {
        setVisible(true);
    }

    const openPickupModal = async () => {
        await fetchCustomerAddresses();
        setOpen(true);
    }

    const closeModal = () => {
        setVisible(false);
    }

    const closePickupModal = () => {
        setOpen(false);
    }

    const fetchCustomerAddresses = async () => {
        if (localStorage.getItem("token")) {
            setLoading(true);
            try {
                const response = await axios.get(FETCH_ADDRESSES, {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}});
                setAddresses(response?.data);
            } catch (error) {
                console.error("Error fetching customer addresses: ", error);
            } finally {
                setLoading(false);
            }
        } else {
            setToast({ message: "Please login to continue", type: "error" });
            navigate("/login");
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-2 bg-gradient-to-b">
            {/* Cover Photo */}
            <div className="relative w-full h-32 md:h-56 rounded-xl overflow-hidden shadow-lg">
                <img
                    src={shop.coverPhoto}
                    alt="Cover"
                    className="object-cover w-full h-full filter brightness-90"
                />
            </div>

            {/* Logo + Description */}
            <div className="flex items-center md:items-start mt-5 md:px-10 px-2 md:gap-8 gap-3">
                <div className="flex-shrink-0">
                    <img
                        src={shop.logo}
                        alt="Logo"
                        className="w-32 md:w-40 h-32 md:h-40 rounded-full border-6 border-gray-400 shadow-xl object-cover"
                    />
                </div>
                <div className="md:my-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 drop-shadow-sm whitespace-nowrap">
                            {shop.name}
                        </h1>
                    </div>

                    <p className="text-gray-700 text-lg leading-relaxed max-w-3xl">
                        {shop.description}
                    </p>
                </div>
            </div>

            {/* Pricing List */}
            {shop.services && shop.services.length > 0 && (
                <section className="mt-5 mx-auto px-4">
                    <div className="flex items-center justify-between md:mb-5 mb-4">
                        <h2 className="text-3xl font-extrabold text-gray-900 border-b-4 border-indigo-600 inline-block">
                            Services
                        </h2>
                        <Button
                            onClick={openModal}
                            variant="contained"
                            color="success"
                            startIcon={<CheckIcon />}
                        >
                            View Prices
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {shop.services.map((item, index) => {
                            const Icon = serviceIcons[item] || FaTshirt;
                            return (
                                <div
                                    key={index}
                                    className="bg-white rounded-3xl p-6 max-w-xs shadow-md border border-gray-200
                                    hover:scale-[1.05] hover:shadow-lg transition-transform cursor-pointer
                                    flex flex-col items-center"
                                >
                                    <Icon className="text-indigo-600 w-10 h-10 mb-3" />
                                    <h3 className="font-semibold text-lg text-center text-indigo-700 mb-4">
                                        {formatEnumString(item)}
                                    </h3>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        size="medium"
                                        className="w-full md:w-auto"
                                        onClick={openPickupModal}
                                    >
                                        Request A Pickup
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {shop.deliveryAndPickup && (
                <section className="mt-10 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-6 flex items-center">
                        🏆 Delivery & Pickup Options
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Standard Delivery */}
                        <div className="bg-green-200 rounded-xl p-4 shadow hover:shadow-lg transition border border-green-300">
                            <h3 className="text-xl font-bold text-green-900 mb-2 flex items-center">
                                🚚 Standard Delivery
                            </h3>
                            <p className="text-base text-green-800">Delivery Time: 72 hours</p>
                            <p className="text-base text-green-800">Price: Standard</p>
                        </div>

                        {/* Semi-Express Delivery */}
                        {shop.deliveryAndPickup.semiExpress && (
                            <div className="bg-green-700 rounded-xl p-4 shadow hover:shadow-lg transition border border-green-500 text-white">
                                <h3 className="text-xl font-bold mb-2 flex items-center">
                                    ⏱ Semi-Express
                                </h3>
                                <p className="text-base">Delivery Time: 48 hours</p>
                                <p className="text-base">Price: 1.5x</p>
                            </div>
                        )}

                        {/* Express Delivery */}
                        {shop.deliveryAndPickup.express && (
                            <div className="bg-green-900 rounded-xl p-4 shadow hover:shadow-lg transition border border-green-700 text-white">
                                <h3 className="text-xl font-bold mb-2 flex items-center">
                                    ⚡ Express Delivery
                                </h3>
                                <p className="text-base">Delivery Time: 24 hours</p>
                                <p className="text-base">Price: 2x</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Image Gallery */}
            {shop.images && shop.images.length > 0 && (
                <section className="mt-16 max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-4 border-indigo-600 inline-block pb-2">
                        Gallery
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {shop.images.map((url, index) => (
                            <div
                                key={index}
                                className="overflow-hidden rounded-2xl shadow-lg cursor-zoom-in transform transition-transform hover:scale-110"
                            >
                                <img
                                    src={url}
                                    alt={`Gallery image ${index + 1}`}
                                    className="w-full h-40 object-cover"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="mt-16 max-w-6xl mx-auto px-4 space-y-3">
                <div>
                    <h2
                        className="text-3xl font-extrabold text-gray-900 mb-6 border-b-4 border-indigo-600 inline-block pb-2"
                        aria-label="Reviews heading"
                    >
                        Reviews
                    </h2>
                    <div
                        className="mb-15 bg-yellow-300 rounded-4xl p-6 shadow-lg max-w-sm mx-auto"
                        role="region"
                        aria-labelledby="reviews-heading"
                    >
                        <div className="flex justify-center items-center mb-3">
                            <span
                                id="reviews-heading"
                                className="text-8xl font-extrabold text-blue-700 mr-3"
                                aria-live="polite"
                            >
                              {rating?.overall}
                            </span>
                            <span className="text-5xl text-blue-700 inline-block">
                                <StarFilled aria-hidden="true" />
                            </span>

                        </div>
                        <p className="text-center text-gray-700 text-sm font-medium tracking-wide">
                            Rated by <span className="font-semibold text-blue-700">{rating?.reviewCount} {rating?.reviewCount > 1 ? "users" : "user"}</span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 text-center mb-8 border border-gray-300 rounded-lg overflow-hidden">
                    <div className="px-4 py-6 border-r border-b border-gray-300">
                        <p className="font-semibold text-gray-700 mb-1">Service Quality</p>
                        <p className="text-blue-600 text-xl font-bold">
                            {rating?.service} <StarFilled/>
                        </p>
                    </div>
                    <div className="px-4 py-6 border-r border-b border-gray-300">
                        <p className="font-semibold text-gray-700 mb-1">Timely Delivery</p>
                        <p className="text-blue-600 text-xl font-bold">
                            {rating?.time} <StarFilled/>
                        </p>
                    </div>
                    <div className="px-4 py-6 border-r border-b border-gray-300">
                        <p className="font-semibold text-gray-700 mb-1">Clothing Care</p>
                        <p className="text-blue-600 text-xl font-bold">
                            {rating?.clothing} <StarFilled/>
                        </p>
                    </div>
                    <div className="px-4 py-6 border-b border-gray-300">
                        <p className="font-semibold text-gray-700 mb-1">Value for Money</p>
                        <p className="text-blue-600 text-xl font-bold">
                            {rating?.value} <StarFilled/>
                        </p>
                    </div>
                </div>
                <div className="px-4">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b-4 border-indigo-600 inline-block pb-2">
                        Latest Reviews
                    </h2>
                    <div className={`grid ${showAll ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'} gap-6 mb-6`}>
                        {displayedReviews.map((review, index) => (
                            <div key={index} className="shadow-lg rounded-2xl p-5 bg-white hover:shadow-xl transition">
                                <div className="flex items-center mb-4">
                                    <img
                                        src={review.customer.user.profile}
                                        alt={review.customer.user.name}
                                        className="h-14 w-14 rounded-full mr-4 object-cover border-2 border-green-400"
                                    />
                                    <div>
                                        <p className="font-semibold text-lg text-gray-900">{review.customer.user.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-base text-gray-700 mb-4 border-l-4 border-green-300 pl-3">
                                    {review.feedback}
                                </p>

                                <div className="grid md:grid-cols-2 md:gap-3">
                                    {/* Service */}
                                    <div className="flex items-center text-sm">
                                        <span className="w-20 font-medium text-gray-700">Service:</span>
                                        <div className="flex text-yellow-400 ml-2">
                                            {Array.from({ length: review.service }, (_, i) => (
                                                <Star key={`service-filled-${i}`} className="w-4 h-4 fill-current" />
                                            ))}
                                            {Array.from({ length: 5 - review.service }, (_, i) => (
                                                <Star key={`service-empty-${i}`} className="w-4 h-4" />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Time */}
                                    <div className="flex items-center text-sm">
                                        <span className="w-20 font-medium text-gray-700">Time:</span>
                                        <div className="flex text-yellow-400 ml-2">
                                            {Array.from({ length: review.time }, (_, i) => (
                                                <Star key={`time-filled-${i}`} className="w-4 h-4 fill-current" />
                                            ))}
                                            {Array.from({ length: 5 - review.time }, (_, i) => (
                                                <Star key={`time-empty-${i}`} className="w-4 h-4" />
                                            ))}
                                        </div>
                                    </div>
                                    {/* Clothing */}
                                    <div className="flex items-center text-sm">
                                        <span className="w-20 font-medium text-gray-700">Clothing:</span>
                                        <div className="flex text-yellow-400 ml-2">
                                            {Array.from({ length: review.clothing }, (_, i) => (
                                                <Star key={`clothing-filled-${i}`} className="w-4 h-4 fill-current" />
                                            ))}
                                            {Array.from({ length: 5 - review.clothing }, (_, i) => (
                                                <Star key={`clothing-empty-${i}`} className="w-4 h-4" />
                                            ))}
                                        </div>
                                    </div>
                                    {/* Value */}
                                    <div className="flex items-center text-sm">
                                        <span className="w-20 font-medium text-gray-700">Value:</span>
                                        <div className="flex text-yellow-400 ml-2">
                                            {Array.from({ length: review.value }, (_, i) => (
                                                <Star key={`value-filled-${i}`} className="w-4 h-4 fill-current" />
                                            ))}
                                            {Array.from({ length: 5 - review.value }, (_, i) => (
                                                <Star key={`value-empty-${i}`} className="w-4 h-4" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Toggle Show/Hide Button */}
                    {reviews.length > 3 && (
                        <div className="flex justify-center mb-10">
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold shadow hover:bg-indigo-700 transition"
                            >
                                {showAll ? 'Show Less' : 'Show All Reviews'}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {shop && <LaundryPricesModal visible={visible} onClose={closeModal} setToast={setToast} shop={shop} setLoading={setLoading} shopId={shop.id} />}
            {shop && <PickupRequestModal visible={open} onClose={closePickupModal} shopId={shop.id} shopName={shop.name} addresses={addresses} setAddresses={setAddresses} setToast={setToast} />}
        </div>
    );
};

export default LaundryShop;