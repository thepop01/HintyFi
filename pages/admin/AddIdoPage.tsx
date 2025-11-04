import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, Ido } from '../../src/types';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import { useToast } from '../../context/ToastContext';
import { addOrUpdateIdo } from '../../src/services/dataService';
import { uid } from '../../utils/helpers';
import { ArrowLeft, Save, Search } from 'lucide-react';

const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => <label className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className="neu-inset-input w-full" />;
const FormSectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-lg font-display font-bold text-on-surface mb-3 mt-6 border-b-2 border-primary/20 pb-2">{children}</h3>;

const AddIdoPage: React.FC = () => {
    const { allProjects, refreshData } = useSuperAdminContext();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [idoDetails, setIdoDetails] = useState({
        raise_amount: '',
        valuation: '',
        supply: '',
        ido_date: '',
        price: ''
    });

    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        return allProjects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, allProjects]);

    const handleSelectProject = (project: Project) => {
        setSelectedProject(project);
        setSearchTerm('');
    };

    const handleIdoDetailChange = (field: keyof typeof idoDetails, value: string) => {
        setIdoDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (isDraft: boolean) => {
        if (!selectedProject) {
            addToast('Please select a project.', 'warning');
            return;
        }

        const newIdo = {
            id: uid(),
            project_id: selectedProject.id,
            ...idoDetails,
            status: isDraft ? 'draft' : 'published',
        };

        const success = await addOrUpdateIdo(newIdo);
        if (success) {
            addToast(`IDO for "${selectedProject.name}" ${isDraft ? 'saved as draft' : 'created'}.`, 'success');
            refreshData();
            navigate('/super-admin/idos');
        } else {
            addToast('Failed to save IDO.', 'error');
        }
    };

    return (
        <div className="neu-card p-6">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="neu-button p-2">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-display font-bold text-on-surface">Add New IDO</h2>
            </div>

            {!selectedProject ? (
                <div>
                    <FormSectionHeader>Select a Project</FormSectionHeader>
                    <div className="relative">
                        <FormInput 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            placeholder="Search for a project..."
                        />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    </div>
                    {searchResults.length > 0 && (
                        <div className="neu-card mt-2 p-2 max-h-60 overflow-y-auto">
                            {searchResults.map(p => (
                                <div key={p.id} onClick={() => handleSelectProject(p)} className="p-2 hover:bg-primary/10 rounded-md cursor-pointer flex items-center gap-3">
                                    <img src={p.logo_url || ''} alt={p.name} className="w-8 h-8 rounded-md object-cover bg-surface" />
                                    <span className="font-semibold">{p.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="max-h-[70vh] overflow-y-auto pr-4">
                    <FormSectionHeader>Project Info</FormSectionHeader>
                    <div className="flex items-center gap-4 p-3 neu-outset-card rounded-lg">
                        <img src={selectedProject.logo_url || ''} alt={selectedProject.name} className="w-12 h-12 rounded-lg object-cover bg-surface" />
                        <div>
                            <h4 className="font-bold text-lg">{selectedProject.name}</h4>
                        </div>
                    </div>

                    <FormSectionHeader>IDO Details</FormSectionHeader>
                    <FormRow><FormLabel>Raising Amount</FormLabel><FormInput value={idoDetails.raise_amount} onChange={e => handleIdoDetailChange('raise_amount', e.target.value)} /></FormRow>
                    <FormRow><FormLabel>Valuation</FormLabel><FormInput value={idoDetails.valuation} onChange={e => handleIdoDetailChange('valuation', e.target.value)} /></FormRow>
                    <FormRow><FormLabel>Supply</FormLabel><FormInput value={idoDetails.supply} onChange={e => handleIdoDetailChange('supply', e.target.value)} /></FormRow>
                    <FormRow><FormLabel>Date</FormLabel><FormInput type="date" value={idoDetails.ido_date} onChange={e => handleIdoDetailChange('ido_date', e.target.value)} /></FormRow>
                    <FormRow><FormLabel>Price</FormLabel><FormInput value={idoDetails.price} onChange={e => handleIdoDetailChange('price', e.target.value)} /></FormRow>
                </div>
            )}

            {selectedProject && (
                <div className="mt-6 pt-4 border-t border-border/20 flex justify-end gap-4">
                    <button type="button" onClick={() => handleSave(true)} className="neu-button px-6 py-2 font-bold">Save as Draft</button>
                    <button type="button" onClick={() => handleSave(false)} className="neu-button active px-6 py-2 font-bold flex items-center gap-2"><Save size={16} /> Publish IDO</button>
                </div>
            )}
        </div>
    );
};

export default AddIdoPage;
