import { useEffect } from "react";

export const useScrollFix = () => {
    useEffect(() => {
        const preventScrollOnNumberInput = () => {
            if (document.activeElement.type === "number") {
                document.activeElement.blur();
            }
        };

        window.addEventListener("wheel", preventScrollOnNumberInput, { passive: false });

        return () => {
            window.removeEventListener("wheel", preventScrollOnNumberInput);
        };
    }, []);
};