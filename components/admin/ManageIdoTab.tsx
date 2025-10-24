
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../../src/types';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import { useToast } from '../../context/ToastContext';
import { addOrUpdateProject, deleteItem } from '../../src/services/dataService';
import { motion } from 'framer-motion';
import { Edit, Save, X, Plus, ChevronDown, Trash2 } from 'lucide-react';
import ImageUploadInput from '../common/ImageUploadInput';
import ConfirmationModal from '../common/ConfirmationModal';

const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => <label className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className="neu-inset-input w-full" />;

const ManageIdoTab: React.FC = () => {
    const { allProjects, refreshData } = useSuperAdminContext();
    const { addToast } = useToast();
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Project>>({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Project | null>(null);


    const launchpadProjects = useMemo(() => {
        return allProjects.filter(p => p.category.includes('launchpad'));
    }, [allProjects]);

    const handleEdit = (project: Project) => {
        if (editingProjectId === project.id) {
            setEditingProjectId(null);
            setFormData({});
        } else {
            setEditingProjectId(project.id);
            setFormData(project);
        }
    };

    const handleCancel = () => {
        setEditingProjectId(null);
        setFormData({});
    };
    
    const handleSave = () => {
        if (!editingProjectId) return;
        const success = addOrUpdateProject(formData as Project);
        if (success) {
            addToast('IDO details updated!', 'success');
            refreshData();
            handleCancel();
        } else {
            addToast('Failed to update IDO details.', 'error');
        }
    };
    
    const handleDeleteClick = (project: Project) => {
        setItemToDelete(project);
        setIsConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        if (deleteItem('projects', itemToDelete.id)) {
            addToast(`IDO Project "${itemToDelete.name}" deleted.`, 'success');
            refreshData();
        } else {
            addToast('Failed to delete project.', 'error');
        }
        setIsConfirmOpen(false);
        setItemToDelete(null);
    };
    
    const handleIdoChange = (field: keyof NonNullable<Project['idoDetails']>, value: string) => {
        setFormData(prev => ({ ...prev, idoDetails: { ...(prev.idoDetails || { tokenPrice: '', vestingSchedule: '', totalSupply: '' }), [field]: value } }));
    };
    
    const handleProjectChange = (field: keyof Project, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    return (
        <div className="neu-card p-4">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-display font-bold text-on-surface">Manage IDO Details</h2>
                 <Link
                    to="/super-admin/idos/add"
                    className="neu-button active px-4 py-2 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add IDO
                </Link>
            </div>
            <div className="space-y-3">
                {launchpadProjects.map(project => (
                    <div key={project.id} className="neu-outset-card rounded-lg overflow-hidden">
                        <div 
                            className="p-3 flex items-center justify-between cursor-pointer"
                            onClick={() => handleEdit(project)}
                        >
                            <div className="flex items-center gap-3">
                                <img src={project.logo} alt={project.name} className="w-10 h-10 rounded-md object-cover bg-surface" />
                                <div>
                                    <p className="font-bold">{project.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-on-surface-variant">Details</span>
                                <motion.div animate={{ rotate: editingProjectId === project.id ? 180 : 0 }}>
                                    <ChevronDown size={20} />
                                </motion.div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(project); }} 
                                    className="neu-button p-2 hover:!text-red-500" 
                                    title="Delete Project"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        {editingProjectId === project.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="border-t border-border/10">
                               <div className="p-4 space-y-4">
                                    <FormRow><FormLabel>Token Price</FormLabel><FormInput value={formData.idoDetails?.tokenPrice || ''} onChange={e => handleIdoChange('tokenPrice', e.target.value)} /></FormRow>
                                    <FormRow><FormLabel>Vesting</FormLabel><FormInput value={formData.idoDetails?.vestingSchedule || ''} onChange={e => handleIdoChange('vestingSchedule', e.target.value)} /></FormRow>
                                    <FormRow><FormLabel>Total Supply</FormLabel><FormInput value={formData.idoDetails?.totalSupply || ''} onChange={e => handleIdoChange('totalSupply', e.target.value)} /></FormRow>
                                    <FormRow><FormLabel>Raise</FormLabel><FormInput value={formData.raise || ''} onChange={e => handleProjectChange('raise', e.target.value)} /></FormRow>
                                    <FormRow><FormLabel>Name</FormLabel><FormInput value={formData.name || ''} onChange={e => handleProjectChange('name', e.target.value)} /></FormRow>
                                    <FormRow><FormLabel>Logo</FormLabel><ImageUploadInput value={formData.logo || ''} onChange={val => handleProjectChange('logo', val)} /></FormRow>
                                    <FormRow><FormLabel>Banner</FormLabel><ImageUploadInput value={formData.banner || ''} onChange={val => handleProjectChange('banner', val)} /></FormRow>
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
      