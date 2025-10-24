import React, { useState, useMemo, useRef } from 'react';
import { SiteContentSettings, Project, Event } from '../../src/types';
import { getSiteContentSettings, updateSiteContentSettings, getProjects, getEvents } from '../../src/services/dataService';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import { Search, X, ChevronDown, Check } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';

const inputBaseClasses = "neu-inset-input w-full";
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className={`${inputBaseClasses} ${props.className}`} />;

// Multi-select project selector component
const ProjectSelector: React.FC<{
    allProjects: Project[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    filterFn?: (project: Project) => boolean;
}> = ({ allProjects, selectedIds, onSelectionChange, filterFn }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    useClickOutside(wrapperRef, () => setIsOpen(false));

    const availableProjects = useMemo(() => {
        const projects = filterFn ? allProjects.filter(filterFn) : allProjects;
        return projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allProjects, filterFn, searchTerm]);
    
    const selectedProjects = useMemo(() => {
        return allProjects.filter(p => selectedIds.includes(p.id));
    }, [allProjects, selectedIds]);

    const handleToggle = (projectId: string) => {
        const newIds = selectedIds.includes(projectId)
            ? selectedIds.filter(id => id !== projectId)
            : [...selectedIds, projectId];
        onSelectionChange(newIds);
    };

    const handleRemove = (projectId: string) => {
        onSelectionChange(selectedIds.filter(id => id !== projectId));
    };

    return (
        <div ref={wrapperRef} className="relative">
            <div 
                className="neu-inset-input flex items-center justify-between cursor-pointer min-h-[40px]"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-1">
                    {selectedProjects.length > 0 ? selectedProjects.map(p => (
                        <span key={p.id} className="bg-primary/20 text-primary text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                            {p.name}
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemove(p.id); }}
                                className="text-primary hover:text-red-500"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )) : <span className="text-on-surface-variant/70">Select projects...</span>}
                </div>
                <ChevronDown size={20} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-[rgb(var(--color-surface-container))] rounded-lg shadow-lg z-10 border border-border/10">
                    <div className="p-2 border-b border-border/10 relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-2 py-1 bg-surface/50 rounded"
                        />
                    </div>
                    <ul className="max-h-60 overflow-y-auto">
                        {availableProjects.map(p => (
                            <li key={p.id}>
                                <button
                                    type="button"
                                    onClick={() => handleToggle(p.id)}
                                    className="w-full text-left p-2 hover:bg-primary/10 flex items-center justify-between"
                                >
                                    <span>{p.name}</span>
                                    {selectedIds.includes(p.id) && <Check size={16} className="text-primary" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// Editor for a single hero section
const HeroSectionEditor: React.FC<{
    title: string;
    sectionKey: keyof SiteContentSettings;
    settings: any;
    onSettingsChange: (key: keyof SiteContentSettings, field: string, value: any) => void;
    allProjects: Project[];
    filterFn?: (project: Project) => boolean;
}> = ({ title, sectionKey, settings, onSettingsChange, allProjects, filterFn }) => {

    const hasTextFields = 'title' in settings && 'subtitle' in settings;

    return (
        <div className="neu-outset-card p-4">
            <h3 className="font-bold text-lg text-on-surface mb-3">{title}</h3>
            {hasTextFields && (
                 <>
                    <div className="mb-2">
                        <label className="text-sm font-semibold text-on-surface-variant">Title</label>
                        <FormInput
                            value={settings.title}
                            onChange={(e) => onSettingsChange(sectionKey, 'title', e.target.value)}
                        />
                    </div>
                    <div className="mb-2">
                        <label className="text-sm font-semibold text-on-surface-variant">Subtitle</label>
                        <FormInput
                            value={settings.subtitle}
                            onChange={(e) => onSettingsChange(sectionKey, 'subtitle', e.target.value)}
                        />
                    </div>
                </>
            )}
            <div className="mb-2">
                <label className="text-sm font-semibold text-on-surface-variant">Featured Projects</label>
                <ProjectSelector
                    allProjects={allProjects}
                    selectedIds={settings.featuredProjectIds}
                    onSelectionChange={(ids) => onSettingsChange(sectionKey, 'featuredProjectIds', ids)}
                    filterFn={filterFn}
                />
            </div>
        </div>
    );
};


const ContentManagementTab: React.FC = () => {
    const [settings, setSettings] = useState<SiteContentSettings>(getSiteContentSettings());
    const [allProjects] = useState<Project[]>(getProjects());
    const [allEvents] = useState<Event[]>(getEvents());
    const { addToast } = useToast();

    const handleSettingsChange = (
        sectionKey: keyof SiteContentSettings,
        field: string,
        value: any
    ) => {
        setSettings(prev => ({
            ...prev,
            [sectionKey]: {
                ...prev[sectionKey],
                [field]: value
            }
        }));
    };
    
    const handleSave = () => {
        if (updateSiteContentSettings(settings)) {
            addToast('Hero section content updated!', 'success');
        } else {
            addToast('Failed to save settings.', 'error');
        }
    };

    const sectionConfigs = [
        { key: 'campaigns', title: 'Campaigns Page', filterFn: (p: Project) => allEvents.some(e => e.type === 'campaign' && e.projectName === p.name) },
        { key: 'tasks', title: 'Tasks Page', filterFn: (p: Project) => !!p.tasksInfo },
        { key: 'meme', title: 'Meme Page', filterFn: (p: Project) => p.category.includes('meme') },
        { key: 'nft', title: 'NFT Page', filterFn: (p: Project) => p.category.includes('nft') },
        { key: 'thisWeek', title: 'This Week Page', filterFn: (p: Project) => allEvents.some(e => e.projectName === p.name) },
    ] as const;


    return (
        <div className="neu-card p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-display font-bold text-on-surface">Manage Content</h2>
                <motion.button
                    onClick={handleSave}
                    className="neu-button active px-6 py-2 font-bold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Save Changes
                </motion.button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sectionConfigs.map(config => (
                    <HeroSectionEditor
                        key={config.key}
                        title={config.title}
                        sectionKey={config.key}
                        settings={settings[config.key]}
                        onSettingsChange={handleSettingsChange}
                        allProjects={allProjects}
                        filterFn={config.filterFn}
                    />
                ))}
            </div>
        </div>
    );
};

export default ContentManagementTab;
