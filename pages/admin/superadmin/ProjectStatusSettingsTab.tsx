import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Project } from '../../../src/types';
import { useToast } from '../../../context/ToastContext';
import { addOrUpdateProject } from '../../../src/services/dataService';
import { useSuperAdminContext } from '../../../context/SuperAdminContext';
import { Crown, Sparkles, Flame } from 'lucide-react';

const StatusToggleCard: React.FC<{
  label: string;
  icon: React.ReactNode;
  colorClasses: string; // e.g., 'text-yellow-500'
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  isDisabled?: boolean;
  tooltip?: string;
}> = ({ label, icon, colorClasses, isChecked, onChange, isDisabled = false, tooltip }) => {
  
  const baseClasses = "flex flex-col items-center justify-center text-center gap-3 p-6 rounded-2xl transition-all duration-200 ease-in-out h-full w-full";
  
  const inactiveClasses = `bg-[rgb(var(--color-background))] shadow-outset-md hover:shadow-outset-sm text-on-surface-variant hover:text-primary cursor-pointer`;
  
  const activeClasses = `bg-[rgb(var(--color-background))] shadow-inset-md ${colorClasses} cursor-pointer`;

  const disabledClasses = "bg-surface/50 text-on-surface-variant/50 cursor-not-allowed !shadow-none";

  return (
    <label 
      className={`${baseClasses} ${isDisabled ? disabledClasses : (isChecked ? activeClasses : inactiveClasses)}`}
      title={isDisabled ? tooltip : undefined}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={isDisabled}
        className="absolute inset-0 opacity-0 w-0 h-0" // Hide it completely
        aria-label={label}
      />
      <div className={`transition-transform duration-200 ${isChecked ? 'scale-110' : 'scale-100'}`}>
        {icon}
      </div>
      <span className="font-display font-bold text-2xl tracking-wider uppercase">{label}</span>
      {isDisabled && <span className="text-xs font-semibold normal-case">(Automatic)</span>}
    </label>
  );
};


const ProjectStatusSettingsTab: React.FC = () => {
    const { project: initialProject } = useOutletContext<{ project: Project }>();
    const { addToast } = useToast();
    const { refreshData } = useSuperAdminContext();
    
    const [formData, setFormData] = useState<Partial<Project>>({
        isCrowned: initialProject.isCrowned,
        isNew: initialProject.isNew,
        isHot: initialProject.isHot,
    });
    
    useEffect(() => {
        setFormData({
            isCrowned: initialProject.isCrowned,
            isNew: initialProject.isNew,
            isHot: initialProject.isHot,
        });
    }, [initialProject]);

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
        <form onSubmit={handleSave} className="neu-card p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-on-surface mb-8 text-center">Manage Status Tags</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <StatusToggleCard
                    label="Crowned"
                    icon={<Crown size={48} />}
                    colorClasses="text-yellow-500"
                    isChecked={!!formData.isCrowned}
                    onChange={(checked) => handleChange('isCrowned', checked)}
                />
                <StatusToggleCard
                    label="New"
                    icon={<Sparkles size={48} />}
                    colorClasses="text-sky-500"
                    isChecked={!!formData.isNew}
                    onChange={(checked) => handleChange('isNew', checked)}
                />
                <StatusToggleCard
                    label="Hot"
                    icon={<Flame size={48} />}
                    colorClasses="text-red-500"
                    isChecked={!!formData.isHot}
                    onChange={(checked) => handleChange('isHot', checked)}
                />
                <StatusToggleCard
                    label="Early"
                    icon={<Sparkles size={48} />}
                    colorClasses="text-blue-500"
                    isChecked={isEarly}
                    onChange={() => {}} // No-op
                    isDisabled={true}
                    tooltip="This status is automatically applied to projects in the 'Early' or 'Pre-Launch' stage."
                />
            </div>

            <div className="mt-10 pt-6 border-t border-border/20 flex justify-center">
                <button type="submit" className="neu-button active px-12 py-3 text-lg font-bold">Save Status</button>
            </div>
        </form>
    );
};

export default ProjectStatusSettingsTab;