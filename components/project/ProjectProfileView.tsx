import React, { useMemo, useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, Event, User, TeamMember, PerkType, Task, CampaignEvent, NftCollection, DiscordRole, PointTier } from '../../src/types';
import { getProjects, getUsers } from '../../src/services/dataService';
import { Globe, Users, Award, FileText, Gem, PackageCheck, Link as LinkIcon, ArrowRight, ClipboardList, Banknote, Flame, Megaphone, Youtube, Edit3, ChevronDown, BrainCircuit, Shield, Linkedin } from 'lucide-react';

// --- ANIMATION VARIANTS ---
const animatedTextContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const animatedTextChar = {
    hidden: { y: '100%', opacity: 0 },
    visible: {
        y: '0%',
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: 'easeOut' as const,
        },
    },
};


// --- HELPER COMPONENTS ---

const XSocialIcon = () => (
    <div className="bg-black w-5 h-5 rounded-md flex items-center justify-center">
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 fill-current text-white"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
    </div>
);

const XIconInline: React.FC<{ className?: string }> = ({ className }) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={`fill-current ${className}`}><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
);

const DiscordIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
    <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={`fill-current ${className}`}
        style={{ width: size, height: size }}
    >
        <title>Discord</title>
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4464.8257-.618 1.2295a18.298 18.298 0 00-5.4849 0c-.1716-.4038-.407-.8542-.618-1.2295a.0741.0741 0 00-.0785-.0371 19.7363 19.7363 0 00-4.8851 1.5152.0699.0699 0 00-.0321.027c-3.3757 5.9272-3.3757 11.7582 0 17.6854a.0699.0699 0 00.0321.027c1.5872.4839 3.1632.844 4.8851 1.05.0741.0053.1328-.0213.1593-.0838.2215-.5533.432-1.1281.5937-1.7292a.0741.0741 0 00-.0426-.0891 16.5913 16.5913 0 01-1.4239-.8199.0741.0741 0 01-.0053-.1064c.2057-.2825.401-.5754.578-.8578a.0741.0741 0 01.0991-.0106c.0053.0053.0106.0053.0159.0106 2.3051 1.2825 4.9543 1.2825 7.2594 0 .0053-.0053.0106-.0053.0159-.0106a.0741.0741 0 01.0991.0106c.177.2824.3723.5753.578.8578a.0741.0741 0 01-.0053.1064 16.5913 16.5913 0 01-1.4239.8199.0741.0741 0 00-.0426.0891c.1617.6011.3722 1.1759.5937 1.7292.0266.0625.0852.0891.1593.0838 1.7219-.206 3.2979-.5661 4.8851-1.05a.0699.0699 0 00.0321-.027c3.3757-5.9272 3.3757-11.7582 0-17.6854a.0699.0699 0 00-.0321-.027zm-5.4232 12.336c-1.3813 0-2.5024-1.1636-2.5024-2.5929s1.1211-2.5929 2.5024-2.5929c1.3813 0 2.5024 1.1636 2.5024 2.5929s-1.1211 2.5929-2.5024 2.5929zm-5.3283 0c-1.3813 0-2.5024-1.1636-2.5024-2.5929s1.1211-2.5929 2.5024-2.5929c1.3813 0 2.5024 1.1636 2.5024 2.5929 0 1.4293-1.1211 2.5929-2.5024 2.5929z" />
    </svg>
);


const GuildIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2zm0 6h2v2h-2z" /></svg>
);

const platformIcons: Record<Task['platform'], React.ReactNode> = {
    x: <XSocialIcon />,
    discord: <DiscordIcon />,
    guild: <GuildIcon />,
    youtube: <Youtube size={20} />,
    website: <LinkIcon size={20} />,
    testnet: <Edit3 size={20} />,
};

const HeroLink: React.FC<{ href: string; icon: React.ReactNode; label: string; }> = ({ href, icon, label }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={label}
        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition-all duration-200"
    >
        {icon}
    </a>
);

const formatMetric = (num?: number): string | undefined => {
    if (num === undefined) return undefined;
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(0) + 'K';
    }
    return num.toString();
};

