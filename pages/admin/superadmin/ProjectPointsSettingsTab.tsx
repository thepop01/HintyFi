

import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Project, PointTier, DiscordRole, NftCollection } from '../../../src/types';
import { useToast } from '../../../context/ToastContext';
import { addOrUpdateProject, getProjectById } from '../../../src/services/dataService';
import { motion } from 'framer-motion';
// FIX: Import the 'uid' utility function.
import { Plus, Trash2, Shield, Gem, Banknote, Crown } from 'lucide-react';
import Loader from '../../../components/common/Loader';
import { uid } from '../../../utils/helpers';
// FIX: Corrected import path for useSuperAdminContext.
import { useSuperAdminContext } from '../../../context/SuperAdminContext';
import ImageUploadInput from '../../../components/common/ImageUploadInput';

// Reusable form components
const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-center mb-2">{children}</div>;
const FormLabel: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => <label htmlFor={htmlFor} className="font-semibold text-on-surface-variant text-sm md:text-right">{children}</label>;
const FormField: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;
const inputBaseClasses = "neu-inset-input w-full !py-1.5 !text-sm";
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className={`${inputBaseClasses} ${props.className}`} />;
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => <select {...props} className={`${inputBaseClasses} neu-select`}>{props.children}</select>;
const FormSectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="flex items-center gap-2 text-xl font-display font-bold text-on-surface mb-4 mt-8 border-b-2 border-primary/20 pb-2">{children}</h3>
);

