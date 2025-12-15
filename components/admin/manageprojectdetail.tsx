import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, Event, User } from '../../src/types';
import { motion } from 'framer-motion';
import { Search, ChevronRight, Sparkles, Crown, Trash2, Plus } from 'lucide-react';
import { fuzzySearch } from '../../utils/helpers';
import { addOrUpdateProject } from '../../src/services/dataService';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import ConfirmationModal from '../common/ConfirmationModal';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import ManageButton from '../common/ManageButton';

const ManageProjectDetail: React.FC = () => {
    const { allProjects, users, refreshData } = useSuperAdminContext();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [viewMode, setViewMode] = useState<'all' | 'draft'>('all');



    const projectsWithPendingCounts = useMemo(() => {
        return allProjects.map(project => {
            const pendingLinksCount = (project.has_pending_changes && (project.pending_changes as any)?.links && Object.keys((project.pending_changes as any).links).length > 0) ? 1 : 0;
            // const pendingCampaignsCount = allEvents.filter(e => e.projectName === project.name && e.status === 'pending').length;
            const totalPending = pendingLinksCount;
            return { ...project, totalPending };
        });
    }, [allProjects]);

    const filteredProjects = useMemo(() => {
        const projectsToFilter = viewMode === 'draft'
            ? projectsWithPendingCounts.filter(p => p.approval_status === 'draft')
            : projectsWithPendingCounts;

        if (!searchTerm) {
            return projectsToFilter;
        }
        return projectsToFilter.filter(p => fuzzySearch(searchTerm, p.name));
    }, [projectsWithPendingCounts, searchTerm, viewMode]);


    const handlePublish = async (project: Project) => {
        const success = await addOrUpdateProject({ ...project, approval_status: 'approved', is_published: true });
        if (success) {
            addToast('Project published!', 'success');
            refreshData();
        } else {
            addToast('Failed to publish project.', 'error');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70" size={20} />
                    <input
                        type="text"
                        placeholder="Search for a project to manage..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="neu-inset-control w-full pl-10 pr-4 py-2"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode(prev => prev === 'all' ? 'draft' : 'all')}
                        className="neu-button px-4 py-2"
                    >
                        {viewMode === 'all' ? 'View Drafts' : 'View All'}
                    </button>
                    <button
                        onClick={() => navigate('/super-admin/projects/add')}
                        className="neu-button active px-4 py-2 flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <Plus size={18} />
                        Add New Project
                    </button>
                    <ManageButton />
                </div>
            </div>
            {filteredProjects.map(project => (
                <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="neu-outset-card p-4 group"
                >
                     <div
                        className="w-full flex items-center justify-between text-left"
                    >
                        <div className="flex items-center gap-4">
                            <img src={project.logo_url} alt={project.name} className="w-12 h-12 rounded-lg bg-surface object-contain p-1" />
                            <div>
                                <h2 className="font-bold text-lg text-on-surface flex items-center gap-2">
                                    {project.name}
                                    {project.is_crowned && <Crown size={16} className="text-yellow-500 fill-current" />}
                               </h2>
                               <div className="flex items-center gap-2 text-sm">
                                   <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${project.approval_status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                       {project.approval_status}
                                   </span>
                                   {project.stage === 'Early' && <span className="flex items-center gap-1 text-sky-500 font-semibold"><Sparkles size={14} /> Early</span>}
                                   {project.totalPending > 0 && (
                                       <span className="font-semibold text-amber-500">{project.totalPending} pending item(s)</span>
                                   )}
                               </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             {project.approval_status === 'draft' && (
                                <button
                                    onClick={() => handlePublish(project)}
                                    className="neu-button active px-3 py-1 text-sm"
                                >
                                    Publish
                                </button>
                            )}
                            <button
                                onClick={() => navigate(`/super-admin/project-detail/${project.id}`)}
                                className="neu-button active p-2"
                                title="Manage Project"
                            >
                                <ChevronRight size={24} className="text-on-surface-variant flex-shrink-0 group-hover:text-primary transition-colors" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default ManageProjectDetail;