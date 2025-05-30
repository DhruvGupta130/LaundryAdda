const StoreDistanceCircle = ({ distance }) => {
    return (
        <div className="flex items-center justify-center bg-white">
            <div className="relative w-[400px] h-[400px] rounded-full bg-blue-100/30 flex items-center justify-center">
                {/* Dashed Circle */}
                <div className="absolute w-[250px] h-[250px] rounded-full border-2 border-dashed border-blue-400"></div>

                {/* Center Circle */}
                <div className="w-24 h-24 rounded-full bg-blue-600 flex flex-col items-center justify-center text-white z-10 shadow-lg">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 mb-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 10l1.664-5.427A2 2 0 016.58 3h10.84a2 2 0 011.916 1.573L21 10M3 10h18M3 10l1.5 9a2 2 0 002 2h11a2 2 0 002-2l1.5-9"
                        />
                    </svg>
                    <span className="text-sm">Your Store</span>
                </div>

                {/* Dashed line and distance */}
                <svg className="absolute left-12 w-full h-full">
                    <line
                        x1="200"
                        y1="200"
                        x2="280"
                        y2="200"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                    />
                </svg>


                <div className="relative">
                    <div className="absolute bottom-3 left-10 bg-green-500 text-white px-2 py-1 text-xs rounded-full text-nowrap">
                        Up to {distance}km
                    </div>
                </div>

                {/* Label and marker */}
                <div className="absolute right-17 top-1/2 transform -translate-y-1/2 flex items-center gap-1 z-20">
                    <div className="w-4 h-4 border-2 border-blue-600 bg-white rounded-full relative">
                        <div className="absolute inset-1 bg-blue-600 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreDistanceCircle;
