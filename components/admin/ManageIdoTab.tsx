import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Project, Ido } from '../../src/types';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import { useToast } from '../../context/ToastContext';
import { addOrUpdateIdo, deleteItem, getIdos } from '../../src/services/dataService';
import { motion } from 'framer-motion';
import { Edit, Save, X, Plus, ChevronDown, Trash2 } from 'lucide-react';
import ImageUploadInput from '../common/ImageUploadInput';
import ConfirmationModal from '../common/ConfirmationModal';

const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => <label className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className="neu-inset-input w-full" />;

const ManageIdoTab: React.FC = () => {
    const { refreshData } = useSuperAdminContext();
    const [idos, setIdos] = useState<any[]>([]);
    const { addToast } = useToast();
    const [editingIdoId, setEditingIdoId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Ido>>({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any | null>(null);
    const [viewMode, setViewMode] = useState<'all' | 'draft'>('all');


    useEffect(() => {
        const fetchIdos = async () => {
            const data = await getIdos();
            setIdos(data);
        };
        fetchIdos();
    }, [refreshData]);

    const filteredIdos = useMemo(() => {
        if (viewMode === 'draft') {
            return idos.filter(p => p.status === 'draft');
        }
        return idos;
    }, [idos, viewMode]);

    const handleEdit = (ido: any) => {
        if (editingIdoId === ido.id) {
            setEditingIdoId(null);
            setFormData({});
        } else {
            setEditingIdoId(ido.id);
            setFormData(ido);
        }
    };

    const handleCancel = () => {
        setEditingIdoId(null);
        setFormData({});
    };
    
    const handleSave = async () => {
        if (!editingIdoId) return;
        const success = await addOrUpdateIdo(formData);
        if (success) {
            addToast('IDO details updated!', 'success');
            refreshData();
            handleCancel();
        } else {
            addToast('Failed to update IDO details.', 'error');
        }
    };
    
    const handleDeleteClick = (ido: any) => {
        setItemToDelete(ido);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        const success = await deleteItem('idos', itemToDelete.id);
        if (success) {
            addToast(`IDO Project "${itemToDelete.name}" deleted.`, 'success');
            refreshData();
        } else {
            addToast('Failed to delete project.', 'error');
        }
        setIsConfirmOpen(false);
        setItemToDelete(null);
    };
    
    const handleIdoChange = (field: keyof Ido, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handlePublish = async (idoToUpdate: any) => {
        const success = await addOrUpdateIdo({ ...idoToUpdate, status: 'published' });
        if (success) {
            addToast('IDO published!', 'success');
            refreshData();
        } else {
            addToast('Failed to publish IDO.', 'error');
        }
    };

    return (
        <div className="neu-card p-4">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-display font-bold text-on-surface">Manage IDO Details</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode(prev => prev === 'all' ? 'draft' : 'all')}
                        className="neu-button px-4 py-2"
                    >
                        {viewMode === 'all' ? 'View Drafts' : 'View All'}
                    </button>
                    <Link
                        to="/super-admin/idos/add"
                        className="neu-button active px-4 py-2 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add IDO
                    </Link>
                </div>
            </div>
            <div className="space-y-3">
                {filteredIdos.map(ido => (
                    <div key={ido.id} className="neu-outset-card rounded-lg overflow-hidden">
                        <div 
                            className="p-3 flex items-center justify-between cursor-pointer"
                            onClick={() => handleEdit(ido)}
                        >
                            <div className="flex items-center gap-3">
                                <img src={ido.logo_url} alt={ido.name} className="w-10 h-10 rounded-md object-cover bg-surface" />
                                <div>
                                    <p className="font-bold">{ido.name}</p>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ido.status === 'published' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                        {ido.status}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                               {ido.status === 'draft' && (
                                   <button
                                       onClick={(e) => { e.stopPropagation(); handlePublish(ido); }}
                                       className="neu-button active px-3 py-1 text-sm"
                                   >
                                       Publish
                                   </button>
                               )}
                               <span className="text-sm font-semibold text-on-surface-variant">Details</span>
                               <motion.div animate={{ rotate: editingIdoId === ido.id ? 180 : 0 }}>
                                   <ChevronDown size={20} />
                               </motion.div>
                               <button
                                   onClick={(e) => { e.stopPropagation(); handleDeleteClick(ido); }}
                                   className="neu-button p-2 hover:!text-red-500"
                                   title="Delete Project"
                               >
                                   <Trash2 size={16} />
                               </button>
                           </div>
                        </div>
                        {editingIdoId === ido.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="border-t border-border/10">
                               <div className="p-4 space-y-4">
                                <FormRow><FormLabel>Raising Amount</FormLabel><FormInput value={formData.raise_amount || ''} onChange={e => handleIdoChange('raise_amount', e.target.value)} /></FormRow>
                                <FormRow><FormLabel>Valuation</FormLabel><FormInput value={formData.valuation || ''} onChange={e => handleIdoChange('valuation', e.target.value)} /></FormRow>
                                <FormRow><FormLabel>Supply</FormLabel><FormInput value={formData.supply || ''} onChange={e => handleIdoChange('supply', e.target.value)} /></FormRow>
                                <FormRow><FormLabel>Date</FormLabel><FormInput type="date" value={formData.ido_date || ''} onChange={e => handleIdoChange('ido_date', e.target.value)} /></FormRow>
                                <FormRow><FormLabel>Price</FormLabel><FormInput value={formData.price || ''} onChange={e => handleIdoChange('price', e.target.value)} /></FormRow>
                                <div className="flex justify-end gap-2 mt-3">
                                        <button onClick={handleCancel} className="neu-button px-4 py-1.5"><X size={16} /></button>
                                        <button onClick={handleSave} className="neu-button active px-4 py-1.5"><Save size={16} /></button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>
             <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title={`Delete "${itemToDelete?.name}"?`}
                confirmText="Delete"
            >
                Are you sure you want to delete this IDO project? This cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

export default ManageIdoTab;