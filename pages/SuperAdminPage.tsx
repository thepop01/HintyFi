import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useDataRefresher } from '../hooks/useDataRefresher';
import { getUsers, getProjects } from '../src/services/dataService';
import { Shield } from 'lucide-react';
import { SuperAdminContext, SuperAdminContextType } from '../context/SuperAdminContext';


const SuperAdminPage: React.FC = () => {
    const { dataVersion, refreshData } = useDataRefresher();

    const users = useMemo(() => getUsers(), [dataVersion]);
    const allProjects = useMemo(() => getProjects({ includePending: true }), [dataVersion]);
    const approvedProjects = useMemo(() => allProjects.filter(p => p.approvalStatus === 'approved'), [allProjects]);

    const contextValue: SuperAdminContextType = {
        users,
        allProjects,
        approvedProjects,
        refreshData,
        dataVersion,
    };

    return (
        <SuperAdminContext.Provider value={contextValue}>
            <div className="space-y-8 max-w-7xl mx-auto">
                <h1 className="text-4xl font-display font-bold text-on-surface flex items-center gap-3"><Shield size={36} /> Super Admin Dashboard</h1>
                <div className="card bg-yellow-900/50 border border-yellow-500 text-yellow-200 p-4">
                    <p className="font-bold">Public Access Mode & Super Admin Powers</p>
                    <p className="text-sm">You have full control over user roles, project approvals, and global content.</p>
                </div>
                
                <Outlet />
            </div>
        </SuperAdminContext.Provider>
    );
};

export default SuperAdminPage;