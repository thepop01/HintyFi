import React, { useMemo, useState, useEffect } from 'react';
import { User, Project, NftCollection } from '../../src/types';
import { getProjects, getCredoSettings } from '../../src/services/dataService';
import { Link } from 'react-router-dom';
import { Gem, Star, RefreshCw } from 'lucide-react';
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

interface NftHoldingsProps {
    user: User;
}

const NftPointCard: React.FC<{
    collection: NftCollection & { projectName: string; projectId: string };
    isHeld: boolean;
}> = ({ collection, isHeld }) => {
    const pointsInfo = [
        collection.oneTimePoints ? `${collection.oneTimePoints} one-time` : '',
        collection.pointsPerDay ? `${collection.pointsPerDay}/day` : ''
    ].filter(Boolean).join(' + ');

    return (
        <Link to={`/${collection.projectName.toLowerCase()}`} className="nft-card">
            <img src={collection.image} alt={collection.name} className="nft-card-image" loading="lazy" decoding="async" />
            <div className="nft-card-overlay !justify-between">
                <div>
                    <h3 className="nft-card-title">{collection.name}</h3>
                    <p className="nft-card-project">{collection.projectName}</p>
                </div>
                {pointsInfo && (
                    <div className="mt-1 text-xs font-bold text-amber-300 bg-black/50 rounded-full px-2 py-0.5 flex items-center gap-1 self-start">
                        <Star size={12} className="fill-current" />
                        <span>{pointsInfo} pts</span>
                    </div>
                )}
            </div>
            {isHeld && (
                 <div className="absolute top-2 left-2 bg-primary text-on-primary text-xs font-bold px-2 py-1 rounded-full z-20">
                    HELD
                </div>
            )}
        </Link>
    );
};


const NftHoldings: React.FC<NftHoldingsProps> = ({ user }) => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const isOwnProfile = currentUser?.id === user.id;
    const [refreshKey, setRefreshKey] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [nftData, setNftData] = useState<{ heldNfts: any[], unheldNfts: any[] }>({ heldNfts: [], unheldNfts: [] });

    useEffect(() => {
        const fetchNftData = async () => {
            const allProjects = await getProjects();
            const settings = await getCredoSettings();
            const partnerProjectNames = new Set([
                ...(settings.roleBasedPartnerProjectNames || []),
                ...(settings.nftBasedPartnerProjectNames || []),
                ...(settings.tokenBasedPartnerProjectNames || []),
            ]);

            const pointEarningNfts: (NftCollection & { projectName: string; projectId: string })[] = [];
            allProjects.forEach(p => {
                if (partnerProjectNames.has(p.name) && p.nftCollections) {
                    p.nftCollections.forEach(c => {
                        if (c.oneTimePoints || c.pointsPerDay) {
                            pointEarningNfts.push({ ...c, projectName: p.name, projectId: p.id });
                        }
                    });
                }
            });

            const userHeldProjectIds = new Set((user.nftHoldings || []).map(h => h.projectId));

            const held = pointEarningNfts.filter(nft => userHeldProjectIds.has(nft.projectId));
            const unheld = pointEarningNfts.filter(nft => !userHeldProjectIds.has(nft.projectId));

            setNftData({ heldNfts: held, unheldNfts: unheld });
        };

        fetchNftData();
    }, [user.nftHoldings, refreshKey]);

    const { heldNfts, unheldNfts } = nftData;

    const handleRefresh = () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        addToast('Refreshing NFT holdings...', 'info');
        setTimeout(() => {
            setRefreshKey(prev => prev + 1);
            addToast('NFT holdings updated!', 'success');
            setIsRefreshing(false);
        }, 1500);
    };

    if (heldNfts.length === 0 && unheldNfts.length === 0) {
        return null; 
    }

    return (
        <motion.div 
            className="nft-holdings-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="nft-holdings-title !mb-0"><Gem /> NFT Holdings</h2>
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
            
            {heldNfts.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-on-surface-variant mb-4">My Holdings</h3>
                    <motion.div 
                        className="nft-holdings-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {heldNfts.map(collection => (
                            <motion.div key={collection.id} variants={itemVariants}>
                                <NftPointCard collection={collection} isHeld={true} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}

            {unheldNfts.length > 0 && (
                 <div>
                    <h3 className="text-xl font-bold text-on-surface-variant mb-4">Opportunities</h3>
                     <motion.div 
                        className="nft-holdings-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {unheldNfts.map(collection => (
                            <motion.div key={collection.id} variants={itemVariants}>
                                <NftPointCard collection={collection} isHeld={false} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}
            
            {heldNfts.length === 0 && unheldNfts.length > 0 && (
                 <p className="text-center text-on-surface-variant italic mb-6">You are not currently holding any point-earning NFTs.</p>
            )}
        </motion.div>
    );
};

export default NftHoldings;
