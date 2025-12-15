import React, { useState, useMemo, useEffect } from 'react';
import { Project, Task } from '../../src/types';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import { useToast } from '../../context/ToastContext';
import { addOrUpdateProject } from '../../src/services/dataService';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Plus, Edit, Search, Filter, Trash2 } from 'lucide-react';
import TaskForm from './TaskForm';
import ConfirmationModal from '../common/ConfirmationModal';

interface FlattenedTask {
    task: Task;
    project: Project;
}

const TaskListSection: React.FC<{
    title: string;
    items: FlattenedTask[];
    onApprove?: (task: Task, project: Project) => void;
    onReject?: (task: Task, project: Project) => void;
    onEdit?: (item: FlattenedTask) => void;
    onDelete?: (item: FlattenedTask) => void;
    editingItemId?: string | null;
    renderEditForm?: (item: FlattenedTask) => React.ReactNode;
}> = ({ title, items, onApprove, onReject, onEdit, onDelete, editingItemId, renderEditForm }) => (
    <div>
        <h3 className="text-lg font-bold text-on-surface-variant mb-2">{title} ({items.length})</h3>
        {items.length > 0 ? (
            <div className="neu-card p-4 space-y-3">
                {items.map(item => (
                    <div key={item.task.id} className="neu-outset-card overflow-hidden">
                        <div className="p-3 flex items-center justify-between gap-2">
                            <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">{item.project.name}</span>
                                    <p className="font-bold">{item.task.title}</p>
                                </div>
                                <p className="text-sm text-on-surface-variant">{item.task.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {onApprove && <button onClick={() => onApprove(item.task, item.project)} className="neu-button active !text-green-500 !border-green-500/50 px-3 py-1 text-sm flex items-center gap-1"><Check size={14} /> Approve</button>}
                                {onReject && <button onClick={() => onReject(item.task, item.project)} className="neu-button active !text-red-500 !border-red-500/50 px-3 py-1 text-sm flex items-center gap-1"><X size={14} /> Reject</button>}
                                {onEdit && <button onClick={() => onEdit(item)} className="neu-button p-2"><Edit size={16} /></button>}
                                {onDelete && <button onClick={() => onDelete(item)} className="neu-button p-2 hover:!text-red-500"><Trash2 size={16} /></button>}
                            </div>
                        </div>
                        <AnimatePresence>
                            {editingItemId === item.task.id && renderEditForm && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border/10 p-4 bg-surface/20">
                                    {renderEditForm(item)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        ) : <p className="text-sm text-on-surface-variant">No tasks in this category.</p>}
    </div>
);


const EventsTasks: React.FC = () => {
    const { allProjects, refreshData } = useSuperAdminContext();
    const { addToast } = useToast();
    const [isCreating, setIsCreating] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);

    // Filtering
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

    // Delete confirmation
    const [itemToDelete, setItemToDelete] = useState<FlattenedTask | null>(null);

    const allFlattenedTasks = useMemo(() => {
        return allProjects.flatMap(p => (p.tasks || []).map(t => ({ task: t, project: p })));
    }, [allProjects]);

    const filteredTasks = useMemo(() => {
        return allFlattenedTasks.filter(item => {
            const matchesSearch = item.task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.project.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesProject = selectedProjectId === 'all' || item.project.id === selectedProjectId;
            return matchesSearch && matchesProject;
        });
    }, [allFlattenedTasks, searchTerm, selectedProjectId]);

    const tasksByStatus = useMemo(() => {
        const pending = filteredTasks.filter(i => i.task.status === 'pending');
        const approved = filteredTasks.filter(i => i.task.status === 'approved');
        const others = filteredTasks.filter(i => i.task.status === 'draft' || i.task.status === 'rejected' || !i.task.status);
        return { pending, approved, others };
    }, [filteredTasks]);


    const updateTaskInProject = async (project: Project, updatedTask: Task, isDelete: boolean = false) => {
        let newTasks = project.tasks ? [...project.tasks] : [];
        if (isDelete) {
            newTasks = newTasks.filter(t => t.id !== updatedTask.id);
        } else {
            const existingIndex = newTasks.findIndex(t => t.id === updatedTask.id);
            if (existingIndex >= 0) {
                newTasks[existingIndex] = updatedTask;
            } else {
                newTasks.push(updatedTask);
            }
        }

        if (await addOrUpdateProject({ ...project, tasks: newTasks })) {
            return true;
        }
        return false;
    };

    const handleStatusUpdate = async (task: Task, project: Project, status: 'approved' | 'rejected') => {
        const updatedTask = { ...task, status };
        if (await updateTaskInProject(project, updatedTask)) {
            addToast(`Task has been ${status}.`, 'success');
            refreshData();
        } else {
            addToast('Failed to update task status.', 'error');
        }
    };

    const handleEdit = (item: FlattenedTask) => {
        setEditingItemId(prevId => prevId === item.task.id ? null : item.task.id);
        setIsCreating(false);
    };

    const handleDeleteClick = (item: FlattenedTask) => {
        setItemToDelete(item);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        if (await updateTaskInProject(itemToDelete.project, itemToDelete.task, true)) {
            addToast('Task deleted.', 'success');
            refreshData();
        } else {
            addToast('Failed to delete task.', 'error');
        }
        setItemToDelete(null);
    };

    const handleSave = async (taskData: Task, targetProjectId?: string) => {
        // If targetProjectId is provided, we need to add to that project.
        // If editing, we check if project changed.

        let targetProject: Project | undefined;
        let originProject: Project | undefined;

        // Try to find origin project
        const originItem = allFlattenedTasks.find(i => i.task.id === taskData.id);
        if (originItem) {
            originProject = originItem.project;
        }

        if (targetProjectId) {
            targetProject = allProjects.find(p => p.id === targetProjectId);
        } else if (originProject) {
            targetProject = originProject;
        }

        if (!targetProject) {
            addToast('No project selected for this task.', 'error');
            return;
        }

        // Check if moving projects
        if (originProject && originProject.id !== targetProject.id) {
            // Remove from old
            const removed = await updateTaskInProject(originProject, taskData, true);
            if (!removed) {
                addToast('Failed to move task (could not remove from old project).', 'error');
                return;
            }
        }

        // Add/Update in target
        const taskToSave = { ...taskData, status: taskData.status || 'approved' } as Task;
        const saved = await updateTaskInProject(targetProject, taskToSave);

        if (saved) {
            const isNew = !originItem;
            addToast(`Task ${isNew ? 'created' : 'updated'} successfully.`, 'success');
            refreshData();
            setIsCreating(false);
            setEditingItemId(null);
        } else {
            addToast('Failed to save task to project.', 'error');
        }
    };

    const projectOptions = useMemo(() => allProjects.map(p => ({ id: p.id, name: p.name })), [allProjects]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70" size={16} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="neu-inset-control pl-9 pr-3 py-2 w-full md:w-64"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={selectedProjectId}
                            onChange={e => setSelectedProjectId(e.target.value)}
                            className="neu-inset-control py-2 pl-3 pr-8 w-40"
                        >
                            <option value="all">All Projects</option>
                            {projectOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 pointer-events-none" size={16} />
                    </div>
                </div>

                <button onClick={() => { setIsCreating(!isCreating); setEditingItemId(null); }} className="neu-button active px-4 py-2 flex items-center gap-2">
                    <Plus size={18} /> {isCreating ? 'Cancel' : 'Create New Task'}
                </button>
            </div>

            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="neu-card p-4 my-4">
                            <TaskForm
                                onSave={handleSave}
                                onClose={() => setIsCreating(false)}
                                projects={projectOptions}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <TaskListSection
                title="Pending Approval"
                items={tasksByStatus.pending}
                onApprove={(t, p) => handleStatusUpdate(t, p, 'approved')}
                onReject={(t, p) => handleStatusUpdate(t, p, 'rejected')}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                editingItemId={editingItemId}
                renderEditForm={(item) => (
                    <TaskForm
                        task={item.task}
                        onSave={handleSave}
                        onClose={() => setEditingItemId(null)}
                        projects={projectOptions}
                        initialProjectId={item.project.id}
                    />
                )}
            />

            <TaskListSection
                title="Approved Tasks"
                items={tasksByStatus.approved}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                editingItemId={editingItemId}
                renderEditForm={(item) => (
                    <TaskForm
                        task={item.task}
                        onSave={handleSave}
                        onClose={() => setEditingItemId(null)}
                        projects={projectOptions}
                        initialProjectId={item.project.id}
                    />
                )}
            />

            <TaskListSection
                title="Rejected / Drafts / Others"
                items={tasksByStatus.others}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                editingItemId={editingItemId}
                renderEditForm={(item) => (
                    <TaskForm
                        task={item.task}
                        onSave={handleSave}
                        onClose={() => setEditingItemId(null)}
                        projects={projectOptions}
                        initialProjectId={item.project.id}
                    />
                )}
            />

            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Task?"
                confirmText="Delete"
            >
                Are you sure you want to delete this task? This cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

export default EventsTasks;
