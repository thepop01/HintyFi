import React, { useState, useEffect } from 'react';
import { Task } from '../../src/types';
import { Save } from 'lucide-react';

const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => <label htmlFor={htmlFor} className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormField: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;
const inputBaseClasses = "neu-inset-input w-full";
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className={`${inputBaseClasses} ${props.className}`} />;
const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => <textarea {...props} className={`${inputBaseClasses}`} rows={props.rows || 3} />;
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => <select {...props} className={`${inputBaseClasses} neu-select`}>{props.children}</select>;

interface TaskFormProps {
    task?: Partial<Task> | null;
    onSave: (task: Task) => void;
    onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Task>>(task || { title: '', description: '', type: 'social', platform: 'x', points: 100, link: '' });
    
    useEffect(() => {
        setFormData(task || { title: '', description: '', type: 'social', platform: 'x', points: 100, link: '' });
    }, [task]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumber = ['points'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseInt(value, 10) || 0 : value }));
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.link) {
            alert('Please fill in title and link.');
            return;
        }
        onSave(formData as Task);
    };

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <h3 className="text-xl font-display font-bold text-on-surface mb-4">{task ? 'Edit Task' : 'Create New Task'}</h3>
             <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                <FormRow><FormLabel>Title</FormLabel><FormField><FormInput name="title" value={formData.title} onChange={handleChange} required /></FormField></FormRow>
                <FormRow><FormLabel>Description</FormLabel><FormField><FormTextArea name="description" value={formData.description} onChange={handleChange} /></FormField></FormRow>
                <FormRow><FormLabel>Type</FormLabel><FormField><FormSelect name="type" value={formData.type} onChange={handleChange}><option value="community">Community</option><option value="social">Social</option><option value="creative">Creative</option><option value="on-chain">On-chain</option></FormSelect></FormField></FormRow>
                <FormRow><FormLabel>Platform</FormLabel><FormField><FormSelect name="platform" value={formData.platform} onChange={handleChange}><option value="guild">Guild</option><option value="x">X (Twitter)</option><option value="discord">Discord</option><option value="youtube">YouTube</option><option value="testnet">Testnet</option><option value="website">Website</option></FormSelect></FormField></FormRow>
                <FormRow><FormLabel>Points</FormLabel><FormField><FormInput name="points" type="number" value={formData.points} onChange={handleChange} /></FormField></FormRow>
                <FormRow><FormLabel>Link</FormLabel><FormField><FormInput name="link" value={formData.link} onChange={handleChange} required /></FormField></FormRow>
            </div>
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-border/20">
                <button type="button" onClick={onClose} className="neu-button px-4 py-2 font-bold">Cancel</button>
                <button type="button" onClick={handleSubmit} className="neu-button active px-4 py-2 font-bold flex items-center gap-2"><Save size={16} /> Save</button>
            </div>
        </form>
    );
};

export default TaskForm;