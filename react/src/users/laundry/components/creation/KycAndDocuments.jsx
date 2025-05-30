import {FaImage} from "react-icons/fa";
import {useState} from "react";
import {compressImageFile} from "../../../../utils/utility.js";
import axios from "axios";
import {UPLOAD_URL} from "../../../../utils/config.js";
import {Spinner} from "../../../../utils/features.jsx";

const KycAndDocuments = ({setToast, kycDocs, setKycDocs}) => {
    const [uploading, setUploading] = useState({
        labourLicense: false,
        panCard: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setKycDocs((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (event, key) => {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Please upload a valid image file.");
            return;
        }
        setUploading((prev) => ({ ...prev, [key]: true }));
        const compressedFile = await compressImageFile(file, 2);
        const formData = new FormData();
        formData.append("file", compressedFile);
        try {
            const { data } = await axios.post(UPLOAD_URL, formData);
            if (data) {
                setKycDocs((prev) => ({
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
    }

    return (
        <div className="flex justify-center items-center">
            <main className="w-full bg-white shadow-lg rounded-2xl mt-2 md:p-8 p-4">
                <div className="col-span-2">
                    <label className="block text-xl font-bold text-black mb-4">
                        Upload KYC
                    </label>
                    <div className="mt-2 grid md:grid-cols-2 grid-cols-1 md:gap-10 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Labour License <span className="text-red-500">*</span>
                            </label>
                            <label
                                className="border-2 border-dashed p-2 border-gray-300 rounded-lg md:h-60 h-40 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                                {kycDocs?.labourLicense ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={kycDocs?.labourLicense}
                                            alt="Labour License"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </div>
                                ) : uploading.labourLicense ? (
                                    Spinner
                                ) : (
                                    <>
                                        <FaImage className="text-gray-400 text-3xl mb-2"/>
                                        <span className="text-sm text-gray-600">Upload Labour License</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, 'labourLicense')}
                                />
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pan Card <span className="text-red-500">*</span>
                            </label>
                            <label
                                className="border-2 border-dashed p-2 border-gray-300 rounded-lg md:h-60 h-40 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                                {kycDocs?.panCard ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={kycDocs.panCard}
                                            alt="Pan Card"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </div>
                                ) : uploading.panCard ? (
                                    Spinner
                                ) : (
                                    <>
                                        <FaImage className="text-gray-400 text-3xl mb-2"/>
                                        <span className="text-sm text-gray-600">Upload Pan Card</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    required
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, 'panCard')}
                                />
                            </label>
                        </div>
                    </div>
                </div>
                <hr className="my-6 border-gray-300"/>
                <div className="col-span-2">
                    <label className="block text-xl font-bold text-black mb-4">
                        Bank Account Details
                    </label>
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Holder Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="accountHolderName"
                                value={kycDocs?.accountHolderName || ""}
                                onChange={handleChange}
                                className="mt-2 p-3 w-full border border-gray-400 outline-blue-500 rounded-md"
                                placeholder="Enter account holder name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="accountNumber"
                                value={kycDocs?.accountNumber || ""}
                                onChange={handleChange}
                                className="mt-2 p-3 w-full border border-gray-400 outline-blue-500 rounded-md"
                                placeholder="Enter account number"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bank Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="bankName"
                                value={kycDocs?.bankName || ""}
                                onChange={handleChange}
                                className="mt-2 p-3 w-full border border-gray-400 outline-blue-500 rounded-md"
                                placeholder="Enter bank name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                IFSC Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="ifscCode"
                                value={kycDocs?.ifscCode || ""}
                                onChange={handleChange}
                                className="mt-2 p-3 w-full border border-gray-400 outline-blue-500 rounded-md"
                                placeholder="Enter IFSC code"
                                required
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}


export default KycAndDocuments;