const MetricLink: React.FC<{ href: string; icon: React.ReactNode; label: string; metric?: number; metricLabel: string; }> = ({ href, icon, label, metric, metricLabel }) => {
    const [isHovered, setIsHovered] = useState(false);
    const formattedMetric = formatMetric(metric);

    return (
        <motion.a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            className="h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200 overflow-hidden"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            animate={{ width: isHovered && formattedMetric ? 'auto' : 40 }}
            initial={{ width: 40 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
            <div className="flex items-center gap-2 px-3">
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{icon}</div>
                <AnimatePresence>
                    {isHovered && formattedMetric && (
                        <motion.span 
                            className="text-xs font-bold whitespace-nowrap"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            {formattedMetric} {metricLabel}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </motion.a>
    );
};


const Section: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode, className?: string, action?: React.ReactNode }> = ({ icon, title, children, className, action }) => (
    <div className={`neu-card p-6 ${className}`}>
        <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="flex items-center gap-3 text-2xl font-display font-bold text-on-surface">
                {icon}
                <span>{title}</span>
            </h2>
            {action && <div className="flex-shrink-0">{action}</div>}
        </div>
        {children}
    </div>
);

const StrategyWalkthrough: React.FC<{ steps: string[] }> = ({ steps }) => (
    <Section icon={<BrainCircuit size={24} />} title="Strategy Walkthrough">
        <ol className="list-decimal list-inside space-y-3 text-on-surface-variant">
            {steps.map((step, index) => (
                <li key={index} className="flex items-start">
                    <span className="font-bold text-primary mr-2">{index + 1}.</span>
                    <span>{step}</span>
                </li>
            ))}
        </ol>
    </Section>
);

const EngagementPanel: React.FC<{ project: Project; events: Event[] }> = ({ project, events }) => {
    const navigate = ReactRouterDOM.useNavigate();
    const hasTasks = project.tasks && project.tasks.length > 0;
    
    const projectCampaigns = useMemo(() => events.filter((e): e is CampaignEvent => e.type === 'campaign'), [events]);
    const hasCampaigns = projectCampaigns.length > 0;

    const [activeTab, setActiveTab] = useState<'campaigns' | 'tasks'>(hasCampaigns ? 'campaigns' : 'tasks');

    if (!hasTasks && !hasCampaigns) {
        return null;
    }

    return (
        <Section 
            icon={<Megaphone size={24} />} 
            title="Engage"
            action={
                <ReactRouterDOM.Link
                    to={`/project/${project.id}/leaderboard`}
                    className="neu-button px-4 py-2 text-sm font-semibold flex items-center gap-2"
                >
                    <Award size={16} />
                    <span>Leaderboard</span>
                </ReactRouterDOM.Link>
            }
        >
            <div className="flex items-center gap-2 mb-4 border-b border-border/10 pb-2">
                {hasCampaigns && (
                    <button onClick={() => setActiveTab('campaigns')} className={`neu-tab-button ${activeTab === 'campaigns' ? 'active' : ''}`}>
                        Campaigns
                    </button>
                )}
                {hasTasks && (
                    <button onClick={() => setActiveTab('tasks')} className={`neu-tab-button ${activeTab === 'tasks' ? 'active' : ''}`}>
                        Tasks
                    </button>
                )}
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'campaigns' && hasCampaigns && (
                        <div>
                            {projectCampaigns.length > 0 ? (
                                <div className="space-y-3">
                                    {projectCampaigns.map(campaign => {
                                        const now = Date.now();
                                        let status: 'Live' | 'Upcoming' | 'Ended' = 'Upcoming';
                                        let statusColor = 'text-blue-400';
                                        if (now >= campaign.startTime && now <= campaign.endTime) {
                                            status = 'Live';
                                            statusColor = 'text-green-400';
                                        } else if (now > campaign.endTime) {
                                            status = 'Ended';
                                            statusColor = 'text-gray-500';
                                        }

                                        return (
                                            <div key={campaign.id} className="neu-outset-card p-3 flex justify-between items-center gap-4">
                                                <div className="flex-grow min-w-0">
                                                    <p className="font-semibold text-on-surface truncate">{campaign.title}</p>
                                                    <span className={`text-sm font-bold ${statusColor}`}>{status}</span>
                                                </div>
                                                <ReactRouterDOM.Link 
                                                    to={`/campaign/${campaign.id}`} 
                                                    className="neu-button px-4 py-1.5 text-sm font-semibold flex-shrink-0"
                                                >
                                                    Visit
                                                </ReactRouterDOM.Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-center text-on-surface-variant py-4">No campaigns for this project yet.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'tasks' && hasTasks && (
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-on-surface">Engage and Earn</h3>
                                <p className="text-sm text-on-surface-variant">Complete tasks to earn rewards and contribute to the project.</p>
                            </div>
                            <ReactRouterDOM.Link to={`/project/${project.id}/tasks`} className="neu-button px-4 py-2 text-sm font-semibold flex items-center gap-1 flex-shrink-0">
                                View {project.tasks!.length} Tasks <ArrowRight size={14} />
                            </ReactRouterDOM.Link>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </Section>
    );
};

const TeamPanel: React.FC<{ team: TeamMember[]; allUsers: User[] }> = ({ team, allUsers }) => {
    const allProjects = useMemo(() => getProjects(), []);
    const projectsById = useMemo(() => {
        const map = new Map<string, Project>();
        allProjects.forEach(p => map.set(p.id, p));
        return map;
    }, [allProjects]);

    const usersByName = useMemo(() => {
        const map = new Map<string, User>();
        allUsers.forEach(user => map.set(user.name.toLowerCase(), user));
        return map;
    }, [allUsers]);

    const findTier = (tiers: PointTier[] | undefined, amount: number): PointTier | undefined => {
        if (!tiers) return undefined;
        return tiers.find(tier =>
            amount >= tier.minAmount && (tier.maxAmount === null || amount <= tier.maxAmount)
        );
    };

    const calculateCredibilityScore = (user: User): number => {
        let credibilityScore = 0;
        const userRoles = new Set(user.discordRoles || []);

        allProjects.forEach(project => {
            if (project.discordRoles) {
                project.discordRoles.forEach(role => {
                    if (userRoles.has(role.name) && role.points) {
                        credibilityScore += role.points;
                    }
                });
            }
        });

        (user.nftHoldings || []).forEach(holding => {
            const project = projectsById.get(holding.projectId);
            if (project && project.nftCollections) {
                const pointsPerDay = project.nftCollections.reduce((total, collection) => total + (collection.pointsPerDay || 0), 0);
                if (pointsPerDay > 0) {
                    credibilityScore += holding.daysHeld * pointsPerDay;
                }
            }
        });

        (user.tokenHoldings || []).forEach(holding => {
            const project = projectsById.get(holding.projectId);
            if (project && project.tokenHoldingTiers) {
                const tier = findTier(project.tokenHoldingTiers, holding.amount);
                if (tier) {
                    credibilityScore += holding.daysHeld * tier.pointsPerDay;
                }
            }
        });

        return Math.round(credibilityScore);
    };

    if (!team || team.length === 0) return null;

    return (
        <Section icon={<Users size={24} />} title="Team">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.map((member, index) => {
                    const user = usersByName.get(member.name.toLowerCase());
                    const photo = member.photoUrl || user?.profilePic || `https://i.pravatar.cc/150?u=${member.name}`;
                    const credibilityScore = user ? calculateCredibilityScore(user) : null;

                    return (
                        <div key={index} className="neu-outset-card p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <img
                                    src={photo}
                                    alt={member.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-surface flex-shrink-0"
                                    loading="lazy"
                                />
                                <div className="overflow-hidden">
                                    <p className="font-semibold text-on-surface capitalize truncate">{member.name}</p>
                                    <p className="text-sm text-on-surface-variant truncate">{member.role}</p>
                                    {credibilityScore !== null && (
                                        <p className="text-xs text-primary font-bold mt-1">
                                            Credibility: {credibilityScore.toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                {member.socials?.twitter && (
                                    <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" title="Twitter" className="neu-control !p-1.5"><XIconInline className="w-3.5 h-3.5" /></a>
                                )}
                                {member.socials?.linkedin && (
                                    <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="neu-control !p-1.5"><Linkedin size={14} /></a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Section>
    );
};

const CredoPointsPanel: React.FC<{ project: Project }> = ({ project }) => {
    const hasRolePoints = project.discordRoles?.some(r => r.points && r.points > 0);
    const hasNftPoints = project.nftCollections?.some(c => c.pointsPerDay && c.pointsPerDay > 0);
    const hasTokenPoints = project.tokenHoldingTiers && project.tokenHoldingTiers.length > 0;

    if (!hasRolePoints && !hasNftPoints && !hasTokenPoints) {
        return null;
    }

    return (
        <Section icon={<Award size={24} />} title="Credo Points">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hasRolePoints && (
                    <div>
                        <h3 className="font-bold text-on-surface-variant mb-2 flex items-center gap-2"><Shield size={18} /> Discord Roles</h3>
                        <ul className="space-y-1 text-sm">
                            {project.discordRoles?.filter(r => r.points).map(role => (
                                <li key={role.roleId} className="flex justify-between">
                                    <span>{role.name}</span>
                                    <span className="font-semibold text-primary">{role.points} pts</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {hasNftPoints && (
                     <div>
                        <h3 className="font-bold text-on-surface-variant mb-2 flex items-center gap-2"><Gem size={18} /> NFT Holding</h3>
                        <ul className="space-y-1 text-sm">
                            {project.nftCollections?.filter(c => c.pointsPerDay).map(collection => (
                                <li key={collection.id} className="flex justify-between">
                                    <span>{collection.name}</span>
                                    <span className="font-semibold text-primary">{collection.pointsPerDay} pts/day</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {hasTokenPoints && (
                    <div>
                        <h3 className="font-bold text-on-surface-variant mb-2 flex items-center gap-2"><Banknote size={18} /> Token Holding</h3>
                         <ul className="space-y-1 text-sm">
                            {project.tokenHoldingTiers?.map((tier, i) => (
                                <li key={i} className="flex justify-between">
                                    <span>{tier.minAmount.toLocaleString()}{tier.maxAmount ? ` - ${tier.maxAmount.toLocaleString()}` : '+'}</span>
                                    <span className="font-semibold text-primary">{tier.pointsPerDay} pts/day</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </Section>
    );
};

const DiscordRoleDropdown: React.FC<{ roles: DiscordRole[] }> = ({ roles }) => {
    const [isOpen, setIsOpen] = useState(false);

    const PerkTypeBadge: React.FC<{ type: PerkType }> = ({ type }) => {
        const styles: Record<PerkType, string> = {
            'Airdrop': 'bg-green-500/20 text-green-400',
            'GTD': 'bg-blue-500/20 text-blue-400',
            'FCFS': 'bg-amber-800/80 text-amber-100',
            'Free Mint': 'bg-purple-500/20 text-purple-400',
        };
        const style = styles[type] || 'bg-gray-500/20 text-gray-400';
        return <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${style} flex-shrink-0`}>{type}</span>;
    };

    return (
        <div className="p-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-left group"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-lg object-cover border-2 border-surface shadow-md flex items-center justify-center bg-surface-container text-[#5865F2]">
                        <DiscordIcon size={32} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold font-display text-lg text-on-surface group-hover:text-primary transition-colors">Discord Roles</h4>
                        <p className="text-xs text-on-surface-variant">{roles.length} role(s) with perks</p>
                    </div>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown size={24} className="text-on-surface-variant group-hover:text-primary" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pt-2 pb-4 px-4">
                            <div className="space-y-3">
                                {roles.map((role) => (
                                    <div key={role.roleId} className="neu-outset-card p-4 rounded-xl">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-bold text-on-surface">Role: {role.name}</p>
                                                <p className="text-sm text-on-surface-variant mt-1">{role.perk!.description}</p>
                                            </div>
                                            <PerkTypeBadge type={role.perk!.type} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- MAIN VIEW COMPONENT ---
interface ProjectProfileViewProps {
    project: Project;
    events: Event[];
}

const ProjectProfileView: React.FC<ProjectProfileViewProps> = ({ project, events }) => {
    const allUsers = useMemo(() => getUsers(), []);
    const navigate = ReactRouterDOM.useNavigate();

    const NftCollectionDropdown: React.FC<{
        collection: NftCollection & { _sourceProject?: Project };
        project: Project;
    }> = ({ collection, project }) => {
        const [isOpen, setIsOpen] = useState(false);
    
        const PerkTypeBadge: React.FC<{ type: PerkType }> = ({ type }) => {
            const styles: Record<PerkType, string> = {
                'Airdrop': 'bg-green-500/20 text-green-400',
                'GTD': 'bg-blue-500/20 text-blue-400',
                'FCFS': 'bg-amber-800/80 text-amber-100',
                'Free Mint': 'bg-purple-500/20 text-purple-400',
            };
            const style = styles[type] || 'bg-gray-500/20 text-gray-400';
            return <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${style} flex-shrink-0`}>{type}</span>;
        };
    
        const isExternalCollection = collection._sourceProject && collection._sourceProject.id !== project.id;
    
        return (
            <div className="p-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between text-left group"
                    aria-expanded={isOpen}
                >
                    <div className="flex items-center gap-4">
                        {collection.image && (
                            <img
                                src={collection.image}
                                alt={collection.name}
                                className="w-16 h-16 rounded-lg object-cover border-2 border-surface shadow-md"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold font-display text-lg text-on-surface group-hover:text-primary transition-colors truncate">{collection.name}</h4>
                            {isExternalCollection && collection._sourceProject && (
                                <ReactRouterDOM.Link to={`/project/${collection._sourceProject.id}`} onClick={(e) => e.stopPropagation()} className="text-xs text-on-surface-variant hover:text-primary flex items-center gap-1">
                                    From {collection._sourceProject.name}
                                </ReactRouterDOM.Link>
                            )}
                            {(collection.link) && (
                                <a href={collection.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-on-surface-variant hover:text-primary flex items-center gap-1" aria-label={`View ${collection.name} collection`}>
                                    View Collection <LinkIcon size={12} />
                                </a>
                            )}
                        </div>
                    </div>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown size={24} className="text-on-surface-variant group-hover:text-primary" />
                    </motion.div>
                </button>
    
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="pt-2 pb-4 px-4">
                                <div className="space-y-3">
                                    {collection.perks.length > 0 ? (
                                        collection.perks.map((perk, index) => {
                                            const requirement = perk.holdingRequirement;
                                            const sourceProjectName = collection._sourceProject?.name || project.name;
                                            const isInternalPerkRequirement = !requirement.projectName || requirement.projectName === sourceProjectName;
                                            
                                            return (
                                                <div key={index} className="neu-outset-card p-4 rounded-xl">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <p className="font-bold text-on-surface text-sm">
                                                                {isInternalPerkRequirement 
                                                                    ? `Hold ${requirement.count}+ of this collection` 
                                                                    : `Requires: Hold ${requirement.count}+ of ${requirement.collectionName} from ${requirement.projectName}`
                                                                }
                                                            </p>
                                                            <p className="text-sm text-on-surface-variant mt-1">{perk.perk.description}</p>
                                                        </div>
                                                        <PerkTypeBadge type={perk.perk.type} />
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <p className="text-sm text-center text-on-surface-variant py-4">No specific perks listed for this collection.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const PerksAndAirdropsPanel: React.FC<{ project: Project }> = ({ project }) => {
        const allProjects = useMemo(() => getProjects(), []);
    
        const displayableCollections = useMemo(() => {
            const collections = new Map<string, NftCollection & { _sourceProject: Project }>();
            const projectCollections = project.nftCollections || [];
    
            // 1. Add native collections
            projectCollections.forEach(coll => {
                collections.set(`${project.id}-${coll.id}`, { ...coll, _sourceProject: project });
            });
    
            // 2. Add external collections that are required for perks
            projectCollections.forEach(coll => {
                coll.perks.forEach(perk => {
                    const req = perk.holdingRequirement;
                    if (req.projectName && req.collectionName && req.projectName !== project.name) {
                        const externalProject = allProjects.find(p => p.name === req.projectName);
                        const externalCollection = externalProject?.nftCollections?.find(c => c.name === req.collectionName);
                        
                        if (externalProject && externalCollection) {
                            const key = `${externalProject.id}-${externalCollection.id}`;
                            if (!collections.has(key)) {
                                collections.set(key, { ...externalCollection, _sourceProject: externalProject });
                            }
                        }
                    }
                });
            });
            
            return Array.from(collections.values());
        }, [project, allProjects]);

        const rolePerks = useMemo(() => project.discordRoles?.filter(r => r.perk) || [], [project.discordRoles]);
    
        if (rolePerks.length === 0 && displayableCollections.length === 0) {
            return null;
        }
    
        return (
            <Section icon={<PackageCheck size={24} />} title="Perks & Airdrops">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {displayableCollections.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="flex items-center gap-2 font-bold font-display text-lg text-on-surface-variant mb-2">
                                <Gem size={18} />
                                <span>NFT Holding Perks</span>
                            </h3>
                            <div className="divide-y divide-border/10">
                                {displayableCollections.map((collection) => (
                                    <NftCollectionDropdown key={`${collection._sourceProject.id}-${collection.id}`} collection={collection} project={project} />
                                ))}
                            </div>
                        </div>
                    )}
    
                    {rolePerks.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="flex items-center gap-2 font-bold font-display text-lg text-on-surface-variant mb-2">
                                <DiscordIcon className="text-on-surface-variant" />
                                <span>Discord Role Perks</span>
                            </h3>
                            <div className="divide-y divide-border/10">
                                 <DiscordRoleDropdown roles={rolePerks} />
                            </div>
                        </div>
                    )}
                </div>
            </Section>
        );
    };

    return (
        <div className="space-y-8">
            {/* --- HERO --- */}
            <section className="relative min-h-[40vh] md:min-h-[50vh] w-full rounded-lg overflow-hidden flex flex-col items-center justify-center p-6 text-white text-center -mt-4">
                <img 
                    src={project.banner} 
                    alt={`${project.name} Banner`} 
                    className="absolute inset-0 w-full h-full object-cover" 
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <div className="relative z-10 w-full">
                    <div className="flex flex-col items-center gap-6">
                        <img 
                            src={project.logo}
                            alt={`${project.name} Logo`}
                            className="w-28 h-28 rounded-2xl border-4 border-surface bg-background object-contain p-1 shadow-lg"
                            loading="lazy"
                        />
                        <div>
                            <div className="overflow-hidden">
                                <motion.h1 
                                    variants={animatedTextContainer}
                                    initial="hidden"
                                    animate="visible"
                                    aria-label={project.name}
                                    className="text-4xl md:text-5xl font-display font-extrabold text-white drop-shadow-lg flex justify-center"
                                >
                                    {project.name.split('').map((char, index) => (
                                        <motion.span key={index} variants={animatedTextChar} className="inline-block">
                                            {char === ' ' ? '\u00A0' : char}
                                        </motion.span>
                                    ))}
                                </motion.h1>
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-4">
                                {project.category.map(cat => <span key={cat} className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">{cat.toUpperCase()}</span>)}
                            </div>
                            <div className="flex items-center justify-center flex-wrap gap-3 mt-6">
                                {project.links.website && <HeroLink href={project.links.website} icon={<img src={project.logo} alt={project.name} className="w-full h-full object-cover rounded-full" />} label="Website" />}
                                {project.links.twitter && <MetricLink href={project.links.twitter} icon={<XSocialIcon />} label="X (Twitter)" metric={project.followersX} metricLabel="Followers" />}
                                {project.links.discord && <MetricLink href={project.links.discord} icon={<DiscordIcon />} label="Discord" metric={project.membersDiscord} metricLabel="Members" />}
                                {project.links.whitelistInfo && <HeroLink href={project.links.whitelistInfo} icon={<FileText size={20} />} label="Whitelist Info" />}
                                
                                {project.coins?.map(coin => (
                                    <HeroLink key={coin.id} href={coin.link} icon={coin.type === 'meme' ? <Flame size={20} /> : <Banknote size={20} />} label={`${coin.name} (${coin.type})`} />
                                ))}
                                {project.nftCollections?.map(collection => (
                                    <HeroLink key={collection.id} href={collection.link} icon={<Gem size={20} />} label={`${collection.name} (NFT)`} />
                                ))}

                                <ReactRouterDOM.Link
                                    to={`/project/${project.id}/leaderboard`}
                                    className="h-10 px-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition-all duration-200 font-semibold text-sm gap-2"
                                >
                                    <Award size={18} />
                                    <span>Leaderboard</span>
                                </ReactRouterDOM.Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* --- MAIN CONTENT (Single Column) --- */}
            <main className="max-w-5xl mx-auto space-y-8 px-4 sm:px-0">
                <Section 
                    icon={<FileText size={24} />} 
                    title="About"
                >
                    <p className="text-base text-on-surface-variant leading-relaxed whitespace-pre-wrap">{project.longDescription}</p>
                </Section>

                {project.strategyWalkthrough && project.strategyWalkthrough.length > 0 && (
                    <StrategyWalkthrough steps={project.strategyWalkthrough} />
                )}
                
                <EngagementPanel project={project} events={events} />
                <TeamPanel team={project.team || []} allUsers={allUsers} />
                <PerksAndAirdropsPanel project={project} />
                <CredoPointsPanel project={project} />
            </main>
        </div>
    );
};

export default ProjectProfileView;