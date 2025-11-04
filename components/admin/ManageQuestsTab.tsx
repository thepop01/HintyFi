import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Quest } from '../../src/types';
import { getQuests, addOrUpdateQuest, getQuestById, deleteItem } from '../../src/services/dataService';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Trash2 } from 'lucide-react';
import QuestForm from './QuestForm';
import { uid } from '../../utils/helpers';
import ConfirmationModal from '../common/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useClickOutside } from '../../hooks/useClickOutside';


type QuestType = 'submission' | 'identity' | 'mcq';

interface DisplayQuest {
    id: string;
    originalId: string;
    title: string;
    type: QuestType;
    status: 'ongoing' | 'past';
}

const ManageQuestsTab: React.FC = () => {
    const { refreshData, dataVersion } = useSuperAdminContext();
    const { addToast } = useToast();
    
    // State for inline forms
    const [editingQuest, setEditingQuest] = useState<{ quest: Partial<Quest>, type: QuestType } | null>(null);
    const [isCreating, setIsCreating] = useState<QuestType | null>(null);
    const [editingQuestId, setEditingQuestId] = useState<string | null>(null);

    // State for confirmation modal and add menu
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<DisplayQuest | null>(null);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const addMenuRef = useRef<HTMLDivElement>(null);
    useClickOutside(addMenuRef, () => setIsAddMenuOpen(false));


    const [allQuests, setAllQuests] = useState<Quest[]>([]);

    useEffect(() => {
        const fetchQuests = async () => {
            const quests = await getQuests();
            setAllQuests(quests || []);
        };
        fetchQuests();
    }, [dataVersion]);

    const { ongoingQuests, pastQuests } = useMemo(() => {
        const displayQuests: DisplayQuest[] = (allQuests || []).map(q => {
            let type: QuestType;
            let title: string;

            if (q.quest_type === 'Identity' && q.identityQuestion) {
                type = 'identity';
                title = q.identityQuestion.title;
            } else if (q.multipleChoiceQuestion) {
                type = 'mcq';
                title = q.multipleChoiceQuestion.title;
            } else {
                type = 'submission';
                title = q.name;
            }
            return {
                id: q.id,
                originalId: q.id,
                title: title,
                type: type,
                status: q.is_active ? 'ongoing' : 'past',
            };
        });

        const ongoing = displayQuests.filter(q => q.status === 'ongoing');
        const past = displayQuests.filter(q => q.status === 'past').sort((a,b) => b.originalId.localeCompare(a.originalId));
        
        return { ongoingQuests: ongoing, pastQuests: past };
    }, [allQuests]);

    const handleAddNew = (type: QuestType) => {
        setEditingQuest({ quest: {}, type: type });
        setIsCreating(type);
        setEditingQuestId(null);
        setIsAddMenuOpen(false);
    };

    const handleEdit = async (displayQuest: DisplayQuest) => {
        if (editingQuestId === displayQuest.id) {
            setEditingQuestId(null);
            setEditingQuest(null);
            return;
        }
        const originalQuest = await getQuestById(displayQuest.originalId);
        if (originalQuest) {
            setEditingQuest({ quest: originalQuest, type: displayQuest.type });
            setEditingQuestId(displayQuest.id);
            setIsCreating(null);
        }
    };
    
    const handleDeleteClick = (displayQuest: DisplayQuest) => {
        setItemToDelete(displayQuest);
        setIsConfirmOpen(true);
    };
    
    const confirmDelete = () => {
        if (!itemToDelete) return;
        
        const success = deleteItem('quests', itemToDelete.originalId);

        if (success) {
            addToast(`Quest "${itemToDelete.title}" deleted.`, 'success');
            refreshData();
        } else {
            addToast('Failed to delete quest.', 'error');
        }
        
        setIsConfirmOpen(false);
        setItemToDelete(null);
    };

    const handleSave = async (questDataFromForm: Partial<Quest>) => {
        const isNew = !questDataFromForm.id;
        let questToSave: Quest;

        if (isNew) {
            questToSave = {
                id: uid(),
                name: '',
                quest_type: 'Gaming',
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 7 * 86400000).toISOString(),
                is_active: true,
                entries: [],
                ...questDataFromForm,
            } as Quest;
        } else {
            const originalQuest = await getQuestById(questDataFromForm.id!);
            if (!originalQuest) {
                addToast("Original quest not found. Cannot save.", "error");
                return;
            }
            questToSave = { ...originalQuest, ...questDataFromForm };
        }
        
        const success = await addOrUpdateQuest(questToSave);
        if (success) {
            addToast(`Quest saved successfully!`, 'success');
            refreshData();
            // close form
            handleCloseForm();
        } else {
            addToast('Failed to save quest.', 'error');
        }
    };

    const handleCloseForm = () => {
        setIsCreating(null);
        setEditingQuestId(null);
        setEditingQuest(null);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-display font-bold text-on-surface">Manage Quests</h2>
            </div>
            
            <div className="neu-card p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold font-display text-on-surface">Present Quests</h3>
                     <div className="relative" ref={addMenuRef}>
                        <button onClick={() => setIsAddMenuOpen(p => !p)} className="neu-button active px-4 py-2 flex items-center gap-2">
                            <Plus size={18} /> Add Quest
                        </button>
                        <AnimatePresence>
                            {isAddMenuOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full right-0 mt-2 w-48 bg-[rgb(var(--color-surface-container))] rounded-lg shadow-lg z-10 border border-border/10 overflow-hidden"
                                >
                                    <button onClick={() => handleAddNew('submission')} className="w-full text-left p-3 hover:bg-primary/10 text-sm font-semibold">Submission Quest</button>
                                    <button onClick={() => handleAddNew('identity')} className="w-full text-left p-3 hover:bg-primary/10 text-sm font-semibold border-t border-border/10">Identity Question</button>
                                    <button onClick={() => handleAddNew('mcq')} className="w-full text-left p-3 hover:bg-primary/10 text-sm font-semibold border-t border-border/10">Multiple Choice</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <AnimatePresence>
                    {isCreating && editingQuest && (
                        <motion.div
                            layout
                            initial={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: '1rem', marginBottom: '1rem' }}
                            exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="neu-card p-4">
                                <QuestForm
                                    questToEdit={editingQuest.quest}
                                    questType={editingQuest.type}
                                    onSave={handleSave}
                                    onClose={handleCloseForm}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {ongoingQuests.length > 0 ? (
                    <div className="space-y-2">
                        {ongoingQuests.map(q => (
                             <React.Fragment key={q.id}>
                                <div className="neu-outset-card p-3 flex items-center justify-between gap-2">
                                    <div>
                                        <p className="font-semibold">{q.title}</p>
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary capitalize">{q.type} Quest</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleEdit(q)} className="neu-button p-2"><Edit size={16} /></button>
                                        <button onClick={() => handleDeleteClick(q)} className="neu-button p-2 hover:!text-red-500"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {editingQuestId === q.id && editingQuest && (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="neu-card p-4 mt-[-4px] mb-2 rounded-t-none">
                                                <QuestForm
                                                    questToEdit={editingQuest.quest}
                                                    questType={editingQuest.type}
                                                    onSave={handleSave}
                                                    onClose={handleCloseForm}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </React.Fragment>
                        ))}
                    </div>
                ): (
                    !isCreating && <p className="text-on-surface-variant text-center py-4">No ongoing quests. Click "Add Quest" to start one.</p>
                )}
            </div>

             <div className="neu-card p-4">
                <h3 className="text-xl font-bold font-display text-on-surface mb-4">Past Quests</h3>
                 {pastQuests.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {pastQuests.map(q => (
                             <div key={q.id} className="neu-outset-card p-3 flex items-center justify-between gap-2 opacity-70">
                                <p className="font-semibold">{q.title}</p>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-container capitalize">{q.type}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                     <p className="text-on-surface-variant text-center py-4">No past quests found.</p>
                )}
            </div>
            
             <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title={`Delete "${itemToDelete?.title}"?`}
                confirmText="Delete"
            >
                Are you sure you want to delete this quest? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

export default ManageQuestsTab;