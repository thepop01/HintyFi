import React from 'react';
import { useToast } from '../../context/ToastContext';
import { UploadCloud } from 'lucide-react';

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className={`neu-inset-input w-full ${props.className}`} />
);

interface ImageUploadInputProps {
    value: string;
    onChange: (value: string) => void;
}

const ImageUploadInput: React.FC<ImageUploadInputProps> = ({ value, onChange }) => {
    const { addToast } = useToast();
    const fileInputId = React.useId();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                addToast('File size should not exceed 2MB.', 'warning');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <FormInput 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)} 
                    placeholder="https://... or upload" 
                />
                <input 
                    type="file" 
                    id={fileInputId}
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept="image/png, image/jpeg, image/gif, image/webp, image/svg+xml" 
                />
                <label 
                    htmlFor={fileInputId} 
                    className="neu-button px-4 py-2 cursor-pointer whitespace-nowrap flex items-center gap-2"
                >
                    <UploadCloud size={16} />
                    Upload
                </label>
            </div>
            {value && (
                <div className="mt-2">
                    <img 
                        src={value} 
                        alt="Image preview" 
                        className="max-h-24 max-w-full rounded-md object-contain bg-surface/50 p-1 border border-border/10" 
                    />
                </div>
            )}
        </div>
    );
};

export default ImageUploadInput;