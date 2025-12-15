import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ExternalLink, Twitter, MessageSquare, Globe, Loader, AlertCircle } from 'lucide-react';
import { CollaborationTask as CollabTask, UserCollaborationProgress } from '../../src/types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import CollabTaskVerificationModal from './CollabTaskVerificationModal';

interface TaskTableProps {
    tasks: CollabTask[];
    userProgress: UserCollaborationProgress | null;
    onTaskComplete: (taskId: string) => Promise<void>;
    isCollaborationRunning: boolean;
}

const CollabTaskTable: React.FC<TaskTableProps> = ({
    tasks, 
    userProgress, 
    onTaskComplete, 
    isCollaborationRunning 
}) => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
    const [selectedTask, setSelectedTask] = useState<CollabTask | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const getTaskIcon = (taskType: string) => {
        switch (taskType) {
            case 'twitter_follow':
            case 'twitter_like':
            case 'twitter_retweet':
                return <Twitter size={16} className="text-blue-500" />;
            case 'discord_join':
                return <MessageSquare size={16} className="text-indigo-500" />;
            case 'custom':
                return <Globe size={16} className="text-gray-500" />;
            default:
                return <Circle size={16} className="text-gray-500" />;
        }
    };

    const getTaskTypeLabel = (taskType: string) => {
        switch (taskType) {
            case 'twitter_follow':
                return 'Follow on Twitter';
            case 'twitter_like':
                return 'Like Tweet';
            case 'twitter_retweet':
                return 'Retweet';
            case 'discord_join':
                return 'Join Discord';
            case 'custom':
                return 'Custom Task';
            default:
                return taskType;
        }
    };

    const isTaskCompleted = (taskId: string) => {
        return userProgress?.completed_tasks.includes(taskId) || false;
    };

    const handleTaskClick = (task: CollabTask) => {
        if (!currentUser) {
            addToast('Please connect your wallet to complete tasks.', 'info');
            return;
        }

        if (!isCollaborationRunning || isTaskCompleted(task.id) || completingTasks.has(task.id)) {
            return;
        }

        // Open verification modal
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleModalConfirm = async () => {
        if (!selectedTask) return;

        // Mark task as being completed
        setCompletingTasks(prev => new Set(prev).add(selectedTask.id));

        try {
            await onTaskComplete(selectedTask.id);
            addToast(`Task completed! You earned ${selectedTask.hint_points_reward} hint points.`, 'success');
            setIsModalOpen(false);
            setSelectedTask(null);
        } catch (error) {
            console.error('Error completing task:', error);
            addToast('Failed to complete task. Please try again.', 'error');
        } finally {
            setCompletingTasks(prev => {
                const newSet = new Set(prev);
                newSet.delete(selectedTask.id);
                return newSet;
            });
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    return (
        <div className="bg-[#faf0ff] rounded-xl shadow-lg overflow-hidden border border-border/5">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead className="bg-surface/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-display font-bold text-on-surface-variant">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-display font-bold text-on-surface-variant">Task</th>
                            <th className="px-4 py-3 text-left text-sm font-display font-bold text-on-surface-variant">Type</th>
                            <th className="px-4 py-3 text-left text-sm font-display font-bold text-on-surface-variant">Reward</th>
                            <th className="px-4 py-3 text-center text-sm font-display font-bold text-on-surface-variant">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task, index) => {
                            const completed = isTaskCompleted(task.id);
                            const isCompleting = completingTasks.has(task.id);
                            const canComplete = isCollaborationRunning && !completed && !isCompleting && currentUser;

                            return (
                                <motion.tr
                                    key={task.id}
                                    className={`border-b border-border/10 transition-colors ${
                                        canComplete ? 'hover:bg-border/10 cursor-pointer' : ''
                                    }`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                    onClick={() => handleTaskClick(task)}
                                >
                                    <td className="px-4 py-4">
                                        {completed ? (
                                            <CheckCircle size={20} className="text-green-500" />
                                        ) : (
                                            <Circle size={20} className="text-gray-400" />
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div>
                                            <h3 className="font-medium text-on-surface">{task.title}</h3>
                                            <p className="text-sm text-on-surface-variant mt-1">{task.description}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            {getTaskIcon(task.task_type)}
                                            <span className="text-sm font-medium text-on-surface">
                                                {getTaskTypeLabel(task.task_type)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-primary">{task.hint_points_reward}</span>
                                            <span className="text-sm text-on-surface-variant">points</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        {completed ? (
                                            <div className="flex items-center justify-center gap-1 text-green-600">
                                                <CheckCircle size={14} />
                                                <span className="text-sm font-medium">Completed</span>
                                            </div>
                                        ) : isCompleting ? (
                                            <div className="flex items-center justify-center gap-1 text-blue-600">
                                                <Loader size={14} className="animate-spin" />
                                                <span className="text-sm font-medium">Processing...</span>
                                            </div>
                                        ) : canComplete ? (
                                            <div className="flex items-center justify-center gap-1 text-primary hover:text-primary/80 transition-colors">
                                                <ExternalLink size={14} />
                                                <span className="text-sm font-medium">Complete</span>
                                            </div>
                                        ) : !currentUser ? (
                                            <div className="flex items-center justify-center gap-1 text-gray-500">
                                                <AlertCircle size={14} />
                                                <span className="text-sm">Login Required</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-on-surface-variant">
                                                {isCollaborationRunning ? 'Pending' : 'Ended'}
                                            </span>
                                        )}
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {tasks.length === 0 && (
                <div className="p-8 text-center text-on-surface-variant">
                    <p>No tasks available for this collaboration.</p>
                </div>
            )}

            {/* Task Verification Modal */}
            <CollabTaskVerificationModal
                task={selectedTask}
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onConfirm={handleModalConfirm}
                isLoading={selectedTask ? completingTasks.has(selectedTask.id) : false}
            />
        </div>
    );
};

export default CollabTaskTable;