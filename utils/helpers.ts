import { useState, useEffect, useCallback } from 'react';

export const uid = (): string => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const fuzzySearch = (query: string, text: string): boolean => {
    if (!query || !text) return true;
    
    const search = query.toLowerCase();
    const target = text.toLowerCase();
    
    // Simple substring search
    if (target.includes(search)) {
        return true;
    }
    
    // More fuzzy: check if all characters of query appear in order
    let i = 0;
    let j = 0;
    while (i < search.length && j < target.length) {
        if (search[i] === target[j]) {
            i++;
        }
        j++;
    }
    return i === search.length;
};


const STORAGE_KEY = 'hintyfi_completedTasks_v1';
type CompletedTasksState = Record<string, string[]>;

export function useCompletedTasks() {
    const [completedTasks, setCompletedTasks] = useState<CompletedTasksState>({});

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setCompletedTasks(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Failed to load completed tasks from localStorage", error);
        }
    }, []);

    const toggleTaskCompletion = useCallback((projectId: string, taskId: string) => {
        setCompletedTasks(prev => {
            const projectTasks = prev[projectId] ? [...prev[projectId]] : [];
            const taskIndex = projectTasks.indexOf(taskId);

            if (taskIndex > -1) {
                projectTasks.splice(taskIndex, 1);
            } else {
                projectTasks.push(taskId);
            }

            const newState = { ...prev, [projectId]: projectTasks };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
            return newState;
        });
    }, []);
    
    const isTaskCompleted = useCallback((projectId: string, taskId: string): boolean => {
        return !!completedTasks[projectId]?.includes(taskId);
    }, [completedTasks]);

    const getCompletedCount = useCallback((projectId: string): number => {
        return completedTasks[projectId]?.length || 0;
    }, [completedTasks]);

    return { toggleTaskCompletion, isTaskCompleted, getCompletedCount };
}