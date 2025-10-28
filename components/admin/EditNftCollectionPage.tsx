import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NftCollection, Project, NftPerk, PerkType } from '../../src/types';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import { useToast } from '../../context/ToastContext';
import { addOrUpdateProject, getProjectById } from '../../src/services/dataService';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import ImageUploadInput from '../common/ImageUploadInput';

// Reusable form components
const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => <label className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormField: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className="neu-inset-input w-full" />;
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => <select {...props} className="neu-inset-input neu-select w-full">{props.children}</select>;
const FormCheckbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (<label className="flex items-center gap-3 cursor-pointer"><div className="relative flex items-center"><input type="checkbox" {...props} className="peer absolute opacity-0 w-5 h-5" /><div className="w-5 h-5 rounded bg-surface border border-border/30 peer-checked:bg-primary peer-checked:border-primary transition-colors"></div><svg className="absolute w-5 h-5 text-white transition-opacity opacity-0 peer-checked:opacity-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><span className="text-on-surface select-none">{label}</span></label>);
const FormSectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-lg font-display font-bold text-on-surface mb-3 mt-6 border-b-2 border-primary/20 pb-2">{children}</h3>;

const EditNftCollectionPage: React.FC = () => {
    const { projectId, collectionId } = useParams();
    const navigate = useNavigate();
    const { allProjects, refreshData } = useSuperAdminContext();
    const { addToast } = useToast();
    
    const [formData, setFormData] = useState<NftCollection | null>(null);
    const [addNewProjectForPerk, setAddNewProjectForPerk] = useState<Record<number, boolean>>({});


    useEffect(() => {
        const project = getProjectById(projectId!);
        const collection = project?.nftCollections?.find(c => c.id === collectionId);
        if (collection) {
            setFormData(collection);
            const initialAddNewState: Record<number, boolean> = {};
            (collection.perks || []).forEach((perk, index) => {
                const grantingProjectName = perk.perk.grantingProjectName;
                if (grantingProjectName && !allProjects.some(p => p.name === grantingProjectName)) {
                    initialAddNewState[index] = true;
                }
            });
            setAddNewProjectForPerk(initialAddNewState);
        }
    }, [projectId, collectionId, allProjects]);
    
    if (!formData) {
        return <div>Loading collection...</div>;
    }

    const handleChange = (field: keyof Omit<NftCollection, 'id' | 'perks'>, value: any) => {
        setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    const handlePerkChange = (index: number, field: string, value: string | number) => {
        if (!formData) return;
        const newPerks = [...formData.perks];
        const path = field.split('.');
        let current: any = newPerks[index];
        path.slice(0, -1).forEach(p => { current = current[p]; });
        current[path[path.length - 1]] = value;
        setFormData(prev => prev ? ({ ...prev, perks: newPerks }) : null);
    };
    
    const addPerk = () => {
        const newPerk: NftPerk = { 
            holdingRequirement: { count: 1 }, 
            perk: { type: 'Airdrop', description: '' } 
        };
        setFormData(prev => prev ? ({ ...prev, perks: [...prev.perks, newPerk] }) : null);
    };
    
    const removePerk = (index: number) => {
        setFormData(prev => prev ? ({ ...prev, perks: prev.perks.filter((_, i) => i !== index) }) : null);
    };

    const handleSave = () => {
        const project = getProjectById(projectId!);
        if (!project || !formData) {
            addToast('Error finding project or collection data.', 'error');
            return;
        }

        const newCollections = (project.nftCollections || []).map(c => c.id === collectionId ? formData : c);
        const success = addOrUpdateProject({ ...project, nftCollections: newCollections });

        if (success) {
            addToast('NFT Collection updated successfully!', 'success');
            refreshData();
            navigate('/super-admin/nfts');
        } else {
            addToast('Failed to update collection.', 'error');
        }
    };

    return (
        <div className="neu-card p-6">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="neu-button p-2">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-display font-bold text-on-surface">Edit: {formData.name}</h2>
            </div>
            
            <div className="max-h-[70vh] overflow-y-auto pr-4">
                <FormSectionHeader>Collection Details</FormSectionHeader>
                <FormRow><FormLabel>Name</FormLabel><FormInput value={formData.name} onChange={e => handleChange('name', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Image</FormLabel><ImageUploadInput value={formData.image || ''} onChange={val => handleChange('image', val)} /></FormRow>
                <FormRow><FormLabel>Link</FormLabel><FormInput value={formData.link} onChange={e => handleChange('link', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Supply</FormLabel><FormInput value={formData.supply || ''} onChange={e => handleChange('supply', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Mint Price</FormLabel><FormInput value={formData.mintPrice || ''} onChange={e => handleChange('mintPrice', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Floor Price</FormLabel><FormInput value={formData.floorPrice || ''} onChange={e => handleChange('floorPrice', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Status</FormLabel><FormSelect value={formData.status} onChange={e => handleChange('status', e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></FormSelect></FormRow>
                <FormRow><FormLabel>Visible on NFT Page</FormLabel><FormField><FormCheckbox label="Show this collection on the main NFT page" checked={formData.isVisibleOnNftPage !== false} onChange={(e) => handleChange('isVisibleOnNftPage', e.target.checked)} /></FormField></FormRow>

                
                <FormSectionHeader>Holder Perks</FormSectionHeader>
                <div className="space-y-4">
                    {formData.perks.map((perk, i) => (
                        <div key={i} className="neu-outset-card p-4 space-y-4 relative">
                            <button type="button" onClick={() => removePerk(i)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                           
                            <div className="p-3 bg-surface/50 rounded-lg">
                                <h4 className="font-bold text-sm text-on-surface-variant mb-2">Requirement</h4>
                                <FormRow>
                                    <FormLabel>Hold</FormLabel>
                                    <FormField>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <FormInput type="number" value={perk.holdingRequirement.count} onChange={e => handlePerkChange(i, 'holdingRequirement.count', parseInt(e.target.value, 10))} className="!w-20" />
                                            <span>of this collection's NFTs.</span>
                                        </div>
                                    </FormField>
                                </FormRow>
                            </div>

                            <div className="p-3 bg-surface/50 rounded-lg">
                                <h4 className="font-bold text-sm text-on-surface-variant mb-2">Benefit</h4>
                                <FormRow><FormLabel>Perk Type</FormLabel><FormField><FormSelect value={perk.perk.type} onChange={e => handlePerkChange(i, 'perk.type', e.target.value)}><option>Airdrop</option><option>GTD</option><option>FCFS</option><option>Free Mint</option></FormSelect></FormField></FormRow>

                                <FormRow>
                                    <FormLabel>Perks in Project</FormLabel>
                                    <FormField>
                                        <FormSelect
                                            value={addNewProjectForPerk[i] ? '__ADD_NEW__' : perk.perk.grantingProjectName || ''}
                                            onChange={e => {
                                                const value = e.target.value;
                                                setAddNewProjectForPerk(prev => ({ ...prev, [i]: value === '__ADD_NEW__' }));
                                                if (value !== '__ADD_NEW__') {
                                                    const selectedProject = allProjects.find(p => p.name === value);
                                                    handlePerkChange(i, 'perk.grantingProjectName', value);
                                                    handlePerkChange(i, 'perk.grantingProjectImage', selectedProject?.logo || '');
                                                } else {
                                                    handlePerkChange(i, 'perk.grantingProjectName', '');
                                                    handlePerkChange(i, 'perk.grantingProjectImage', '');
                                                }
                                            }}
                                        >
                                            <option value="">Select Project...</option>
                                            <option value="__ADD_NEW__">-- Add New Project --</option>
                                            {allProjects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                        </FormSelect>
                                    </FormField>
                                </FormRow>

                                {addNewProjectForPerk[i] && (
                                    <>
                                        <FormRow>
                                            <FormLabel>New Project Name</FormLabel>
                                            <FormField>
                                                <FormInput
                                                    value={perk.perk.grantingProjectName || ''}
                                                    onChange={e => handlePerkChange(i, 'perk.grantingProjectName', e.target.value)}
                                                    placeholder="Enter new project name"
                                                />
                                            </FormField>
                                        </FormRow>
                                        <FormRow>
                                            <FormLabel>Project Image</FormLabel>
                                            <FormField>
                                                <ImageUploadInput
                                                    value={perk.perk.grantingProjectImage || ''}
                                                    onChange={val => handlePerkChange(i, 'perk.grantingProjectImage', val)}
                                                />
                                            </FormField>
                                        </FormRow>
                                    </>
                                )}
                                {/* FIX: Added missing opening <FormField> tag. */}
                                <FormRow><FormLabel>Description</FormLabel><FormField><FormInput value={perk.perk.description} onChange={e => handlePerkChange(i, 'perk.description', e.target.value)} /></FormField></FormRow>
                            </div>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addPerk} className="neu-button px-3 py-1 text-sm mt-3"><Plus size={14} /> Add Perk</button>
            </div>
            <div className="mt-6 pt-4 border-t border-border/20 flex justify-end">
                <button type="button" onClick={handleSave} className="neu-button active px-6 py-2 font-bold flex items-center gap-2"><Save size={16} /> Save Changes</button>
            </div>
        </div>
    );
};

export default EditNftCollectionPage;