import { useState, useEffect, useCallback } from 'react';

/**
 * A custom hook to provide a data version that updates when data changes globally.
 * It listens for a custom 'datachanged' event on the window object.
 * @returns An object with `dataVersion` (a number that increments on change)
 *          and `refreshData` (a function to manually trigger a refresh).
 */
export function useDataRefresher() {
    const [dataVersion, setDataVersion] = useState(0);
    const refreshData = useCallback(() => setDataVersion(v => v + 1), []);

    useEffect(() => {
        const handleDataChange = () => {
            refreshData();
        };

        window.addEventListener('datachanged', handleDataChange);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('datachanged', handleDataChange);
        };
    }, [refreshData]); // The dependency array ensures this effect runs only once

    return { dataVersion, refreshData };
}
