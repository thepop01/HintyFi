import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Trophy, ExternalLink } from 'lucide-react';
import { Collaboration, Project } from '../../src/types';

interface CollaborationDetailHeroProps {
    collaboration: Collaboration;
    projects: Project[];
}

const CollaborationDetailHero: React.FC<CollaborationDetailHeroProps> = ({ 
    collaboration, 
    projects 
}) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="w-full mb-8">
            {/* Hero Banner */}
            <div className="relative w-full h-[300px] rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                {collaboration.banner_image ? (
                    <img
                        src={collaboration.banner_image}
                        alt={collaboration.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-blue-500/20 to-pink-500/30" />
                )}
                
                {/* Overlay Content */}
                <div className="absolute inset-0 bg-black/20 flex items-end">
                    <div className="p-6 sm:p-8 text-white w-full">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            {/* Left Side - Collaboration Info */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={16} />
                                    <span className="text-sm font-medium">
                                        Started {formatDate(collaboration.start_date)}
                                        {collaboration.end_date && ` • Ends ${formatDate(collaboration.end_date)}`}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Users size={14} />
                                        <span>{collaboration.total_participants} participants</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Trophy size={14} />
                                        <span>{collaboration.total_hint_points_distributed} points distributed</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Participating Projects */}
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium whitespace-nowrap">Participating:</span>
                                <div className="flex -space-x-2">
                                    {projects.slice(0, 5).map((project, index) => (
                                        <motion.div
                                            key={project.id}
                                            className="w-10 h-10 rounded-full bg-white border-2 border-white shadow-lg overflow-hidden"
                                            style={{ zIndex: projects.length - index }}
                                            whileHover={{ scale: 1.1, zIndex: 50 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                            title={project.name}
                                        >
                                            <img
                                                src={project.logo_url || project.logo}
                                                alt={project.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </motion.div>
                                    ))}
                                    {projects.length > 5 && (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-gray-600">
                                            +{projects.length - 5}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Details Cards */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {projects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        className="bg-[#faf0ff] rounded-lg shadow-md border border-border/5 p-4 hover:shadow-lg transition-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        whileHover={{ y: -2 }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <img
                                src={project.logo_url || project.logo}
                                alt={project.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-display font-bold text-on-surface truncate">
                                    {project.name}
                                </h3>
                                <p className="text-xs text-on-surface-variant">
                                    {project.stage || 'Project'}
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">
                            {project.description}
                        </p>

                        {/* Project Links */}
                        <div className="flex items-center gap-2">
                            {project.website_urls && project.website_urls.length > 0 && (
                                <a
                                    href={project.website_urls[0]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                                >
                                    <ExternalLink size={12} />
                                    <span>Website</span>
                                </a>
                            )}
                            {project.twitter_url && (
                                <a
                                    href={project.twitter_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                                >
                                    <ExternalLink size={12} />
                                    <span>Twitter</span>
                                </a>
                            )}
                        </div>

                        {/* Project Categories */}
                        {project.category && project.category.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/10">
                                <div className="flex flex-wrap gap-1">
                                    {project.category.slice(0, 2).map((cat) => (
                                        <span
                                            key={cat}
                                            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium"
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                    {project.category.length > 2 && (
                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                                            +{project.category.length - 2}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default CollaborationDetailHero;