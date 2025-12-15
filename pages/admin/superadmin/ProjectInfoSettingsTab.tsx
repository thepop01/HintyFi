import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Project, NftCollection, Coin, TeamMember, ProjectCategory, LinkItem, User } from '../../../src/types';
import { useToast } from '../../../context/ToastContext';
import { addOrUpdateProject, getCategoriesFromDB } from '../../../src/services/dataService';
import { Plus, Trash2 } from 'lucide-react';
import { uid } from '../../../utils/helpers';
import { useSuperAdminContext } from '../../../context/SuperAdminContext';
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
const FormField: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;
const inputBaseClasses = "neu-inset-input w-full";
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className={`${inputBaseClasses} ${props.className}`} />;
const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => <textarea {...props} className={`${inputBaseClasses}`} rows={props.rows || 3} />;
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => <select {...props} className={`${inputBaseClasses} neu-select`}>{props.children}</select>;
const FormCheckbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (<label className="flex items-center gap-3 cursor-pointer"><div className="relative flex items-center"><input type="checkbox" {...props} className="peer absolute opacity-0 w-5 h-5" /><div className="w-5 h-5 rounded bg-surface border border-border/30 peer-checked:bg-primary peer-checked:border-primary transition-colors"></div><svg className="absolute w-5 h-5 text-white transition-opacity opacity-0 peer-checked:opacity-100 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><span className="text-on-surface select-none">{label}</span></label>);
const FormSectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-lg font-display font-bold text-on-surface mb-3 mt-6 border-b-2 border-primary/20 pb-2">{children}</h3>;


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
export const ProjectInfoSettingsTab: React.FC = () => {
    const { project: initialProject } = useOutletContext<{ project: Project }>();
    const { users: allUsers, refreshData } = useSuperAdminContext();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [formData, setFormData] = useState<Project>(initialProject!);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        getCategoriesFromDB().then(setCategories);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (field: 'logo' | 'banner', value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentCategories = prev.category || [];
            const newCategories = checked ? [...currentCategories, value as ProjectCategory] : currentCategories.filter(c => c !== value);
            return { ...prev, category: newCategories };
        });
    };
    const handleLinkChange = (field: 'twitter' | 'discord') => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(p => ({ ...p, links: { ...p.links, websites: p.links?.websites || [], [field]: e.target.value } as Project['links'] }));
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

    const handleStrategyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { setFormData(prev => ({ ...prev, strategyWalkthrough: e.target.value.split('\n') })); };

    const addTeamMember = () => setFormData(p => ({ ...p, team: [...(p.team || []), { name: '', role: '' }] }));
    const removeTeamMember = (index: number) => setFormData(p => ({ ...p, team: p.team?.filter((_, i) => i !== index) }));

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

    const addCoin = () => setFormData(prev => prev ? ({ ...prev, coins: [...(prev.coins || []), { id: uid(), type: 'meme', network: 'mainnet', name: '', contractAddress: '', link: '', image: '', symbol: '', imageUrl: '' }] }) : null);
    const removeCoin = (id: string) => { setFormData(prev => prev ? ({ ...prev, coins: prev.coins?.filter(c => c.id !== id) }) : null); };
    const handleCoinChange = (id: string, field: keyof Omit<Coin, 'id'>, value: string) => { setFormData(prev => prev ? ({ ...prev, coins: prev.coins?.map(c => c.id === id ? { ...c, [field]: value } : c) }) : null); };

    const addCollection = () => { setFormData(prev => prev ? ({ ...prev, nftCollections: [...(prev.nftCollections || []), { id: uid(), name: '', image: '', contractAddress: '', link: '', network: 'mainnet', perks: [], status: 'draft', pointsPerDay: 0 }] }) : null); };
    const removeCollection = (id: string) => { setFormData(prev => prev ? ({ ...prev, nftCollections: prev.nftCollections?.filter(c => c.id !== id) }) : null); };
    const handleCollectionChange = (id: string, field: keyof Omit<NftCollection, 'id' | 'perks'>, value: string) => { setFormData(prev => prev ? ({ ...prev, nftCollections: prev.nftCollections?.map(c => c.id === id ? { ...c, [field]: value } : c) }) : null); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await addOrUpdateProject(formData);
        if (success) {
            addToast(`Project "${formData.name}" info updated!`, 'success');
            refreshData();
        } else {
            addToast('Failed to save project info.', 'error');
        }
    };

    if (!formData) return null;

    return (
        <form onSubmit={handleSubmit} className="neu-card p-6">
            <FormSectionHeader>Basic Info</FormSectionHeader>
            <FormRow><FormLabel>Name</FormLabel><FormField><FormInput name="name" value={formData.name} onChange={handleChange} /></FormField></FormRow>
            <FormRow><FormLabel>Short Desc</FormLabel><FormField><FormTextArea name="description" value={formData.description} onChange={handleChange} /></FormField></FormRow>
            <FormRow><FormLabel>Long Desc</FormLabel><FormField><FormTextArea name="long_description" value={formData.long_description} onChange={handleChange} rows={5} /></FormField></FormRow>
            <FormRow><FormLabel>Logo</FormLabel><FormField><ImageUploadInput value={formData.logo} onChange={val => handleImageChange('logo', val)} /></FormField></FormRow>
            <FormRow><FormLabel>Banner</FormLabel><FormField><ImageUploadInput value={formData.banner} onChange={val => handleImageChange('banner', val)} /></FormField></FormRow>
            <FormRow>
                <FormLabel>Stage</FormLabel>
                <FormField>
                    <FormSelect name="stage" value={formData.stage} onChange={handleChange}>
                        <option value="Private">Private</option>
                        <option value="Early">Early</option>
                        <option value="Pre-Launch">Pre-Launch</option>
                        <option value="Launched">Launched</option>
                    </FormSelect>
                </FormField>
            </FormRow>
            <FormRow><FormLabel>Category</FormLabel><FormField><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{categories.map(cat => (<FormCheckbox key={cat} label={cat} value={cat} checked={formData.category?.includes(cat as ProjectCategory)} onChange={handleCategoryChange} />))}</div></FormField></FormRow>
            <FormRow><FormLabel>Strategy Walkthrough</FormLabel><FormField><FormTextArea value={formData.strategy_walkthrough?.join('\n') || ''} onChange={handleStrategyChange} rows={5} placeholder="One step per line" /></FormField></FormRow>

            <FormSectionHeader>Links</FormSectionHeader>
            {formData.has_pending_changes && formData.pending_changes?.links && (
                <div className="mb-4 p-3 bg-yellow-500/20 text-yellow-800 rounded-md text-sm">
                    <p className="font-bold">There are pending link changes that require approval:</p>
                    <ul className="list-disc pl-5 mt-1">
                        {Object.entries(formData.pending_changes.links).map(([key, value]) => <li key={key}><strong>{key}:</strong> {value as string}</li>)}
                    </ul>
                </div>
            )}
            <FormRow>
                <FormLabel>Websites</FormLabel>
                <FormField>
                    <div className="space-y-2">
                        {formData.links?.websites.map((site, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <FormInput value={site.label} onChange={e => handleWebsiteChange(i, 'label', e.target.value)} placeholder="Label (e.g., Main Site)" className="w-1/3" />
                                <FormInput value={site.url} onChange={e => handleWebsiteChange(i, 'url', e.target.value)} placeholder="https://..." />
                                <button type="button" onClick={() => removeWebsite(i)} className="neu-button !rounded-full !p-2 text-red-500"><Trash2 size={14} /></button>
                            </div>
                        ))}
                        <button type="button" onClick={addWebsite} className="neu-button px-3 py-1 text-sm flex items-center gap-1"><Plus size={14} /> Add Website</button>
                    </div>
                </FormField>
            </FormRow>
            <FormRow><FormLabel>Twitter</FormLabel><FormField><FormInput value={formData.links?.twitter || ''} onChange={handleLinkChange('twitter')} /></FormField></FormRow>
            <FormRow><FormLabel>Discord</FormLabel><FormField><FormInput value={formData.links?.discord || ''} onChange={handleLinkChange('discord')} /></FormField></FormRow>

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

            <FormSectionHeader>Coins</FormSectionHeader>
            {formData.coins?.map((coin) => (
                <div key={coin.id} className="neu-outset-card p-3 mb-2 relative">
                    <FormRow><FormLabel>Name</FormLabel><FormField><FormInput value={coin.name} onChange={e => handleCoinChange(coin.id, 'name', e.target.value)} /></FormField></FormRow>
                    <FormRow><FormLabel>Type</FormLabel><FormField><FormSelect value={coin.type} onChange={e => handleCoinChange(coin.id, 'type', e.target.value)}><option value="meme">Meme</option><option value="ecosystem">Ecosystem</option></FormSelect></FormField></FormRow>
                    <FormRow><FormLabel>Link</FormLabel><FormField><FormInput value={coin.link} onChange={e => handleCoinChange(coin.id, 'link', e.target.value)} /></FormField></FormRow>
                    <FormRow><FormLabel>Image</FormLabel><FormField><ImageUploadInput value={coin.image} onChange={val => handleCoinChange(coin.id, 'image', val)} /></FormField></FormRow>
                    <button type="button" onClick={() => removeCoin(coin.id)} className="absolute top-2 right-2 p-1 text-red-500"><Trash2 size={16} /></button>
                </div>
            ))}
            <button type="button" onClick={addCoin} className="neu-button px-3 py-1 text-sm mt-3"><Plus size={14} /> Add Coin</button>

            <FormSectionHeader>NFT Collections</FormSectionHeader>
            {formData.nftCollections?.map((coll) => (
                <div key={coll.id} className="neu-outset-card p-3 mb-2 relative">
                    <FormRow><FormLabel>Name</FormLabel><FormField><FormInput value={coll.name} onChange={e => handleCollectionChange(coll.id, 'name', e.target.value)} /></FormField></FormRow>
                    <FormRow><FormLabel>Link</FormLabel><FormField><FormInput value={coll.link} onChange={e => handleCollectionChange(coll.id, 'link', e.target.value)} /></FormField></FormRow>
                    <FormRow><FormLabel>Image</FormLabel><FormField><ImageUploadInput value={coll.image} onChange={val => handleCollectionChange(coll.id, 'image', val)} /></FormField></FormRow>
                    <button type="button" onClick={() => removeCollection(coll.id)} className="absolute top-2 right-2 p-1 text-red-500"><Trash2 size={16} /></button>
                </div>
            ))}
            <button type="button" onClick={addCollection} className="neu-button px-3 py-1 text-sm mt-3"><Plus size={14} /> Add NFT Collection</button>

            <div className="mt-8 pt-4 border-t border-border/20 flex justify-end">
                <button type="submit" className="neu-button active px-6 py-2 font-bold">Save Info</button>
            </div>
        </form>
    );
};

export default ProjectInfoSettingsTab;