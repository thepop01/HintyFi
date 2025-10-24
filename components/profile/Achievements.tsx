import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { User, Project, PointTier } from '../../src/types';
import { getProjects } from '../../src/services/dataService';
import { Award } from 'lucide-react';

interface AchievementsProps {
    user: User;
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const getEmptyStateMessage = (type: string) => {
    switch (type) {
        case 'role': return 'No roles held';
        default: return 'Not achieved';
    }
};

const AchievementCard: React.FC<{ ach: any }> = ({ ach }) => (
    <motion.div 
        key={ach.id} 
        className={`achievement-card group ${ach.isAchieved ? 'achieved' : ''}`}
        variants={itemVariants}
    >
        <div className="flex-grow flex flex-col items-center justify-center gap-2 w-full">
            <img src={ach.logo} alt={ach.title} className="w-16 h-16 rounded-full bg-surface/50 object-contain p-1 transition-transform duration-300 group-hover:scale-110" />
            <h3 className="font-['Oswald',_sans-serif] font-semibold text-xl text-on-surface w-full transition-colors truncate">{ach.title}</h3>
        </div>
        
        <div className="text-xs text-on-surface-variant w-full mt-auto pt-2 border-t border-border/10 space-y-1 flex-shrink-0">
            {ach.isAchieved ? (
                ach.type === 'role' ? (
                    (ach.achievedItems as { name: string; points: number }[]).slice(0, 2).map(item => (
                        <div key={item.name} className="flex items-center justify-center gap-1.5">
                            <Award size={12} className="text-accent flex-shrink-0" />
                            <p className="truncate">{item.name} (+{item.points})</p>
                        </div>
                    ))
                ) : null
            ) : (
                <p className="italic">{getEmptyStateMessage(ach.type)}</p>
            )}
        </div>
    </motion.div>
);

const Achievements: React.FC<AchievementsProps> = ({ user }) => {
    const {
        groupedAchievements,
        totalScore 
    } = useMemo(() => {
        const allProjects = getProjects();
        const projectsById = new Map(allProjects.map(p => [p.id, p]));
        let currentTotalScore = 0;
        
        const achievements: any[] = [];

        const userRoles = new Set(user.discordRoles || []);
        
        // --- Calculate points from all sources ---
        allProjects.forEach(project => {
            // 1. Role-based points
            if (project.discordRoles && project.discordRoles.length > 0) {
                const achievedRoles = project.discordRoles.filter(role => userRoles.has(role.name));
                if (achievedRoles.length > 0) {
                    const points = achievedRoles.reduce((sum, role) => sum + (role.points || 0), 0);
                    currentTotalScore += points;
                    achievements.push({
                        id: `${project.id}-roles`,
                        logo: project.logo,
                        title: project.name,
                        achievedItems: achievedRoles.map(r => ({name: r.name, points: r.points || 0})),
                        points,
                        isAchieved: true,
                        type: 'role' as const,
                    });
                }
            }
        });
        
        // 5. Manual points (can be positive or negative)
        currentTotalScore += user.manualCredoPoints || 0;


        const grouped = {
            role: achievements.filter(a => a.type === 'role'),
        };

        return { 
            groupedAchievements: grouped,
            totalScore: currentTotalScore 
        };
    }, [user]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const renderSection = (title: string, achievements: any[]) => {
        if (achievements.length === 0) return null;
        return (
            <>
                <h3 className="text-xl font-display font-bold text-on-surface-variant mt-8 mb-6 text-center">{title}</h3>
                <motion.div 
                    className="achievements-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {achievements.map((ach) => (
                        <AchievementCard key={ach.id} ach={ach} />
                    ))}
                </motion.div>
            </>
        );
    };
    
    if (groupedAchievements.role.length === 0) {
        return null;
    }

    return (
        <motion.div
            className="achievements-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <h2 className="recent-activity-title">Achievements</h2>
            
            {renderSection("Partner Roles", groupedAchievements.role)}
           
            <div className="total-achievement-score">
                <Award size={24} className="text-amber-400" />
                <span>Total Achievement Score:</span>
                <span className="font-bold text-on-surface">{Math.round(totalScore).toLocaleString()}</span>
            </div>
        </motion.div>
    );
};

export default Achievements;