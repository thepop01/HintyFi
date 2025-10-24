import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Project } from '../../../src/types';
import { useToast } from '../../../context/ToastContext';
import { addOrUpdateProject } from '../../../src/services/dataService';
import { useSuperAdminContext } from '../../../context/SuperAdminContext';
import { Crown, Sparkles, Flame } from 'lucide-react';

const FormCheckbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: React.ReactNode }> = ({ label, icon, ...props }) => (
    <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg hover:bg-surface/50 transition-colors border border-border/10">
        <div className="relative flex items-center">
            <input type="checkbox" {...props} className="peer absolute opacity-0 w-6 h-6" />
            <div className="w-6 h-6 rounded-md bg-surface border-2 border-border/30 peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                <svg className="w-4 h-4 text-white transition-opacity opacity-0 peer-checked:opacity-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
        </div>
        <div className="flex items-center gap-2">
            {icon}
            <span className="text-on-surface select-none font-semibold text-lg">{label}</span>
        </div>
    </label>
);

const ProjectStatusSettingsTab: React.FC = () => {
    const { project: initialProject } = useOutletContext<{ project: Project }>();
    const { addToast } = useToast();
    const { refreshData } = useSuperAdminContext();
    
    const [formData, setFormData] = useState<Partial<Project>>({
        isCrowned: initialProject.isCrowned,
        isNew: initialProject.isNew,
        isHot: initialProject.isHot,
    });
    
    const isEarly = initialProject.stage === 'Early' || initialProject.stage === 'Pre-Launch';

    const handleChange = (field: 'isCrowned' | 'isNew' | 'isHot', value: boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedProject = { ...initialProject, ...formData };
        if (addOrUpdateProject(updatedProject)) {
            addToast('Project status updated!', 'success');
            refreshData();
        } else {
            addToast('Failed to update status.', 'error');
        }
    };

    return (
        <form onSubmit={handleSave} className="neu-card p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-display font-bold text-on-surface mb-6">Manage Status Tags</h2>
            
            <div className="space-y-4">
                <FormCheckbox 
                    label="Crowned" 
                    icon={<Crown className="text-yellow-500" />}
                    checked={!!formData.isCrowned}
                    onChange={(e) => handleChange('isCrowned', e.target.checked)}
                />
                <FormCheckbox 
                    label="New" 
                    icon={<Sparkles className="text-sky-500" />}
                    checked={!!formData.isNew}
                    onChange={(e) => handleChange('isNew', e.target.checked)}
                />
                <FormCheckbox 
                    label="Hot" 
                    icon={<Flame className="text-red-500" />}
                    checked={!!formData.isHot}
                    onChange={(e) => handleChange('isHot', e.target.checked)}
                />
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border/10 bg-surface/50 opacity-70">
                    <div className="w-6 h-6 rounded-md bg-surface border-2 border-border/30 flex items-center justify-center">
                        {isEarly && <svg className="w-4 h-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-blue-500" />
                        <span className="text-on-surface select-none font-semibold text-lg">Early</span>
                    </div>
                    <span className="ml-auto text-xs text-on-surface-variant">(Automatic based on stage)</span>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border/20 flex justify-end">
                <button type="submit" className="neu-button active px-6 py-2 font-bold">Save Status</button>
            </div>
        </form>
    );
};

export default ProjectStatusSettingsTab;