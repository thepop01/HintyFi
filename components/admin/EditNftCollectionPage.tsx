import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tables, Project } from '../../src/types';
import { addOrUpdateProject, getProjectById } from '../../src/services/dataService';
type NftCollection = Tables<'nft_collections'>;
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import { useToast } from '../../context/ToastContext';
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
    
    const [formData, setFormData] = useState<Partial<NftCollection> | null>(null);
    
    useEffect(() => {
        const fetchCollection = async () => {
            const project = await getProjectById(projectId!);
            if (project && project.nftCollections) {
                const collection = project.nftCollections.find(c => c.id === collectionId);
                if (collection) {
                    setFormData(collection);
                }
            }
        };
        fetchCollection();
    }, [projectId, collectionId]);

    if (!formData) {
        return <div>Loading collection...</div>;
    }

    const handleChange = (field: keyof NftCollection, value: any) => {
        setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    const handleSave = async () => {
        const project = await getProjectById(projectId!);
        if (!project || !formData) {
            addToast('Error finding project or collection data.', 'error');
            return;
        }

        const updatedCollections = (project.nftCollections || []).map(c =>
            c.id === collectionId ? (formData as any) : c
        );
        const updatedProject = { ...project, nftCollections: updatedCollections };
        const success = await addOrUpdateProject(updatedProject as Project);

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
                <FormRow><FormLabel>Image</FormLabel><ImageUploadInput value={formData.image_url || ''} onChange={val => handleChange('image_url', val)} /></FormRow>
                <FormRow><FormLabel>Link</FormLabel><FormInput value={formData.urls?.[0] || ''} onChange={e => handleChange('urls', [e.target.value])} /></FormRow>
                <FormRow><FormLabel>Supply</FormLabel><FormInput value={formData.supply || ''} onChange={e => handleChange('supply', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Mint Price</FormLabel><FormInput value={formData.mint_price || ''} onChange={e => handleChange('mint_price', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Floor Price</FormLabel><FormInput value={formData.floor_price || ''} onChange={e => handleChange('floor_price', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Status</FormLabel><FormSelect value={formData.status || ''} onChange={e => handleChange('status', e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></FormSelect></FormRow>
                <FormRow><FormLabel>Visible on NFT Page</FormLabel><FormField><FormCheckbox label="Show this collection on the main NFT page" checked={formData.is_visible_on_nft_page !== false} onChange={(e) => handleChange('is_visible_on_nft_page', e.target.checked)} /></FormField></FormRow>

                
            </div>
            <div className="mt-6 pt-4 border-t border-border/20 flex justify-end">
                <button type="button" onClick={handleSave} className="neu-button active px-6 py-2 font-bold flex items-center gap-2"><Save size={16} /> Save Changes</button>
            </div>
        </div>
    );
};

export default EditNftCollectionPage;