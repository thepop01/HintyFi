import React, { useMemo, useState, useEffect } from 'react';
import { Outlet, useParams, NavLink, Link } from 'react-router-dom';
import { getProjectById, getEvents } from '../src/services/dataService';
import Loader from '../components/common/Loader';
import { ArrowLeft, Award, Info, Tag, Megaphone, ClipboardList, Bell } from 'lucide-react';
import { useSuperAdminContext } from '../context/SuperAdminContext';

const SuperAdminProjectLayout: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { refreshData } = useSuperAdminContext();
    const [project, setProject] = useState(getProjectById(id!));
    const [pendingCounts, setPendingCounts] = useState({ campaigns: 0, tasks: 0, info: 0 });

    useEffect(() => {
        const handleDataChange = () => {
             if (id) {
                setProject(getProjectById(id));
            }
        };
        window.addEventListener('datachanged', handleDataChange);
        return () => window.removeEventListener('datachanged', handleDataChange);
    }, [id]);

    useEffect(() => {
        if (!project) return;

        const allEvents = getEvents();
        const campaignsCount = allEvents.filter(e => e.projectName === project.name && e.status === 'pending').length;
        const tasksCount = project.tasks?.filter(t => t.status === 'pending').length || 0;
        const infoCount = (project.hasPendingChanges && project.pendingChanges?.links && Object.keys(project.pendingChanges.links).length > 0) ? 1 : 0;
        
        setPendingCounts({ campaigns: campaignsCount, tasks: tasksCount, info: infoCount });

    }, [project, refreshData]);

    if (!project) {
        return <Loader message="Loading project data..." />;
    }
    
    const totalPending = pendingCounts.campaigns + pendingCounts.tasks + pendingCounts.info;

    const navItems = [
        { to: 'points', label: 'Manage Points', icon: <Award size={16} />, pendingCount: 0 },
        { to: 'info', label: 'Manage Info', icon: <Info size={16} />, pendingCount: pendingCounts.info },
        { to: 'status', label: 'Status', icon: <Tag size={16} />, pendingCount: 0 },
        { to: 'campaigns', label: 'Campaigns', icon: <Megaphone size={16} />, pendingCount: pendingCounts.campaigns },
        { to: 'tasks', label: 'Tasks', icon: <ClipboardList size={16} />, pendingCount: pendingCounts.tasks },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/super-admin/project-detail" className="neu-button p-2">
                        <ArrowLeft size={20} />
                    </Link>
                    <img src={project.logo} alt={project.name} className="w-12 h-12 rounded-lg bg-surface object-contain p-1" />
                    <div>
                        <h1 className="text-2xl font-display font-bold text-on-surface">{project.name}</h1>
                        <p className="text-sm text-on-surface-variant">Project Management</p>
                    </div>
                </div>
            </div>

            {totalPending > 0 && (
                <div className="bg-amber-400/20 text-amber-800 p-3 rounded-lg mb-4 text-sm font-semibold flex items-center gap-2">
                    <Bell size={16} />
                    This project has {totalPending} item(s) pending your review. Check the tabs with notification badges.
                </div>
            )}
            
            <nav className="mb-6 w-full overflow-x-auto hide-scrollbar">
                <div className="flex items-center gap-2 border-b border-border/10 pb-2">
                    {navItems.map(item => (
                         <NavLink
                            key={item.to}
                            to={item.to}
                            end
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 font-semibold text-sm rounded-md transition-colors whitespace-nowrap ${
                                    isActive ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface/80'
                                }`
                            }
                        >
                            {item.icon}
                            <span>{item.label}</span>
                             {item.pendingCount > 0 && (
                                <span className="ml-1 bg-amber-400 text-amber-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {item.pendingCount}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </div>
            </nav>
            
            <Outlet context={{ project }} />
        </div>
    );
};

export default SuperAdminProjectLayout;