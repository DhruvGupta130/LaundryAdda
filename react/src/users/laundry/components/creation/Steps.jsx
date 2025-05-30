import React from "react";
import { FaCheck } from "react-icons/fa6";

const Steps = ({ currentStep }) => {
    const steps = [
        {title : "About Your Laundry Store", value : 1},
        {title: "KYC And Bank Info", value: 2},
        {title: "Services And Pricing", value: 3},
        {title: "Delivery And Pickup Slots", value: 4},
    ];

    return (
        <div className="relative flex flex-col md:flex-row items-center justify-between py-4 mt-8 w-full md:gap-10 gap-4">
            <div className="absolute top-1/2 left-0 w-full border-dotted border-b-2 border-gray-400 hidden md:block -translate-y-1/2 z-0">
                <div
                    className="absolute h-full border-b-4 border-green-600 transition-all"
                    style={{
                        width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                    }}
                ></div>
            </div>

            {steps.map((step) => (
                <div
                    key={step.value}
                    className={`flex flex-row items-center md:p-3 p-2 transition-all w-full md:w-1/4 rounded-full gap-2 z-10
                        ${step.value === currentStep ? "bg-blue-600" :
                        step.value > currentStep ? "bg-white" :
                        "bg-purple-100 text-black"}
                    `}
                >
                    {/* Step Circle */}
                    <div
                        className={`md:w-10 md:h-10 w-8 h-8 flex items-center justify-center rounded-full font-bold shadow-md transition-all z-10
                            ${step.value === currentStep ? "bg-white text-black" :
                            step.value > currentStep
                            ? "bg-gray-400 text-white"
                            : "bg-green-600 text-white"}
                        `}
                    >
                        <FaCheck className="md:text-xl" />
                    </div>

                    {/* Step Label */}
                    <span
                        className={`md:text-md font-semibold mt-2 md:mt-0 text-center transition-all
                            ${step.value === currentStep ? "text-white" :
                            step.value < currentStep ? "text-indigo-600" : "text-gray-500 opacity-60"}
                        `}
                    >
                        {step.title}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default Steps;
