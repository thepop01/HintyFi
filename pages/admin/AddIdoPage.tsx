import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, ProjectCategory, LinkItem } from '../../src/types';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import { useToast } from '../../context/ToastContext';
import { addOrUpdateProject } from '../../src/services/dataService';
import { uid } from '../../utils/helpers';
import ImageUploadInput from '../../components/common/ImageUploadInput';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => <label className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className="neu-inset-input w-full" />;
const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => <textarea {...props} className="neu-inset-input w-full" rows={props.rows || 3} />;
const FormSectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-lg font-display font-bold text-on-surface mb-3 mt-6 border-b-2 border-primary/20 pb-2">{children}</h3>;

const AddIdoPage: React.FC = () => {
    const { refreshData } = useSuperAdminContext();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Partial<Project>>({
        name: '', logo: '', banner: '', description: '', longDescription: '',
        category: ['launchpad'],
        links: { websites: [{label: 'Main Website', url: ''}] },
        idoDetails: { tokenPrice: '', vestingSchedule: '', totalSupply: '' }
    });

    const handleChange = (field: keyof Project, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
     const handleLinkChange = (field: 'twitter' | 'discord') => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(p => ({ ...p, links: { ...p.links, websites: p.links?.websites || [], [field]: e.target.value } as Project['links'] }));
    };

    const handleWebsiteChange = (index: number, field: keyof LinkItem, value: string) => {
        setFormData(p => {
            const newWebsites = [...(p.links?.websites || [])];
            newWebsites[index] = { ...newWebsites[index], [field]: value };
            return { ...p, links: { ...p.links, websites: newWebsites } as Project['links'] };
        });
    };

    const addWebsite = () => {
        setFormData(p => {
            const newWebsites = [...(p.links?.websites || []), { label: '', url: '' }];
            return { ...p, links: { ...p.links, websites: newWebsites } as Project['links'] };
        });
    };

    const removeWebsite = (index: number) => {
        setFormData(p => {
            const newWebsites = (p.links?.websites || []).filter((_, i) => i !== index);
            return { ...p, links: { ...p.links, websites: newWebsites } as Project['links'] };
        });
    };
    
    const handleIdoChange = (field: keyof NonNullable<Project['idoDetails']>, value: string) => {
        setFormData(prev => ({ ...prev, idoDetails: { ...(prev.idoDetails || { tokenPrice: '', vestingSchedule: '', totalSupply: '' }), [field]: value } }));
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
            links: formData.links || { websites: [] },
            category: formData.category as ProjectCategory[],
            events: [],
            status: 'ongoing',
            createdAt: Date.now(),
            votes: { up: 0, down: 0, voters: [] },
            approvalStatus: 'approved',
            idoDetails: formData.idoDetails,
        };

        if (addOrUpdateProject(newProject)) {
            addToast(`IDO Project "${formData.name}" created.`, 'success');
            refreshData();
            navigate('/super-admin/idos');
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
                <h2 className="text-2xl font-display font-bold text-on-surface">Add New IDO Project</h2>
            </div>
            <div className="max-h-[70vh] overflow-y-auto pr-4">
                <FormSectionHeader>Project Info</FormSectionHeader>
                <FormRow><FormLabel>Name</FormLabel><FormInput value={formData.name} onChange={e => handleChange('name', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Description</FormLabel><FormTextArea value={formData.description} onChange={e => handleChange('description', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Logo</FormLabel><ImageUploadInput value={formData.logo || ''} onChange={val => handleChange('logo', val)} /></FormRow>
                <FormRow><FormLabel>Banner</FormLabel><ImageUploadInput value={formData.banner || ''} onChange={val => handleChange('banner', val)} /></FormRow>
                
                <FormSectionHeader>Links</FormSectionHeader>
                <FormRow>
                    <FormLabel>Websites</FormLabel>
                    <div className="space-y-2">
                        {formData.links?.websites.map((site, i) => (
                             <div key={i} className="flex items-center gap-2">
                                <FormInput value={site.label} onChange={e => handleWebsiteChange(i, 'label', e.target.value)} placeholder="Label (e.g., Main Site)" className="w-1/3"/>
                                <FormInput value={site.url} onChange={e => handleWebsiteChange(i, 'url', e.target.value)} placeholder="https://..." />
                                <button type="button" onClick={() => removeWebsite(i)} className="neu-button !rounded-full !p-2 text-red-500"><Trash2 size={14}/></button>
                            </div>
                        ))}
                        <button type="button" onClick={addWebsite} className="neu-button px-3 py-1 text-sm flex items-center gap-1"><Plus size={14}/> Add Website</button>
                    </div>
                </FormRow>
                <FormRow><FormLabel>Twitter</FormLabel><FormInput value={formData.links?.twitter || ''} onChange={handleLinkChange('twitter')} /></FormRow>

                <FormSectionHeader>IDO Details</FormSectionHeader>
                <FormRow><FormLabel>Token Price</FormLabel><FormInput value={formData.idoDetails?.tokenPrice || ''} onChange={e => handleIdoChange('tokenPrice', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Vesting Schedule</FormLabel><FormInput value={formData.idoDetails?.vestingSchedule || ''} onChange={e => handleIdoChange('vestingSchedule', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Total Supply</FormLabel><FormInput value={formData.idoDetails?.totalSupply || ''} onChange={e => handleIdoChange('totalSupply', e.target.value)} /></FormRow>
                <FormRow><FormLabel>Raise</FormLabel><FormInput value={formData.raise || ''} onChange={e => handleChange('raise', e.target.value)} /></FormRow>
            </div>
            <div className="mt-6 pt-4 border-t border-border/20 flex justify-end">
                <button type="button" onClick={handleSave} className="neu-button active px-6 py-2 font-bold flex items-center gap-2"><Save size={16} /> Add IDO</button>
            </div>
        </div>
    );
};

export default AddIdoPage;
