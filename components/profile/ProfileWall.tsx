import React, { useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import { User, Project, NftCollection, PointTier } from '../../src/types';
import { getProjects, vouchForUser } from '../../src/services/dataService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Wallet, ShieldCheck, BarChart } from 'lucide-react';

const XIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: size, height: size }} className="fill-current">
        <title>X</title>
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
    </svg>
);

const DiscordIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: size, height: size }} className="fill-current">
        <title>Discord</title>
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4464.8257-.618 1.2295a18.298 18.298 0 00-5.4849 0c-.1716-.4038-.407-.8542-.618-1.2295a.0741.0741 0 00-.0785-.0371 19.7363 19.7363 0 00-4.8851 1.5152.0699.0699 0 00-.0321.027c-3.3757 5.9272-3.3757 11.7582 0 17.6854a.0699.0699 0 00.0321.027c1.5872.4839 3.1632.844 4.8851 1.05.0741.0053.1328-.0213.1593-.0838.2215-.5533.432-1.1281.5937-1.7292a.0741.0741 0 00-.0426-.0891 16.5913 16.5913 0 01-1.4239-.8199.0741.0741 0 01-.0053-.1064c.2057-.2825.401-.5754.578-.8578a.0741.0741 0 01.0991-.0106c.0053.0053.0106.0053.0159.0106 2.3051 1.2825 4.9543 1.2825 7.2594 0 .0053-.0053.0106-.0053.0159-.0106a.0741.0741 0 01.0991.0106c.177.2824.3723.5753.578.8578a.0741.0741 0 01-.0053.1064 16.5913 16.5913 0 01-1.4239.8199.0741.0741 0 00-.0426.0891c.1617.6011.3722 1.1759.5937 1.7292.0266.0625.0852.0891.1593.0838 1.7219-.206 3.2979-.5661 4.8851-1.05a.0699.0699 0 00.0321-.027c-3.3757-5.9272 3.3757-11.7582 0-17.6854a.0699.0699 0 00-.0321-.027zm-5.4232 12.336c-1.3813 0-2.5024-1.1636-2.5024-2.5929s1.1211-2.5929 2.5024-2.5929c1.3813 0 2.5024 1.1636 2.5024 2.5929s-1.1211 2.5929-2.5024 2.5929zm-5.3283 0c-1.3813 0-2.5024-1.1636-2.5024-2.5929s1.1211-2.5929 2.5024-2.5929c1.3813 0 2.5024 1.1636 2.5024 2.5929 0 1.4293-1.1211 2.5929-2.5024 2.5929z" />
    </svg>
);


interface ProfileWallProps {
    user: User;
}

const panelVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } }
};

