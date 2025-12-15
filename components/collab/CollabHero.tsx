import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Trophy, Calendar, ArrowRight, Sparkles, Target, Gift } from 'lucide-react';
import { Collaboration, Project } from '../../src/types';



interface CollaborationHeroProps {
    collaborations: Collaboration[];
    projects: Project[];
}

const CollaborationHero: React.FC<CollaborationHeroProps> = ({ collaborations, projects }) => {
    const navigate = useNavigate();

    // Get the featured collaboration (most recent running collaboration)
    const featuredCollaboration = useMemo(() => {
        const runningCollabs = collaborations.filter(c => c.status === 'running');
        if (runningCollabs.length === 0) return null;
        
        // Sort by created date and get the most recent
        return runningCollabs.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
    }, [collaborations]);

    // Get participating projects for the featured collaboration
    const featuredProjects = useMemo(() => {
        if (!featuredCollaboration) return [];
        return projects.filter(p => featuredCollaboration.participating_projects.includes(p.id));
    }, [featuredCollaboration, projects]);

    if (!featuredCollaboration) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-12">
                <div className="text-center py-12">
                    <p className="text-lg text-on-background-variant">No active collaborations at the moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-12">
            {/* Collab of the Week */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-pink-500/10 p-8 sm:p-12">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]"></div>
                </div>

                <div className="relative">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center justify-center mb-6"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm shadow-lg">
                            <Sparkles size={16} />
                            <span>COLLAB OF THE WEEK</span>
                            <Sparkles size={16} />
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        {/* Left Side - Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-on-background mb-4">
                                {featuredCollaboration.title}
                            </h2>
                            <p className="text-lg text-on-background-variant mb-6 leading-relaxed">
                                {featuredCollaboration.description}
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 mb-2 mx-auto">
                                        <Users size={20} className="text-purple-500" />
                                    </div>
                                    <div className="text-2xl font-bold text-on-background">
                                        {featuredCollaboration.total_participants.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-on-background-variant">Participants</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-2 mx-auto">
                                        <Target size={20} className="text-blue-500" />
                                    </div>
                                    <div className="text-2xl font-bold text-on-background">
                                        {featuredProjects.length}
                                    </div>
                                    <div className="text-sm text-on-background-variant">Projects</div>
                                </div>
                            </div>

                            {/* Collaboration Photo - Removed per user request */}

                            {/* Featured Reward */}
                            {featuredCollaboration.rewards && (
                                <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Gift size={16} className="text-green-500" />
                                        <span className="text-sm font-bold text-green-500 uppercase tracking-wide">Featured Reward</span>
                                    </div>
                                    <p className="text-on-background font-medium">
                                        {featuredCollaboration.rewards.featured_reward}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {featuredCollaboration.rewards.types.map((type, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-500 rounded-full"
                                            >
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CTA Button */}
                            <motion.button
                                onClick={() => navigate(`/collabs/${featuredCollaboration.slug}`)}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 group"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span>Join</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </motion.div>

                        {/* Right Side - Project Showcase */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="relative"
                        >
                            {/* Background Card */}
                            <div className="relative bg-background/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-bold text-on-background mb-2">Participating Projects</h3>
                                    <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"></div>
                                </div>

                                {/* Project Tiles */}
                                <div className="space-y-4">
                                    {featuredProjects.slice(0, 3).map((project, index) => (
                                        <motion.div
                                            key={project.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                                            className="group cursor-pointer"
                                            onClick={() => navigate(`/${project.name.toLowerCase()}`)}
                                        >
                                            <div className="flex items-center gap-4 p-4 rounded-xl bg-background shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] border border-surface/20">
                                                {/* Project Logo */}
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 rounded-full bg-surface p-2 shadow-md group-hover:shadow-lg transition-shadow">
                                                        <img
                                                            src={project.logo_url || project.logo}
                                                            alt={project.name}
                                                            className="w-full h-full object-contain rounded-full"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                {/* Project Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-on-background group-hover:text-primary transition-colors truncate">
                                                        {project.name}
                                                    </h4>
                                                    <p className="text-sm text-on-background-variant truncate">
                                                        {project.description || 'Partner project'}
                                                    </p>
                                                </div>

                                                {/* Arrow Indicator */}
                                                <div className="flex-shrink-0">
                                                    <ArrowRight 
                                                        size={16} 
                                                        className="text-on-background-variant group-hover:text-primary group-hover:translate-x-1 transition-all" 
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* More Projects Indicator */}
                                {featuredProjects.length > 3 && (
                                    <div className="text-center mt-6 pt-4 border-t border-surface/20">
                                        <span className="text-sm text-on-background-variant">
                                            +{featuredProjects.length - 3} more projects participating
                                        </span>
                                    </div>
                                )}

                                {/* Partnership Badge */}
                                <div className="absolute -top-2 -right-2">
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                        Partnership
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-60 animate-pulse"></div>
                            <div className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
                        </motion.div>
                    </div>

                    {/* Time Indicator */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="flex items-center justify-center gap-2 mt-8 text-sm text-on-background-variant"
                    >
                        <Calendar size={16} />
                        <span>
                            Started {new Date(featuredCollaboration.start_date).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                        {featuredCollaboration.end_date && (
                            <>
                                <span>•</span>
                                <span>
                                    Ends {new Date(featuredCollaboration.end_date).toLocaleDateString('en-US', { 
                                        month: 'long', 
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CollaborationHero;