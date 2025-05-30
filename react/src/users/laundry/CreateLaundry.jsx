import {useState} from "react";
import Steps from "./components/creation/Steps.jsx";
import NavigationButtons from "./components/creation/NavigationButtons.jsx";
import {
    validateDeliveryDetails,
    validateItemPricing,
    validateKycDocs,
    validateLaundryData
} from "../../utils/Utility.js";
import SetUpLaundry from "./components/creation/SetUpLaundry.jsx";
import KycAndDocuments from "./components/creation/KycAndDocuments.jsx";
import DeliveryAndPickup from "./components/creation/DeliveryAndPickup.jsx";
import Services from "./components/creation/Services.jsx";
import axios from "axios";
import {
    CREATE_LAUNDRY,
    LAUNDRY_KYC,
    PICKUP_DELIVERY,
    PRICING
} from "../../utils/config.js";
import {useNavigate} from "react-router-dom";

const CreateLaundry = ({ setToast, setLoading, fetchLaundry, laundry, setLaundry, kycDocs, setKycDocs, prices, setPrices, delivery, setDelivery, services, setServices }) => {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    const handleNext = async () => {
        if (currentStep === 1) {
            setLoading(true);
            try {
                validateLaundryData(laundry);
                const response = await axios.post(CREATE_LAUNDRY, laundry, {headers: {Authorization: `Bearer ${token}`}});
                setToast({ message: response?.data?.message, type: "success" });
            } catch (error) {
                console.error("Error creating laundry: ", error);
                setToast({ message: error?.response?.data?.message || error?.message, type: "error" }); // Fix here
                return;
            } finally {
                setLoading(false);
            }
        }

        if (currentStep === 2) {
            setLoading(true);
            try {
                validateKycDocs(kycDocs);
                const response = await axios.put(LAUNDRY_KYC, kycDocs, {headers: {Authorization: `Bearer ${token}`}});
                setToast({ message: response?.data?.message, type: "success" });
            } catch (error) {
                console.error("Error updating documents: ", error);
                setToast({ message: error?.response?.data?.message || error?.message, type: "error" }); // Fix here
                return;
            } finally {
                setLoading(false);
            }
        }

        if (currentStep === 3) {
            setLoading(true);
            try {
                validateItemPricing(prices);
                const response = await axios.put(PRICING, prices, {headers: {Authorization: `Bearer ${token}`}});
                setToast({ message: response?.data?.message, type: "success" });
                setServices([...new Set(prices.map(item => item.service))]);
            } catch (error) {
                console.error("Error updating prices: ", error);
                setToast({ message: error?.response?.data?.message || error?.message, type: "error" }); // Fix here
                return;
            } finally {
                setLoading(false);
            }
        }

        if (currentStep === 4) {
            setLoading(true);
            try {
                validateDeliveryDetails(delivery);
                const response = await axios.put(PICKUP_DELIVERY, delivery, {headers: {Authorization: `Bearer ${token}`}});
                setToast({ message: response?.data?.message, type: "success" });
                setTimeout(() => navigate("/laundry/dashboard"), 500);
            } catch (error) {
                console.error("Error updating pickup and delivery instructions: ", error);
                setToast({ message: error?.response?.data?.message || error?.message, type: "error" }); // Fix here
                return;
            } finally {
                setLoading(false);
            }
        }

        setCurrentStep((prev) => Math.min(prev + 1, 4));
    };

    return (
        <main className="flex-1 p-4 md:p-10 lg:p-12 mt-32 md:mt-6">
            <Steps currentStep={currentStep} />
            <div className="pb-24">
                {/* Step 1 */}
                {currentStep === 1 && <SetUpLaundry setToast={setToast} setLaundry={setLaundry} laundry={laundry}/>}
                {currentStep === 2 && <KycAndDocuments setToast={setToast} kycDocs={kycDocs} setKycDocs={setKycDocs}/>}
                {currentStep === 3 && <Services setToast={setToast} prices={prices} setPrices={setPrices} fetchLaundry={fetchLaundry} />}
                {currentStep === 4 && <DeliveryAndPickup setToast={setToast} services={services} delivery={delivery} setDelivery={setDelivery} />}
            </div>
            <NavigationButtons
                currentStep={currentStep}
                onNext={handleNext}
                onPrevious={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
            />
        </main>
    );
}

export default CreateLaundry;