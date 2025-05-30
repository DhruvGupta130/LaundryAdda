import {
    LocalLaundryService,
    DashboardCustomize,
    Schedule,
    TrackChanges,
} from "@mui/icons-material";
import {FaClock, FaTruck, FaBoxOpen, FaCheckCircle, FaBan, FaTshirt, FaHandsWash} from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { GiClothesline, GiTakeMyMoney } from "react-icons/gi";
import {FaBroom, FaPumpSoap, FaSteam} from "react-icons/fa6";

export const features = [
    {
        title: "Multiple Services",
        desc: "Choose from Wash & Fold, Dry Cleaning, and Ironing services.",
        icon: <LocalLaundryService fontSize="large" className="text-blue-600" />,
    },
    {
        title: "Customized Instructions",
        desc: "Add special care instructions for each garment type.",
        icon: <DashboardCustomize fontSize="large" className="text-green-600" />,
    },
    {
        title: "Flexible Scheduling",
        desc: "Choose your preferred pickup and delivery times.",
        icon: <Schedule fontSize="large" className="text-yellow-600" />,
    },
    {
        title: "Real-time Tracking",
        desc: "Track your order status from pickup to delivery.",
        icon: <TrackChanges fontSize="large" className="text-red-600" />,
    },
];

export const Spinner = (
    <span className="flex items-center justify-center gap-2 text-sm text-gray-600 italic">
        <svg className="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Uploading image, please wait...
    </span>
);

export function getStatusKey(status) {
    if (status.startsWith("CANCELLED")) {
        return "CANCELLED";
    }
    return status;
}

export const OrderStatusConfig = {
    PENDING_OWNER_CONFIRMATION: {
        label: "Pending Confirmation",
        color: "text-yellow-500",
        bg: "bg-yellow-100",
        icon: <FaClock size={25} className="animate-spin" />
    },
    AWAITING_PICKUP: {
        label: "Awaiting Pickup",
        color: "text-blue-500",
        bg: "bg-blue-100",
        icon: <FaTruck size={30} className="animate-bounce" />
    },
    PICKED_UP: {
        label: "Picked Up",
        color: "text-indigo-500",
        bg: "bg-indigo-100",
        icon: <MdDeliveryDining size={30} className="animate-pulse" />
    },
    COUNTING: {
        label: "Counting Clothes",
        color: "text-purple-500",
        bg: "bg-purple-100",
        icon: <GiClothesline size={30} className="animate-bounce" />
    },
    BILL_GENERATED: {
        label: "Bill Generated",
        color: "text-green-600",
        bg: "bg-green-100",
        icon: <GiTakeMyMoney size={30} className="animate-pulse" />
    },
    PROCESSING: {
        label: "Processing",
        color: "text-cyan-600",
        bg: "bg-cyan-100",
        icon: <FaBoxOpen size={30} className="animate-bounce" />
    },
    READY_FOR_DELIVERY: {
        label: "Ready for Delivery",
        color: "text-teal-600",
        bg: "bg-teal-100",
        icon: <MdDeliveryDining size={30} className="animate-pulse" />
    },
    OUT_FOR_DELIVERY: {
        label: "Out for Delivery",
        color: "text-orange-500",
        bg: "bg-orange-100",
        icon: <FaTruck size={30} className="animate-pulse" />
    },
    DELIVERED: {
        label: "Delivered",
        color: "text-green-700",
        bg: "bg-green-200",
        icon: <FaCheckCircle size={30} className="text-green-700" />
    },
    CANCELLED: {
        label: "Cancelled",
        color: "text-red-600",
        bg: "bg-red-100",
        icon: <FaBan size={30} className="animate-spin" />
    }
};

export const serviceIcons = {
    'DRY_CLEAN': FaTshirt,
    'WASH_AND_IRON': FaHandsWash,
    'CLEANING': FaBroom,
    'STEAM_IRON': FaSteam,
    'WASH_AND_FOLD': FaPumpSoap
};