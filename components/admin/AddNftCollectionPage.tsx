import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, Nft } from '../../src/types';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import { useToast } from '../../context/ToastContext';
import { addOrUpdateNft } from '../../src/services/dataService';
import { uid } from '../../utils/helpers';
import ImageUploadInput from '../common/ImageUploadInput';
import { ArrowLeft, Save } from 'lucide-react';

const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => <label className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className="neu-inset-input w-full" />;
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => <select {...props} className="neu-inset-input neu-select w-full">{props.children}</select>;

const AddNftCollectionPage: React.FC = () => {
    const { allProjects, refreshData } = useSuperAdminContext();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [selectedProjectId, setSelectedProjectId] = useState<string>(allProjects[0]?.id || '');
    const [formData, setFormData] = useState({
        name: '', image_url: '', link: '', supply: '', mint_price: '', floor_price: ''
    });

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (status: 'published' | 'draft') => {
        if (!selectedProjectId || !formData.name) {
            addToast('Please select a project and enter a collection name.', 'warning');
            return;
        }

        const newNft: Nft = {
            id: uid(),
            project_id: selectedProjectId,
            ...formData,
            status: status,
            network: 'mainnet',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            published_at: status === 'published' ? new Date().toISOString() : null,
        };

        const success = await addOrUpdateNft(newNft);
        if (success) {
            addToast(`Collection "${formData.name}" saved as ${status}.`, 'success');
            refreshData();
            navigate('/super-admin/nfts');
        } else {
            addToast('Failed to save collection.', 'error');
        }
    };

    return (
        <div className="neu-card p-6">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="neu-button p-2">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-display font-bold text-on-surface">Add New NFT Collection</h2>
            </div>

            <div className="space-y-4">
                <FormRow><FormLabel>Project</FormLabel><FormSelect value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>{allProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</FormSelect></FormRow>
                <FormRow><FormLabel>Name</FormLabel><FormInput value={formData.name} onChange={e => handleChange('name', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Link</FormLabel><FormInput value={formData.link} onChange={e => handleChange('link', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Supply</FormLabel><FormInput value={formData.supply} onChange={e => handleChange('supply', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Mint Price</FormLabel><FormInput value={formData.mint_price} onChange={e => handleChange('mint_price', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Floor Price</FormLabel><FormInput value={formData.floor_price} onChange={e => handleChange('floor_price', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Image</FormLabel><ImageUploadInput value={formData.image_url || ''} onChange={val => handleChange('image_url', val)} /></FormRow>
            </div>

            <div className="mt-6 pt-4 border-t border-border/20 flex justify-end gap-3">
                <button type="button" onClick={() => handleSave('draft')} className="neu-button px-6 py-2 font-bold">Save as Draft</button>
                <button type="button" onClick={() => handleSave('published')} className="neu-button active px-6 py-2 font-bold flex items-center gap-2"><Save size={16} /> Publish Collection</button>
            </div>
        </div>
    );
};

export default AddNftCollectionPage;