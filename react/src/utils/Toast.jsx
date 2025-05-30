import React, { useEffect, useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const Toast = ({ message, type = 'error', title = '', onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(false), 3000);
        return () => clearTimeout(timer);
    }, [message]);

    useEffect(() => {
        if (!isVisible) {
            const timeout = setTimeout(onClose, 300);
            return () => clearTimeout(timeout);
        }
    }, [isVisible, onClose]);

    const icon = {
        success: <CheckCircleIcon className="!w-10 !h-10 text-white" />,
        error: <ErrorIcon className="!w-10 !h-10 text-white" />,
    }[type];

    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';

    return (
        <div
            className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-xl shadow-xl text-white max-w-sm w-full z-[10000]
                transition-all duration-300 ease-in-out
                ${bgColor}
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}
            `}
            role="alert"
            aria-live="assertive"
        >
            <div className="flex items-start">
                <div className="mt-0.5">{icon}</div>
                <div className="ml-3 flex-1">
                    {title && <p className="font-semibold text-sm">{title}</p>}
                    {Array.isArray(message) ? (
                        <ul className="mt-1 text-sm list-disc list-inside space-y-1 text-white/90">
                            {message.map((msg, idx) => (
                                <li key={idx}>{msg}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-white/90 mt-1">{message}</p>
                    )}
                </div>
                <button
                    className="ml-4 text-white/80 hover:text-white transition"
                    onClick={() => setIsVisible(false)}
                    aria-label="Close notification"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Toast;
