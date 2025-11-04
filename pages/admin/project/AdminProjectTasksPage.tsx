import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Project, Task } from '../../../src/types';
import { useToast } from '../../../context/ToastContext';
import { addOrUpdateProject } from '../../../src/services/dataService';
import { uid } from '../../../utils/helpers';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { Edit, Trash2, Plus, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataRefresher } from '../../../hooks/useDataRefresher';
import TaskForm from '../../../components/admin/TaskForm';

const TaskList: React.FC<{
    tasks: Task[];
    title: string;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
    onStatusChange: (task: Task, newStatus: 'pending' | 'draft') => void;
    editingTaskId: string | null;
    renderEditForm: (task: Task) => React.ReactNode;
}> = ({ tasks, title, onEdit, onDelete, onStatusChange, editingTaskId, renderEditForm }) => {
     const statusPill = (status: Task['status']) => {
        const config = {
            draft: { text: 'Draft', color: 'bg-gray-400/20 text-gray-500' },
            pending: { text: 'Pending', color: 'bg-yellow-400/20 text-yellow-500' },
            approved: { text: 'Approved', color: 'bg-green-400/20 text-green-500' },
            rejected: { text: 'Rejected', color: 'bg-red-400/20 text-red-500' }
        }[status] || { text: 'Unknown', color: 'bg-gray-400/20 text-gray-500' };

        return <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${config.color}`}>{config.text}</span>;
    };
    return (
        <div>
            <h3 className="text-lg font-bold text-on-surface-variant mb-2">{title} ({tasks.length})</h3>
            {tasks.length > 0 ? (
                <div className="space-y-3">
                    {tasks.map(task => (
                        <div key={task.id} className="neu-outset-card overflow-hidden">
                            <div className="p-3 flex items-center justify-between gap-4">
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold flex items-center gap-2">{task.title} {statusPill(task.status)}</p>
                                    <p className="text-sm text-on-surface-variant">{task.points} Points - {task.platform}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {task.status === 'draft' && <button onClick={() => onStatusChange(task, 'pending')} className="neu-button px-3 py-1 text-sm flex items-center gap-1" title="Submit for Approval"><Send size={14} /> Submit</button>}
                                    {task.status === 'pending' && <button onClick={() => onStatusChange(task, 'draft')} className="neu-button px-3 py-1 text-sm">Retract</button>}
                                    <button onClick={() => onEdit(task)} className="neu-control p-2"><Edit size={16} /></button>
                                    <button onClick={() => onDelete(task)} className="neu-control p-2 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <AnimatePresence>
                                {editingTaskId === task.id && (
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
}


const AdminProjectTasksPage: React.FC = () => {
    const { project } = useOutletContext<{ project: Project }>();
    const { addToast } = useToast();
    const { dataVersion, refreshData } = useDataRefresher();

    const [tasks, setTasks] = useState(project.tasks || []);
    const [isCreating, setIsCreating] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    useEffect(() => {
        setTasks(project.tasks || []);
    }, [project.tasks, dataVersion]);
    
    const handleSaveTask = (taskData: Partial<Task>) => {
        const isNew = !taskData.id;
        const editingTask = tasks.find(t => t.id === taskData.id);
        const wasApproved = editingTask?.status === 'approved';

        let newStatus: Task['status'] = 'draft';
        if (!isNew && wasApproved) {
            newStatus = 'pending'; // Re-submit for approval
        }
        
        const taskToSave = { ...taskData, id: taskData.id || uid(), status: newStatus } as Task;
        
        const newTasks = isNew ? [...tasks, taskToSave] : tasks.map(t => t.id === taskToSave.id ? taskToSave : t);
        
        const updatedProject = { ...project, tasks: newTasks };
        if (addOrUpdateProject(updatedProject)) {
            const message = isNew ? 'Task created as a draft.' : wasApproved ? 'Task updated and re-submitted for approval.' : 'Draft updated.';
            addToast(message, 'success');
            refreshData();
            setIsCreating(false);
            setEditingTaskId(null);
        } else {
            addToast('Failed to save task.', 'error');
        }
    };
    
    const handleStatusChange = (task: Task, newStatus: 'pending' | 'draft') => {
        const newTasks = tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
        const updatedProject = { ...project, tasks: newTasks };
        if (addOrUpdateProject(updatedProject)) {
            const message = newStatus === 'pending' ? 'Task submitted for approval!' : 'Task retracted to drafts.';
            addToast(message, 'success');
            refreshData();
        } else {
            addToast('Failed to update task status.', 'error');
        }
    };

    const handleEdit = (task: Task) => {
        setEditingTaskId(prevId => prevId === task.id ? null : task.id);
        setIsCreating(false);
    };

    const handleDelete = (task: Task) => { setTaskToDelete(task); };

    const confirmDelete = () => {
        if (!taskToDelete) return;
        const newTasks = tasks.filter(t => t.id !== taskToDelete.id);
        if (addOrUpdateProject({ ...project, tasks: newTasks })) {
            addToast('Task deleted successfully!', 'success');
            refreshData();
        } else {
            addToast('Failed to delete task.', 'error');
        }
        setTaskToDelete(null);
    };
    
    const renderEditForm = (task: Task) => (
        <TaskForm 
            task={task}
            onSave={handleSaveTask}
            onClose={() => setEditingTaskId(null)}
        />
    );

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-display font-bold text-on-surface">Manage Tasks</h2>
                <button onClick={() => { setIsCreating(!isCreating); setEditingTaskId(null); }} className="neu-button active px-4 py-2 flex items-center gap-2">
                    <Plus size={18} /> {isCreating ? 'Cancel' : 'Add New Task'}
                </button>
            </div>
            
             <AnimatePresence>
                {isCreating && (
                    <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="neu-card p-4 my-4">
                            <TaskForm onSave={handleSaveTask} onClose={() => setIsCreating(false)} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <TaskList
                tasks={tasks}
                title="All Tasks"
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                editingTaskId={editingTaskId}
                renderEditForm={renderEditForm}
            />
            
            <ConfirmationModal isOpen={!!taskToDelete} onClose={() => setTaskToDelete(null)} onConfirm={confirmDelete} title={`Delete "${taskToDelete?.title}"?`} confirmText="Delete">This action cannot be undone.</ConfirmationModal>
        </div>
    );
};

export default AdminProjectTasksPage;