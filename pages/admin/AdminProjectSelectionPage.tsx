import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../../src/services/dataService';
import { Project } from '../../src/types';
import { motion } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import { fuzzySearch } from '../../utils/helpers';
import { useDataRefresher } from '../../hooks/useDataRefresher';
import { useAuth } from '../../context/AuthContext';

const AdminProjectSelectionPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { dataVersion } = useDataRefresher();
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const { currentUser } = useAuth();
    
    useEffect(() => {
        setAllProjects(getProjects({ includePending: true }));
    }, [dataVersion]);

    const accessibleProjects = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'super_admin') {
            return allProjects;
        }
        if (currentUser.role === 'project_admin') {
            const associatedIds = new Set(currentUser.associatedProjectIds || []);
            return allProjects.filter(p => associatedIds.has(p.id));
        }
        return [];
    }, [allProjects, currentUser]);

    const filteredProjects = useMemo(() => {
        if (!searchTerm) {
            return accessibleProjects;
        }
        return accessibleProjects.filter(p => fuzzySearch(searchTerm, p.name));
    }, [accessibleProjects, searchTerm]);

    return (
        <div className="max-w-4xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-display font-bold text-on-surface">Admin Panel</h1>
                <p className="text-lg text-on-surface-variant mt-2">Select a project to manage</p>
            </header>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70" size={20} />
                <input
                    type="text"
                    placeholder="Search for a project..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="neu-inset-control w-full pl-12 pr-4 py-3 text-lg text-on-surface placeholder:text-on-surface-variant/70"
                />
            </div>

            <div className="space-y-4">
                {filteredProjects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="neu-outset-card p-4 group"
                    >
                        <button
                            onClick={() => navigate(`/admin/project/${project.id}`)}
                            className="w-full flex items-center justify-between text-left"
                        >
                            <div className="flex items-center gap-4">
                                <img src={project.logo} alt={project.name} className="w-12 h-12 rounded-lg bg-surface object-contain p-1" />
                                <div>
                                    <h2 className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors">{project.name}</h2>
                                    <p className="text-sm text-on-surface-variant">{project.description}</p>
                                </div>
                            </div>
                            <ChevronRight size={24} className="text-on-surface-variant flex-shrink-0 group-hover:text-primary transition-colors" />
                        </button>
                    </motion.div>
                ))}
            </div>
             {filteredProjects.length === 0 && (
                <div className="text-center py-12 text-on-surface-variant">
                    <p>No projects found for "{searchTerm}".</p>
                </div>
            )}
        </div>
    );
};

export default AdminProjectSelectionPage;