import React, { useState, useEffect } from 'react';
import { Event, CampaignEvent } from '../../src/types';
import ImageUploadInput from '../common/ImageUploadInput';
import { Save } from 'lucide-react';

// Reusable form components from other admin pages
const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ htmlFor?: string, children: React.ReactNode }> = ({ htmlFor, children }) => <label htmlFor={htmlFor} className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormField: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;
const inputBaseClasses = "neu-inset-input w-full";
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className={`${inputBaseClasses} ${props.className}`} />;
const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => <textarea {...props} className={`${inputBaseClasses}`} rows={props.rows || 3} />;
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => <select {...props} className={`${inputBaseClasses} neu-select`}>{props.children}</select>;
const FormCheckbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <label className="flex items-center gap-3 cursor-pointer"><div className="relative flex items-center"><input type="checkbox" {...props} className="peer absolute opacity-0 w-5 h-5" /><div className="w-5 h-5 rounded bg-surface border border-border/30 peer-checked:bg-primary peer-checked:border-primary transition-colors"></div><svg className="absolute w-5 h-5 text-white transition-opacity opacity-0 peer-checked:opacity-100 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><span className="text-on-surface select-none">{label}</span></label>
);


interface CampaignFormProps {
    campaign?: Event | null;
    onSave: (event: Event) => void;
    onClose: () => void;
    projectName: string;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ campaign, onSave, onClose, projectName }) => {
    const defaultCampaign: Partial<CampaignEvent> = { type: 'campaign', title: '', description: '', image: '', pinned: false, category: 'community', startTime: Date.now(), endTime: Date.now() + 86400000, reward: '', projectName, status: 'draft', numberOfWinners: 0 };
    
    const [formData, setFormData] = useState<Event>((campaign || defaultCampaign) as Event);
    const [dateError, setDateError] = useState<string | null>(null);

    useEffect(() => {
        if (formData.type === 'campaign') { const { startTime, endTime } = formData; if (endTime <= startTime) { setDateError('End time must be after start time.'); } else { setDateError(null); } }
    }, [formData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') { setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked })); } 
        else if (name === 'startTime' || name === 'endTime') { setFormData(prev => ({...prev, [name]: new Date(value).getTime() })); }
        else if (type === 'number') { setFormData(prev => ({...prev, [name]: parseInt(value, 10) || 0 }))}
        else { setFormData(prev => ({ ...prev, [name]: value })); }
    };
    
    const handleSubmit = () => {
        if (dateError) { return; };
        onSave(formData);
    };
    
    const toDateTimeLocal = (timestamp: number) => new Date(timestamp - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <h3 className="text-xl font-display font-bold text-on-surface mb-4">{campaign ? 'Edit Campaign' : 'Create New Campaign'}</h3>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                <FormRow><FormLabel>Title</FormLabel><FormField><FormInput name="title" value={formData.title} onChange={handleChange} required /></FormField></FormRow>
                <FormRow><FormLabel>Description</FormLabel><FormField><FormTextArea name="description" value={formData.description} onChange={handleChange} /></FormField></FormRow>
                <FormRow><FormLabel>Image</FormLabel><FormField><ImageUploadInput value={formData.image} onChange={val => setFormData(p => ({...p, image: val}))} /></FormField></FormRow>
                <FormRow><FormLabel>Category</FormLabel><FormField><FormSelect name="category" value={formData.category} onChange={handleChange}><option>defi</option><option>nft</option><option>gaming</option><option>art</option><option>community</option></FormSelect></FormField></FormRow>
                <FormRow><FormLabel>Pinned</FormLabel><FormField><FormCheckbox label="Pin this campaign" name="pinned" checked={formData.pinned} onChange={handleChange} /></FormField></FormRow>
                <FormRow><FormLabel>Start Time</FormLabel><FormField><FormInput name="startTime" type="datetime-local" value={toDateTimeLocal((formData as CampaignEvent).startTime)} onChange={handleChange} /></FormField></FormRow>
                <FormRow><FormLabel>End Time</FormLabel><FormField><FormInput name="endTime" type="datetime-local" value={toDateTimeLocal((formData as CampaignEvent).endTime)} onChange={handleChange} /></FormField></FormRow>
                {dateError && <p className="text-red-500 text-sm text-right -mt-2">{dateError}</p>}
                <FormRow><FormLabel>Reward</FormLabel><FormField><FormInput name="reward" value={(formData as CampaignEvent).reward} onChange={handleChange} /></FormField></FormRow>
                <FormRow><FormLabel>Number of Winners</FormLabel><FormField><FormInput name="numberOfWinners" type="number" value={(formData as CampaignEvent).numberOfWinners || 0} onChange={handleChange} /></FormField></FormRow>
            </div>
            <div className="mt-6 pt-4 border-t border-border/20 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="neu-button px-4 py-2 font-bold">Cancel</button>
                <button type="button" onClick={handleSubmit} className="neu-button active px-4 py-2 font-bold flex items-center gap-2" disabled={!!dateError}><Save size={16} /> Save</button>
            </div>
        </form>
    );
};

export default CampaignForm;