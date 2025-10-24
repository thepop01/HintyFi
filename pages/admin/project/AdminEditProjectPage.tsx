import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Project, ProjectCategory, TeamMember } from '../../../src/types';
import { useToast } from '../../../context/ToastContext';
import { addOrUpdateProject } from '../../../src/services/dataService';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import ImageUploadInput from '../../../components/common/ImageUploadInput';

// Reusable form components
const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => <label htmlFor={htmlFor} className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormField: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;
const inputBaseClasses = "neu-inset-input w-full";
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className={`${inputBaseClasses} ${props.className}`} />;
const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => <textarea {...props} className={`${inputBaseClasses}`} rows={props.rows || 3} />;
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => <select {...props} className={`${inputBaseClasses} neu-select`}>{props.children}</select>;
const FormSectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-display font-bold text-on-surface mb-3 mt-6 border-b-2 border-primary/20 pb-2">{children}</h3>
);

const AdminEditProjectPage: React.FC = () => {
    const { project } = useOutletContext<{ project: Project }>();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Project>(project);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (field: 'logo' | 'banner', value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLinkChange = (field: 'website' | 'twitter' | 'discord' | 'whitelistInfo' | 'coinLink') => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, links: { ...prev.links, [field]: e.target.value } }));
    };

    const addTeamMember = () => setFormData(prev => ({ ...prev, team: [...(prev.team || []), { name: '', role: '', discordUserId: '', discordUsername: '', photoUrl: '', socials: { twitter: '', linkedin: '' } }] }));
    const removeTeamMember = (index: number) => setFormData(prev => ({ ...prev, team: prev.team?.filter((_, i) => i !== index) }));
    
    const handleTeamChange = (index: number, field: keyof Omit<TeamMember, 'socials'>, value: string) => {
        setFormData(prev => {
            if (!prev || !prev.team) return prev;
            const newTeam = [...prev.team];
            if (newTeam[index]) {
                newTeam[index] = { ...newTeam[index], [field]: value };
            }
            return { ...prev, team: newTeam };
        });
    };

    const handleTeamSocialChange = (index: number, social: 'twitter' | 'linkedin', value: string) => {
        setFormData(prev => {
            if (!prev || !prev.team) return prev;
            const newTeam = [...prev.team];
            const member = newTeam[index];
            if (member) {
                newTeam[index] = {
                    ...member,
                    socials: {
                        ...(member.socials || {}),
                        [social]: value,
                    },
                };
            }
            return { ...prev, team: newTeam };
        });
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = addOrUpdateProject(formData);
        if (success) {
            addToast(`Project "${formData.name}" updated successfully!`, 'success');
            navigate('/admin');
        } else {
            addToast('Failed to update project.', 'error');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="neu-card p-6">
            <FormSectionHeader>Basic Info</FormSectionHeader>
            <FormRow><FormLabel htmlFor="name">Project Name</FormLabel><FormField><FormInput name="name" value={formData.name} onChange={handleChange} required /></FormField></FormRow>
            <FormRow><FormLabel htmlFor="description">Short Desc</FormLabel><FormField><FormTextArea name="description" value={formData.description} onChange={handleChange} /></FormField></FormRow>
            <FormRow><FormLabel htmlFor="longDescription">Long Desc</FormLabel><FormField><FormTextArea name="longDescription" value={formData.longDescription} onChange={handleChange} rows={5} /></FormField></FormRow>
            
            <FormRow>
                <FormLabel>Logo</FormLabel>
                <FormField>
                    <ImageUploadInput value={formData.logo} onChange={(val) => handleImageChange('logo', val)} />
                </FormField>
            </FormRow>

            <FormRow>
                <FormLabel>Banner</FormLabel>
                <FormField>
                     <ImageUploadInput value={formData.banner} onChange={(val) => handleImageChange('banner', val)} />
                </FormField>
            </FormRow>

            <FormSectionHeader>Links</FormSectionHeader>
            <FormRow><FormLabel htmlFor="website">Website</FormLabel><FormField><FormInput id="website" value={formData.links?.website} onChange={handleLinkChange('website')} /></FormField></FormRow>
            <FormRow><FormLabel htmlFor="twitter">Twitter</FormLabel><FormField><FormInput id="twitter" value={formData.links?.twitter || ''} onChange={handleLinkChange('twitter')} /></FormField></FormRow>
            <FormRow><FormLabel htmlFor="discord">Discord</FormLabel><FormField><FormInput id="discord" value={formData.links?.discord || ''} onChange={handleLinkChange('discord')} /></FormField></FormRow>

            <FormSectionHeader>Team</FormSectionHeader>
            <div className="space-y-3">
                {formData.team?.map((member, i) => (
                    <div key={i} className="p-3 border rounded-lg bg-surface/50 relative neu-card">
                        <FormRow><FormLabel>Name</FormLabel><FormField><FormInput value={member.name} onChange={e => handleTeamChange(i, 'name', e.target.value)} /></FormField></FormRow>
                        <FormRow><FormLabel>Role</FormLabel><FormField><FormInput value={member.role} onChange={e => handleTeamChange(i, 'role', e.target.value)} /></FormField></FormRow>
                        <FormRow><FormLabel>Discord User ID</FormLabel><FormField><FormInput value={member.discordUserId || ''} onChange={e => handleTeamChange(i, 'discordUserId', e.target.value)} placeholder="e.g., 123456789012345678" /></FormField></FormRow>
                        <FormRow><FormLabel>Discord Username</FormLabel><FormField><FormInput value={member.discordUsername || ''} onChange={e => handleTeamChange(i, 'discordUsername', e.target.value)} placeholder="e.g., username#0000" /></FormField></FormRow>
                        <FormRow><FormLabel>Photo URL</FormLabel><FormField><FormInput value={member.photoUrl || ''} onChange={e => handleTeamChange(i, 'photoUrl', e.target.value)} placeholder="Overrides Discord photo" /></FormField></FormRow>
                        <FormRow><FormLabel>Twitter URL</FormLabel><FormField><FormInput value={member.socials?.twitter || ''} onChange={e => handleTeamSocialChange(i, 'twitter', e.target.value)} /></FormField></FormRow>
                        <FormRow><FormLabel>LinkedIn URL</FormLabel><FormField><FormInput value={member.socials?.linkedin || ''} onChange={e => handleTeamSocialChange(i, 'linkedin', e.target.value)} /></FormField></FormRow>
                        <button type="button" onClick={() => removeTeamMember(i)} className="absolute top-2 right-2 text-red-500 hover:text-red-400 p-1"><Trash2 size={16} /></button>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addTeamMember} className="neu-button px-3 py-1 text-sm flex items-center gap-1 mt-3"><Plus size={14} /> Add Team Member</button>

            <div className="mt-8 pt-4 border-t border-border/20 flex justify-end gap-3">
                <motion.button type="button" onClick={() => navigate('/admin')} className="neu-button px-6 py-2 font-bold">Cancel</motion.button>
                <motion.button type="submit" className="neu-button active px-6 py-2 font-bold">Save Changes</motion.button>
            </div>
        </form>
    );
};

export default AdminEditProjectPage;