const ProjectPointsSettingsTab: React.FC = () => {
    const { project: initialProject } = useOutletContext<{ project: Project }>();
    const navigate = useNavigate();
    const { addToast } = useToast();
    // FIX: Correctly import and use the Super Admin context hook.
    const { refreshData } = useSuperAdminContext();

    const project = useMemo(() => {
        if (!initialProject.id) return null;
        return getProjectById(initialProject.id);
    }, [initialProject.id]);

    const [formData, setFormData] = useState<Project | null>(project);

    if (!formData) {
        return <Loader message="Loading project data..." />;
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => (prev ? { ...prev, [name]: value } : null));
    };

    const toggleCrowned = () => {
        if (!formData) return;
        const updatedProject = { ...formData, isCrowned: !formData.isCrowned };
        if (addOrUpdateProject(updatedProject)) {
            addToast(`${formData.name} has been ${updatedProject.isCrowned ? 'crowned' : 'uncrowned'}.`, 'success');
            setFormData(updatedProject); // Update local state for immediate UI feedback
            refreshData(); // Trigger data refresh in parent layout
        } else {
            addToast('Failed to update crowned status.', 'error');
        }
    };

    // --- Role Handlers ---
    const handleRoleChange = (index: number, field: keyof Omit<DiscordRole, 'perk'>, value: string | number) => {
        setFormData(prev => {
            if (!prev) return null;
            const newRoles = [...(prev.discordRoles || [])];
            (newRoles[index] as any)[field] = value;
            return { ...prev, discordRoles: newRoles };
        });
    };
    const addRole = () => {
        setFormData(prev => {
            if (!prev) return null;
            const newRole: DiscordRole = { serverId: '', roleId: '', name: '', description: '', points: 0 };
            return { ...prev, discordRoles: [...(prev.discordRoles || []), newRole] };
        });
    };
    const removeRole = (index: number) => {
        setFormData(prev => {
            if (!prev) return null;
            return { ...prev, discordRoles: prev.discordRoles?.filter((_, i) => i !== index) };
        });
    };
    
    // --- NFT Collection Handlers ---
    const handleCollectionChange = (index: number, field: keyof Omit<NftCollection, 'perks' | 'id'>, value: string | number) => {
        setFormData(prev => {
            if (!prev) return null;
            const newCollections = [...(prev.nftCollections || [])];
            (newCollections[index] as any)[field] = value;
            return { ...prev, nftCollections: newCollections };
        });
    };
    
    const addCollection = () => {
        setFormData(prev => {
            if (!prev) return null;
            // FIX: Added missing 'status' property to align with the NftCollection type definition.
            const newCollection: NftCollection = { id: uid(), name: '', image: '', contractAddress: '', link: '', network: 'mainnet', perks: [], status: 'draft' };
            return { ...prev, nftCollections: [...(prev.nftCollections || []), newCollection] };
        });
    };
    const removeCollection = (index: number) => {
        setFormData(prev => {
            if (!prev) return null;
            return { ...prev, nftCollections: prev.nftCollections?.filter((_, i) => i !== index) };
        });
    };

    // --- Token Settings Handlers ---
    const handleTokenSettingsChange = (field: keyof NonNullable<Project['tokenHoldingSettings']>, value: string) => {
        setFormData(prev => {
            if (!prev) return null;
            return { ...prev, tokenHoldingSettings: { ...(prev.tokenHoldingSettings || { name: '', contractAddress: '', link: '' }), [field]: value }};
        });
    };
    
    // Handlers for Token Tiers
    const handleTierChange = (index: number, field: keyof PointTier, value: number | null) => {
        setFormData(prev => {
            if (!prev) return null;
            const newTiers = [...(prev.tokenHoldingTiers || [])];
            (newTiers[index] as any)[field] = value;
            return { ...prev, tokenHoldingTiers: newTiers };
        });
    };

    const addTier = () => {
        setFormData(prev => {
            if (!prev) return null;
            const newTiers = [...(prev.tokenHoldingTiers || []), { minAmount: 0, maxAmount: 0, pointsPerDay: 0 }];
            return { ...prev, tokenHoldingTiers: newTiers };
        });
    };

    const removeTier = (index: number) => {
        setFormData(prev => {
            if (!prev) return null;
            const newTiers = prev.tokenHoldingTiers?.filter((_, i) => i !== index);
            return { ...prev, tokenHoldingTiers: newTiers };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = addOrUpdateProject(formData);
        if (success) {
            addToast(`Project "${formData.name}" updated successfully!`, 'success');
            navigate('/super-admin/credo');
        } else {
            addToast('Failed to update project.', 'error');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="neu-card p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-display font-bold text-on-surface">Manage Points & Status</h2>
                <button type="button" onClick={toggleCrowned} className={`neu-button text-sm px-4 py-2 flex items-center gap-2 ${formData.isCrowned ? 'active' : ''}`}>
                    <Crown size={16} />
                    {formData.isCrowned ? 'Un-crown' : 'Crown Project'}
                </button>
            </div>
            
            <div className="max-h-[70vh] overflow-y-auto pr-2">
                <FormSectionHeader><Shield /> Discord Role Points</FormSectionHeader>
                <div className="space-y-4">
                    {(formData.discordRoles || []).map((role, index) => (
                        <div key={index} className="neu-outset-card p-4 relative">
                             <button type="button" onClick={() => removeRole(index)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                             <FormRow><FormLabel>Role Name</FormLabel><FormField><FormInput value={role.name} onChange={e => handleRoleChange(index, 'name', e.target.value)} placeholder="e.g., OG" /></FormField></FormRow>
                             <FormRow><FormLabel>Server ID</FormLabel><FormField><FormInput value={role.serverId} onChange={e => handleRoleChange(index, 'serverId', e.target.value)} /></FormField></FormRow>
                             <FormRow><FormLabel>Role ID</FormLabel><FormField><FormInput value={role.roleId} onChange={e => handleRoleChange(index, 'roleId', e.target.value)} /></FormField></FormRow>
                             <FormRow><FormLabel>Points</FormLabel><FormField><FormInput type="number" value={role.points || 0} onChange={e => handleRoleChange(index, 'points', parseInt(e.target.value, 10) || 0)} placeholder="Points" /></FormField></FormRow>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addRole} className="neu-button px-3 py-1 text-sm flex items-center gap-1 mt-3"><Plus size={14} /> Add Role</button>


                <FormSectionHeader><Gem /> NFT Holding Points</FormSectionHeader>
                <div className="space-y-4">
                    {(formData.nftCollections || []).map((collection, index) => (
                         <div key={index} className="neu-outset-card p-4 relative">
                            <button type="button" onClick={() => removeCollection(index)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                            <FormRow><FormLabel>Collection Name</FormLabel><FormField><FormInput value={collection.name} onChange={e => handleCollectionChange(index, 'name', e.target.value)}/></FormField></FormRow>
                            <FormRow><FormLabel>Image</FormLabel><FormField><ImageUploadInput value={collection.image} onChange={val => handleCollectionChange(index, 'image', val)} /></FormField></FormRow>
                            <FormRow><FormLabel>Contract Address</FormLabel><FormField><FormInput value={collection.contractAddress || ''} onChange={e => handleCollectionChange(index, 'contractAddress', e.target.value)}/></FormField></FormRow>
                            <FormRow><FormLabel>Marketplace Link</FormLabel><FormField><FormInput value={collection.link || ''} onChange={e => handleCollectionChange(index, 'link', e.target.value)}/></FormField></FormRow>
                            <FormRow><FormLabel>One-time Points</FormLabel><FormField><FormInput type="number" value={collection.oneTimePoints || 0} onChange={e => handleCollectionChange(index, 'oneTimePoints', parseInt(e.target.value) || 0)} placeholder="Points for holding" /></FormField></FormRow>
                            <FormRow><FormLabel>Points per Day</FormLabel><FormField><FormInput type="number" value={collection.pointsPerDay || 0} onChange={e => handleCollectionChange(index, 'pointsPerDay', parseInt(e.target.value) || 0)} placeholder="Daily points for holding" /></FormField></FormRow>
                         </div>
                    ))}
                </div>
                 <button type="button" onClick={addCollection} className="neu-button px-3 py-1 text-sm flex items-center gap-1 mt-3"><Plus size={14} /> Add NFT Collection</button>


                <FormSectionHeader><Banknote />Token Settings</FormSectionHeader>
                <div className="neu-outset-card p-4">
                    <FormRow><FormLabel>Token Name</FormLabel><FormField><FormInput value={formData.tokenHoldingSettings?.name || ''} onChange={e => handleTokenSettingsChange('name', e.target.value)} /></FormField></FormRow>
                    <FormRow><FormLabel>Contract Address</FormLabel><FormField><FormInput value={formData.tokenHoldingSettings?.contractAddress || ''} onChange={e => handleTokenSettingsChange('contractAddress', e.target.value)} /></FormField></FormRow>
                    <FormRow><FormLabel>Info Link</FormLabel><FormField><FormInput value={formData.tokenHoldingSettings?.link || ''} onChange={e => handleTokenSettingsChange('link', e.target.value)} placeholder="e.g., BirdEye URL" /></FormField></FormRow>
                </div>

                <FormSectionHeader><Banknote />Token Holding Tiers</FormSectionHeader>
                <div className="space-y-3">
                    {formData.tokenHoldingTiers?.map((tier, index) => (
                        <div key={index} className="p-3 rounded-lg bg-surface/50 flex items-center gap-4">
                            <FormInput type="number" value={tier.minAmount} onChange={e => handleTierChange(index, 'minAmount', parseInt(e.target.value, 10) || 0)} placeholder="Min Amount" />
                            <span className="font-bold">-</span>
                            <FormInput type="number" value={tier.maxAmount ?? ''} onChange={e => handleTierChange(index, 'maxAmount', e.target.value ? parseInt(e.target.value, 10) : null)} placeholder="Max (optional)" />
                            <span className="font-bold">=</span>
                            <FormInput type="number" value={tier.pointsPerDay} onChange={e => handleTierChange(index, 'pointsPerDay', parseInt(e.target.value, 10) || 0)} placeholder="Points/Day" />
                            <button type="button" onClick={() => removeTier(index)} className="p-1 text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addTier} className="neu-button px-3 py-1 text-sm flex items-center gap-1 mt-3"><Plus size={14} /> Add Tier</button>
            </div>
            
            <div className="mt-8 pt-4 border-t border-border/20 flex justify-end gap-3">
                <motion.button type="button" onClick={() => navigate('/super-admin/project-detail')} className="neu-button px-6 py-2 font-bold">Cancel</motion.button>
                <motion.button type="submit" className="neu-button active px-6 py-2 font-bold">Save Changes</motion.button>
            </div>
        </form>
    );
};

export default ProjectPointsSettingsTab;