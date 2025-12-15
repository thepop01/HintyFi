import React, { useState, useMemo, useEffect } from 'react';
import { Project, Event, CampaignEvent } from '../../src/types';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import { useToast } from '../../context/ToastContext';
import { addOrUpdateEvent, getEvents } from '../../src/services/dataService';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Plus, Edit, Search, Filter } from 'lucide-react';
import CampaignForm from './CampaignForm';

const CampaignListSection: React.FC<{
    title: string;
    campaigns: CampaignEvent[];
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    onEdit?: (campaign: CampaignEvent) => void;
    editingCampaignId?: string | null;
    renderEditForm?: (campaign: CampaignEvent) => React.ReactNode;
}> = ({ title, campaigns, onApprove, onReject, onEdit, editingCampaignId, renderEditForm }) => (
    <div>
        <h3 className="text-lg font-bold text-on-surface-variant mb-2">{title} ({campaigns.length})</h3>
        {campaigns.length > 0 ? (
            <div className="neu-card p-4 space-y-3">
                {campaigns.map(c => (
                    <div key={c.id} className="neu-outset-card overflow-hidden">
                        <div className="p-3 flex items-center justify-between gap-2">
                            <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">{c.projectName}</span>
                                    <p className="font-bold">{c.title}</p>
                                </div>
                                <p className="text-sm text-on-surface-variant">{c.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {onApprove && <button onClick={() => onApprove(c.id)} className="neu-button active !text-green-500 !border-green-500/50 px-3 py-1 text-sm flex items-center gap-1"><Check size={14} /> Approve</button>}
                                {onReject && <button onClick={() => onReject(c.id)} className="neu-button active !text-red-500 !border-red-500/50 px-3 py-1 text-sm flex items-center gap-1"><X size={14} /> Reject</button>}
                                {onEdit && <button onClick={() => onEdit(c)} className="neu-button p-2"><Edit size={16} /></button>}
                            </div>
                        </div>
                        <AnimatePresence>
                            {editingCampaignId === c.id && renderEditForm && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border/10 p-4 bg-surface/20">
                                    {renderEditForm(c)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        ) : <p className="text-sm text-on-surface-variant">No campaigns in this category.</p>}
    </div>
);


const EventsCampaigns: React.FC = () => {
    const { allProjects, refreshData } = useSuperAdminContext();
    const { addToast } = useToast();
    const [isCreating, setIsCreating] = useState(false);
    const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
    const [allCampaigns, setAllCampaigns] = useState<CampaignEvent[]>([]);

    // Filtering
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

    useEffect(() => {
        const fetchCampaigns = async () => {
            const events = await getEvents();
            const campaigns = (events || []).filter((e): e is CampaignEvent => e.type === 'campaign');
            setAllCampaigns(campaigns);
        };
        fetchCampaigns();
    }, [refreshData]);

    const filteredCampaigns = useMemo(() => {
        return allCampaigns.filter(c => {
            const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesProject = selectedProjectId === 'all' || allProjects.find(p => p.id === selectedProjectId)?.name === c.projectName; // Note: Campaign stores projectName, but use Project ID for logic if possible. Campaign type has project_id as well.
            // Actually campaign event type has projectName. Tables definition has project_id. Let's assume projectName is populated correctly or verify. 
            // In getEvents service, it likely joins. 
            // Let's use projectName for filtering if project_id is not available on Event type (Event type has 'projectName').
            return matchesSearch && matchesProject;
        });
    }, [allCampaigns, searchTerm, selectedProjectId, allProjects]);

    const campaignsByStatus = useMemo(() => {
        const pending = filteredCampaigns.filter(c => c.status === 'pending');
        const approved = filteredCampaigns.filter(c => c.status === 'approved');
        const others = filteredCampaigns.filter(c => c.status === 'draft' || c.status === 'rejected');
        return { pending, approved, others };
    }, [filteredCampaigns]);

    const handleStatusUpdate = async (campaignId: string, status: 'approved' | 'rejected') => {
        const campaign = allCampaigns.find(c => c.id === campaignId);
        if (!campaign) return;

        if (await addOrUpdateEvent({ ...campaign, status } as Event)) {
            addToast(`Campaign has been ${status}.`, 'success');
            refreshData();
        } else {
            addToast('Failed to update campaign status.', 'error');
        }
    };

    const handleEditApproved = (campaign: CampaignEvent) => {
        setEditingCampaignId(prevId => prevId === campaign.id ? null : campaign.id);
        setIsCreating(false);
    };

    const handleCreateNew = () => {
        setIsCreating(prev => !prev);
        setEditingCampaignId(null);
    };

    const handleSave = async (eventData: Partial<Event>) => {
        const existing = allCampaigns.find(c => c.id === eventData.id);
        const campaignToSave = {
            ...existing,
            ...eventData,
            status: eventData.status || 'approved', // Default to approved on create/edit from admin
        } as Event;

        // Ensure project name is synced if project_id changed (handled in form, but check here)
        // Since we are admin, we trust the form.

        if (await addOrUpdateEvent(campaignToSave)) {
            const isNew = !eventData.id;
            addToast(`Campaign ${isNew ? 'created' : 'updated'} successfully.`, 'success');
            refreshData();
            setIsCreating(false);
            setEditingCampaignId(null);
        } else {
            addToast('Failed to save campaign.', 'error');
        }
    };

    const projectOptions = useMemo(() => allProjects.map(p => ({ id: p.id, name: p.name })), [allProjects]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70" size={16} />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="neu-inset-control pl-9 pr-3 py-2 w-full md:w-64"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={selectedProjectId}
                            onChange={e => setSelectedProjectId(e.target.value)}
                            className="neu-inset-control py-2 pl-3 pr-8 w-40"
                        >
                            <option value="all">All Projects</option>
                            {projectOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 pointer-events-none" size={16} />
                    </div>
                </div>

                <button onClick={handleCreateNew} className="neu-button active px-4 py-2 flex items-center gap-2">
                    <Plus size={18} /> {isCreating ? 'Cancel' : 'Create New Campaign'}
                </button>
            </div>

            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="neu-card p-4 my-4">
                            <CampaignForm
                                onSave={(eventData) => handleSave({ ...eventData, status: 'approved' })}
                                onClose={() => setIsCreating(false)}
                                projects={projectOptions}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <CampaignListSection
                title="Pending Approval"
                campaigns={campaignsByStatus.pending}
                onApprove={(id) => handleStatusUpdate(id, 'approved')}
                onReject={(id) => handleStatusUpdate(id, 'rejected')}
            />
            <CampaignListSection
                title="Approved Campaigns"
                campaigns={campaignsByStatus.approved}
                onEdit={handleEditApproved}
                editingCampaignId={editingCampaignId}
                renderEditForm={(campaign) => (
                    <CampaignForm
                        campaign={campaign}
                        onSave={(eventData) => handleSave(eventData)}
                        onClose={() => setEditingCampaignId(null)}
                        projects={projectOptions}
                        projectName={campaign.projectName}
                    />
                )}
            />
            <CampaignListSection
                title="Rejected / Drafts / Others"
                campaigns={campaignsByStatus.others}
            />
        </div>
    );
};

export default EventsCampaigns;
