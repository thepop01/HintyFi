import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Project } from '../../src/types';
import { useToast } from '../../context/ToastContext';
import { updateUserPermissions, removePointsFromUser, addPointsToUser } from '../../src/services/dataService';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Save, X, ArrowUp, ArrowDown, Search, History, ChevronDown, Users, MinusCircle, PlusCircle } from 'lucide-react';
import PaginationControls from '../common/PaginationControls';
import { useDebounce } from '../../hooks/useDebounce';
import { useSearchHistory } from '../../hooks/useSearchHistory';
import { useClickOutside } from '../../hooks/useClickOutside';
import { fuzzySearch } from '../../utils/helpers';
import EmptyState from '../common/EmptyState';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import Modal from '../common/Modal';

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => <select {...props} className="neu-inset-input neu-select w-full">{props.children}</select>;
const FormCheckbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-surface/50 transition-colors">
        <div className="relative flex items-center">
            <input type="checkbox" {...props} className="peer absolute opacity-0 w-5 h-5" />
            <div className="w-5 h-5 rounded bg-surface border border-border/30 peer-checked:bg-primary peer-checked:border-primary transition-colors"></div>
            <svg className="absolute w-5 h-5 text-white transition-opacity opacity-0 peer-checked:opacity-100 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <span className="text-on-surface select-none font-medium">{label}</span>
    </label>
);
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className="neu-inset-input w-full" />;


type SortableUserKeys = 'name' | 'role' | 'projects';

