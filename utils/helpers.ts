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
import { User } from '../src/types';

// Voting Logic
const MONAD_SERVER_ID = '1036357772826120242';
const FULL_ACCESS_ROLE_ID = '1072682201658970112';
const MIN_HINT_POINTS_TO_VOTE = 50;

export const canVote = (user: User): { canVote: boolean; reason: string } => {
    if (!user) {
        return { canVote: false, reason: "You must be logged in to vote." };
    }

    // Check for Monad "full access" role
    const hasFullAccessRole = user.discordRoles?.some(role => 
        role.serverId === MONAD_SERVER_ID && role.roleId === FULL_ACCESS_ROLE_ID
    );

    if (hasFullAccessRole) {
        return { canVote: true, reason: "You can vote because you have the 'full access' role in the Monad Discord." };
    }

    // Check for minimum hint points
    if ((user.hint_points || 0) >= MIN_HINT_POINTS_TO_VOTE) {
        return { canVote: true, reason: `You can vote because you have over ${MIN_HINT_POINTS_TO_VOTE} Hint Points.` };
    }

    // Check for roles in partner projects
    // This part of the logic is not fully defined yet.
    // We can add it later when the requirements are clear.

    return { 
        canVote: false, 
        reason: `You need the 'full access' role in the Monad Discord or at least ${MIN_HINT_POINTS_TO_VOTE} Hint Points to vote.` 
    };
};