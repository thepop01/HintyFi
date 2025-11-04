import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Edit, Megaphone, ClipboardList, Gem, Award } from 'lucide-react';
import { getProjects } from '../../src/services/dataService';

const navItems = [
    { to: 'edit', label: 'Edit Project', icon: <Edit size={16} /> },
    { to: 'campaigns', label: 'Campaigns', icon: <Megaphone size={16} /> },
    { to: 'tasks', label: 'Tasks', icon: <ClipboardList size={16} /> },
    { to: 'nfts-memes', label: 'NFTs & Memes', icon: <Gem size={16} /> },
    { to: 'discord-roles', label: 'Discord Roles', icon: <Award size={16} /> },
];

const NavItem: React.FC<{ to: string; label: string; icon: React.ReactNode }> = ({ to, label, icon }) => (
    <NavLink
        to={to}
        end
        className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 font-semibold text-sm rounded-md transition-colors whitespace-nowrap ${
                isActive ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface/80'
            }`
        }
    >
        {icon}
        {label}
    </NavLink>
);

const ProjectAdminNavbar: React.FC<{ projectId: string }> = ({ projectId }) => {
    const [urlPath, setUrlPath] = useState<string>(projectId);
    
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const projects = await getProjects();
                const project = projects.find(p => p.id === projectId);
                if (project) {
                    setUrlPath(project.name.toLowerCase());
                }
            } catch (error) {
                console.error('Error fetching project:', error);
            }
        };
        
        fetchProject();
    }, [projectId]);
    
    return (
        <nav className="mt-4 w-full overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-2 border-b border-border/10 pb-2">
                {navItems.map(item => {
                    return (
                        <NavItem 
                            key={item.to} 
                            to={`/admin/project/${urlPath}/${item.to}`} 
                            label={item.label} 
                            icon={item.icon} 
                        />
                    );
                })}
            </div>
        </nav>
    );
};

export default ProjectAdminNavbar;