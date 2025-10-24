







import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Coin, Project } from '../../src/types';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import { useToast } from '../../context/ToastContext';
import { addOrUpdateProject } from '../../src/services/dataService';
import { motion } from 'framer-motion';
import { Edit, Save, X, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import ConfirmationModal from '../common/ConfirmationModal';

// Reusable form components
const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-2 items-center mb-2">{children}</div>;
const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => <label className="font-semibold text-on-surface-variant text-sm text-right">{children}</label>;
const FormField: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className="neu-inset-input w-full !py-1.5 !text-sm" />;
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => <select {...props} className="neu-inset-input neu-select w-full !py-1.5 !text-sm">{props.children}</select>;

type EditableMeme = Coin & { projectId: string; projectName: string; };

const ManageMemeTab: React.FC = () => {
    const { allProjects, refreshData } = useSuperAdminContext();
    const { addToast } = useToast();
    const [editingMemeId, setEditingMemeId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Coin>>({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<EditableMeme | null>(null);

    const allMemes = useMemo(() => {
        return allProjects.flatMap(p =>
            (p.coins || [])
                .filter(c => c.type === 'meme')
                .map(c => ({
                    ...c,
                    projectId: p.id,
                    projectName: p.name
                }))
        );
    }, [allProjects]);
    
    const handleEdit = (meme: EditableMeme) => {
        if (editingMemeId === meme.id) {
            setEditingMemeId(null);
            setFormData({});
        } else {
            setEditingMemeId(meme.id);
            setFormData(meme);
        }
    };
    
    const handleCancel = () => {
        setEditingMemeId(null);
        setFormData({});
    };

    const handleSave = () => {
        if (!editingMemeId) return;

        const originalMeme = allMemes.find(m => m.id === editingMemeId);
        if (!originalMeme) {
            addToast('Could not find original meme coin.', 'error');
            return;
        }

        const project = allProjects.find(p => p.id === originalMeme.projectId);
        if (!project) {
            addToast('Could not find parent project.', 'error');
            return;
        }

        const newCoins = (project.coins || []).map(c => {
            if (c.id === editingMemeId) {
                // FIX: Spreading formData directly widens literal types (e.g. 'status' becomes a generic string).
                // This logic uses type guards to ensure the correct literal types are maintained.
                const updatedCoin: Coin = {
                    ...c,
                    name: formData.name ?? c.name,
                    contractAddress: formData.contractAddress ?? c.contractAddress,
                    link: formData.link ?? c.link,
                    image: formData.image ?? c.image,
                    supply: formData.supply ?? c.supply,
                    marketPrice: formData.marketPrice ?? c.marketPrice,
                    status: (formData.status === 'published' || formData.status === 'draft') ? formData.status : c.status,
                    type: (formData.type === 'meme' || formData.type === 'ecosystem') ? formData.type : c.type,
                    network: (formData.network === 'mainnet' || formData.network === 'testnet') ? formData.network : c.network,
                };
                return updatedCoin;
            }
            return c;
        });

        const success = addOrUpdateProject({ ...project, coins: newCoins });
        if (success) {
            addToast('Meme coin updated!', 'success');
            refreshData();
            handleCancel();
        } else {
            addToast('Failed to update meme coin.', 'error');
        }
    };
    
    const handleDeleteClick = (meme: EditableMeme) => {
        setItemToDelete(meme);
        setIsConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        const project = allProjects.find(p => p.id === itemToDelete.projectId);
        if (!project) {
            addToast('Could not find parent project to delete coin from.', 'error');
            setIsConfirmOpen(false);
            return;
        }
        const newCoins = (project.coins || []).filter(c => c.id !== itemToDelete.id);
        const success = addOrUpdateProject({ ...project, coins: newCoins });
        if (success) {
            addToast(`Meme coin "${itemToDelete.name}" deleted.`, 'success');
            refreshData();
        } else {
            addToast('Failed to delete meme coin.', 'error');
        }
        setIsConfirmOpen(false);
        setItemToDelete(null);
    };

    const handleChange = (field: keyof Omit<Coin, 'id'>, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };
    
    const handleStatusToggle = (memeToUpdate: EditableMeme) => {
        const project = allProjects.find(p => p.id === memeToUpdate.projectId);
        if (!project) {
            addToast('Could not find parent project.', 'error');
            return;
        }

        // FIX: Explicitly type `newStatus` to prevent TypeScript from widening it to a generic `string`.
        const newStatus: 'published' | 'draft' = memeToUpdate.status === 'published' ? 'draft' : 'published';
        const newCoins = (project.coins || []).map(c =>
            c.id === memeToUpdate.id ? { ...c, status: newStatus } : c
        );
        
        const success = addOrUpdateProject({ ...project, coins: newCoins });
        if (success) {
            addToast(`Meme coin is now ${newStatus === 'published' ? 'displayed' : 'hidden'}.`, 'success');
            refreshData();
        } else {
            addToast('Failed to update status.', 'error');
        }
    };


    return (
        <div className="neu-card p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-display font-bold text-on-surface">Manage Meme Coins</h2>
                <Link
                    to="/super-admin/memes/add"
                    className="neu-button active px-4 py-2 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Meme
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-surface/50">
                        <tr>
                            <th className="p-3 text-left text-sm font-bold text-on-surface-variant">Coin</th>
                            <th className="p-3 text-left text-sm font-bold text-on-surface-variant">Project</th>
                            <th className="p-3 text-left text-sm font-bold text-on-surface-variant">Display Status</th>
                            <th className="p-3 text-center text-sm font-bold text-on-surface-variant">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allMemes.map(meme => (
                            <React.Fragment key={meme.id}>
                                <tr className="border-b border-border/10">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <img src={meme.image} alt={meme.name} className="w-8 h-8 rounded-full" />
                                            <span className="font-semibold">{meme.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-on-surface-variant">{meme.projectName}</td>
                                    <td className="p-3">
                                        <button onClick={() => handleStatusToggle(meme)} className={`neu-button px-3 py-1 text-sm flex items-center gap-2 ${meme.status === 'published' ? 'active' : ''}`}>
                                            {meme.status === 'published' ? <Eye size={14} /> : <EyeOff size={14} />}
                                            <span>{meme.status === 'published' ? 'Displayed' : 'Hidden'}</span>
                                        </button>
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleEdit(meme)} className="neu-button px-3 py-1 text-sm flex items-center gap-1">
                                                <Edit size={14} /> {editingMemeId === meme.id ? 'Close' : 'Edit'}
                                            </button>
                                            <button onClick={() => handleDeleteClick(meme)} className="neu-button p-2 hover:!text-red-500" title="Delete">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {editingMemeId === meme.id && (
                                    <tr>
                                        <td colSpan={4} className="p-0 bg-surface/20">
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-4">
                                                <FormRow><FormLabel>Name</FormLabel><FormField><FormInput value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} /></FormField></FormRow>
                                                <FormRow><FormLabel>Contract</FormLabel><FormField><FormInput value={formData.contractAddress || ''} onChange={e => handleChange('contractAddress', e.target.value)} /></FormField></FormRow>
                                                <FormRow><FormLabel>Link</FormLabel><FormField><FormInput value={formData.link || ''} onChange={e => handleChange('link', e.target.value)} /></FormField></FormRow>
                                                <FormRow><FormLabel>Image URL</FormLabel><FormField><FormInput value={formData.image || ''} onChange={e => handleChange('image', e.target.value)} /></FormField></FormRow>
                                                <FormRow><FormLabel>Supply</FormLabel><FormField><FormInput value={formData.supply || ''} onChange={e => handleChange('supply', e.target.value)} /></FormField></FormRow>
                                                <FormRow><FormLabel>Market Price</FormLabel><FormField><FormInput value={formData.marketPrice || ''} onChange={e => handleChange('marketPrice', e.target.value)} /></FormField></FormRow>
                                                <FormRow>
                                                    <FormLabel>Status</FormLabel>
                                                    <FormField>
                                                        <FormSelect value={formData.status || 'draft'} onChange={e => handleChange('status', e.target.value)}>
                                                            <option value="draft">Hidden</option>
                                                            <option value="published">Displayed</option>
                                                        </FormSelect>
                                                    </FormField>
                                                </FormRow>
                                                <div className="flex justify-end gap-2 mt-3">
                                                    <button onClick={handleCancel} className="neu-button px-4 py-1.5"><X size={16} /></button>
                                                    <button onClick={handleSave} className="neu-button active px-4 py-1.5"><Save size={16} /></button>
                                                </div>
                                            </motion.div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
             <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title={`Delete "${itemToDelete?.name}"?`}
                confirmText="Delete"
            >
                Are you sure you want to delete this meme coin? This cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

export default ManageMemeTab;