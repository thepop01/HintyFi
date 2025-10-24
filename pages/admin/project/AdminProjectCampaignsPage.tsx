import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { getEvents, deleteItem, addOrUpdateEvent, selectCampaignWinners } from '../../../src/services/dataService';
import { Project, Event, CampaignEvent } from '../../../src/types';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { uid } from '../../../utils/helpers';
import { Edit, Trash2, Plus, Pin, Save, Send, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataRefresher } from '../../../hooks/useDataRefresher';
import CampaignForm from '../../../components/admin/CampaignForm';


const AdminProjectCampaignsPage: React.FC = () => {
    const { project } = useOutletContext<{ project: Project }>();
    const { addToast } = useToast();
    const { dataVersion, refreshData } = useDataRefresher();

    const [isCreating, setIsCreating] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Event | null>(null);
    const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Event | null>(null);

    const projectCampaigns = useMemo(() => {
        return getEvents().filter(e => e.projectName === project.name && e.type === 'campaign');
    }, [project.name, dataVersion]);

    const handleEdit = (event: Event) => {
        const newEditingId = editingCampaignId === event.id ? null : event.id;
        setEditingCampaignId(newEditingId);
        setEditingCampaign(newEditingId ? event : null);
        setIsCreating(false);
    };

    const handleDelete = (event: Event) => { setItemToDelete(event); setIsConfirmOpen(true); };
    
    const confirmDelete = () => {
        if (!itemToDelete) return;
        if (deleteItem('events', itemToDelete.id)) { addToast(`Campaign "${itemToDelete.title}" deleted.`, 'success'); refreshData(); } 
        else { addToast('Failed to delete campaign.', 'error'); }
        setIsConfirmOpen(false); setItemToDelete(null);
    };

    const handleSelectWinners = (campaignId: string) => {
        const result = selectCampaignWinners(campaignId);
        addToast(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            refreshData();
        }
    };

    const handleSave = (eventData: Event) => {
        const isNew = !eventData.id;
        const wasApproved = editingCampaign?.status === 'approved';
        let newStatus: Event['status'] = 'draft';

        if (!isNew && wasApproved) {
            newStatus = 'pending'; // Re-submit for approval after editing
        }
        
        const eventToSave = { ...eventData, status: newStatus, id: eventData.id || uid(), entries: eventData.type === 'campaign' ? (eventData as CampaignEvent).entries || [] : undefined };
        
        if (addOrUpdateEvent(eventToSave)) { 
            const action = isNew ? 'created' : 'updated';
            const message = isNew ? `Campaign created as a draft.` : wasApproved ? `Campaign updated and re-submitted for approval.` : `Draft updated.`;

            addToast(message, 'success');
            refreshData();
            setIsCreating(false);
            setEditingCampaign(null);
            setEditingCampaignId(null);
        } else { 
            addToast('Failed to save campaign.', 'error'); 
        }
    };
    
    const handleStatusChange = (event: Event, status: 'pending' | 'draft') => {
        const success = addOrUpdateEvent({ ...event, status });
        if (success) {
            const message = status === 'pending' ? 'Campaign submitted for approval!' : 'Campaign retracted to drafts.';
            addToast(message, 'success');
            refreshData();
        } else {
            addToast('Failed to update campaign status.', 'error');
        }
    };

    const statusPill = (status: Event['status']) => {
        const config = {
            draft: { text: 'Draft', color: 'bg-gray-400/20 text-gray-500' },
            pending: { text: 'Pending', color: 'bg-yellow-400/20 text-yellow-500' },
            approved: { text: 'Approved', color: 'bg-green-400/20 text-green-500' },
            rejected: { text: 'Rejected', color: 'bg-red-400/20 text-red-500' }
        }[status];

        return <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${config.color}`}>{config.text}</span>;
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold text-on-surface">Manage Campaigns</h2>
                <button onClick={() => { setIsCreating(!isCreating); setEditingCampaignId(null); }} className="neu-button active px-4 py-2 flex items-center gap-2">
                    <Plus size={18} /> {isCreating ? 'Cancel' : 'Add New Campaign'}
                </button>
            </div>
            
            <AnimatePresence>
                {isCreating && (
                    <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="neu-card p-4 my-4">
                            <CampaignForm onSave={handleSave} onClose={() => setIsCreating(false)} projectName={project.name} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="space-y-3">
                {projectCampaigns.map(event => {
                    const campaign = event as CampaignEvent;
                    const isEnded = campaign.endTime < Date.now();
                    const winnersSelected = (campaign.winners || []).length > 0;
                    const canSelectWinners = isEnded && !winnersSelected && (campaign.numberOfWinners || 0) > 0;

                    return (
                        <div key={event.id} className="neu-outset-card overflow-hidden">
                            <div className="p-3 flex items-center justify-between gap-4">
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold flex items-center gap-2">{event.title} {statusPill(event.status)}</p>
                                    <p className="text-sm text-on-surface-variant">Reward: {(event as CampaignEvent).reward}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {canSelectWinners && <button onClick={() => handleSelectWinners(campaign.id)} className="neu-button active !text-amber-500 !border-amber-500/50 px-3 py-1 text-sm flex items-center gap-1" title="Select Winners"><Trophy size={14} /> Select Winners</button>}
                                    {event.status === 'draft' && <button onClick={() => handleStatusChange(event, 'pending')} className="neu-button px-3 py-1 text-sm flex items-center gap-1" title="Submit for Approval"><Send size={14} /> Submit</button>}
                                    {event.status === 'pending' && <button onClick={() => handleStatusChange(event, 'draft')} className="neu-button px-3 py-1 text-sm">Retract</button>}
                                    <button onClick={() => handleEdit(event)} className="neu-control p-2"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(event)} className="neu-control p-2 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <AnimatePresence>
                            {editingCampaignId === event.id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border/10 p-4 bg-surface/20">
                                    <CampaignForm campaign={editingCampaign} onSave={handleSave} onClose={() => setEditingCampaignId(null)} projectName={project.name} />
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </div>
            
            <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title={`Delete "${itemToDelete?.title}"?`} confirmText="Delete">
                This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

export default AdminProjectCampaignsPage;