import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Project, DiscordRole, Perk, PerkType } from '../../../src/types';
import { useToast } from '../../../context/ToastContext';
import { addOrUpdateProject } from '../../../src/services/dataService';
import { uid } from '../../../utils/helpers';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { Edit, Trash2, Plus, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataRefresher } from '../../../hooks/useDataRefresher';

// Reusable form components
const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => <label htmlFor={htmlFor} className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormField: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;
const inputBaseClasses = "neu-inset-input w-full";
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className={`${inputBaseClasses} ${props.className}`} />;
const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => <textarea {...props} className={`${inputBaseClasses}`} rows={props.rows || 3} />;
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => <select {...props} className={`${inputBaseClasses} neu-select`}>{props.children}</select>;
const FormSectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-lg font-display font-bold text-on-surface mb-3 mt-6 border-b-2 border-primary/20 pb-2">{children}</h3>;

// Role Form Component
const RoleForm: React.FC<{ role?: Partial<DiscordRole> | null; onSave: (role: DiscordRole) => void; onClose: () => void }> = ({ role, onSave, onClose }) => {
    const getInitialFormData = (role: Partial<DiscordRole> | null | undefined): Partial<DiscordRole> => ({
        name: role?.name || '',
        serverId: role?.serverId || '',
        roleId: role?.roleId || uid(),
        description: role?.description || '',
        perks: role?.perks && role.perks.length > 0 ? role.perks : [{ type: 'FCFS', description: '' }],
    });

    const [formData, setFormData] = useState<Partial<DiscordRole>>(getInitialFormData(role));

    useEffect(() => {
        setFormData(getInitialFormData(role));
    }, [role]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePerkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, index: number) => {
        const { name, value } = e.target;
        const newPerks = [...(formData.perks || [])];
        newPerks[index] = { ...newPerks[index], [name]: value } as Perk;
        setFormData(prev => ({ ...prev, perks: newPerks }));
    };

    const addPerk = () => {
        // FIX: Explicitly type the new perk to match PerkType and avoid type inference issues with string literals.
        const newPerk: Perk = { type: 'FCFS' as PerkType, description: '' };
        const newPerks = [...(formData.perks || []), newPerk];
        setFormData(prev => ({ ...prev, perks: newPerks }));
    };
    
    const removePerk = (index: number) => {
        const newPerks = (formData.perks || []).filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, perks: newPerks }));
    };


    const handleSubmit = () => {
        if (!formData.name || !formData.roleId) {
            alert('Please fill in Role Name and Role ID.');
            return;
        }
        onSave(formData as DiscordRole);
    };

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <h3 className="text-xl font-display font-bold text-on-surface mb-4">{role ? 'Edit Discord Role' : 'Create New Discord Role'}</h3>
             <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                <FormRow><FormLabel>Role Name</FormLabel><FormField><FormInput name="name" value={formData.name} onChange={handleChange} required /></FormField></FormRow>
                <FormRow><FormLabel>Role ID</FormLabel><FormField><FormInput name="roleId" value={formData.roleId} onChange={handleChange} required /></FormField></FormRow>
                <FormRow><FormLabel>Server ID</FormLabel><FormField><FormInput name="serverId" value={formData.serverId} onChange={handleChange} /></FormField></FormRow>
                <FormRow><FormLabel>Description</FormLabel><FormField><FormTextArea name="description" value={formData.description} onChange={handleChange} /></FormField></FormRow>

                <FormSectionHeader>Perk Details</FormSectionHeader>
                <div className="space-y-3">
                    {(formData.perks || []).map((perk, index) => (
                        <div key={index} className="p-3 neu-outset-card relative">
                             <button type="button" onClick={() => removePerk(index)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                             <FormRow><FormLabel>Perk Type</FormLabel><FormField><FormSelect name="type" value={perk.type} onChange={e => handlePerkChange(e, index)}>
                                <option value="Airdrop">Airdrop</option>
                                <option value="GTD">Guaranteed (GTD)</option>
                                <option value="FCFS">First-Come, First-Served (FCFS)</option>
                                <option value="Free Mint">Free Mint</option>
                            </FormSelect></FormField></FormRow>
                            <FormRow><FormLabel>Perk Description</FormLabel><FormField><FormTextArea name="description" value={perk.description} onChange={e => handlePerkChange(e, index)} /></FormField></FormRow>
                        </div>
                    ))}
                </div>
                 <button type="button" onClick={addPerk} className="neu-button px-3 py-1 text-sm flex items-center gap-1 mt-3"><Plus size={14} /> Add Another Perk</button>
            </div>
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-border/20">
                <button type="button" onClick={onClose} className="neu-button px-4 py-2 font-bold">Cancel</button>
                <button type="button" onClick={handleSubmit} className="neu-button active px-4 py-2 font-bold flex items-center gap-2"><Save size={16} /> Save Role</button>
            </div>
        </form>
    );
};


