import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Project, TeamMember, LinkItem, User } from '../../../src/types';
import { useToast } from '../../../context/ToastContext';
import { addOrUpdateProject, getUsers } from '../../../src/services/dataService';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import ImageUploadInput from '../../../components/common/ImageUploadInput';

// --- HELPER HOOKS & FUNCTIONS (Copied for component use) ---

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
}

type Handler = (event: MouseEvent | TouchEvent) => void;
function useClickOutside<T extends HTMLElement = HTMLElement>(ref: React.RefObject<T>, handler: Handler): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

const fuzzySearch = (query: string, text: string): boolean => {
    if (!query || !text) return true;
    const search = query.toLowerCase();
    const target = text.toLowerCase();
    if (target.includes(search)) return true;
    let i = 0;
    let j = 0;
    while (i < search.length && j < target.length) {
        if (search[i] === target[j]) i++;
        j++;
    }
    return i === search.length;
};

// Reusable form components
const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => <label htmlFor={htmlFor} className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormField: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => <div className={className}>{children}</div>;
const inputBaseClasses = "neu-inset-input w-full";
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className={`${inputBaseClasses} ${props.className}`} />;
const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => <textarea {...props} className={`${inputBaseClasses}`} rows={props.rows || 3} />;
const FormSectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-display font-bold text-on-surface mb-3 mt-6 border-b-2 border-primary/20 pb-2">{children}</h3>
);

