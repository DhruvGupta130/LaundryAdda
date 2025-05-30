import imageCompression from "browser-image-compression";

export function validatePassword(password) {
    if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
    }
    if (!/[A-Z]/.test(password)) {
        throw new Error("Password must contain at least one uppercase letter.");
    }
    if (!/[a-z]/.test(password)) {
        throw new Error("Password must contain at least one lowercase letter.");
    }
    if (!/[0-9]/.test(password)) {
        throw new Error("Password must contain at least one number.");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        throw new Error("Password must contain at least one special character.");
    }
}

export const formatEnumString = (enumString) => {
    if (!enumString) return "";
    return enumString
        .toLowerCase() // Convert to lowercase
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
};

export const initialToastState = {
    message: "",
    type: "",
};

export const compressImageFile = async (file, fileSizeInMB = 1) => {
    if (!file || !file.type.startsWith("image/")) {
        throw new Error("Invalid image file");
    }
    const originalExtension = file.name.split(".").pop();
    const mimeType = file.type;
    const options = {
        maxSizeMB: fileSizeInMB,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
    };
    const compressedBlob = await imageCompression(file, options);
    return new File(
        [compressedBlob],
        `compressed_${Date.now()}.${originalExtension}`,
        {type: mimeType}
    );
};

export function validateLaundryData(laundry) {
    // Helper regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile numbers
    const coordRegex = /^-?\d+(\.\d+)?$/;

    // Basic string fields
    if (!laundry.logo?.trim()) throw new Error("Logo image is required.");
    if (!laundry.coverPhoto?.trim()) throw new Error("Cover photo is required.");
    if (!laundry.name?.trim()) throw new Error("Name is required.");
    if (!laundry.description?.trim()) throw new Error("Description is required.");

    // Images
    if (!Array.isArray(laundry.images) || laundry.images.length === 0) {
        throw new Error("At least one image is required.");
    }

    // Address
    const address = laundry.address || {};
    if (!address.street?.trim()) throw new Error("Street is required.");
    if (!address.city?.trim()) throw new Error("City is required.");
    if (!address.state?.trim()) throw new Error("State is required.");
    if (!address.zip?.trim()) throw new Error("Zip is required.");
    if (!address.addressType?.trim()) throw new Error("Address type is required.");
    if (!coordRegex.test(address.latitude)) throw new Error("Valid latitude is required.");
    if (!coordRegex.test(address.longitude)) throw new Error("Valid longitude is required.");

    // Contact and manager
    if (!emailRegex.test(laundry.email)) throw new Error("Valid email is required.");
    if (!phoneRegex.test(laundry.mobile)) throw new Error("Valid 10 digits Indian mobile number is required.");
    if (!laundry.managerName?.trim()) throw new Error("Manager name is required.");
}

export const validateKycDocs = (kycDocs) => {
    if (!kycDocs.panCard) {
        throw new Error("Pan Card is required.");
    }
    if (!kycDocs.labourLicense) {
        throw new Error("Labour License is required.");
    }
    if (!kycDocs.accountHolderName || kycDocs.accountHolderName.trim() === "") {
        throw new Error("Account Holder Name is required.");
    }
    if (!kycDocs.accountNumber?.trim() || kycDocs.accountNumber.trim().length < 5) {
        throw new Error("Account Number must be at least 5 digits.");
    }
    if (!kycDocs.bankName || kycDocs.bankName.trim() === "") {
        throw new Error("Bank Name is required.");
    }
    if (!kycDocs.ifscCode || kycDocs.ifscCode.trim() === "") {
        throw new Error("IFSC Code is required.");
    }
};

export function validateItemPricing(items) {
    if (!Array.isArray(items)) {
        throw new Error("Input must be a list of pricing items.");
    }

    if (items.length === 0) {
        throw new Error("At least one item is required.");
    }

    items.forEach((item, index) => {
        if (!item.service) {
            throw new Error(`Item ${index + 1}: Service is required.`);
        }

        if (!item.clothType) {
            throw new Error(`Item ${index + 1}: Cloth type is required.`);
        }

        if (!item.cloth || item.cloth.trim() === "") {
            throw new Error(`Item ${index + 1}: Cloth name is required.`);
        }

        if (item.price === '' || isNaN(item.price) || Number(item.price) < 0) {
            throw new Error(`Item ${index + 1}: Price must be a valid number.`);
        }
    });
}

export function validateDeliveryDetails(delivery) {
    if (!delivery) throw new Error("Delivery details are required.");
    const { pickupSlots, serviceRadius } = delivery;
    if (!Array.isArray(pickupSlots) || pickupSlots.length === 0) throw new Error("Please select at least one pickup slot.");
    if (typeof serviceRadius !== "number" || serviceRadius < 1 || isNaN(serviceRadius)) throw new Error("Service radius must be at least 1 km.");
}

export function formatSlotName(slot) {
    // Maps prefix to readable label
    const labelMap = {
        MORNING: 'Morning',
        MIDDAY: 'Mid-day',
        AFTERNOON: 'Afternoon',
        EVENING: 'Evening',
        NIGHT: 'Night',
    };

    // Helper: convert 24h integer hour to 12h with AM/PM string
    function to12Hour(hour) {
        const period = hour >= 12 ? 'PM' : 'AM';
        let hr = hour % 12;
        if (hr === 0) hr = 12;
        return `${hr}:00 ${period}`;
    }

    // Match prefix and two 2-digit hour numbers
    const regex = /^(MORNING|MIDDAY|AFTERNOON|EVENING|NIGHT)[ _](\d{2})[ _](\d{2})$/;
    const match = slot.match(regex);

    if (!match) return slot; // fallback if input is unexpected

    const [, prefix, startStr, endStr] = match;
    const startHour = parseInt(startStr, 10);
    const endHour = parseInt(endStr, 10);

    // Format times to 12-hour strings
    const startTime = to12Hour(startHour);
    const endTime = to12Hour(endHour);

    // Return nicely formatted label with times
    return `${labelMap[prefix]} ${startTime} - ${endTime}`;
}


export const deliveryColors = {
    "STANDARD": "bg-blue-100 text-blue-600",
    "EXPRESS": "bg-green-100 text-green-600",
    "SEMI_EXPRESS": "bg-orange-100 text-orange-600",
};

export const validateDeliveryPersonProfile = (delivery) => {
    if (!delivery.mobile.trim())
        throw new Error('Please enter the mobile number');
    if (!/^\d{10}$/.test(delivery.mobile))
        throw new Error('Enter a valid 10-digit mobile number');

    if (!delivery.aadharNumber.trim())
        throw new Error('Please enter the Aadhar number');
    if (!/^\d{12}$/.test(delivery.aadharNumber))
        throw new Error('Enter a valid 12-digit Aadhar number');

    if (!delivery.gender)
        throw new Error('Please select the gender');

    const fileUrl = delivery.aadharImage;
    if (!fileUrl) throw new Error('Please upload the Aadhar image');
};