// Main Page Component
const AdminProjectDiscordRolesPage: React.FC = () => {
    const { project } = useOutletContext<{ project: Project }>();
    const { addToast } = useToast();
    const { dataVersion, refreshData } = useDataRefresher();

    const [roles, setRoles] = useState(project.discordRoles || []);
    const [isCreating, setIsCreating] = useState(false);
    const [editingRole, setEditingRole] = useState<DiscordRole | null>(null);
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<DiscordRole | null>(null);

    useEffect(() => {
        setRoles(project.discordRoles || []);
    }, [project.discordRoles, dataVersion]);

    const handleSaveRole = (roleData: Partial<DiscordRole>) => {
        const isNew = isCreating;
        
        let newRoles;
        if (isNew) {
            newRoles = [...roles, { ...roleData, id: uid() } as DiscordRole];
        } else {
            newRoles = roles.map(r => r.id === (editingRole || roleData).id ? { ...r, ...roleData } : r);
        }
        
        const updatedProject = { ...project, discordRoles: newRoles };
        const success = addOrUpdateProject(updatedProject);

        if(success) {
            const action = isNew ? 'created' : 'updated';
            addToast(`Role ${action}!`, 'success');
            refreshData();
            setIsCreating(false);
            setEditingRole(null);
            setEditingRoleId(null);
        } else {
            addToast('Failed to save role.', 'error');
        }
    };

    const handleEditClick = (role: DiscordRole) => {
        const newEditingRoleId = editingRoleId === role.id ? null : role.id;
        setEditingRoleId(newEditingRoleId);
        setEditingRole(newEditingRoleId ? role : null);
        setIsCreating(false); // Close the create form if it's open
    };

    const handleDelete = (role: DiscordRole) => {
        setRoleToDelete(role);
    };

    const confirmDelete = () => {
        if (!roleToDelete) return;

        const newRoles = roles.filter(r => r.id !== roleToDelete.id);
        const updatedProject = { ...project, discordRoles: newRoles };
        const success = addOrUpdateProject(updatedProject);

        if(success) {
            addToast('Role deleted successfully!', 'success');
            refreshData();
        } else {
            addToast('Failed to delete role.', 'error');
        }
        setRoleToDelete(null);
    };
    
    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-display font-bold text-on-surface">Manage Discord Roles</h2>
                <button onClick={() => { setIsCreating(!isCreating); setEditingRoleId(null); }} className="neu-button active px-4 py-2 flex items-center gap-2">
                    <Plus size={18} /> {isCreating ? 'Cancel' : 'Add New Role'}
                </button>
            </div>
            
             <AnimatePresence>
                {isCreating && (
                    <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="neu-card p-4 my-4">
                            <RoleForm onSave={handleSaveRole} onClose={() => setIsCreating(false)} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="neu-card p-4 space-y-3">
                {roles.length > 0 ? roles.map(role => (
                    <div key={role.id} className="neu-outset-card overflow-hidden">
                        <div className="p-3 flex items-center justify-between gap-4">
                            <div className="flex-grow min-w-0">
                                <p className="font-bold">{role.name}</p>
                                <p className="text-sm text-on-surface-variant line-clamp-2">
                                    {(role.perks || []).map(p => `${p.type}: ${p.description}`).join(' | ')}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => handleEditClick(role)} className="neu-control p-2"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(role)} className="neu-control p-2 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <AnimatePresence>
                            {editingRoleId === role.id && (
                                <motion.div
                                    layout
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-border/10 p-4 bg-surface/20"
                                >
                                    <RoleForm
                                        role={editingRole}
                                        onSave={handleSaveRole}
                                        onClose={() => { setEditingRoleId(null); setEditingRole(null); }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )) : (
                    <p className="text-center py-8 text-on-surface-variant">No Discord roles with perks have been added yet.</p>
                )}
            </div>
            
            <ConfirmationModal isOpen={!!roleToDelete} onClose={() => setRoleToDelete(null)} onConfirm={confirmDelete} title={`Delete "${roleToDelete?.name}"?`} confirmText="Delete">This action cannot be undone.</ConfirmationModal>
        </div>
    );
};

export default AdminProjectDiscordRolesPage;