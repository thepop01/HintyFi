import React, { useState, useEffect } from 'react';
import {
    Collaboration, Project, CollaborationTask, MysteryCard,
    RaffleReward, UserCardPurchase, UserCollaborationProgress, CollabProject
} from '../../src/types';
import {
    getCollaborations, addOrUpdateCollaboration,
    getCollabTasks, addOrUpdateCollaborationTask,
    getMysteryCard, addOrUpdateMysteryCard,
    getProjectsFromDB, addOrUpdateProject,
    getUserCardPurchases, getUserCollaborationProgressAll,
    getCollabProjects, addOrUpdateCollabProject
} from '../../src/services/dataService';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import { useToast } from '../../context/ToastContext';
import { uid } from '../../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit, Trash2, Save, X,
    Trophy, Target, Gift, Calendar,
    Users, BarChart3, Globe, Image as ImageIcon,
    ExternalLink, CheckCircle, ScrollText
} from 'lucide-react';
import ImageUploadInput from '../common/ImageUploadInput';
import ConfirmationModal from '../common/ConfirmationModal';
import Modal from '../common/Modal';

// --- Sub-Components ---

// 1. Project Selection / Creation
const ProjectSelector: React.FC<{
    selectedProjectIds: string[];
    onChange: (ids: string[]) => void;
    allProjects: Project[];
    onAddCustomProject: (project: Partial<Project>) => Promise<string | null>;
}> = ({ selectedProjectIds, onChange, allProjects, onAddCustomProject }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newProject, setNewProject] = useState<{ name: string; logo: string; link: string }>({ name: '', logo: '', link: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const handleAdd = async () => {
        if (!newProject.name) return;
        const id = await onAddCustomProject({
            name: newProject.name,
            logo_url: newProject.logo,
            twitter_url: newProject.link,
            website_urls: [],
            approval_status: 'approved', // Auto-approve specifically created entries
            is_published: false // Hide from main ecosystem by default? Or true? User said "might be or might not be in db".
            // Best to keep it "approved" so it shows in the generic project lists if needed,
            // but maybe 'is_published' false to hide from main grids if desired.
            // Let's default to verified=true (approved).
        });
        if (id) {
            onChange([...selectedProjectIds, id]);
            setIsAdding(false);
            setNewProject({ name: '', logo: '', link: '' });
        }
    };

    const filteredProjects = allProjects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-4 border p-4 rounded-lg border-white/10">
            <h3 className="font-bold flex items-center gap-2"><Globe size={18} /> Participating Projects</h3>

            <div className="flex flex-wrap gap-2 mb-2">
                {selectedProjectIds.map(id => {
                    const p = allProjects.find(px => px.id === id);
                    return (
                        <div key={id} className="bg-primary/20 text-primary px-3 py-1 rounded-full flex items-center gap-2">
                            {p?.logo_url && <img src={p.logo_url} className="w-4 h-4 rounded-full" />}
                            <span>{p?.name || 'Unknown'}</span>
                            <button onClick={() => onChange(selectedProjectIds.filter(pid => pid !== id))}><X size={14} /></button>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-2">
                <select
                    className="neu-inset-input flex-grow"
                    onChange={e => {
                        if (e.target.value && !selectedProjectIds.includes(e.target.value)) {
                            onChange([...selectedProjectIds, e.target.value]);
                        }
                    }}
                    value=""
                >
                    <option value="">Select existing project...</option>
                    {filteredProjects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <button onClick={() => setIsAdding(true)} className="neu-button px-4 py-2"><Plus size={18} /></button>
            </div>

            {isAdding && (
                <div className="p-4 bg-surface/50 rounded-lg space-y-3 mt-2">
                    <h4 className="font-bold text-sm">Add New Project (External)</h4>
                    <input
                        placeholder="Project Name"
                        value={newProject.name}
                        onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                        className="neu-inset-input w-full"
                    />
                    <input
                        placeholder="Twitter Link"
                        value={newProject.link}
                        onChange={e => setNewProject({ ...newProject, link: e.target.value })}
                        className="neu-inset-input w-full"
                    />
                    <div className="mb-2">
                        <label className="text-xs font-bold block mb-1">Project Logo</label>
                        <ImageUploadInput
                            value={newProject.logo}
                            onChange={val => setNewProject({ ...newProject, logo: val })}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsAdding(false)} className="neu-button px-3 py-1">Cancel</button>
                        <button onClick={handleAdd} className="neu-button active px-3 py-1">Create & Add</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 2. Task Manager
const TaskManager: React.FC<{
    tasks: CollaborationTask[];
    onUpdate: (tasks: CollaborationTask[]) => void;
    collabId: string;
}> = ({ tasks, onUpdate, collabId }) => {
    const [editingTask, setEditingTask] = useState<Partial<CollaborationTask> | null>(null);

    const handleSaveTask = async () => {
        if (!editingTask || !editingTask.title) return;
        const newTask: CollaborationTask = {
            id: editingTask.id || uid(),
            collaboration_id: collabId,
            title: editingTask.title,
            description: editingTask.description || '',
            task_type: editingTask.task_type || 'custom',
            hint_points_reward: editingTask.hint_points_reward || 10,
            verification_data: editingTask.verification_data || {},
            is_active: editingTask.is_active !== undefined ? editingTask.is_active : true,
            created_at: editingTask.created_at || new Date().toISOString()
        };

        // In a real app we would save to DB here individually, but for now we update the local list
        // which will be saved when the parent saves, OR we save immediately.
        // Let's save immediately to avoid data loss.
        await addOrUpdateCollaborationTask(newTask as CollaborationTask);

        // Update local list
        const existingIndex = tasks.findIndex(t => t.id === newTask.id);
        if (existingIndex >= 0) {
            const newTasks = [...tasks];
            newTasks[existingIndex] = newTask;
            onUpdate(newTasks);
        } else {
            onUpdate([...tasks, newTask]);
        }
        setEditingTask(null);
    };

    const handleDeleteTask = (taskId: string) => {
        // In real app, delete from DB. For now just remove from list.
        // await deleteItem('collaboration_tasks', taskId);
        onUpdate(tasks.filter(t => t.id !== taskId));
    };

    return (
        <div className="space-y-4 border p-4 rounded-lg border-white/10">
            <div className="flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><Target size={18} /> Tasks ({tasks.length})</h3>
                <button onClick={() => setEditingTask({})} className="neu-button px-3 py-1 text-sm"><Plus size={14} /> Add Task</button>
            </div>

            <div className="space-y-2">
                {tasks.map(task => (
                    <div key={task.id} className="bg-surface/30 p-3 rounded flex justify-between items-center">
                        <div>
                            <p className="font-bold">{task.title}</p>
                            <p className="text-xs text-on-surface-variant">{task.task_type} • {task.hint_points_reward} pts</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setEditingTask(task)} className="neu-button p-1"><Edit size={14} /></button>
                            {/* <button onClick={() => handleDeleteTask(task.id)} className="neu-button p-1 text-red-400"><Trash2 size={14} /></button> */}
                        </div>
                    </div>
                ))}
            </div>

            {editingTask && (
                <Modal isOpen onClose={() => setEditingTask(null)} title={editingTask.id ? 'Edit Task' : 'New Task'}>
                    <div className="space-y-3">
                        <input className="neu-inset-input w-full" placeholder="Task Title" value={editingTask.title || ''} onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} />
                        <textarea className="neu-inset-input w-full" placeholder="Description" value={editingTask.description || ''} onChange={e => setEditingTask({ ...editingTask, description: e.target.value })} />

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold block mb-1">Type</label>
                                <select className="neu-inset-input w-full" value={editingTask.task_type || 'custom'} onChange={e => setEditingTask({ ...editingTask, task_type: e.target.value as any })}>
                                    <option value="custom">Custom</option>
                                    <option value="twitter_follow">X Follow</option>
                                    <option value="twitter_like">X Like</option>
                                    <option value="twitter_retweet">X Retweet</option>
                                    <option value="discord_join">Discord Join</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Points</label>
                                <input type="number" className="neu-inset-input w-full" value={editingTask.hint_points_reward || 0} onChange={e => setEditingTask({ ...editingTask, hint_points_reward: parseInt(e.target.value) })} />
                            </div>
                        </div>

                        {/* Verification Data based on type */}
                        <div className="space-y-2 border-t border-white/10 pt-2">
                            <h5 className="text-xs font-bold text-on-surface-variant">Verification Config</h5>
                            <input className="neu-inset-input w-full" placeholder="Target URL / Username / ID"
                                value={editingTask.verification_data?.custom_url || editingTask.verification_data?.twitter_username || editingTask.verification_data?.discord_server_id || ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    const newData = { ...editingTask.verification_data };
                                    if (editingTask.task_type?.startsWith('twitter')) newData.twitter_username = val;
                                    else if (editingTask.task_type === 'discord_join') newData.discord_server_id = val;
                                    else newData.custom_url = val;
                                    setEditingTask({ ...editingTask, verification_data: newData });
                                }}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setEditingTask(null)} className="neu-button px-3 py-1">Cancel</button>
                            <button onClick={handleSaveTask} className="neu-button active px-3 py-1">Save Task</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// 3. Mystery Card Manager
const MysteryCardManager: React.FC<{
    card: MysteryCard | null;
    onSave: (card: MysteryCard) => void;
    collabId: string;
}> = ({ card, onSave, collabId }) => {
    const [editingCard, setEditingCard] = useState<Partial<MysteryCard>>(card || {
        collaboration_id: collabId,
        hint_points_cost: 100,
        max_cards_per_user: 5,
        is_active: true,
        can_purchase: true,
        can_open: false,
        raffle_pool: []
    });

    const [editingReward, setEditingReward] = useState<Partial<RaffleReward> | null>(null);

    useEffect(() => {
        if (card) setEditingCard(card);
    }, [card]);

    const handleSaveCard = () => {
        const newCard: MysteryCard = {
            id: editingCard.id || uid(),
            collaboration_id: collabId,
            title: editingCard.title || 'Mystery Card',
            description: editingCard.description || 'Contains random rewards',
            hint_points_cost: editingCard.hint_points_cost || 0,
            max_cards_per_user: editingCard.max_cards_per_user || 1,
            purchased_count: editingCard.purchased_count || 0,
            is_active: editingCard.is_active ?? true,
            can_purchase: editingCard.can_purchase ?? true,
            can_open: editingCard.can_open ?? false,
            raffle_pool: editingCard.raffle_pool || []
        };
        onSave(newCard);
    };

    const handleSaveReward = () => {
        if (!editingReward || !editingReward.title) return;
        const newReward: RaffleReward = {
            id: editingReward.id || uid(),
            title: editingReward.title,
            description: editingReward.description || '',
            type: editingReward.type || 'code',
            quantity: editingReward.quantity || 1,
            rarity_weight: editingReward.rarity_weight || 10,
            value: editingReward.value || {}
        };

        const currentPool = editingCard.raffle_pool || [];
        const index = currentPool.findIndex(r => r.id === newReward.id);
        const newPool = index >= 0
            ? currentPool.map((r, i) => i === index ? newReward : r)
            : [...currentPool, newReward];

        setEditingCard({ ...editingCard, raffle_pool: newPool });
        setEditingReward(null);
    };

    return (
        <div className="space-y-4 border p-4 rounded-lg border-white/10">
            <h3 className="font-bold flex items-center gap-2"><Gift size={18} /> Mystery Card Config</h3>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold block mb-1">Cost (Points)</label>
                    <input type="number" className="neu-inset-input w-full" value={editingCard.hint_points_cost} onChange={e => setEditingCard({ ...editingCard, hint_points_cost: parseInt(e.target.value) })} />
                </div>
                <div>
                    <label className="text-xs font-bold block mb-1">Max Per User</label>
                    <input type="number" className="neu-inset-input w-full" value={editingCard.max_cards_per_user} onChange={e => setEditingCard({ ...editingCard, max_cards_per_user: parseInt(e.target.value) })} />
                </div>
            </div>

            <div className="flex gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={editingCard.can_purchase} onChange={e => setEditingCard({ ...editingCard, can_purchase: e.target.checked })} /> Allow Purchase</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editingCard.can_open} onChange={e => setEditingCard({ ...editingCard, can_open: e.target.checked })} /> Allow Open</label>
            </div>

            <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-sm">Raffle Rewards ({(editingCard.raffle_pool || []).length})</h4>
                    <button onClick={() => setEditingReward({})} className="neu-button px-2 py-1 text-xs"><Plus size={12} /> Add Reward</button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {editingCard.raffle_pool?.map(reward => (
                        <div key={reward.id} className="bg-surface/30 p-2 rounded flex justify-between items-center text-sm">
                            <span>{reward.title} (x{reward.quantity})</span>
                            <button onClick={() => setEditingReward(reward)} className="neu-button p-1"><Edit size={12} /></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={handleSaveCard} className="neu-button active px-4 py-2 w-full"><Save size={16} className="inline mr-2" /> Save Card Config</button>
            </div>

            {editingReward && (
                <Modal isOpen onClose={() => setEditingReward(null)} title="Edit Reward">
                    <div className="space-y-3">
                        <input className="neu-inset-input w-full" placeholder="Reward Title" value={editingReward.title || ''} onChange={e => setEditingReward({ ...editingReward, title: e.target.value })} />
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold block mb-1">Type</label>
                                <select className="neu-inset-input w-full" value={editingReward.type || 'code'} onChange={e => setEditingReward({ ...editingReward, type: e.target.value as any })}>
                                    <option value="code">Code</option>
                                    <option value="whitelist">Whitelist</option>
                                    <option value="points">Points</option>
                                    <option value="tokens">Tokens</option>
                                    <option value="nft">NFT</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Quantity</label>
                                <input type="number" className="neu-inset-input w-full" value={editingReward.quantity || 1} onChange={e => setEditingReward({ ...editingReward, quantity: parseInt(e.target.value) })} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold block mb-1">Raffle Weight (Chance)</label>
                            <input type="number" className="neu-inset-input w-full" value={editingReward.rarity_weight || 10} onChange={e => setEditingReward({ ...editingReward, rarity_weight: parseInt(e.target.value) })} />
                        </div>
                        {/* Value fields based on type */}
                        <div>
                            <label className="text-xs font-bold block mb-1">Value (Code/Amount)</label>
                            <input className="neu-inset-input w-full" placeholder="Code or Amount"
                                value={editingReward.value?.code || editingReward.value?.amount || ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    setEditingReward({
                                        ...editingReward,
                                        value: { ...editingReward.value, code: val, amount: isNaN(Number(val)) ? 0 : Number(val) }
                                    });
                                }}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setEditingReward(null)} className="neu-button px-3 py-1">Cancel</button>
                            <button onClick={handleSaveReward} className="neu-button active px-3 py-1">Add/Update</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// 4. Dashboard
const CollabDashboard: React.FC<{ collabId: string }> = ({ collabId }) => {
    const [stats, setStats] = useState({
        purchases: 0,
        users: 0,
        pointsDistributed: 0,
        cardsOpened: 0
    });

    useEffect(() => {
        const loadStats = async () => {
            // In a real app we would have a dedicated aggregate API.
            // Here we might be limited, but let's try to load what we can.
            // This is heavy, in prod use summary tables.
            // For now, mock or minimal load.
            // We can get purchase count from MysteryCards for this collab.
            const card = await getMysteryCard(collabId);
            setStats({
                purchases: card?.purchased_count || 0,
                users: 0, // Need API
                pointsDistributed: 0, // Need API
                cardsOpened: 0
            });
        };
        loadStats();
    }, [collabId]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="neu-card p-4 text-center">
                <h4 className="text-2xl font-bold">{stats.purchases}</h4>
                <p className="text-xs text-on-surface-variant">Cards Sold</p>
            </div>
            <div className="neu-card p-4 text-center">
                <h4 className="text-2xl font-bold">-</h4>
                <p className="text-xs text-on-surface-variant">Participants</p>
            </div>
        </div>
    );
};

// --- Main Component ---

const ManageCollabs: React.FC = () => {
    const { allProjects, refreshData } = useSuperAdminContext();
    const { addToast } = useToast();

    const [collabs, setCollabs] = useState<Collaboration[]>([]);
    const [extraProjects, setExtraProjects] = useState<CollabProject[]>([]); // Projects from collab_projects table
    const [view, setView] = useState<'list' | 'edit'>('list');
    const [editingCollab, setEditingCollab] = useState<Partial<Collaboration>>({});

    // Sub-states for the editing collab
    const [editTasks, setEditTasks] = useState<CollaborationTask[]>([]);
    const [editMysteryCard, setEditMysteryCard] = useState<MysteryCard | null>(null);

    useEffect(() => {
        loadCollabs();
    }, []);

    const loadCollabs = async () => {
        const [collabData, extraProjData] = await Promise.all([
            getCollaborations(),
            getCollabProjects()
        ]);
        setCollabs(collabData);
        setExtraProjects(extraProjData);
    };

    const handleCreateNew = () => {
        setEditingCollab({
            id: uid(),
            title: '',
            slug: '',
            description: '',
            status: 'running',
            start_date: new Date().toISOString(),
            participating_projects: [],
            total_participants: 0,
            total_hint_points_distributed: 0,
            created_at: new Date().toISOString()
        });
        setEditTasks([]);
        setEditMysteryCard(null); // Will default in Manager
        setView('edit');
    };

    const handleEdit = async (collab: Collaboration) => {
        setEditingCollab(collab);
        // Load dependencies
        const [tasks, card] = await Promise.all([
            getCollabTasks(collab.id),
            getMysteryCard(collab.id)
        ]);
        setEditTasks(tasks);
        setEditMysteryCard(card || null);
        setView('edit');
    };

    const handleSaveAll = async () => {
        if (!editingCollab.title || !editingCollab.slug) {
            addToast('Title and Slug are required', 'error');
            return;
        }

        // 1. Save Collab
        const success = await addOrUpdateCollaboration(editingCollab as Collaboration);
        if (!success) {
            addToast('Failed to save collaboration', 'error');
            return;
        }

        // 2. Save Mystery Card (if initialized)
        if (editMysteryCard) {
            const cardSuccess = await addOrUpdateMysteryCard(editMysteryCard);
            if (!cardSuccess) console.warn('Failed to save mystery card');
        }

        // 3. Save Tasks (Tasks save individually in the component, but we ensure consistency here if needed)

        addToast('Collaboration saved successfully!', 'success');
        loadCollabs();
        setView('list');
    };



    if (view === 'list') {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-display font-bold text-on-surface">Manage Collaborations</h2>
                    <button onClick={handleCreateNew} className="neu-button active px-4 py-2 flex items-center gap-2">
                        <Plus size={18} /> New Collab
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collabs.map(collab => (
                        <div key={collab.id} className="neu-card p-4 space-y-3 relative group">
                            <div className="h-32 w-full bg-surface/50 rounded-md overflow-hidden mb-2">
                                {collab.banner_image && <img src={collab.banner_image} className="w-full h-full object-cover" />}
                            </div>
                            <h3 className="font-bold text-lg leading-tight">{collab.title}</h3>
                            <div className="flex justify-between text-sm text-on-surface-variant">
                                <span className={`px-2 py-0.5 rounded-full ${collab.status === 'running' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20'}`}>{collab.status}</span>
                                <span>{collab.participating_projects?.length || 0} Projects</span>
                            </div>

                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button onClick={() => handleEdit(collab)} className="neu-button p-2 bg-surface shadow-lg"><Edit size={16} /></button>
                            </div>
                        </div>
                    ))}
                    {collabs.length === 0 && <p>No collaborations found.</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setView('list')} className="text-on-surface-variant hover:text-on-surface">
                    Back to List
                </button>
                <h2 className="text-2xl font-bold">{editingCollab.id ? 'Edit Collaboration' : 'New Collaboration'}</h2>
            </div>

            {editingCollab.id && <CollabDashboard collabId={editingCollab.id} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Core Info */}
                <div className="space-y-6">
                    <div className="neu-card p-4 space-y-4">
                        <h3 className="font-bold flex items-center gap-2"><ScrollText size={18} /> Basic Info</h3>
                        <input
                            placeholder="Title"
                            className="neu-inset-input w-full font-bold text-lg"
                            value={editingCollab.title || ''}
                            onChange={e => setEditingCollab({ ...editingCollab, title: e.target.value })}
                        />
                        <input
                            placeholder="Slug (url-friendly-name)"
                            className="neu-inset-input w-full"
                            value={editingCollab.slug || ''}
                            onChange={e => setEditingCollab({ ...editingCollab, slug: e.target.value })}
                        />
                        <textarea
                            placeholder="Description"
                            className="neu-inset-input w-full min-h-[100px]"
                            value={editingCollab.description || ''}
                            onChange={e => setEditingCollab({ ...editingCollab, description: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Status</label>
                                <select
                                    className="neu-inset-input w-full"
                                    value={editingCollab.status || 'running'}
                                    onChange={e => setEditingCollab({ ...editingCollab, status: e.target.value as any })}
                                >
                                    <option value="running">Running</option>
                                    <option value="past">Past</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Start Date</label>
                                <input type="datetime-local" className="neu-inset-input w-full" value={editingCollab.start_date?.slice(0, 16) || ''} onChange={e => setEditingCollab({ ...editingCollab, start_date: new Date(e.target.value).toISOString() })} />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="text-xs font-bold block mb-1">Banner Image</label>
                            <ImageUploadInput
                                value={editingCollab.banner_image || ''}
                                onChange={val => setEditingCollab({ ...editingCollab, banner_image: val })}
                            />
                        </div>
                    </div>

                    {/* Merge projects for selector */}
                    <ProjectSelector
                        selectedProjectIds={editingCollab.participating_projects || []}
                        onChange={ids => setEditingCollab({ ...editingCollab, participating_projects: ids })}
                        allProjects={[
                            ...allProjects,
                            ...extraProjects.map(ep => ({
                                id: ep.id,
                                name: ep.name,
                                logo_url: ep.logo_url,
                                links: { twitter: ep.twitter_url, websites: [], discord: null } // Map twitter_url
                            } as any))
                        ]}
                        onAddCustomProject={async (proj) => {
                            const id = uid();
                            const success = await addOrUpdateCollabProject({
                                id,
                                name: proj.name!,
                                logo_url: proj.logo_url || '',
                                twitter_url: proj.twitter_url || '',
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            });
                            if (success) {
                                // Refresh local list
                                const newExtra = [...extraProjects, {
                                    id,
                                    name: proj.name!,
                                    logo_url: proj.logo_url || '',
                                    twitter_url: proj.twitter_url || '',
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                }];
                                setExtraProjects(newExtra);
                                return id;
                            }
                            return null;
                        }}
                    />
                </div>

                {/* Right Column: Logic/Config */}
                <div className="space-y-6">
                    {editingCollab.id ? (
                        <>
                            <TaskManager
                                tasks={editTasks}
                                onUpdate={setEditTasks}
                                collabId={editingCollab.id}
                            />

                            <MysteryCardManager
                                card={editMysteryCard}
                                onSave={setEditMysteryCard}
                                collabId={editingCollab.id}
                            />
                        </>
                    ) : (
                        <div className="neu-card p-8 text-center text-on-surface-variant">
                            Save the collaboration basic info first to add Tasks and Mystery Cards.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-border/10">
                <button onClick={handleSaveAll} className="neu-button active px-8 py-3 font-bold text-lg flex items-center gap-2">
                    <Save size={20} /> Save Collaboration
                </button>
            </div>
        </div>
    );
};

export default ManageCollabs;