// --- UserSearchInput Component ---
interface UserSearchInputProps {
    allUsers: User[];
    value: string;
    onUserSelect: (user: User) => void;
    onChange: (value: string) => void;
}
const UserSearchInput: React.FC<UserSearchInputProps> = ({ allUsers, value, onUserSelect, onChange }) => {
    const [searchTerm, setSearchTerm] = useState(value);
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useClickOutside(wrapperRef, () => setIsFocused(false));

    useEffect(() => { setSearchTerm(value); }, [value]);

    useEffect(() => {
        if (debouncedSearchTerm && isFocused) {
            const filtered = allUsers.filter(user => 
                fuzzySearch(debouncedSearchTerm, user.name) ||
                (user.discordUsername && fuzzySearch(debouncedSearchTerm, user.discordUsername))
            ).slice(0, 5);
            setSuggestions(filtered);
            setActiveIndex(-1);
        } else {
            setSuggestions([]);
        }
    }, [debouncedSearchTerm, allUsers, isFocused]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter' && activeIndex > -1) {
            e.preventDefault();
            handleSelect(suggestions[activeIndex]);
        } else if (e.key === 'Escape') {
            setSearchTerm('');
            setSuggestions([]);
            setIsFocused(false);
            onChange('');
        }
    };

    const handleSelect = (user: User) => {
        onUserSelect(user);
        setSearchTerm(user.name);
        setSuggestions([]);
        setIsFocused(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        onChange(e.target.value);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <FormInput
                type="text" value={searchTerm} onChange={handleChange}
                onFocus={() => setIsFocused(true)} onKeyDown={handleKeyDown}
                placeholder="Search by username..." autoComplete="off"
            />
            {isFocused && suggestions.length > 0 && (
                <ul className="absolute top-full mt-2 w-full bg-[rgb(var(--color-surface-container))] rounded-lg shadow-lg z-10 border border-border/10 overflow-hidden">
                    {suggestions.map((user, index) => (
                        <li key={user.id}>
                            <button
                                type="button" onClick={() => handleSelect(user)}
                                className={`w-full text-left p-2 flex items-center gap-2 ${index === activeIndex ? 'bg-primary/10' : 'hover:bg-primary/10'}`}
                            >
                                <img src={user.profile_pic_url || `https://i.pravatar.cc/32?u=${user.id}`} alt={user.name} className="w-6 h-6 rounded-full" />
                                <span>{user.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};


// --- MAIN COMPONENT ---
const AdminEditProjectPage: React.FC = () => {
    const { project } = useOutletContext<{ project: Project }>();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Project>(project);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const users = await getUsers();
            setAllUsers(users);
        };
        fetchUsers();
    }, []);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (field: 'logo' | 'banner', value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLinkChange = (field: 'twitter' | 'discord' | 'coinLink') => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, links: { ...prev.links, websites: prev.links?.websites || [], [field]: e.target.value } }));
    };
    
    const handleWebsiteChange = (index: number, field: keyof LinkItem, value: string) => {
        setFormData(p => {
            const newWebsites = [...(p.links?.websites || [])];
            newWebsites[index] = { ...newWebsites[index], [field]: value };
            return { ...p, links: { ...p.links, websites: newWebsites } as Project['links'] };
        });
    };

    const addWebsite = () => {
        setFormData(p => {
            const newWebsites = [...(p.links?.websites || []), { label: '', url: '' }];
            return { ...p, links: { ...p.links, websites: newWebsites } as Project['links'] };
        });
    };

    const removeWebsite = (index: number) => {
        setFormData(p => {
            const newWebsites = (p.links?.websites || []).filter((_, i) => i !== index);
            return { ...p, links: { ...p.links, websites: newWebsites } as Project['links'] };
        });
    };

    const addTeamMember = () => setFormData(prev => ({ ...prev, team: [...(prev.team || []), { name: '', role: '' }] }));
    const removeTeamMember = (index: number) => setFormData(prev => ({ ...prev, team: prev.team?.filter((_, i) => i !== index) }));
    
    const handleTeamChange = (index: number, field: keyof TeamMember, value: string) => {
        setFormData(prev => {
            if (!prev.team) return prev;
            const newTeam = [...prev.team];
            (newTeam[index] as any)[field] = value;
            return { ...prev, team: newTeam };
        });
    };

    const handleTeamUserSelect = (index: number, user: User) => {
        setFormData(prev => {
            if (!prev.team) return prev;
            const newTeam = [...prev.team];
            newTeam[index] = { 
                ...newTeam[index], 
                name: user.name, 
                discordUserId: user.discordId, 
                discordUsername: user.discordUsername,
                photoUrl: user.profile_pic_url,
                socials: user.socials,
            };
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
            <FormRow><FormLabel htmlFor="longDescription">Long Desc</FormLabel><FormField><FormTextArea name="long_description" value={formData.long_description} onChange={handleChange} rows={5} /></FormField></FormRow>
            
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
            <FormRow>
                <FormLabel>Websites</FormLabel>
                <FormField>
                    <div className="space-y-2">
                        {formData.links?.websites.map((site, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <FormInput value={site.label} onChange={e => handleWebsiteChange(i, 'label', e.target.value)} placeholder="Label (e.g., Main Site)" className="w-1/3"/>
                                <FormInput value={site.url} onChange={e => handleWebsiteChange(i, 'url', e.target.value)} placeholder="https://..." />
                                <button type="button" onClick={() => removeWebsite(i)} className="neu-button !rounded-full !p-2 text-red-500"><Trash2 size={14}/></button>
                            </div>
                        ))}
                        <button type="button" onClick={addWebsite} className="neu-button px-3 py-1 text-sm flex items-center gap-1"><Plus size={14}/> Add Website</button>
                    </div>
                </FormField>
            </FormRow>
            <FormRow><FormLabel htmlFor="twitter">Twitter</FormLabel><FormField><FormInput id="twitter" value={formData.links?.twitter || ''} onChange={handleLinkChange('twitter')} /></FormField></FormRow>
            <FormRow><FormLabel htmlFor="discord">Discord</FormLabel><FormField><FormInput id="discord" value={formData.links?.discord || ''} onChange={handleLinkChange('discord')} /></FormField></FormRow>

            <FormSectionHeader>Team</FormSectionHeader>
            <div className="space-y-4">
                {formData.team?.map((member, i) => (
                    <div key={i} className="neu-outset-card p-4 relative">
                        <button type="button" onClick={() => removeTeamMember(i)} className="absolute top-2 right-2 text-red-500 hover:text-red-400 p-1"><Trash2 size={16} /></button>
                         <FormRow>
                            <FormLabel>Member</FormLabel>
                            <FormField>
                                <UserSearchInput
                                    allUsers={allUsers}
                                    value={member.name}
                                    onUserSelect={(user) => handleTeamUserSelect(i, user)}
                                    onChange={(value) => handleTeamChange(i, 'name', value)}
                                />
                            </FormField>
                        </FormRow>
                        <FormRow>
                            <FormLabel>Role</FormLabel>
                            <FormField>
                                <FormInput
                                    placeholder="Role in project"
                                    value={member.role}
                                    onChange={(e) => handleTeamChange(i, 'role', e.target.value)}
                                />
                            </FormField>
                        </FormRow>
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