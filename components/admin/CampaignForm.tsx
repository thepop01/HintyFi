import React, { useState, useEffect } from 'react';
import { Tables } from '../../src/types';
type Event = Tables<'campaigns'>;
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
    campaign?: Partial<Event> | null;
    onSave: (event: Partial<Event>) => void;
    onClose: () => void;
    projectName: string;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ campaign, onSave, onClose, projectName }) => {
    const defaultCampaign: Partial<Event> = { name: '', description: '', banner_url: '', start_date: new Date().toISOString(), end_date: new Date(Date.now() + 86400000).toISOString(), total_rewards: 0, project_id: projectName, is_active: false };
    
    const [formData, setFormData] = useState<Partial<Event>>(campaign || defaultCampaign);
    const [dateError, setDateError] = useState<string | null>(null);

    useEffect(() => {
        if (formData.start_date && formData.end_date) { if (formData.end_date <= formData.start_date) { setDateError('End time must be after start time.'); } else { setDateError(null); } }
    }, [formData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') { setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked })); } 
        else if (name === 'start_date' || name === 'end_date') { setFormData(prev => ({...prev, [name]: new Date(value).toISOString() })); }
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
                <FormRow><FormLabel>Title</FormLabel><FormField><FormInput name="name" value={formData.name} onChange={handleChange} required /></FormField></FormRow>
                <FormRow><FormLabel>Description</FormLabel><FormField><FormTextArea name="description" value={formData.description || ''} onChange={handleChange} /></FormField></FormRow>
                <FormRow><FormLabel>Image</FormLabel><FormField><ImageUploadInput value={formData.banner_url || ''} onChange={val => setFormData(p => ({...p, banner_url: val}))} /></FormField></FormRow>
                <FormRow><FormLabel>Active</FormLabel><FormField><FormCheckbox label="Activate this campaign" name="is_active" checked={formData.is_active || false} onChange={handleChange} /></FormField></FormRow>
                <FormRow><FormLabel>Start Time</FormLabel><FormField><FormInput name="start_date" type="datetime-local" value={toDateTimeLocal(new Date(formData.start_date || '').getTime())} onChange={handleChange} /></FormField></FormRow>
                <FormRow><FormLabel>End Time</FormLabel><FormField><FormInput name="end_date" type="datetime-local" value={toDateTimeLocal(new Date(formData.end_date || '').getTime())} onChange={handleChange} /></FormField></FormRow>
                {dateError && <p className="text-red-500 text-sm text-right -mt-2">{dateError}</p>}
                <FormRow><FormLabel>Total Rewards</FormLabel><FormField><FormInput name="total_rewards" type="number" value={formData.total_rewards || 0} onChange={handleChange} /></FormField></FormRow>
            </div>
            <div className="mt-6 pt-4 border-t border-border/20 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="neu-button px-4 py-2 font-bold">Cancel</button>
                <button type="button" onClick={handleSubmit} className="neu-button active px-4 py-2 font-bold flex items-center gap-2" disabled={!!dateError}><Save size={16} /> Save</button>
            </div>
        </form>
    );
};

export default CampaignForm;