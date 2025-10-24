import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, ProjectCategory } from '../../../src/types';
import { useSuperAdminContext } from '../../../context/SuperAdminContext';
import { useToast } from '../../../context/ToastContext';
import { addOrUpdateProject } from '../../../src/services/dataService';
import { uid } from '../../../utils/helpers';
import ImageUploadInput from '../../../components/common/ImageUploadInput';
import { ArrowLeft, Save } from 'lucide-react';

const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => <label className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormField: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;
const inputBaseClasses = "neu-inset-input w-full";
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className={`${inputBaseClasses} ${props.className}`} />;
const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => <textarea {...props} className={`${inputBaseClasses}`} rows={props.rows || 3} />;
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => <select {...props} className={`${inputBaseClasses} neu-select`}>{props.children}</select>;
const FormSectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-lg font-display font-bold text-on-surface mb-3 mt-6 border-b-2 border-primary/20 pb-2">{children}</h3>;
const FormCheckbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (<label className="flex items-center gap-3 cursor-pointer"><div className="relative flex items-center"><input type="checkbox" {...props} className="peer absolute opacity-0 w-5 h-5" /><div className="w-5 h-5 rounded bg-surface border border-border/30 peer-checked:bg-primary peer-checked:border-primary transition-colors"></div><svg className="absolute w-5 h-5 text-white transition-opacity opacity-0 peer-checked:opacity-100 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><span className="text-on-surface select-none">{label}</span></label>);


const AddProjectPage: React.FC = () => {
    const { refreshData } = useSuperAdminContext();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Partial<Project>>({
        name: '',
        logo: '',
        banner: '',
        description: '',
        longDescription: '',
        category: [],
        links: { website: '', twitter: '', discord: '' } as Project['links'],
        stage: 'Early',
    });

    const handleChange = (field: keyof Project, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleLinkChange = (field: 'website' | 'twitter' | 'discord') => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(p => ({ ...p, links: { ...p.links, [field]: e.target.value } as Project['links'] }));
    };
    
    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentCategories = prev.category || [];
            const newCategories = checked ? [...currentCategories, value as ProjectCategory] : currentCategories.filter(c => c !== value);
            return { ...prev, category: newCategories };
        });
    };

    const handleSave = () => {
        if (!formData.name) {
            addToast('Please enter a project name.', 'warning');
            return;
        }

        const newProject: Project = {
            id: uid(),
            name: formData.name,
            logo: formData.logo || '',
            banner: formData.banner || '',
            description: formData.description || '',
            longDescription: formData.longDescription || '',
            links: formData.links || { website: '' },
            category: (formData.category as ProjectCategory[]) || [],
            stage: formData.stage,
            events: [],
            status: 'ongoing',
            createdAt: Date.now(),
            votes: { up: 0, down: 0, voters: [] },
            approvalStatus: 'approved', // Super admin creates approved projects by default
        };

        if (addOrUpdateProject(newProject)) {
            addToast(`Project "${formData.name}" created.`, 'success');
            refreshData();
            navigate('/super-admin/project-detail');
        } else {
            addToast('Failed to save project.', 'error');
        }
    };
    
    return (
        <div className="neu-card p-6">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="neu-button p-2">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-display font-bold text-on-surface">Add New Project</h2>
            </div>
            <div className="max-h-[70vh] overflow-y-auto pr-4">
                <FormSectionHeader>Project Info</FormSectionHeader>
                <FormRow><FormLabel>Name</FormLabel><FormInput value={formData.name} onChange={e => handleChange('name', e.target.value)} required /></FormRow>
                <FormRow><FormLabel>Short Description</FormLabel><FormTextArea value={formData.description} onChange={e => handleChange('description', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Long Description</FormLabel><FormTextArea value={formData.longDescription} onChange={e => handleChange('longDescription', e.target.value)} rows={5} /></FormRow>
                <FormRow><FormLabel>Logo</FormLabel><ImageUploadInput value={formData.logo || ''} onChange={val => handleChange('logo', val)} /></FormRow>
                <FormRow><FormLabel>Banner</FormLabel><ImageUploadInput value={formData.banner || ''} onChange={val => handleChange('banner', val)} /></FormRow>
                <FormRow><FormLabel>Stage</FormLabel><FormSelect name="stage" value={formData.stage} onChange={e => handleChange('stage', e.target.value)}>
                    <option value="Private">Private</option>
                    <option value="Early">Early</option>
                    <option value="Pre-Launch">Pre-Launch</option>
                    <option value="Launched">Launched</option>
                </FormSelect></FormRow>
                <FormRow><FormLabel>Category</FormLabel><FormField><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{['defi', 'nft', 'gaming', 'socialfi', 'dex', 'rwa', 'infrastructure', 'wallet', 'depin', 'ai', 'meme', 'launchpad'].map(cat => (<FormCheckbox key={cat} label={cat} value={cat} checked={formData.category?.includes(cat as ProjectCategory)} onChange={handleCategoryChange} />))}</div></FormField></FormRow>
                
                <FormSectionHeader>Links</FormSectionHeader>
                <FormRow><FormLabel>Website</FormLabel><FormInput value={formData.links?.website} onChange={handleLinkChange('website')} /></FormRow>
                <FormRow><FormLabel>Twitter</FormLabel><FormInput value={formData.links?.twitter || ''} onChange={handleLinkChange('twitter')} /></FormRow>
                <FormRow><FormLabel>Discord</FormLabel><FormInput value={formData.links?.discord || ''} onChange={handleLinkChange('discord')} /></FormRow>
            </div>
            <div className="mt-6 pt-4 border-t border-border/20 flex justify-end">
                <button type="button" onClick={handleSave} className="neu-button active px-6 py-2 font-bold flex items-center gap-2"><Save size={16} /> Add Project</button>
            </div>
        </div>
    );
};

export default AddProjectPage;
