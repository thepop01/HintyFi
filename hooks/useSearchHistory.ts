import { useState, useCallback } from 'react';

const MAX_HISTORY_SIZE = 5;

export function useSearchHistory(storageKey: string) {
    const [history, setHistory] = useState<string[]>(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const addSearchTerm = useCallback((term: string) => {
        const trimmedTerm = term.trim();
        if (!trimmedTerm) return;
        
        setHistory(prevHistory => {
            const newHistory = [
                trimmedTerm,
                ...prevHistory.filter(t => t.toLowerCase() !== trimmedTerm.toLowerCase())
            ].slice(0, MAX_HISTORY_SIZE);
            
            try {
                 localStorage.setItem(storageKey, JSON.stringify(newHistory));
            } catch (error) {
                console.error("Failed to save search history to localStorage", error);
            }
            return newHistory;
        });
    }, [storageKey]);

    const clearHistory = useCallback(() => {
        setHistory([]);
        try {
            localStorage.removeItem(storageKey);
        } catch (error) {
             console.error("Failed to clear search history from localStorage", error);
        }
    }, [storageKey]);
    
    return { history, addSearchTerm, clearHistory };
}