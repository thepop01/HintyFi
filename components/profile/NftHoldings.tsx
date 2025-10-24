import React, { useMemo } from 'react';
import { User, Project, NftCollection } from '../../src/types';
import { getProjects } from '../../src/services/dataService';
import { Link } from 'react-router-dom';
import { Gem } from 'lucide-react';
import { motion } from 'framer-motion';

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

const NftHoldings: React.FC<NftHoldingsProps> = ({ user }) => {
    const userHoldings = useMemo(() => {
        if (!user.nftHoldings || user.nftHoldings.length === 0) {
            return [];
        }
        const allProjects = getProjects();
        const projectsById = new Map<string, Project>(allProjects.map(p => [p.id, p]));
        
        const holdings: (NftCollection & { projectName: string; projectId: string })[] = [];
        
        user.nftHoldings.forEach(holding => {
            const project = projectsById.get(holding.projectId);
            if (project && project.nftCollections) {
                project.nftCollections.forEach(collection => {
                    holdings.push({ ...collection, projectName: project.name, projectId: project.id });
                });
            }
        });
        return holdings;
    }, [user.nftHoldings]);

    if (userHoldings.length === 0) {
        return null; 
    }

    return (
        <motion.div 
            className="nft-holdings-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <h2 className="nft-holdings-title"><Gem /> NFT Holdings</h2>
            <motion.div 
                className="nft-holdings-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {userHoldings.map(collection => (
                    <motion.div key={collection.id} variants={itemVariants}>
                        <Link to={`/project/${collection.projectId}`} className="nft-card">
                            <img src={collection.image} alt={collection.name} className="nft-card-image" loading="lazy" decoding="async" />
                            <div className="nft-card-overlay">
                                <h3 className="nft-card-title">{collection.name}</h3>
                                <p className="nft-card-project">{collection.projectName}</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
};

export default NftHoldings;