const UserManagementTab: React.FC = () => {
    const { users, approvedProjects: projects, refreshData } = useSuperAdminContext();
    const { addToast } = useToast();
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<{
        role: User['role'],
        associatedProjectIds: string[]
    }>({
        role: 'member',
        associatedProjectIds: []
    });
    const [sortConfig, setSortConfig] = useState<{ key: SortableUserKeys; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
    const [projectSearchTerm, setProjectSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const debouncedUserSearchTerm = useDebounce(userSearchTerm, 300);
    const [isUserSearchFocused, setIsUserSearchFocused] = useState(false);
    const { history: userHistory, addSearchTerm: addUserSearchTerm, clearHistory: clearUserHistory } = useSearchHistory('superadmin-user-search');
    const userSearchWrapperRef = useRef<HTMLDivElement>(null);
    useClickOutside(userSearchWrapperRef, () => setIsUserSearchFocused(false));

    const [userForRemovePoints, setUserForRemovePoints] = useState<User | null>(null);
    const [pointsToRemove, setPointsToRemove] = useState({ credo: 0, hint: 0, hintCategory: 'rewards', hintReason: '' });
    const [userForAddPoints, setUserForAddPoints] = useState<User | null>(null);
    const [pointsToAdd, setPointsToAdd] = useState({ credo: 0, hint: 0, hintCategory: 'rewards', hintReason: '' });


    const debouncedProjectSearchTerm = useDebounce(projectSearchTerm, 300);

    const handleEdit = (user: User) => {
        if (editingUser?.id === user.id) {
            setEditingUser(null);
        } else {
            setEditingUser(user);
            setPermissions({
                role: user.role,
                associatedProjectIds: user.associatedProjectIds || []
            });
            setProjectSearchTerm('');
        }
    };

    const handleCancel = () => setEditingUser(null);

    const handleProjectToggle = (projectId: string) => {
        setPermissions(prev => {
            const newIds = prev.associatedProjectIds.includes(projectId) ? prev.associatedProjectIds.filter(id => id !== projectId) : [...prev.associatedProjectIds, projectId];
            return { ...prev, associatedProjectIds: newIds };
        });
    };

    const handleSave = () => {
        if (!editingUser) return;
        const success = updateUserPermissions(editingUser.id, permissions.role, permissions.associatedProjectIds);
        if (success) {
            addToast(`Permissions updated for ${editingUser.name}`, 'success');
            refreshData();
            setEditingUser(null);
        } else {
            addToast('Failed to update permissions.', 'error');
        }
    };
    
    const handleOpenRemovePointsModal = (user: User) => {
        setUserForRemovePoints(user);
        setPointsToRemove({ credo: 0, hint: 0, hintCategory: 'rewards', hintReason: '' });
    };
    
    const handleOpenAddPointsModal = (user: User) => {
        setUserForAddPoints(user);
        setPointsToAdd({ credo: 0, hint: 0, hintCategory: 'rewards', hintReason: '' });
    };

    const handlePointsChange = (setter: React.Dispatch<React.SetStateAction<any>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setter(prev => ({ ...prev, [name]: (name === 'credo' || name === 'hint') ? parseInt(value, 10) || 0 : value }));
    };

    const handleRemovePoints = () => {
        if (!userForRemovePoints) return;
        const success = removePointsFromUser(
            userForRemovePoints.id,
            { credo: pointsToRemove.credo },
            { points: pointsToRemove.hint, category: pointsToRemove.hintCategory as any, reason: pointsToRemove.hintReason }
        );
        if (success) {
            addToast(`Points removed from ${userForRemovePoints.name}`, 'success');
            refreshData();
            setUserForRemovePoints(null);
        } else {
            addToast('Failed to remove points.', 'error');
        }
    };
    
    const handleAddPoints = () => {
        if (!userForAddPoints) return;
        const success = addPointsToUser(
            userForAddPoints.id,
            { credo: pointsToAdd.credo },
            { points: pointsToAdd.hint, category: pointsToAdd.hintCategory as any, reason: pointsToAdd.hintReason }
        );
        if (success) {
            addToast(`Points added to ${userForAddPoints.name}`, 'success');
            refreshData();
            setUserForAddPoints(null);
        } else {
            addToast('Failed to add points.', 'error');
        }
    };


    const requestSort = (key: SortableUserKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedUsers = useMemo(() => {
        let filtered = users.filter(u => u.role !== 'super_admin' && fuzzySearch(debouncedUserSearchTerm, u.name));
        if (sortConfig) {
            filtered.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof User] || '';
                let bValue: any = b[sortConfig.key as keyof User] || '';
                if (sortConfig.key === 'projects') {
                    aValue = a.associatedProjectIds?.length || 0;
                    bValue = b.associatedProjectIds?.length || 0;
                }
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [users, debouncedUserSearchTerm, sortConfig]);

    const { paginatedUsers, totalPages } = useMemo(() => {
        const total = filteredAndSortedUsers.length;
        const pages = Math.ceil(total / pageSize);
        const paginated = filteredAndSortedUsers.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
        return { paginatedUsers: paginated, totalPages: pages };
    }, [filteredAndSortedUsers, currentPage, pageSize]);

    useEffect(() => { setCurrentPage(0); }, [debouncedUserSearchTerm, sortConfig, pageSize]);
    
    const filteredProjects = useMemo(() => projects.filter(p => fuzzySearch(debouncedProjectSearchTerm, p.name)), [projects, debouncedProjectSearchTerm]);
    
    const SortableHeader: React.FC<{ sortKey: SortableUserKeys; children: React.ReactNode }> = ({ sortKey, children }) => {
        const isSorted = sortConfig?.key === sortKey;
        return (
            <th className="px-6 py-3 text-left text-sm font-bold text-on-surface-variant cursor-pointer" onClick={() => requestSort(sortKey)}>
                <div className="flex items-center gap-1">{children} {isSorted && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</div>
            </th>
        );
    };
    
    const userSearchSuggestions = useMemo(() => {
        if (!debouncedUserSearchTerm) return [];
        return users.filter(u => u.role !== 'super_admin' && fuzzySearch(debouncedUserSearchTerm, u.name)).slice(0, 5);
    }, [debouncedUserSearchTerm, users]);
    
    const handleUserSearchSelect = (term: string) => {
        setUserSearchTerm(term);
        addUserSearchTerm(term);
        setIsUserSearchFocused(false);
    };

    return (
        <div className="neu-card p-4 overflow-hidden">
            <div ref={userSearchWrapperRef} className="mb-4 relative max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by name..." 
                    value={userSearchTerm} 
                    onChange={(e) => setUserSearchTerm(e.target.value)} 
                    onFocus={() => setIsUserSearchFocused(true)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { addUserSearchTerm(userSearchTerm); setIsUserSearchFocused(false); } }}
                    className="neu-inset-control w-full pl-12 pr-4 py-2 text-on-surface placeholder:text-on-surface-variant/70 text-base"
                />
                 <AnimatePresence>
                    {isUserSearchFocused && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full mt-2 w-full bg-[rgb(var(--color-surface-container))] rounded-lg shadow-lg z-50 border border-border/10 overflow-hidden"
                        >
                            {userSearchTerm.length === 0 && userHistory.length > 0 && (
                                <div>
                                    <div className="flex justify-between items-center px-3 py-2 bg-surface/50"><h4 className="text-xs font-bold text-on-surface-variant">RECENT</h4><button onClick={clearUserHistory} className="text-xs text-on-surface-variant/70 hover:text-primary">Clear</button></div>
                                    {userHistory.map(term => <button key={term} onClick={() => handleUserSearchSelect(term)} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-primary/10"><History size={16} className="text-on-surface-variant" /><span>{term}</span></button>)}
                                </div>
                            )}
                            {userSearchTerm.length > 0 && userSearchSuggestions.length > 0 && (
                                <div>
                                    <h4 className="px-3 py-2 bg-surface/50 text-xs font-bold text-on-surface-variant">SUGGESTIONS</h4>
                                    {userSearchSuggestions.map(u => <button key={u.id} onClick={() => handleUserSearchSelect(u.name)} className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-primary/10"><img src={u.profilePic || `https://i.pravatar.cc/32?u=${u.id}`} alt={u.name} className="w-6 h-6 rounded-full"/><span>{u.name}</span></button>)}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {paginatedUsers.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-surface/50"><tr>
                                <SortableHeader sortKey="name">User</SortableHeader>
                                <SortableHeader sortKey="role">Role</SortableHeader>
                                <SortableHeader sortKey="projects">Assigned Projects</SortableHeader>
                                <th className="p-3 text-center text-sm font-bold text-on-surface-variant">Actions</th>
                            </tr></thead>
                            <tbody>
                                {paginatedUsers.map(user => (
                                <React.Fragment key={user.id}>
                                    <tr className="border-b border-border/10">
                                        <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={user.profilePic || `https://i.pravatar.cc/32?u=${user.id}`} alt={user.name} className="w-8 h-8 rounded-full" /><span className="font-semibold">{user.name}</span></div></td>
                                        <td className="px-6 py-4 capitalize">{user.role.replace('_', ' ')}</td>
                                        <td className="px-6 py-4">{user.associatedProjectIds?.map(id => projects.find(p=>p.id===id)?.name).join(', ') || 'N/A'}</td>
                                        <td className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(user)} className="neu-button px-3 py-1 text-sm flex items-center gap-1"><Edit size={14}/> {editingUser?.id === user.id ? 'Close' : 'Edit'}</motion.button>
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleOpenAddPointsModal(user)} className="neu-button p-2" title="Add Points"><PlusCircle size={14} /></motion.button>
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleOpenRemovePointsModal(user)} className="neu-button p-2" title="Remove Points"><MinusCircle size={14} /></motion.button>
                                            </div>
                                        </td>
                                    </tr>
                                    {editingUser?.id === user.id && (
                                        <tr><td colSpan={4} className="p-0 bg-surface/20"><motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div><h4 className="font-bold text-on-surface mb-2">Role</h4><FormSelect value={permissions.role} onChange={e => setPermissions(p => ({...p, role: e.target.value as User['role']}))}><option value="member">Member</option><option value="project_admin">Project Admin</option></FormSelect></div>
                                            </div>
                                            {permissions.role === 'project_admin' && (<div><h4 className="font-bold text-on-surface mb-2">Assign Projects</h4><div className="mb-2"><input type="text" placeholder="Search projects..." value={projectSearchTerm} onChange={(e) => setProjectSearchTerm(e.target.value)} className="neu-inset-input w-full"/></div><div className="max-h-48 overflow-y-auto p-2 rounded-md bg-surface border border-border/20 grid grid-cols-1 sm:grid-cols-2 gap-1">{filteredProjects.map(p => <FormCheckbox key={p.id} label={p.name} checked={permissions.associatedProjectIds.includes(p.id)} onChange={() => handleProjectToggle(p.id)} />)}</div></div>)}
                                        </div><div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border/10"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCancel} className="neu-button px-4 py-1.5 font-semibold">Cancel</motion.button><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSave} className="neu-button active px-4 py-1.5 font-semibold">Save</motion.button></div></motion.div></td></tr>
                                    )}
                                </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/10">
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            pageSize={pageSize}
                            onPageSizeChange={setPageSize}
                            totalItems={filteredAndSortedUsers.length}
                        />
                    </div>
                </>
            ) : (
                <EmptyState 
                    icon={<Users size={48} />}
                    title="No Users Found"
                    description={debouncedUserSearchTerm ? `Your search for "${debouncedUserSearchTerm}" did not match any users.` : `There are no users to display.`}
                />
            )}

            <Modal
                isOpen={!!userForAddPoints}
                onClose={() => setUserForAddPoints(null)}
                title={`Add Points to ${userForAddPoints?.name}`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="font-semibold text-on-surface-variant text-sm mb-1 block">Credo Points to Add</label>
                        <FormInput type="number" name="credo" value={pointsToAdd.credo} onChange={handlePointsChange(setPointsToAdd)} />
                    </div>
                    <div className="p-3 border rounded-md border-border/20 space-y-3">
                        <h4 className="font-bold">Hint Points Adjustment</h4>
                        <div>
                            <label className="font-semibold text-on-surface-variant text-sm mb-1 block">Points to Add</label>
                            <FormInput type="number" name="hint" value={pointsToAdd.hint} onChange={handlePointsChange(setPointsToAdd)} />
                        </div>
                        <div>
                            <label className="font-semibold text-on-surface-variant text-sm mb-1 block">Category</label>
                            <FormSelect name="hintCategory" value={pointsToAdd.hintCategory} onChange={handlePointsChange(setPointsToAdd)}>
                                <option value="rewards">Rewards</option>
                                <option value="wins">Campaign Wins</option>
                                <option value="tasks">Task Completion</option>
                            </FormSelect>
                        </div>
                        <div>
                            <label className="font-semibold text-on-surface-variant text-sm mb-1 block">Reason (Optional)</label>
                            <FormInput name="hintReason" value={pointsToAdd.hintReason} onChange={handlePointsChange(setPointsToAdd)} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setUserForAddPoints(null)} className="neu-button px-4 py-1.5 font-semibold">Cancel</button>
                        <button type="button" onClick={handleAddPoints} className="neu-button active !text-green-500 !border-green-500/50 px-4 py-1.5 font-semibold">Add Points</button>
                    </div>
                </div>
            </Modal>
            
            <Modal
                isOpen={!!userForRemovePoints}
                onClose={() => setUserForRemovePoints(null)}
                title={`Remove Points from ${userForRemovePoints?.name}`}
            >
                <div className="space-y-4">
                     <div>
                        <label className="font-semibold text-on-surface-variant text-sm mb-1 block">Credo Points to Remove</label>
                        <FormInput type="number" name="credo" value={pointsToRemove.credo} onChange={handlePointsChange(setPointsToRemove)} />
                    </div>
                    <div className="p-3 border rounded-md border-border/20 space-y-3">
                        <h4 className="font-bold">Hint Points Adjustment</h4>
                        <div>
                            <label className="font-semibold text-on-surface-variant text-sm mb-1 block">Points to Remove</label>
                            <FormInput type="number" name="hint" value={pointsToRemove.hint} onChange={handlePointsChange(setPointsToRemove)} />
                        </div>
                        <div>
                            <label className="font-semibold text-on-surface-variant text-sm mb-1 block">Category</label>
                            <FormSelect name="hintCategory" value={pointsToRemove.hintCategory} onChange={handlePointsChange(setPointsToRemove)}>
                                <option value="rewards">Rewards</option>
                                <option value="wins">Campaign Wins</option>
                                <option value="tasks">Task Completion</option>
                            </FormSelect>
                        </div>
                        <div>
                            <label className="font-semibold text-on-surface-variant text-sm mb-1 block">Reason (Optional)</label>
                            <FormInput name="hintReason" value={pointsToRemove.hintReason} onChange={handlePointsChange(setPointsToRemove)} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setUserForRemovePoints(null)} className="neu-button px-4 py-1.5 font-semibold">Cancel</button>
                        <button type="button" onClick={handleRemovePoints} className="neu-button active !text-red-500 !border-red-500/50 px-4 py-1.5 font-semibold">Remove Points</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagementTab;