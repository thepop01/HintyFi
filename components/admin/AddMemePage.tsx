import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, Coin } from '../../src/types';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import { useToast } from '../../context/ToastContext';
import { addOrUpdateProject } from '../../src/services/dataService';
import { uid } from '../../utils/helpers';
import ImageUploadInput from '../common/ImageUploadInput';
import { ArrowLeft, Save } from 'lucide-react';

const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => <label className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className="neu-inset-input w-full" />;
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => <select {...props} className="neu-inset-input neu-select w-full">{props.children}</select>;

const AddMemePage: React.FC = () => {
    const { allProjects, refreshData } = useSuperAdminContext();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [selectedProjectId, setSelectedProjectId] = useState<string>(allProjects[0]?.id || '');
    const [formData, setFormData] = useState<Partial<Coin>>({
        name: '', image: '', link: '', contractAddress: '', supply: '', marketPrice: '', type: 'meme', network: 'mainnet'
    });

    const handleChange = (field: keyof Omit<Coin, 'id'>, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!selectedProjectId || !formData.name) {
            addToast('Please select a project and enter a coin name.', 'warning');
            return;
        }
        
        const project = allProjects.find(p => p.id === selectedProjectId);
        if (!project) {
            addToast('Selected project not found.', 'error');
            return;
        }

        const newCoin: Coin = {
            id: uid(),
            name: formData.name!,
            type: 'meme',
            network: 'mainnet',
            image: formData.image || '',
            link: formData.link || '#',
            contractAddress: formData.contractAddress || '',
            supply: formData.supply,
            marketPrice: formData.marketPrice,
        };

        const updatedProject = {
            ...project,
            coins: [...(project.coins || []), newCoin]
        };

        if (addOrUpdateProject(updatedProject)) {
            addToast(`Meme coin "${formData.name}" added.`, 'success');
            refreshData();
            navigate('/super-admin/memes');
        } else {
            addToast('Failed to save meme coin.', 'error');
        }
    };

    return (
        <div className="neu-card p-6">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="neu-button p-2">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-display font-bold text-on-surface">Add New Meme Coin</h2>
            </div>

            <div className="space-y-4">
                <FormRow><FormLabel>Project</FormLabel><FormSelect value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>{allProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</FormSelect></FormRow>
                <FormRow><FormLabel>Name</FormLabel><FormInput value={formData.name} onChange={e => handleChange('name', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Contract</FormLabel><FormInput value={formData.contractAddress} onChange={e => handleChange('contractAddress', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Link</FormLabel><FormInput value={formData.link} onChange={e => handleChange('link', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Supply</FormLabel><FormInput value={formData.supply} onChange={e => handleChange('supply', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Market Price</FormLabel><FormInput value={formData.marketPrice} onChange={e => handleChange('marketPrice', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Image</FormLabel><ImageUploadInput value={formData.image || ''} onChange={val => handleChange('image', val)} /></FormRow>
            </div>

            <div className="mt-6 pt-4 border-t border-border/20 flex justify-end">
                <button type="button" onClick={handleSave} className="neu-button active px-6 py-2 font-bold flex items-center gap-2"><Save size={16} /> Add Meme Coin</button>
            </div>
        </div>
    );
};

export default AddMemePage;