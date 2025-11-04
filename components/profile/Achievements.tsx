import React, { useMemo, useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { User, Project, PointTier, Achievement } from '../../src/types';
import { getProjects, getCredoSettings } from '../../src/services/dataService';
import { Award, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AchievementsProps {
    user: User;
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const AchievementCard: React.FC<{ ach: Achievement }> = ({ ach }) => {
    const { currentUser, checkDiscordRoles } = useAuth();
    const isOwnProfile = currentUser?.id === ach.userId;
    const project = ach.project as Project;
    const hasDiscordRoles = project.discordRoles && project.discordRoles.length > 0;
    const [isChecking, setIsChecking] = useState(false);

    const handleCheckRoles = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (isChecking) return;
        setIsChecking(true);
        try {
            await checkDiscordRoles([project]);
        } finally {
            setIsChecking(false);
        }
    };
    
    return (
        <motion.div 
            key={ach.id} 
            className={`achievement-card group ${ach.isAchieved ? 'achieved' : ''}`}
            variants={itemVariants}
        >
            <div className="flex-grow flex flex-col items-center justify-center gap-2 w-full">
                <img src={ach.logo} alt={ach.title} className="w-16 h-16 rounded-full bg-surface/50 object-contain p-1 transition-transform duration-300 group-hover:scale-110" loading="lazy" decoding="async" />
                <h3 className="font-['Oswald',_sans-serif] font-semibold text-xl text-on-surface w-full transition-colors truncate">{ach.title}</h3>
            </div>
            
            <div className="text-xs text-on-surface-variant w-full mt-auto pt-2 border-t border-border/10 space-y-1 flex-shrink-0">
                {ach.isAchieved && ach.achievedItems.length > 0 ? (
                    (ach.achievedItems as { name: string; points: number }[]).slice(0, 2).map(item => (
                        <div key={item.name} className="flex items-center justify-center gap-1.5">
                            <Award size={12} className="text-accent flex-shrink-0" />
                            <p className="truncate">{item.name} (+{Math.round(item.points)})</p>
                        </div>
                    ))
                ) : (
                    <p className="italic">No points earned</p>
                )}
            </div>
             {isOwnProfile && hasDiscordRoles && (
                <button
                    onClick={handleCheckRoles}
                    disabled={isChecking}
                    className="neu-button text-xs px-3 py-1 mt-2 w-full flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <ShieldCheck size={14} className={isChecking ? 'animate-spin' : ''} />
                    Check My Roles
                </button>
            )}
        </motion.div>
    );
};

const Achievements: React.FC<AchievementsProps> = ({ user }) => {
    const { currentUser, checkDiscordRoles } = useAuth();
    const isOwnProfile = currentUser?.id === user.id;
    const [isCheckingAll, setIsCheckingAll] = useState(false);
    const [achievementsData, setAchievementsData] = useState<{ groupedAchievements: { partner: Achievement[] }, totalScore: number } | null>(null);

    useEffect(() => {
        const fetchAchievements = async () => {
            const allProjects = await getProjects();
            const settings = await getCredoSettings();
            const projectsByName = new Map(allProjects.map(p => [p.name, p]));
            let currentTotalScore = 0;

            const partnerProjectNames = new Set([
                ...(settings.roleBasedPartnerProjectNames || []),
                ...(settings.nftBasedPartnerProjectNames || []),
                ...(settings.tokenBasedPartnerProjectNames || []),
            ]);

            const achievements = Array.from(partnerProjectNames).map(projectName => {
                const project = projectsByName.get(projectName as string);
                if (!project) return null;

                let totalPoints = 0;
                let achievedItems: { name: string; points: number }[] = [];
                
                const userRoles = new Set(user.discordRoles || []);

                // 1. Role points
                project.discordRoles?.forEach(role => {
                    if (userRoles.has(role) && role.points) {
                        totalPoints += role.points;
                        achievedItems.push({ name: role.name, points: role.points });
                    }
                });

                // 2. NFT points
                const userNftHolding = (user.nftHoldings || []).find(h => h.projectId === project.id);
                if (userNftHolding && project.nftCollections) {
                    project.nftCollections.forEach(collection => {
                        let pointsFromCollection = 0;
                        if (collection.oneTimePoints) pointsFromCollection += collection.oneTimePoints;
                        if (collection.pointsPerDay && userNftHolding.daysHeld) pointsFromCollection += collection.pointsPerDay * userNftHolding.daysHeld;
                        
                        if (pointsFromCollection > 0) {
                            totalPoints += pointsFromCollection;
                            achievedItems.push({ name: `${collection.name} NFT`, points: Math.round(pointsFromCollection) });
                        }
                    });
                }
                
                // 3. Token points
                const userTokenHolding = (user.tokenHoldings || []).find(h => h.projectId === project.id);
                if (userTokenHolding && project.tokenHoldingTiers) {
                    const tier = project.tokenHoldingTiers.find(t => userTokenHolding.amount >= t.minAmount && (t.maxAmount === null || userTokenHolding.amount <= t.maxAmount));
                    if (tier && tier.pointsPerDay > 0 && userTokenHolding.daysHeld) {
                        const pointsFromToken = tier.pointsPerDay * userTokenHolding.daysHeld;
                        totalPoints += pointsFromToken;
                        achievedItems.push({ name: `Token Holding`, points: Math.round(pointsFromToken) });
                    }
                }
                
                const isAchieved = totalPoints > 0;
                if (isAchieved) {
                    currentTotalScore += totalPoints;
                }

                const achievement: Achievement = {
                    id: project.id,
                    logo: project.logo as string,
                    title: project.name,
                    achievedItems,
                    points: totalPoints,
                    isAchieved,
                    type: 'partner',
                    project: project,
                    userId: user.id
                };
                return achievement;
            }).filter((a): a is NonNullable<typeof a> => a !== null);
            
            achievements.sort((a, b) => {
                if (a.isAchieved && !b.isAchieved) return -1;
                if (!a.isAchieved && b.isAchieved) return 1;
                return a.title.localeCompare(b.title);
            });

            currentTotalScore += user.manualCredoPoints || 0;

            setAchievementsData({
                groupedAchievements: { partner: achievements },
                totalScore: currentTotalScore
            });
        };

        fetchAchievements();
    }, [user]);

    const handleCheckAllProjectRoles = async () => {
        if(isCheckingAll) return;
        setIsCheckingAll(true);
        try {
            const allProjects = await getProjects();
            const projectsWithRoles = allProjects.filter(p => p.discordRoles && p.discordRoles.length > 0);
            await checkDiscordRoles(projectsWithRoles);
        } finally {
            setIsCheckingAll(false);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const renderSection = (title: string, achievements: Achievement[]) => {
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
    
    if (!achievementsData || achievementsData.groupedAchievements.partner.length === 0) {
        return null;
    }

    return (
        <motion.div
            className="achievements-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className="flex justify-between items-start mb-4">
                <h2 className="recent-activity-title !mb-0">Achievements</h2>
                {isOwnProfile && (
                    <button
                        onClick={handleCheckAllProjectRoles}
                        disabled={isCheckingAll}
                        className="neu-button text-sm px-4 py-2 flex items-center gap-2 flex-shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <ShieldCheck size={16} className={isCheckingAll ? 'animate-spin' : ''} />
                        Check All Roles
                    </button>
                )}
            </div>
            
            {achievementsData && renderSection("Partner Projects", achievementsData.groupedAchievements.partner)}
           
            <div className="total-achievement-score">
                <Award size={24} className="text-amber-400" />
                <span>Total Achievement Score:</span>
                <span className="font-bold text-on-surface">{achievementsData ? Math.round(achievementsData.totalScore).toLocaleString() : '...'}</span>
            </div>
        </motion.div>
    );
};

export default Achievements;