import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Trophy, ArrowRight, Clock } from 'lucide-react';
import { Collaboration, Project } from '../../src/types';

interface CollaborationCardProps {
    collaboration: Collaboration;
    projects: Project[];
    onClick?: () => void;
}

const CollaborationCard: React.FC<CollaborationCardProps> = ({ collaboration, projects, onClick }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const isRunning = collaboration.status === 'running';
    const statusColor = isRunning ? 'text-green-500' : 'text-gray-500';
    const statusBg = isRunning ? 'bg-green-500/20' : 'bg-gray-500/20';

    return (
        <motion.div
            className="bg-[#faf0ff] rounded-xl shadow-lg border border-border/5 overflow-hidden cursor-pointer group"
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={onClick}
        >
            {/* Header with banner or gradient */}
            <div className="relative h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 overflow-hidden">
                {collaboration.banner_image ? (
                    <img
                        src={collaboration.banner_image}
                        alt={collaboration.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30" />
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${statusBg} ${statusColor} backdrop-blur-sm`}>
                        {isRunning ? <Clock size={12} /> : <Trophy size={12} />}
                        <span>{isRunning ? 'Running' : 'Completed'}</span>
                    </div>
                </div>

                {/* Participating Projects Logos */}
                <div className="absolute bottom-3 left-3 flex -space-x-2">
                    {projects.slice(0, 3).map((project, index) => (
                        <div
                            key={project.id}
                            className="w-8 h-8 rounded-full bg-white border-2 border-white shadow-md overflow-hidden"
                            style={{ zIndex: projects.length - index }}
                        >
                            <img
                                src={project.logo_url || project.logo}
                                alt={project.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                    {projects.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-md flex items-center justify-center text-xs font-bold text-gray-600">
                            +{projects.length - 3}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-display font-bold text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
                        {collaboration.title}
                    </h3>
                    <ArrowRight 
                        size={16} 
                        className="text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 ml-2 mt-1" 
                    />
                </div>

                <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">
                    {collaboration.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <Users size={14} className="text-purple-500" />
                        <span>{collaboration.total_participants} participants</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <Trophy size={14} className="text-yellow-500" />
                        <span>{collaboration.total_hint_points_distributed} points</span>
                    </div>
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <Calendar size={14} />
                    <span>
                        {formatDate(collaboration.start_date)}
                        {collaboration.end_date && ` - ${formatDate(collaboration.end_date)}`}
                    </span>
                </div>

                {/* Project Names */}
                <div className="mt-3 pt-3 border-t border-border/10">
                    <div className="flex flex-wrap gap-1">
                        {projects.slice(0, 2).map((project) => (
                            <span
                                key={project.id}
                                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium"
                            >
                                {project.name}
                            </span>
                        ))}
                        {projects.length > 2 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                                +{projects.length - 2} more
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CollaborationCard;