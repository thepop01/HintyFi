import React, { useMemo, useState } from 'react';
import { User, Project, UserTokenHolding } from '../../src/types';
import { getProjects, getCredoSettings } from '../../src/services/dataService';
import { Link } from 'react-router-dom';
import { Banknote, Star, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

interface TokenHoldingsProps {
    user: User;
}

const TokenPointCard: React.FC<{
    project: Project;
    holding?: UserTokenHolding;
}> = ({ project, holding }) => {
    const isHeld = !!holding;

    const pointsInfo = useMemo(() => {
        if (!project.tokenHoldingTiers || project.tokenHoldingTiers.length === 0) {
            return null;
        }

        if (isHeld && holding) {
            const tier = project.tokenHoldingTiers.find(t => 
                holding.amount >= t.minAmount && (t.maxAmount === null || holding.amount <= t.maxAmount)
            );
            return tier ? `${tier.pointsPerDay}/day` : '0/day';
        } else {
            const maxPoints = Math.max(...project.tokenHoldingTiers.map(t => t.pointsPerDay));
            return `Up to ${maxPoints}/day`;
        }
    }, [project, holding, isHeld]);
    
    return (
        <Link to={`/project/${project.id}`} className="token-card">
            <img src={project.logo} alt={project.name} className="token-card-logo" loading="lazy" decoding="async" />
            <div className="token-card-details">
                <h3 className="token-card-project-name">{project.name}</h3>
                {isHeld && holding ? (
                    <>
                        <p className="token-card-amount">{holding.amount.toLocaleString()}</p>
                        <p className="token-card-token-name">{project.tokenHoldingSettings?.name || project.token || ''}</p>
                    </>
                ) : (
                    <div className="mt-2 text-xs bg-surface-container rounded-full px-3 py-1 font-semibold">Opportunity</div>
                )}
            </div>
             {pointsInfo && (
                <div className="mt-2 text-xs font-bold text-amber-400 bg-black/50 rounded-full px-2 py-1.5 flex items-center gap-1">
                    <Star size={12} className="fill-current" />
                    <span>{pointsInfo}</span>
                </div>
            )}
        </Link>
    );
};

const TokenHoldings: React.FC<TokenHoldingsProps> = ({ user }) => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const isOwnProfile = currentUser?.id === user.id;
    const [refreshKey, setRefreshKey] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { heldTokens, unheldTokens } = useMemo(() => {
        const allProjects = getProjects();
        const settings = getCredoSettings();
         const partnerProjectNames = new Set([
            ...settings.roleBasedPartnerProjectNames,
            ...settings.nftBasedPartnerProjectNames,
            ...settings.tokenBasedPartnerProjectNames,
        ]);

        const tokenOpportunities = allProjects.filter(p => 
            partnerProjectNames.has(p.name) && p.tokenHoldingTiers && p.tokenHoldingTiers.length > 0
        );

        const userHeldProjectIds = new Set((user.tokenHoldings || []).map(h => h.projectId));

        const held = tokenOpportunities.filter(p => userHeldProjectIds.has(p.id));
        const unheld = tokenOpportunities.filter(p => !userHeldProjectIds.has(p.id));

        return { heldTokens: held, unheldTokens: unheld };
    }, [user.tokenHoldings, refreshKey]);

    const userHoldingsMap = useMemo(() => 
        new Map((user.tokenHoldings || []).map(h => [h.projectId, h])),
        [user.tokenHoldings, refreshKey]
    );
    
    const handleRefresh = () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        addToast('Refreshing token holdings...', 'info');
        setTimeout(() => {
            setRefreshKey(prev => prev + 1);
            addToast('Token holdings updated!', 'success');
            setIsRefreshing(false);
        }, 1500);
    };

    if (heldTokens.length === 0 && unheldTokens.length === 0) {
        return null; 
    }

    return (
        <motion.div 
            className="token-holdings-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
        >
             <div className="flex justify-between items-center mb-6">
                <h2 className="token-holdings-title !mb-0"><Banknote /> Token Holdings</h2>
                {isOwnProfile && (
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="neu-button text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        Refresh Holdings
                    </button>
                )}
            </div>
            
            {heldTokens.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-on-surface-variant mb-4">My Holdings</h3>
                    <motion.div 
                        className="token-holdings-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {heldTokens.map(project => (
                            <motion.div key={project.id} variants={itemVariants}>
                                <TokenPointCard project={project} holding={userHoldingsMap.get(project.id)} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}

            {unheldTokens.length > 0 && (
                 <div>
                    <h3 className="text-xl font-bold text-on-surface-variant mb-4">Opportunities</h3>
                    <motion.div 
                        className="token-holdings-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {unheldTokens.map(project => (
                            <motion.div key={project.id} variants={itemVariants}>
                                <TokenPointCard project={project} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}

            {heldTokens.length === 0 && unheldTokens.length > 0 && (
                 <p className="text-center text-on-surface-variant italic mb-6">You are not currently holding any point-earning tokens.</p>
            )}
        </motion.div>
    );
};

export default TokenHoldings;
