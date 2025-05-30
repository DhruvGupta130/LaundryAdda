import {useState} from "react";
import {Close} from "@mui/icons-material";
import {formatEnumString} from "../../../../utils/utility.js";
import UploadModal from "./UploadModal.jsx";
import {Button} from "antd";

const services = ['WASH_AND_FOLD', 'WASH_AND_IRON', 'STEAM_IRON', 'DRY_CLEAN', 'CLEANING'];

const Services = ({prices, setPrices, fetchLaundry}) => {
    const [newItemName, setNewItemName] = useState('');
    const [selectedService, setSelectedService] = useState(services[0]);
    const [activeCategory, setActiveCategory] = useState('MEN');
    const [openModal, setOpenModal] = useState(false);

    const handlePriceChange = (service, clothType, cloth, value) => {
        setPrices(prev => prev.map(item => item.service === service && item.clothType === clothType && item.cloth === cloth ? {
            ...item, price: parseFloat(value)
        } : item));
    };
    const toggleService = (service) => {
        setSelectedService(service);
    }

    const handleAddItem = () => {
        if (!newItemName.trim()) return;

        const formattedClothName = newItemName
            .trim()
            .toUpperCase()
            .replace(/\s+/g, '_');

        const itemExists = prices.some(item => item.service === selectedService && item.cloth === formattedClothName && item.clothType === activeCategory);

        if (itemExists) {
            alert('Item already exists');
            return;
        }

        const newPrice = {
            service: selectedService, clothType: activeCategory, cloth: formattedClothName, price: ''
        };

        setPrices(prev => [...prev, newPrice]);
        setNewItemName('');
    };

    const handleDeleteItem = (cloth) => {
        setPrices(prev =>
            prev.filter(item =>
                !(item.cloth === cloth)
            )
        );
    };

    return (
        <div className="flex flex-col md:flex-row justify-center gap-0.5">
            {/* Sidebar */}
            <aside className="md:w-64 w-full bg-white border-r md:rounded-2xl md:rounded-r-none rounded-t-2xl border-gray-200 p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold">Services</h2>
                <p className="text-sm text-gray-500 mb-4">Select services you provide</p>

                <div className="space-y-3">
                    {services.map((service, index) => (
                        <label key={index} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={selectedService === service}
                                onChange={() => toggleService(service)}
                                className="accent-blue-600 w-4 h-4"
                            />
                            <span className="text-sm md:text-base">{formatEnumString(service)}</span>
                        </label>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="w-full bg-white md:rounded-2xl md:rounded-l-none rounded-b-2xl md:p-8 p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-6">
                    <h2 className="text-xl md:text-2xl font-bold">
                        Add Pricing For <span className="capitalize">{formatEnumString(selectedService)}</span>
                    </h2>
                    <Button type="primary" onClick={() => setOpenModal(true)}>Add through Excel File</Button>
                </div>
                <p className="text-sm text-gray-500 mb-6">Select item category and enter pricing</p>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {['MEN', 'WOMEN', 'HOUSEHOLD', 'OTHER'].map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${activeCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            {category.charAt(0) + category.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-2xl border-2 border-black">
                    <table className="w-full rounded-2xl bg-white">
                        <thead>
                        <tr className="bg-black border-b-2 border-black">
                            <th className="text-left px-6 md:px-10 w-2/5 py-3 text-xs md:text-sm font-semibold text-white">Item</th>
                            <th className="text-left px-6 md:px-10 w-2/5 py-3 text-xs md:text-sm font-semibold text-white">Price (₹)</th>
                            <th className="text-left px-6 md:px-10 w-1/5 py-3 text-xs md:text-sm font-semibold text-white">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {prices
                            .filter(item => item.clothType === activeCategory && item.service === selectedService)
                            .sort((a, b) => {
                                if (a.service !== b.service) {
                                    return a.service.localeCompare(b.service);
                                }
                                if (a.clothType !== b.clothType) {
                                    return a.clothType.localeCompare(b.clothType);
                                }
                                return a.cloth.localeCompare(b.cloth);
                            })
                            .map((item, index) => (
                                <tr
                                    key={index}
                                    className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                >
                                    <td className="px-6 md:px-8 py-4 text-sm font-medium text-gray-800">
                                        {item.cloth.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                                    </td>
                                    <td className="px-6 md:px-8 py-4">
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => handlePriceChange(item.service, item.clothType, item.cloth, e.target.value)}
                                            className="w-full md:w-1/2 px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="Enter ₹"
                                        />
                                    </td>
                                    <td className="px-6 md:px-8 py-4">
                                        <button
                                            onClick={() => handleDeleteItem(item.cloth)}
                                            className="p-1 hover:bg-gray-200 rounded-full"
                                        >
                                            <Close className="w-5 h-5 text-red-500"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t border-gray-200">
                        <tr>
                            <td colSpan="3" className="p-4">
                                <div className="flex flex-col md:flex-row gap-2">
                                    <input
                                        type="text"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        placeholder="Enter item name"
                                        className="flex-1 p-2 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={handleAddItem}
                                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Add Item
                                    </button>
                                </div>
                            </td>
                        </tr>
                        </tfoot>
                    </table>
                </div>
                <UploadModal open={openModal} onClose={() => setOpenModal(false)} fetchLaundry={fetchLaundry}/>
            </main>
        </div>
    );
}

export default Services;
