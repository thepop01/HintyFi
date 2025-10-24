import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Project, Task } from '../../../src/types';
import { useSuperAdminContext } from '../../../context/SuperAdminContext';
import { useToast } from '../../../context/ToastContext';
import { addOrUpdateProject } from '../../../src/services/dataService';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Plus, Edit } from 'lucide-react';
import TaskForm from '../../../components/admin/TaskForm';

const TaskListSection: React.FC<{ 
    title: string; 
    tasks: Task[]; 
    onApprove?: (id: string) => void; 
    onReject?: (id: string) => void; 
    onEdit?: (task: Task) => void;
    editingTaskId?: string | null;
    renderEditForm?: (task: Task) => React.ReactNode;
}> = ({ title, tasks, onApprove, onReject, onEdit, editingTaskId, renderEditForm }) => (
    <div>
        <h3 className="text-lg font-bold text-on-surface-variant mb-2">{title} ({tasks.length})</h3>
        {tasks.length > 0 ? (
            <div className="neu-card p-4 space-y-3">
                {tasks.map(task => (
                    <div key={task.id} className="neu-outset-card overflow-hidden">
                        <div className="p-3 flex items-center justify-between gap-2">
                            <div className="flex-grow min-w-0">
                                <p className="font-bold">{task.title}</p>
                                <p className="text-sm text-on-surface-variant">{task.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {onApprove && <button onClick={() => onApprove(task.id)} className="neu-button active !text-green-500 !border-green-500/50 px-3 py-1 text-sm flex items-center gap-1"><Check size={14} /> Approve</button>}
                                {onReject && <button onClick={() => onReject(task.id)} className="neu-button active !text-red-500 !border-red-500/50 px-3 py-1 text-sm flex items-center gap-1"><X size={14} /> Reject</button>}
                                {onEdit && <button onClick={() => onEdit(task)} className="neu-button p-2"><Edit size={16} /></button>}
                            </div>
                        </div>
                         <AnimatePresence>
                            {editingTaskId === task.id && renderEditForm && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border/10 p-4 bg-surface/20">
                                    {renderEditForm(task)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        ) : <p className="text-sm text-on-surface-variant">No tasks in this category.</p>}
    </div>
);

const ProjectTasksVerificationTab: React.FC = () => {
    const { project: initialProject } = useOutletContext<{ project: Project }>();
    const { refreshData } = useSuperAdminContext();
    const { addToast } = useToast();
    
    const [project, setProject] = useState(initialProject);
    const [isCreating, setIsCreating] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    
    useEffect(() => {
        setProject(initialProject);
    }, [initialProject, refreshData]);

    const tasksByStatus = useMemo(() => {
        const tasks = project.tasks || [];
        const pending = tasks.filter(t => t.status === 'pending');
        const approved = tasks.filter(t => t.status === 'approved');
        const others = tasks.filter(t => t.status === 'draft' || t.status === 'rejected');
        return { pending, approved, others };
    }, [project.tasks]);

    const handleStatusUpdate = (taskId: string, status: 'approved' | 'rejected') => {
        const newTasks = (project.tasks || []).map(t => t.id === taskId ? { ...t, status } : t);
        if (addOrUpdateProject({ ...project, tasks: newTasks })) {
            addToast(`Task has been ${status}.`, 'success');
            refreshData();
        } else {
            addToast('Failed to update task status.', 'error');
        }
    };
    
    const handleEditApproved = (task: Task) => {
        setEditingTaskId(prevId => prevId === task.id ? null : task.id);
        setIsCreating(false);
    };
    
    const handleSave = (taskData: Task) => {
        const newTasks = (project.tasks || []).filter(t => t.id !== taskData.id);
        newTasks.push({ ...taskData, status: 'approved' });

        if (addOrUpdateProject({ ...project, tasks: newTasks })) {
            const isNew = !taskData.id;
            addToast(`Task ${isNew ? 'created' : 'updated'} and approved.`, 'success');
            refreshData();
            setIsCreating(false);
            setEditingTaskId(null);
        } else {
            addToast('Failed to save task.', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold text-on-surface">Task Verification</h2>
                <button onClick={() => { setIsCreating(!isCreating); setEditingTaskId(null); }} className="neu-button active px-4 py-2 flex items-center gap-2">
                    <Plus size={18} /> {isCreating ? 'Cancel' : 'Create New Task'}
                </button>
            </div>
            
            <AnimatePresence>
                {isCreating && (
                    <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="neu-card p-4 my-4">
                            <TaskForm onSave={handleSave} onClose={() => setIsCreating(false)} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <TaskListSection 
                title="Pending Approval"
                tasks={tasksByStatus.pending}
                onApprove={(id) => handleStatusUpdate(id, 'approved')}
                onReject={(id) => handleStatusUpdate(id, 'rejected')}
            />
            <TaskListSection 
                title="Approved Tasks"
                tasks={tasksByStatus.approved}
                onEdit={handleEditApproved}
                editingTaskId={editingTaskId}
                renderEditForm={(task) => (
                    <TaskForm 
                        task={task}
                        onSave={handleSave}
                        onClose={() => setEditingTaskId(null)}
                    />
                )}
            />
            <TaskListSection 
                title="Rejected / Drafts"
                tasks={tasksByStatus.others}
            />
        </div>
    );
};

export default ProjectTasksVerificationTab;