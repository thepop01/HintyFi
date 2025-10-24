import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Project, NftCollection, Coin, TeamMember, ProjectCategory } from '../../../src/types';
import { useToast } from '../../../context/ToastContext';
import { addOrUpdateProject } from '../../../src/services/dataService';
import { Plus, Trash2 } from 'lucide-react';
import { uid } from '../../../utils/helpers';
import { useSuperAdminContext } from '../../../context/SuperAdminContext';
import ImageUploadInput from '../../../components/common/ImageUploadInput';

// Reusable form components
const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => <label htmlFor={htmlFor} className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormField: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;
const inputBaseClasses = "neu-inset-input w-full";
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className={`${inputBaseClasses} ${props.className}`} />;
const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => <textarea {...props} className={`${inputBaseClasses}`} rows={props.rows || 3} />;
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => <select {...props} className={`${inputBaseClasses} neu-select`}>{props.children}</select>;
const FormCheckbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (<label className="flex items-center gap-3 cursor-pointer"><div className="relative flex items-center"><input type="checkbox" {...props} className="peer absolute opacity-0 w-5 h-5" /><div className="w-5 h-5 rounded bg-surface border border-border/30 peer-checked:bg-primary peer-checked:border-primary transition-colors"></div><svg className="absolute w-5 h-5 text-white transition-opacity opacity-0 peer-checked:opacity-100 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><span className="text-on-surface select-none">{label}</span></label>);
const FormSectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-lg font-display font-bold text-on-surface mb-3 mt-6 border-b-2 border-primary/20 pb-2">{children}</h3>;


export const ProjectInfoSettingsTab: React.FC = () => {
    const { project: initialProject } = useOutletContext<{ project: Project }>();
    const { refreshData } = useSuperAdminContext();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [formData, setFormData] = useState<Project>(initialProject!);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (field: 'logo' | 'banner', value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentCategories = prev.category || [];
            const newCategories = checked ? [...currentCategories, value as ProjectCategory] : currentCategories.filter(c => c !== value);
            return { ...prev, category: newCategories };
        });
    };
    const handleLinkChange = (field: keyof Omit<Project['links'], 'magicEden' | 'memeCoin'>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(p => ({ ...p, links: { ...p.links, [field]: e.target.value } as Project['links'] }));
    };
    
    const handleNestedLinkChange = (field: 'magicEden' | 'memeCoin', subField: 'mainnet' | 'testnet') => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            links: {
                ...prev.links,
                [field]: {
                    ...(prev.links[field] || {}),
                    [subField]: value,
                },
            },
        }));
    };

    const handleStrategyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { setFormData(prev => ({ ...prev, strategyWalkthrough: e.target.value.split('\n') })); };
    const addTeamMember = () => setFormData(p => ({ ...p, team: [...(p.team || []), { name: '', role: '' }] }));
    const removeTeamMember = (index: number) => setFormData(p => ({ ...p, team: p.team?.filter((_, i) => i !== index) }));
    const handleTeamChange = (index: number, field: keyof TeamMember, value: string) => { setFormData(p => { const newTeam = [...(p.team || [])]; (newTeam[index] as any)[field] = value; return { ...p, team: newTeam }; }); };
    const addCoin = () => setFormData(prev => prev ? ({...prev, coins: [...(prev.coins || []), { id: uid(), type: 'meme', network: 'mainnet', name: '', contractAddress: '', link: '', image: '' }] }) : null);
    const removeCoin = (id: string) => { setFormData(prev => prev ? ({...prev, coins: prev.coins?.filter(c => c.id !== id) }) : null); };
    const handleCoinChange = (id: string, field: keyof Omit<Coin, 'id'>, value: string) => { setFormData(prev => prev ? ({...prev, coins: prev.coins?.map(c => c.id === id ? { ...c, [field]: value } : c) }) : null); };
    
    // FIX: Added missing 'status' property to align with NftCollection type.
    const addCollection = () => { setFormData(prev => prev ? ({...prev, nftCollections: [...(prev.nftCollections || []), { id: uid(), name: '', image: '', contractAddress: '', link: '', network: 'mainnet', perks: [], status: 'draft' }] }) : null); };
    const removeCollection = (id: string) => { setFormData(prev => prev ? ({...prev, nftCollections: prev.nftCollections?.filter(c => c.id !== id) }) : null); };
    const handleCollectionChange = (id: string, field: keyof Omit<NftCollection, 'id' | 'perks'>, value: string) => { setFormData(prev => prev ? ({...prev, nftCollections: prev.nftCollections?.map(c => c.id === id ? { ...c, [field]: value } : c) }) : null); };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = addOrUpdateProject(formData);
        if (success) {
            addToast(`Project "${formData.name}" info updated!`, 'success');
            refreshData();
        } else {
            addToast('Failed to save project info.', 'error');
        }
    };
    
    if (!formData) return null;

    return (
        <form onSubmit={handleSubmit} className="neu-card p-6">
            <FormSectionHeader>Basic Info</FormSectionHeader>
            <FormRow><FormLabel>Name</FormLabel><FormField><FormInput name="name" value={formData.name} onChange={handleChange} /></FormField></FormRow>
            <FormRow><FormLabel>Short Desc</FormLabel><FormField><FormTextArea name="description" value={formData.description} onChange={handleChange} /></FormField></FormRow>
            <FormRow><FormLabel>Long Desc</FormLabel><FormField><FormTextArea name="longDescription" value={formData.longDescription} onChange={handleChange} rows={5} /></FormField></FormRow>
            <FormRow><FormLabel>Logo</FormLabel><FormField><ImageUploadInput value={formData.logo} onChange={val => handleImageChange('logo', val)} /></FormField></FormRow>
            <FormRow><FormLabel>Banner</FormLabel><FormField><ImageUploadInput value={formData.banner} onChange={val => handleImageChange('banner', val)} /></FormField></FormRow>
            <FormRow><FormLabel>Category</FormLabel><FormField><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{['defi', 'nft', 'gaming', 'socialfi', 'dex', 'rwa', 'infrastructure', 'wallet', 'depin', 'ai', 'meme', 'launchpad'].map(cat => (<FormCheckbox key={cat} label={cat} value={cat} checked={formData.category?.includes(cat as ProjectCategory)} onChange={handleCategoryChange} />))}</div></FormField></FormRow>
            <FormRow><FormLabel>Strategy Walkthrough</FormLabel><FormField><FormTextArea value={formData.strategyWalkthrough?.join('\n') || ''} onChange={handleStrategyChange} rows={5} placeholder="One step per line" /></FormField></FormRow>
            
            <FormSectionHeader>Links</FormSectionHeader>
            {formData.hasPendingChanges && formData.pendingChanges?.links && (
                <div className="mb-4 p-3 bg-yellow-500/20 text-yellow-800 rounded-md text-sm">
                    <p className="font-bold">There are pending link changes that require approval:</p>
                    <ul className="list-disc pl-5 mt-1">
                        {Object.entries(formData.pendingChanges.links).map(([key, value]) => <li key={key}><strong>{key}:</strong> {value as string}</li>)}
                    </ul>
                </div>
            )}
            <FormRow><FormLabel>Website</FormLabel><FormField><FormInput value={formData.links?.website} onChange={handleLinkChange('website')} /></FormField></FormRow>
            <FormRow><FormLabel>Twitter</FormLabel><FormField><FormInput value={formData.links?.twitter || ''} onChange={handleLinkChange('twitter')} /></FormField></FormRow>
            <FormRow><FormLabel>Discord</FormLabel><FormField><FormInput value={formData.links?.discord || ''} onChange={handleLinkChange('discord')} /></FormField></FormRow>
            <FormRow><FormLabel>Magic Eden (Mainnet)</FormLabel><FormField><FormInput value={formData.links.magicEden?.mainnet || ''} onChange={handleNestedLinkChange('magicEden', 'mainnet')} /></FormField></FormRow>
            <FormRow><FormLabel>Magic Eden (Testnet)</FormLabel><FormField><FormInput value={formData.links.magicEden?.testnet || ''} onChange={handleNestedLinkChange('magicEden', 'testnet')} /></FormField></FormRow>
            <FormRow><FormLabel>Meme Coin (Mainnet)</FormLabel><FormField><FormInput value={formData.links.memeCoin?.mainnet || ''} onChange={handleNestedLinkChange('memeCoin', 'mainnet')} /></FormField></FormRow>
            <FormRow><FormLabel>Meme Coin (Testnet)</FormLabel><FormField><FormInput value={formData.links.memeCoin?.testnet || ''} onChange={handleNestedLinkChange('memeCoin', 'testnet')} /></FormField></FormRow>

            <FormSectionHeader>Team</FormSectionHeader>
            {formData.team?.map((member, i) => (<div key={i} className="neu-outset-card p-3 mb-2 relative"><FormRow><FormLabel>Name</FormLabel><FormField><FormInput value={member.name} onChange={e => handleTeamChange(i, 'name', e.target.value)} /></FormField></FormRow><FormRow><FormLabel>Role</FormLabel><FormField><FormInput value={member.role} onChange={e => handleTeamChange(i, 'role', e.target.value)} /></FormField></FormRow><button type="button" onClick={() => removeTeamMember(i)} className="absolute top-2 right-2 p-1 text-red-500"><Trash2 size={16} /></button></div>))}
            <button type="button" onClick={addTeamMember} className="neu-button px-3 py-1 text-sm mt-3"><Plus size={14} /> Add Team Member</button>

            <FormSectionHeader>Coins</FormSectionHeader>
            {formData.coins?.map((coin) => (<div key={coin.id} className="neu-outset-card p-3 mb-2 relative"><FormRow><FormLabel>Name</FormLabel><FormField><FormInput value={coin.name} onChange={e => handleCoinChange(coin.id, 'name', e.target.value)} /></FormField></FormRow><FormRow><FormLabel>Type</FormLabel><FormField><FormSelect value={coin.type} onChange={e => handleCoinChange(coin.id, 'type', e.target.value)}><option value="meme">Meme</option><option value="ecosystem">Ecosystem</option></FormSelect></FormField></FormRow><FormRow><FormLabel>Link</FormLabel><FormField><FormInput value={coin.link} onChange={e => handleCoinChange(coin.id, 'link', e.target.value)} /></FormField></FormRow><button type="button" onClick={() => removeCoin(coin.id)} className="absolute top-2 right-2 p-1 text-red-500"><Trash2 size={16} /></button></div>))}
            <button type="button" onClick={addCoin} className="neu-button px-3 py-1 text-sm mt-3"><Plus size={14} /> Add Coin</button>
            
            <FormSectionHeader>NFT Collections</FormSectionHeader>
            {formData.nftCollections?.map((coll) => (<div key={coll.id} className="neu-outset-card p-3 mb-2 relative"><FormRow><FormLabel>Name</FormLabel><FormField><FormInput value={coll.name} onChange={e => handleCollectionChange(coll.id, 'name', e.target.value)} /></FormField></FormRow><FormRow><FormLabel>Link</FormLabel><FormField><FormInput value={coll.link} onChange={e => handleCollectionChange(coll.id, 'link', e.target.value)} /></FormField></FormRow><button type="button" onClick={() => removeCollection(coll.id)} className="absolute top-2 right-2 p-1 text-red-500"><Trash2 size={16} /></button></div>))}
            <button type="button" onClick={addCollection} className="neu-button px-3 py-1 text-sm mt-3"><Plus size={14} /> Add NFT Collection</button>
            
            <div className="mt-8 pt-4 border-t border-border/20 flex justify-end">
                <button type="submit" className="neu-button active px-6 py-2 font-bold">Save Info</button>
            </div>
        </form>
    );
};

export default ProjectInfoSettingsTab;
