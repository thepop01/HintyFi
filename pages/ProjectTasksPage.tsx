import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { getProjects, updateUserTirthPoints } from '../src/services/dataService';
import { Project, Task } from '../src/types';
import { ArrowLeft, CheckCircle, Circle, Link as LinkIcon, Edit3, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompletedTasks } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const XSocialIcon: React.FC = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
);
const DiscordIcon: React.FC = () => (
    <img src="https://i.ibb.co/H8R4mmz/discord-white-icon.webp" alt="Discord" className="w-5 h-5" />
);
const GuildIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2zm0 6h2v2h-2z" /></svg>
);


const platformIcons: Record<Task['platform'], React.ReactNode> = {
    x: <XSocialIcon />,
    discord: <DiscordIcon />,
    guild: <GuildIcon />,
    youtube: <Youtube size={20} />,
    website: <LinkIcon size={20} />,
    testnet: <Edit3 size={20} />,
};

const TaskCard: React.FC<{ task: Task; isCompleted: boolean; onComplete: () => void }> = ({ task, isCompleted, onComplete }) => {
    const handleGoClick = () => {
        if (!isCompleted) {
            onComplete();
        }
    };
    
    const platformName = task.platform === 'x' ? 'X (Twitter)' : 
                         task.platform === 'youtube' ? 'YouTube' :
                         task.platform.charAt(0).toUpperCase() + task.platform.slice(1);

    return (
        <motion.div 
            className={`neu-outset-card p-4 flex flex-col sm:flex-row items-start gap-4 ${isCompleted ? 'opacity-70' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant px-2 py-1 bg-surface/50 rounded-md">
                        {platformIcons[task.platform]}
                        <span>{platformName}</span>
                    </span>
                </div>
                <h3 className="font-bold text-lg text-on-surface">{task.title}</h3>
                <p className="text-sm text-on-surface-variant mt-1">{task.description}</p>
            </div>
            <div className="flex items-center gap-4 sm:ml-auto w-full sm:w-auto flex-shrink-0">
                <div className="text-center">
                    <p className="font-bold text-lg text-primary">{task.points}</p>
                    <p className="text-xs text-on-surface-variant">Points</p>
                </div>
                 <a 
                    href={task.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={handleGoClick} 
                    className="neu-button px-4 py-2 font-semibold"
                >
                    Go
                </a>
                <div className="w-7 h-7 flex items-center justify-center">
                    {isCompleted ? <CheckCircle size={28} className="text-green-500" /> : <Circle size={28} className="text-on-surface-variant/50" />}
                </div>
            </div>
        </motion.div>
    )
};


const ProjectTasksPage: React.FC = () => {
    const { id } = ReactRouterDOM.useParams();
    const navigate = ReactRouterDOM.useNavigate();

    const project = useMemo(() => {
        return getProjects().find(p => p.id === id);
    }, [id]);

    const { toggleTaskCompletion, isTaskCompleted } = useCompletedTasks();
    const { currentUser } = useAuth();

    const handleToggle = (taskId: string) => {
        if (!project) return;
        const wasCompleted = isTaskCompleted(project.id, taskId);
        toggleTaskCompletion(project.id, taskId);
        if (currentUser) {
            const pointDelta = wasCompleted ? -1 : 1;
            updateUserTirthPoints(currentUser.id, pointDelta);
        }
    };

    if (!project) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-on-surface">Project not found</h2>
                <button onClick={() => navigate('/tasks')} className="mt-4 neu-button px-4 py-2 flex items-center gap-2 mx-auto">
                    <ArrowLeft size={16} /> Back to Tasks
                </button>
            </div>
        );
    }
    
    const tasks = project.tasks || [];
    const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
    const completedPoints = useMemo(() => {
        return tasks.reduce((sum, task) => isTaskCompleted(project.id, task.id) ? sum + task.points : sum, 0);
    }, [tasks, project.id, isTaskCompleted]);


    return (
        <div className="space-y-6">
            <button onClick={() => navigate('/tasks')} className="neu-button px-4 py-2 flex items-center gap-2 w-max">
                <ArrowLeft size={16} />
                Back to All Tasks
            </button>

            <div className="neu-card p-6 flex flex-col sm:flex-row items-center gap-6">
                <img src={project.logo} alt={project.name} className="w-24 h-24 rounded-full border-4 border-surface bg-background object-contain p-1" />
                <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-4xl font-display font-bold text-on-surface">{project.name} Tasks</h1>
                    <p className="text-lg text-on-surface-variant mt-1">{project.description}</p>
                </div>
                <div className="neu-outset-card p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{completedPoints} / {totalPoints}</p>
                    <p className="text-sm font-semibold text-on-surface-variant">Points Earned</p>
                </div>
            </div>

            {tasks.length > 0 ? (
                <div className="space-y-4">
                    {tasks.map((task) => (
                        <TaskCard 
                            key={task.id} 
                            task={task}
                            isCompleted={isTaskCompleted(project.id, task.id)}
                            onComplete={() => handleToggle(task.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="neu-card p-12 text-center text-on-surface-variant">
                    <h2 className="text-2xl font-bold">No tasks available yet.</h2>
                    <p>Check back soon for opportunities to contribute and earn rewards.</p>
                </div>
            )}
        </div>
    );
};

export default ProjectTasksPage;