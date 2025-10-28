import React, { useState, useEffect } from 'react';
import { User } from '../../src/types';
import Modal from '../common/Modal';
import ImageUploadInput from '../common/ImageUploadInput';
import { Save } from 'lucide-react';

// Reusable form components
const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => <label className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className="neu-inset-input w-full" />;
const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => <textarea {...props} className="neu-inset-input w-full" rows={props.rows || 3} />;

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSave: (updatedUser: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        if (user) {
            setFormData({
                ...user
            });
        }
    }, [user, isOpen]);

    const handleChange = (field: keyof User, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSocialChange = (field: 'twitter' | 'discord' | 'github', value: string) => {
        setFormData(prev => ({
            ...prev,
            socials: {
                ...prev.socials,
                [field]: value,
            },
        }));
    };
    
    const handleSubmit = () => {
        onSave(formData as User);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile">
            <div className="max-h-[70vh] overflow-y-auto pr-4">
                <FormRow><FormLabel>Nickname</FormLabel><FormInput value={formData.nickname || ''} onChange={e => handleChange('nickname', e.target.value)} /></FormRow>
                
                <h3 className="text-lg font-display font-bold text-on-surface mb-3 mt-6 border-b-2 border-primary/20 pb-2">Links</h3>
                <FormRow><FormLabel>Twitter Handle</FormLabel><FormInput value={formData.socials?.twitter || ''} onChange={e => handleSocialChange('twitter', e.target.value)} placeholder="@username" /></FormRow>
                <FormRow><FormLabel>Discord</FormLabel><FormInput value={formData.socials?.discord || ''} onChange={e => handleSocialChange('discord', e.target.value)} placeholder="username#0000" /></FormRow>
                <FormRow><FormLabel>GitHub Handle</FormLabel><FormInput value={formData.socials?.github || ''} onChange={e => handleSocialChange('github', e.target.value)} placeholder="username" /></FormRow>
                <FormRow><FormLabel>Wallet Address</FormLabel><FormInput value={formData.walletAddress || ''} onChange={e => handleChange('walletAddress', e.target.value)} placeholder="0x..." /></FormRow>
            </div>
             <div className="mt-6 pt-4 border-t border-border/20 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="neu-button px-6 py-2 font-bold">Cancel</button>
                <button type="button" onClick={handleSubmit} className="neu-button active px-6 py-2 font-bold flex items-center gap-2"><Save size={16} /> Save Changes</button>
            </div>
        </Modal>
    );
};

export default EditProfileModal;