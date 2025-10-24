import React, { useMemo } from 'react';
import { User, Project, UserTokenHolding } from '../../src/types';
import { getProjects } from '../../src/services/dataService';
import { Link } from 'react-router-dom';
import { Banknote } from 'lucide-react';
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

interface TokenHoldingsProps {
    user: User;
}

interface DisplayTokenHolding extends UserTokenHolding {
    project: Project;
}

const TokenHoldings: React.FC<TokenHoldingsProps> = ({ user }) => {
    const userHoldings = useMemo(() => {
        if (!user.tokenHoldings || user.tokenHoldings.length === 0) {
            return [];
        }
        const allProjects = getProjects();
        const projectsById = new Map<string, Project>(allProjects.map(p => [p.id, p]));

        const holdings: DisplayTokenHolding[] = [];
        
        user.tokenHoldings.forEach(holding => {
            const project = projectsById.get(holding.projectId);
            if (project) {
                holdings.push({ ...holding, project });
            }
        });
        return holdings;
    }, [user.tokenHoldings]);

    if (userHoldings.length === 0) {
        return null; 
    }

    return (
        <motion.div 
            className="token-holdings-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
        >
            <h2 className="token-holdings-title"><Banknote /> Token Holdings</h2>
            <motion.div 
                className="token-holdings-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {userHoldings.map(holding => (
                    <motion.div key={holding.project.id} variants={itemVariants}>
                        <Link to={`/project/${holding.project.id}`} className="token-card">
                            <img src={holding.project.logo} alt={holding.project.name} className="token-card-logo" loading="lazy" decoding="async" />
                            <div className="token-card-details">
                                <h3 className="token-card-project-name">{holding.project.name}</h3>
                                <p className="token-card-amount">{holding.amount.toLocaleString()}</p>
                                <p className="token-card-token-name">{holding.project.tokenHoldingSettings?.name || holding.project.token || ''}</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
};

export default TokenHoldings;