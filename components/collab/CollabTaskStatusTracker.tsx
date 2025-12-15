import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Target, Trophy, Users } from 'lucide-react';
import { CollaborationTask as CollabTask, UserCollaborationProgress } from '../../src/types';

interface TaskStatusTrackerProps {
    tasks: CollabTask[];
    userProgress: UserCollaborationProgress | null;
    collaborationTitle: string;
}

const TaskStatusTracker: React.FC<TaskStatusTrackerProps> = ({
    tasks,
    userProgress,
    collaborationTitle
}) => {
    const completedTasks = userProgress?.completed_tasks || [];
    const totalTasks = tasks.length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
    const earnedPoints = userProgress?.earned_hint_points || 0;

    // Calculate potential points
    const totalPossiblePoints = tasks.reduce((sum, task) => sum + task.hint_points_reward, 0);
    const remainingPoints = totalPossiblePoints - earnedPoints;

    // Get recently completed tasks
    const recentlyCompleted = tasks
        .filter(task => completedTasks.includes(task.id))
        .slice(-3); // Show last 3 completed tasks

    return (
        <div className="bg-[#faf0ff] rounded-xl shadow-lg border border-border/5 p-6">
            <div className="flex items-center gap-3 mb-6">
                <Target size={24} className="text-blue-500" />
                <h3 className="text-lg font-display font-bold text-on-surface">
                    Task Progress
                </h3>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Completion Progress */}
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-gray-200"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="text-blue-500"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeDasharray={`${completionPercentage}, 100`}
                                strokeLinecap="round"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-on-surface">{completionPercentage}%</span>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-on-surface">Completion</p>
                    <p className="text-xs text-on-surface-variant">
                        {completedTasks.length} of {totalTasks} tasks
                    </p>
                </div>

                {/* Points Earned */}
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Trophy size={24} className="text-yellow-500" />
                    </div>
                    <p className="text-sm font-medium text-on-surface">Points Earned</p>
                    <p className="text-lg font-bold text-primary">{earnedPoints}</p>
                    <p className="text-xs text-on-surface-variant">
                        {remainingPoints} remaining
                    </p>
                </div>

                {/* Status */}
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                        {completionPercentage === 100 ? (
                            <CheckCircle size={24} className="text-green-500" />
                        ) : (
                            <Clock size={24} className="text-blue-500" />
                        )}
                    </div>
                    <p className="text-sm font-medium text-on-surface">Status</p>
                    <p className="text-sm font-bold text-primary">
                        {completionPercentage === 100 ? 'Complete' : 'In Progress'}
                    </p>
                </div>
            </div>

            {/* Recent Activity */}
            {recentlyCompleted.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-on-surface mb-3 flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        Recent Completions
                    </h4>
                    <div className="space-y-2">
                        {recentlyCompleted.map((task, index) => (
                            <motion.div
                                key={task.id}
                                className="flex items-center gap-3 p-2 bg-green-50 rounded-lg"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-on-surface truncate">
                                        {task.title}
                                    </p>
                                    <p className="text-xs text-on-surface-variant">
                                        +{task.hint_points_reward} points
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Next Steps */}
            {completionPercentage < 100 && (
                <div className="mt-6 pt-4 border-t border-border/10">
                    <h4 className="text-sm font-medium text-on-surface mb-2">Next Steps</h4>
                    <p className="text-sm text-on-surface-variant">
                        Complete {totalTasks - completedTasks.length} more tasks to earn {remainingPoints} additional points.
                    </p>
                </div>
            )}

            {/* Completion Celebration */}
            {completionPercentage === 100 && (
                <div className="mt-6 pt-4 border-t border-border/10 text-center">
                    <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                        <Trophy size={20} />
                        <span className="font-bold">Collab Complete!</span>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                        You've completed all tasks in "{collaborationTitle}". 
                        Use your {earnedPoints} hint points to unlock reward cards!
                    </p>
                </div>
            )}
        </div>
    );
};

export default TaskStatusTracker;