const ProfileWall: React.FC<ProfileWallProps> = ({ user }) => {
    const {
        id,
        name,
        profilePic,
        tirthPoints,
        discordRoles = [],
        projectsBuilding = [],
        banner,
    } = user;

    const allProjects = useMemo(() => getProjects(), []);

    const credoPoints = useMemo(() => {
        // Credo points are now 0 for everyone.
        return 0;
    }, [user, allProjects]);

    const userHoldings = useMemo(() => {
        if (!user.nftHoldings || user.nftHoldings.length === 0) {
            return [];
        }
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
    }, [user.nftHoldings, allProjects]);

    const { buildingProjects, pastBuilds } = useMemo(() => {
        if (!projectsBuilding || projectsBuilding.length === 0) {
            return { buildingProjects: [], pastBuilds: [] };
        }
        const allUserProjects = allProjects.filter(p => projectsBuilding.includes(p.name));
        return {
            buildingProjects: allUserProjects.filter(p => p.stage !== 'Launched'),
            pastBuilds: allUserProjects.filter(p => p.stage === 'Launched')
        };
    }, [projectsBuilding, allProjects]);
    
    const roleToProjectMap = useMemo(() => {
        const map = new Map<string, string>();
        allProjects.forEach(project => {
            if (project.discordRoles) {
                project.discordRoles.forEach(role => {
                    map.set(role.name, project.name);
                });
            }
        });
        return map;
    }, [allProjects]);

    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const [justVouched, setJustVouched] = useState(false);

    const isOwnProfile = currentUser && currentUser.id === user.id;

    const canVouch = currentUser && currentUser.id !== user.id;
    const hasVouched = currentUser?.vouchedFor?.includes(user.id);
    const vouchButtonDisabled = !canVouch || hasVouched || justVouched;

    const handleVouch = () => {
        if (!currentUser || vouchButtonDisabled) return;
        
        const result = vouchForUser(currentUser.id, user.id);
        addToast(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            setJustVouched(true);
        }
    };
    
    const formatWalletAddress = (address?: string) => {
        if (!address) return 'N/A';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    const handleCopyAddress = (address?: string) => {
        if (!address) return;
        navigator.clipboard.writeText(address).then(() => {
            addToast('Wallet address copied!', 'success');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            addToast('Failed to copy address.', 'error');
        });
    };
    
    return (
        <div className="profile-wall-container -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="profile-content-wrapper">
                <div className="profile-badge">
                    <div className="profile-identity-block">
                        <img 
                            src={profilePic || `https://i.pravatar.cc/150?u=${user.id}`} 
                            alt={name}
                            className="profile-badge-photo"
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="profile-identity-text">
                            <h2 className="profile-badge-name">{name}</h2>
                            <p className="profile-badge-userid">USER ID: {id}</p>
                            <p className="profile-badge-score">SCORE: {credoPoints?.toLocaleString() || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="profile-badge-divider"></div>

                    <div className="profile-socials-block">
                        {user.socials?.discord && (
                            <div className="profile-badge-detail-item">
                                <DiscordIcon size={18} />
                                <span>{user.socials.discord}</span>
                            </div>
                        )}
                        {user.socials?.twitter ? (
                            <div className="profile-badge-detail-item">
                                <XIcon size={16} />
                                <span>@{user.socials.twitter}</span>
                            </div>
                        ) : isOwnProfile && (
                            <a href="#" onClick={(e) => { e.preventDefault(); addToast('Twitter connection coming soon!', 'info'); }} className="profile-badge-detail-item clickable">
                                <XIcon size={16} />
                                <span>Connect Twitter</span>
                            </a>
                        )}
                        {user.walletAddress ? (
                            <div
                                className="profile-badge-detail-item clickable"
                                onClick={() => handleCopyAddress(user.walletAddress)}
                                title="Copy address"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleCopyAddress(user.walletAddress);
                                    }
                                }}
                            >
                                <Wallet size={18} />
                                <span>{formatWalletAddress(user.walletAddress)}</span>
                            </div>
                        ) : isOwnProfile && (
                            <button onClick={() => addToast('Wallet connection coming soon!', 'info')} className="profile-badge-detail-item clickable w-full">
                                <Wallet size={18} />
                                <span>Connect Wallet</span>
                            </button>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-auto">
                        <button 
                            onClick={handleVouch}
                            disabled={vouchButtonDisabled}
                            className={`profile-vouch-button flex-1 ${hasVouched || justVouched ? 'vouched' : 'can-vouch'}`}
                        >
                            <ShieldCheck size={20} />
                            <span>{hasVouched || justVouched ? 'Vouched' : 'Vouch'}</span>
                        </button>
                        <ReactRouterDOM.Link 
                            to={`/profile/points?user=${user.id}`}
                            className="profile-vouch-button can-vouch flex-1"
                        >
                            <BarChart size={20} />
                            <span>Points</span>
                        </ReactRouterDOM.Link>
                    </div>
                </div>

                <div className="profile-panels-group">
                    {buildingProjects.length > 0 && (
                        <motion.div
                            className="profile-side-panel"
                            variants={panelVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h3>BUILDING</h3>
                            <ul>
                                {buildingProjects.map(project => (
                                    <li key={project.id}>
                                        <ReactRouterDOM.Link to={`/project/${project.id}`} className="profile-project-item group">
                                            <img src={project.logo} alt={project.name} className="profile-project-logo transition-transform duration-200 group-hover:scale-110" loading="lazy" decoding="async" />
                                            <span className="transition-colors duration-200 group-hover:text-primary">{project.name}</span>
                                        </ReactRouterDOM.Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                    
                    {pastBuilds.length > 0 && (
                        <motion.div
                            className="profile-side-panel"
                            variants={panelVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h3>PAST BUILDS</h3>
                            <ul>
                                {pastBuilds.map(project => (
                                    <li key={project.id}>
                                        <ReactRouterDOM.Link to={`/project/${project.id}`} className="profile-project-item group">
                                            <img src={project.logo} alt={project.name} className="profile-project-logo transition-transform duration-200 group-hover:scale-110" loading="lazy" decoding="async" />
                                            <span className="transition-colors duration-200 group-hover:text-primary">{project.name}</span>
                                        </ReactRouterDOM.Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                    
                    {discordRoles.length > 0 && (
                        <motion.div 
                            className="profile-side-panel"
                            variants={panelVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h3>ROLES</h3>
                            <ul>
                                {discordRoles.map(role => {
                                    const projectName = roleToProjectMap.get(role);
                                    return (
                                        <li key={role} className="profile-role-item">
                                            {projectName ? `${projectName} - ${role}` : role}
                                        </li>
                                    );
                                })}
                            </ul>
                        </motion.div>
                    )}

                    {userHoldings.length > 0 && (
                        <motion.div
                            className="profile-side-panel"
                            variants={panelVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h3>NFT Holdings</h3>
                            <ul>
                                {userHoldings.map(collection => (
                                    <li key={collection.id}>
                                        <ReactRouterDOM.Link to={`/project/${collection.projectId}`} className="profile-project-item group">
                                            <img src={collection.image} alt={collection.name} className="profile-project-logo !rounded-lg transition-transform duration-200 group-hover:scale-110" loading="lazy" decoding="async" />
                                            <div className="flex flex-col -space-y-1">
                                                <span className="transition-colors duration-200 group-hover:text-primary">{collection.name}</span>
                                                <span className="text-xs text-on-surface-variant font-normal">{collection.projectName}</span>
                                            </div>
                                        </ReactRouterDOM.Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileWall;