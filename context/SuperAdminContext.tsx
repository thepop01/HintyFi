import { createContext, useContext } from 'react';
import { User, Project } from '../src/types';

export interface SuperAdminContextType {
    users: User[];
    allProjects: Project[];
    approvedProjects: Project[];
    refreshData: () => void;
    dataVersion: number;
}

export const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export const useSuperAdminContext = () => {
    const context = useContext(SuperAdminContext);
    if (!context) {
        throw new Error('useSuperAdminContext must be used within a SuperAdminLayout provider');
    }
    return context;
};