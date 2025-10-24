import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Project, Event, CampaignEvent } from '../../../src/types';
import { useSuperAdminContext } from '../../../context/SuperAdminContext';
import { useToast } from '../../../context/ToastContext';
import { addOrUpdateEvent, getEvents } from '../../../src/services/dataService';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Plus, Edit } from 'lucide-react';
import CampaignForm from '../../../components/admin/CampaignForm';


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
                                <p className="font-bold">{c.title}</p>
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


const ProjectCampaignsVerificationTab: React.FC = () => {
    const { project } = useOutletContext<{ project: Project }>();
    const { refreshData } = useSuperAdminContext();
    const { addToast } = useToast();
    const [isCreating, setIsCreating] = useState(false);
    const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);

    const projectCampaigns = useMemo(() => {
        return getEvents().filter((e): e is CampaignEvent => e.type === 'campaign' && e.projectName === project.name);
    }, [project.name, refreshData]);

    const campaignsByStatus = useMemo(() => {
        const pending = projectCampaigns.filter(c => c.status === 'pending');
        const approved = projectCampaigns.filter(c => c.status === 'approved');
        const others = projectCampaigns.filter(c => c.status === 'draft' || c.status === 'rejected');
        return { pending, approved, others };
    }, [projectCampaigns]);

    const handleStatusUpdate = (campaignId: string, status: 'approved' | 'rejected') => {
        const campaign = projectCampaigns.find(c => c.id === campaignId);
        if (!campaign) return;
        
        if (addOrUpdateEvent({ ...campaign, status })) {
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

    const handleSave = (event: Event, newStatus: Event['status']) => {
        if (addOrUpdateEvent({ ...event, status: newStatus })) {
            const isNew = !event.id;
            addToast(`Campaign ${isNew ? 'created' : 'updated'} successfully.`, 'success');
            refreshData();
            setIsCreating(false);
            setEditingCampaignId(null);
        } else {
            addToast('Failed to save campaign.', 'error');
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold text-on-surface">Campaign Verification</h2>
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
                                onSave={(eventData) => handleSave(eventData, 'approved')}
                                onClose={() => setIsCreating(false)}
                                projectName={project.name}
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
                        onSave={(eventData) => handleSave(eventData, 'approved')}
                        onClose={() => setEditingCampaignId(null)}
                        projectName={project.name}
                    />
                )}
            />
            <CampaignListSection 
                title="Rejected / Drafts"
                campaigns={campaignsByStatus.others}
            />
        </div>
    );
};

export default ProjectCampaignsVerificationTab;