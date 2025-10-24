import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Project, NftCollection, Coin } from '../../../src/types';
import { useToast } from '../../../context/ToastContext';
import { addOrUpdateProject } from '../../../src/services/dataService';
import { Plus, Trash2 } from 'lucide-react';
import { uid } from '../../../utils/helpers';
import ImageUploadInput from '../../../components/common/ImageUploadInput';

// Reusable form components
const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => <label htmlFor={htmlFor} className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormField: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;
const inputBaseClasses = "neu-inset-input w-full";
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className={`${inputBaseClasses} ${props.className}`} />;
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => <select {...props} className={`${inputBaseClasses} neu-select`}>{props.children}</select>;
const FormSectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-lg font-display font-bold text-on-surface mb-3 mt-6 border-b-2 border-primary/20 pb-2">{children}</h3>;

const AdminProjectNftsMemesPage: React.FC = () => {
    const { project } = useOutletContext<{ project: Project }>();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Project>(project);
    
    // --- Coin Handlers ---
    const addCoin = () => { setFormData(prev => ({...prev, coins: [...(prev.coins || []), { id: uid(), type: 'meme', network: 'mainnet', name: '', contractAddress: '', link: '', image: '' }] })); };
    const removeCoin = (id: string) => { setFormData(prev => ({...prev, coins: prev.coins?.filter(c => c.id !== id) })); };
    const handleCoinChange = (id: string, field: keyof Omit<Coin, 'id'>, value: string) => {
        setFormData(prev => ({...prev, coins: prev.coins?.map(c => c.id === id ? { ...c, [field]: value } : c) }));
    };

    // --- NFT Collection Handlers ---
    const addCollection = () => { setFormData(prev => ({...prev, nftCollections: [...(prev.nftCollections || []), { id: uid(), name: '', image: '', contractAddress: '', link: '', network: 'mainnet', perks: [], status: 'draft' }] })); };
    const removeCollection = (id: string) => { setFormData(prev => ({...prev, nftCollections: prev.nftCollections?.filter(c => c.id !== id) })); };
    const handleCollectionChange = (id: string, field: keyof Omit<NftCollection, 'id' | 'perks'>, value: string) => {
        setFormData(prev => ({...prev, nftCollections: prev.nftCollections?.map(c => c.id === id ? { ...c, [field]: value } : c) }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (addOrUpdateProject(formData)) {
            addToast('NFT & Coin info updated successfully!', 'success');
            navigate('/admin');
        } else {
            addToast('Failed to update project.', 'error');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="neu-card p-6">
            <FormSectionHeader>Coins</FormSectionHeader>
            <div className="space-y-4">
                {formData.coins?.map((coin, index) => (
                    <div key={coin.id} className="neu-outset-card p-4 space-y-4 relative">
                        <button type="button" onClick={() => removeCoin(coin.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                        <h4 className="font-bold text-lg text-on-surface">Coin #{index + 1}</h4>
                        <FormRow><FormLabel>Name</FormLabel><FormField><FormInput value={coin.name} onChange={e => handleCoinChange(coin.id, 'name', e.target.value)} /></FormField></FormRow>
                        <FormRow><FormLabel>Type</FormLabel><FormField><FormSelect value={coin.type} onChange={e => handleCoinChange(coin.id, 'type', e.target.value)}><option value="meme">Meme Coin</option><option value="ecosystem">Ecosystem Coin</option></FormSelect></FormField></FormRow>
                        <FormRow><FormLabel>Network</FormLabel><FormField><FormSelect value={coin.network} onChange={e => handleCoinChange(coin.id, 'network', e.target.value)}><option value="mainnet">Mainnet</option><option value="testnet">Testnet</option></FormSelect></FormField></FormRow>
                        <FormRow><FormLabel>Contract</FormLabel><FormField><FormInput value={coin.contractAddress} onChange={e => handleCoinChange(coin.id, 'contractAddress', e.target.value)} /></FormField></FormRow>
                        <FormRow><FormLabel>Link</FormLabel><FormField><FormInput value={coin.link} onChange={e => handleCoinChange(coin.id, 'link', e.target.value)} /></FormField></FormRow>
                        <FormRow><FormLabel>Image</FormLabel><FormField><ImageUploadInput value={coin.image} onChange={val => handleCoinChange(coin.id, 'image', val)} /></FormField></FormRow>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addCoin} className="neu-button px-3 py-1 text-sm flex items-center gap-1 mt-4"><Plus size={14} /> Add Coin</button>


            <FormSectionHeader>NFT Collections</FormSectionHeader>
            <div className="space-y-4">
                {formData.nftCollections?.map((collection, collIndex) => (
                    <div key={collection.id} className="neu-outset-card p-4 space-y-4 relative">
                        <button type="button" onClick={() => removeCollection(collection.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                        <h4 className="font-bold text-lg text-on-surface">Collection #{collIndex + 1}</h4>
                        <FormRow><FormLabel>Name</FormLabel><FormField><FormInput value={collection.name} onChange={e => handleCollectionChange(collection.id, 'name', e.target.value)} /></FormField></FormRow>
                        <FormRow><FormLabel>Network</FormLabel><FormField><FormSelect value={collection.network} onChange={e => handleCollectionChange(collection.id, 'network', e.target.value)}><option value="mainnet">Mainnet</option><option value="testnet">Testnet</option></FormSelect></FormField></FormRow>
                        <FormRow><FormLabel>Contract</FormLabel><FormField><FormInput value={collection.contractAddress || ''} onChange={e => handleCollectionChange(collection.id, 'contractAddress', e.target.value)} /></FormField></FormRow>
                        <FormRow><FormLabel>Link</FormLabel><FormField><FormInput value={collection.link} onChange={e => handleCollectionChange(collection.id, 'link', e.target.value)} /></FormField></FormRow>
                        <FormRow><FormLabel>Image</FormLabel><FormField><ImageUploadInput value={collection.image} onChange={val => handleCollectionChange(collection.id, 'image', val)} /></FormField></FormRow>
                        <FormRow><FormLabel>Supply</FormLabel><FormField><FormInput value={collection.supply || ''} onChange={e => handleCollectionChange(collection.id, 'supply', e.target.value)} /></FormField></FormRow>
                        <FormRow><FormLabel>Mint Price</FormLabel><FormField><FormInput value={collection.mintPrice || ''} onChange={e => handleCollectionChange(collection.id, 'mintPrice', e.target.value)} /></FormField></FormRow>
                        <FormRow><FormLabel>Floor Price</FormLabel><FormField><FormInput value={collection.floorPrice || ''} onChange={e => handleCollectionChange(collection.id, 'floorPrice', e.target.value)} /></FormField></FormRow>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addCollection} className="neu-button px-3 py-1 text-sm flex items-center gap-1 mt-4"><Plus size={14} /> Add NFT Collection</button>
            <div className="mt-8 pt-4 border-t border-border/20 flex justify-end gap-3"><button type="submit" className="neu-button active px-6 py-2 font-bold">Save Changes</button></div>
        </form>
    );
};

export default AdminProjectNftsMemesPage;