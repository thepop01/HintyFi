import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, Tables } from '../../../src/types';
import { useSuperAdminContext } from '../../../context/SuperAdminContext';
import { useToast } from '../../../context/ToastContext';
import { addOrUpdateProject } from '../../../src/services/dataService';
import { uid } from '../../../utils/helpers';
import ImageUploadInput from '../../../components/common/ImageUploadInput';
import { ArrowLeft, Save } from 'lucide-react';

const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => <label className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className="neu-inset-input w-full" />;
const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => <textarea {...props} className="neu-inset-input w-full" rows={props.rows || 3} />;
const FormSectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-lg font-display font-bold text-on-surface mb-3 mt-6 border-b-2 border-primary/20 pb-2">{children}</h3>;

const AddProjectPage: React.FC = () => {
    const { refreshData } = useSuperAdminContext();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Partial<Project>>({
        name: '', logo_url: '', banner_url: '', description: '', long_description: '',
        website_urls: [''],
        twitter_url: '',
        discord_url: '',
    });

    const handleChange = (field: keyof Project, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (isDraft: boolean) => {
        if (!formData.name) {
            addToast('Please enter a project name.', 'warning');
            return;
        }

        const newProject: Tables<'projects'> = {
            id: uid(),
            name: formData.name || '',
            logo_url: formData.logo_url || '',
            banner_url: formData.banner_url || '',
            description: formData.description || '',
            long_description: formData.long_description || '',
            website_urls: formData.website_urls || [],
            twitter_url: formData.twitter_url || '',
            discord_url: formData.discord_url || '',
            approval_status: isDraft ? 'draft' : 'approved',
            is_published: !isDraft,
            created_at: new Date().toISOString(),
            drop_status: null,
            followers_x: null,
            has_pending_changes: false,
            is_crowned: false,
            is_hot: false,
            is_new: true,
            members_discord: null,
            nft_volume: null,
            pending_changes: null,
            raise_amount: null,
            reward_type: null,
            stage: null,
            status: 'ongoing',
            strategy_walkthrough: null,
            token_holding_settings_contract: null,
            token_holding_settings_link: null,
            token_holding_settings_name: null,
            token_symbol: null,
        };

        const success = await addOrUpdateProject(newProject as Project);
        if (success) {
            addToast(`Project "${formData.name}" ${isDraft ? 'saved as draft' : 'created'}.`, 'success');
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
                <FormRow><FormLabel>Name</FormLabel><FormInput value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Description</FormLabel><FormTextArea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Logo</FormLabel><ImageUploadInput value={formData.logo_url || ''} onChange={val => handleChange('logo_url', val)} /></FormRow>
                <FormRow><FormLabel>Banner</FormLabel><ImageUploadInput value={formData.banner_url || ''} onChange={val => handleChange('banner_url', val)} /></FormRow>
                
                <FormSectionHeader>Links</FormSectionHeader>
                <FormRow><FormLabel>Website</FormLabel><FormInput value={formData.website_urls?.[0] || ''} onChange={e => handleChange('website_urls', [e.target.value])} /></FormRow>
                <FormRow><FormLabel>Twitter</FormLabel><FormInput value={formData.twitter_url || ''} onChange={e => handleChange('twitter_url', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Discord</FormLabel><FormInput value={formData.discord_url || ''} onChange={e => handleChange('discord_url', e.target.value)} /></FormRow>
            </div>
            <div className="mt-6 pt-4 border-t border-border/20 flex justify-end gap-4">
                <button type="button" onClick={() => handleSave(true)} className="neu-button px-6 py-2 font-bold">Save as Draft</button>
                <button type="button" onClick={() => handleSave(false)} className="neu-button active px-6 py-2 font-bold flex items-center gap-2"><Save size={16} /> Publish Project</button>
            </div>
        </div>
    );
};

export default AddProjectPage;
