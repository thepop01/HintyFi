import React, { useMemo, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { getProjects, getUsers, getEvents } from '../src/services/dataService';
import { Project, User, Event, CampaignEvent, Task } from '../src/types';
import { ArrowLeft, Award, Crown, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PaginationControls from '../components/common/PaginationControls';

// Copied from utils/helpers.ts to read localStorage directly
const COMPLETED_TASKS_STORAGE_KEY = 'trndz_completedTasks_v1';
type CompletedTasksState = Record<string, string[]>;

const ProjectLeaderboardPage: React.FC = () => {
    const { id } = ReactRouterDOM.useParams();
    const navigate = ReactRouterDOM.useNavigate();
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const { project, allUsers, projectCampaigns } = useMemo(() => {
        if (!id) return { project: null, allUsers: [], projectCampaigns: [] };
        const projectData = getProjects().find(p => p.id === id);
        const usersData = getUsers();
        const eventsData = getEvents().filter((e): e is CampaignEvent => e.type === 'campaign' && e.projectName === projectData?.name);
        return { project: projectData, allUsers: usersData, projectCampaigns: eventsData };
    }, [id]);

    const leaderboardData = useMemo(() => {
        if (!project) return [];

        let completedTasks: CompletedTasksState = {};
        try {
            const stored = localStorage.getItem(COMPLETED_TASKS_STORAGE_KEY);
            if (stored) {
                completedTasks = JSON.parse(stored);
            }
        } catch (error) {
            console.error("Failed to load completed tasks from localStorage", error);
        }

        const projectTasksMap = new Map<string, Task>(project.tasks?.map(t => [t.id, t]) || []);

        const scores = allUsers.map(user => {
            let score = 0;
            const scoreBreakdown: {
                tasks: number;
                campaigns: number;
                roles: number;
                nfts: number;
                tokens: number;
            } = {
                tasks: 0,
                campaigns: 0,
                roles: 0,
                nfts: 0,
                tokens: 0,
            };

            // 1. Task Points
            const userCompletedTasks = completedTasks[project.id] || [];
            userCompletedTasks.forEach(taskId => {
                const task = projectTasksMap.get(taskId);
                if (task) {
                    scoreBreakdown.tasks += task.points;
                }
            });

            // 2. Campaign Points (e.g., 100 points per submission)
            projectCampaigns.forEach(campaign => {
                if (campaign.entries?.some(entry => entry.userId === user.id)) {
                    scoreBreakdown.campaigns += 100;
                }
            });

            // 3. Role points
            const userRoles = new Set(user.discordRoles || []);
            if (project.discordRoles) {
                project.discordRoles.forEach(role => {
                    if (userRoles.has(role.name) && role.points) {
                        scoreBreakdown.roles += role.points;
                    }
                });
            }

            // 4. NFT Holding points
            const userNftHolding = (user.nftHoldings || []).find(h => h.projectId === project.id);
            if (userNftHolding && project.nftCollections) {
                const pointsPerDay = project.nftCollections.reduce((total, collection) => total + (collection.pointsPerDay || 0), 0);
                if (pointsPerDay > 0) {
                    scoreBreakdown.nfts += userNftHolding.daysHeld * pointsPerDay;
                }
                const oneTimePoints = project.nftCollections.reduce((total, collection) => total + (collection.oneTimePoints || 0), 0);
                scoreBreakdown.nfts += oneTimePoints;
            }
            
            // 5. Token Holding points
            const userTokenHolding = (user.tokenHoldings || []).find(h => h.projectId === project.id);
            if (userTokenHolding && project.tokenHoldingTiers) {
                const tier = project.tokenHoldingTiers.find(t => userTokenHolding.amount >= t.minAmount && (t.maxAmount === null || userTokenHolding.amount <= t.maxAmount));
                if (tier) {
                    scoreBreakdown.tokens += userTokenHolding.daysHeld * tier.pointsPerDay;
                }
            }

            score = Object.values(scoreBreakdown).reduce((sum, current) => sum + current, 0);

            return { user, score: Math.round(score), scoreBreakdown };
        });

        return scores
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);

    }, [project, allUsers, projectCampaigns]);

    const { paginatedLeaderboard, totalPages } = useMemo(() => {
        const total = leaderboardData.length;
        const pages = Math.ceil(total / pageSize);
        const paginated = leaderboardData.slice(
            currentPage * pageSize,
            (currentPage + 1) * pageSize
        );
        return { paginatedLeaderboard: paginated, totalPages: pages };
    }, [leaderboardData, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [pageSize]);

    if (!project) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-on-surface">Project not found</h2>
                <button onClick={() => navigate('/ecosystem')} className="mt-4 neu-button px-4 py-2 flex items-center gap-2 mx-auto">
                    <ArrowLeft size={16} /> Back to Ecosystem
                </button>
            </div>
        );
    }
    
    const rankStyle = (rank: number) => {
        if (rank === 1) return 'text-amber-400';
        if (rank === 2) return 'text-slate-400';
        if (rank === 3) return 'text-amber-600';
        return 'text-on-surface-variant';
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <button onClick={() => navigate(`/project/${project.id}`)} className="neu-button px-4 py-2 flex items-center gap-2 w-max">
                <ArrowLeft size={16} />
                Back to Project
            </button>

            <div className="neu-card p-6 flex items-center gap-6">
                <img src={project.logo} alt={project.name} className="w-24 h-24 rounded-full border-4 border-surface bg-background object-contain p-1" />
                <div>
                    <h1 className="text-4xl font-display font-bold text-on-surface">{project.name}</h1>
                    <h2 className="text-2xl font-display font-semibold text-on-surface-variant">Community Leaderboard</h2>
                </div>
            </div>
            
            <Section icon={<Award size={24} />} title="Top Contributors">
                <ol className="space-y-3">
                    {paginatedLeaderboard.map((item, index) => {
                        const rank = currentPage * pageSize + index + 1;
                        const isExpanded = expandedUserId === item.user.id;
                        return (
                        <motion.li key={item.user.id} layout>
                            <div 
                                className="neu-outset-card p-3 flex items-center gap-4 cursor-pointer"
                                onClick={() => setExpandedUserId(isExpanded ? null : item.user.id)}
                            >
                                <div className="flex items-center justify-center w-12 flex-shrink-0">
                                    <span className={`font-display font-bold text-2xl ${rankStyle(rank)}`}>
                                        #{rank}
                                    </span>
                                </div>
                                <img 
                                    src={item.user.profilePic || `https://i.pravatar.cc/40?u=${item.user.id}`} 
                                    alt={item.user.name} 
                                    className="w-10 h-10 rounded-full object-cover border-2 border-surface" 
                                />
                                <ReactRouterDOM.Link to={`/profile?user=${item.user.id}`} onClick={e=>e.stopPropagation()} className="font-semibold text-on-surface hover:text-primary transition-colors flex-grow truncate flex items-center gap-2">
                                    {item.user.name}
                                    {rank === 1 && <Crown size={16} className="text-amber-400 fill-amber-400" />}
                                </ReactRouterDOM.Link>
                                <span className="font-bold text-primary whitespace-nowrap">{item.score.toLocaleString()} PTS</span>
                                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="ml-2">
                                    <ChevronDown size={20} />
                                </motion.div>
                            </div>
                             <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-surface/50 rounded-b-lg px-6 pb-4 pt-2 -mt-2"
                                    >
                                        <h4 className="font-bold text-sm text-on-surface-variant mb-2">Score Breakdown:</h4>
                                        <ul className="text-sm text-on-surface grid grid-cols-2 gap-x-4 gap-y-1">
                                            {Object.entries(item.scoreBreakdown).map(([key, value]) => typeof value === 'number' && value > 0 && (
                                                <li key={key} className="flex justify-between">
                                                    <span className="capitalize text-on-surface-variant">{key}:</span>
                                                    <span className="font-semibold">{value.toLocaleString()} pts</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.li>
                    )})}
                </ol>
                {leaderboardData.length === 0 && (
                    <p className="text-center text-on-surface-variant py-8">No contributors with points yet. Be the first!</p>
                )}
                 {leaderboardData.length > 0 && (
                    <div className="mt-6">
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            pageSize={pageSize}
                            onPageSizeChange={setPageSize}
                            totalItems={leaderboardData.length}
                        />
                    </div>
                )}
            </Section>

        </div>
    );
};

const Section: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode, className?: string }> = ({ icon, title, children, className }) => (
    <div className={`neu-card p-6 ${className}`}>
        <h2 className="flex items-center gap-3 text-2xl font-display font-bold text-on-surface mb-4">
            {icon}
            <span>{title}</span>
        </h2>
        {children}
    </div>
);

export default ProjectLeaderboardPage;