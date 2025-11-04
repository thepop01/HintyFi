import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Coin } from '../../src/types';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import { useToast } from '../../context/ToastContext';
import { addOrUpdateMeme, deleteItem, getMemes } from '../../src/services/dataService';
import { motion } from 'framer-motion';
import { Edit, Save, X, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import ConfirmationModal from '../common/ConfirmationModal';

// Reusable form components
const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-2 items-center mb-2">{children}</div>;
const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => <label className="font-semibold text-on-surface-variant text-sm text-right">{children}</label>;
const FormField: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className="neu-inset-input w-full !py-1.5 !text-sm" />;
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => <select {...props} className="neu-inset-input neu-select w-full !py-1.5 !text-sm">{props.children}</select>;

const ManageMemeTab: React.FC = () => {
    const { refreshData } = useSuperAdminContext();
    const { addToast } = useToast();
    const [memes, setMemes] = useState<any[]>([]);
    const [editingMemeId, setEditingMemeId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<any>>({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any | null>(null);
    const [viewMode, setViewMode] = useState<'all' | 'draft'>('all');

    useEffect(() => {
        const fetchMemes = async () => {
            const data = await getMemes();
            setMemes(data);
        };
        fetchMemes();
    }, [refreshData]);

    const filteredMemes = useMemo(() => {
        if (viewMode === 'draft') {
            return memes.filter(m => m.status === 'draft');
        }
        return memes;
    }, [memes, viewMode]);
    
    const handleEdit = (meme: any) => {
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

    const handleSave = async () => {
        if (!editingMemeId) return;

        const success = await addOrUpdateMeme(formData);
        if (success) {
            addToast('Meme coin updated!', 'success');
            refreshData();
            handleCancel();
        } else {
            addToast('Failed to update meme coin.', 'error');
        }
    };
    
    const handleDeleteClick = (meme: any) => {
        setItemToDelete(meme);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        const success = await deleteItem('memes', itemToDelete.id);
        if (success) {
            addToast(`Meme coin "${itemToDelete.name}" deleted.`, 'success');
            refreshData();
        } else {
            addToast('Failed to delete meme coin.', 'error');
        }
        setIsConfirmOpen(false);
        setItemToDelete(null);
    };

    const handleChange = (field: keyof any, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };
    
    const handlePublish = async (memeToUpdate: any) => {
        const success = await addOrUpdateMeme({ ...memeToUpdate, status: 'published' });
        if (success) {
            addToast(`Meme coin is now published.`, 'success');
            refreshData();
        } else {
            addToast('Failed to update status.', 'error');
        }
    };


    return (
        <div className="neu-card p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-display font-bold text-on-surface">Manage Meme Coins</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode(prev => prev === 'all' ? 'draft' : 'all')}
                        className="neu-button px-4 py-2"
                    >
                        {viewMode === 'all' ? 'View Drafts' : 'View All'}
                    </button>
                    <Link
                        to="/super-admin/memes/add"
                        className="neu-button active px-4 py-2 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Meme
                    </Link>
                </div>
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
                        {filteredMemes.map(meme => (
                            <React.Fragment key={meme.id}>
                                <tr className="border-b border-border/10">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <img src={meme.image_url} alt={meme.name} className="w-8 h-8 rounded-full" />
                                            <span className="font-semibold">{meme.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-on-surface-variant">{meme.project_id}</td>
                                    <td className="p-3">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meme.status === 'published' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                            {meme.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {meme.status === 'draft' && (
                                                <button onClick={() => handlePublish(meme)} className="neu-button active px-3 py-1 text-sm">
                                                    Publish
                                                </button>
                                            )}
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
                                                <FormRow><FormLabel>Contract</FormLabel><FormField><FormInput value={formData.contract_address || ''} onChange={e => handleChange('contract_address', e.target.value)} /></FormField></FormRow>
                                                <FormRow><FormLabel>Link</FormLabel><FormField><FormInput value={formData.link || ''} onChange={e => handleChange('link', e.target.value)} /></FormField></FormRow>
                                                <FormRow><FormLabel>Image URL</FormLabel><FormField><FormInput value={formData.image_url || ''} onChange={e => handleChange('image_url', e.target.value)} /></FormField></FormRow>
                                                <FormRow><FormLabel>Supply</FormLabel><FormField><FormInput value={formData.supply || ''} onChange={e => handleChange('supply', e.target.value)} /></FormField></FormRow>
                                                <FormRow><FormLabel>Market Price</FormLabel><FormField><FormInput value={formData.market_price || ''} onChange={e => handleChange('market_price', e.target.value)} /></FormField></FormRow>
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