

import React, { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getUsers, getProjects, getEvents, getQuests } from '../src/services/dataService';
import { User, Project, Event, Quest, CampaignEvent, PointTier, ManualTirthAdjustment } from '../src/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, ArrowLeft, Shield, Gem, Banknote, Vote, FilePen, Trophy, ClipboardCheck } from 'lucide-react';
import Loader from '../components/common/Loader';
import { useCompletedTasks } from '../utils/helpers';

// Component for a single point entry
const PointEntry: React.FC<{ icon: React.ReactNode; label: string; points: number; subtext?: string }> = ({ icon, label, points, subtext }) => {
    if (points === 0) return null;
    return (
        <div className="flex items-center justify-between gap-4 p-3 bg-surface/50 rounded-lg">
            <div className="flex items-center gap-3">
                <div className="text-primary">{icon}</div>
                <div>
                    <p className="font-semibold text-on-surface">{label}</p>
                    {subtext && <p className="text-xs text-on-surface-variant">{subtext}</p>}
                </div>
            </div>
            <div className="font-bold text-primary text-lg whitespace-nowrap">
                {points > 0 ? '+' : ''}{points.toLocaleString()}
            </div>
        </div>
    );
};

// Component for Credo Points breakdown
const CredoPointsTab: React.FC<{ user: User; projects: Project[] }> = ({ user, projects }) => {
    const { isEligible, credoPoints } = useMemo(() => {
        const teamMemberNames = new Set<string>();
        projects.forEach(project => {
            project.team?.forEach(member => {
                teamMemberNames.add(member.name.toLowerCase());
            });
        });

        const isBuilder = user.projectsBuilding && user.projectsBuilding.length > 0;
        const isTeamMember = teamMemberNames.has(user.name.toLowerCase());
        
        const eligible = isBuilder || isTeamMember;
        
        return {
            isEligible: eligible,
            credoPoints: eligible ? (user.manualCredoPoints || 0) : 'N/A'
        };
    }, [user, projects]);

    return (
        <div className="space-y-6">
            <div className="neu-outset-card p-4 text-center">
                <p className="text-sm font-semibold text-on-surface-variant">Total Credo Points</p>
                <p className="text-4xl font-bold text-primary">
                    {typeof credoPoints === 'number' ? credoPoints.toLocaleString() : credoPoints}
                </p>
            </div>
            
            {isEligible ? (
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-on-surface-variant">Breakdown</h3>
                    <PointEntry 
                        icon={<Award />} 
                        label="Manually Awarded Points" 
                        points={typeof credoPoints === 'number' ? credoPoints : 0} 
                        subtext="For significant contributions to the ecosystem."
                    />
                </div>
            ) : (
                <div className="text-center py-10 text-on-surface-variant">
                    <h3 className="text-xl font-bold">Credo Points are for Builders</h3>
                    <p>Credo Points are manually awarded to active builders and team members for their contributions to the ecosystem.</p>
                </div>
            )}
        </div>
    );
};

// Component for Tirth Points breakdown
const TirthPointsTab: React.FC<{ user: User; projects: Project[], events: Event[]; quests: Quest[] }> = ({ user, projects, events, quests }) => {
    const { isTaskCompleted } = useCompletedTasks();
    
    const { tirthBreakdown, totalTirth, rewardsAdjustments } = useMemo(() => {
        const breakdown = {
            projectVotes: 0,
            roles: { points: 0, count: 0 },
            campaignSubmissions: 0,
            campaignVotes: 0,
            campaignWins: 0,
            questAnswers: 0,
            tasks: { points: 0, count: 0 },
            nfts: { points: 0, count: 0 },
            tokens: { points: 0, count: 0 },
            rewards: 0,
        };

        // --- AUTOMATED POINT CALCULATIONS ---
        if (user.discordRoles?.includes('with full access')) {
            breakdown.projectVotes = (user.votedProjectIds || []).length;
        }

        const userRoles = new Set(user.discordRoles || []);
        // Fix: Explicitly type the Map to ensure correct type inference for `projectsById.get()`, resolving errors on lines 132 and 156.
        const projectsById = new Map<string, Project>(projects.map(p => [p.id, p]));

        projects.forEach(project => {
            project.discordRoles?.forEach(role => {
                if (userRoles.has(role.name) && role.points) {
                    breakdown.roles.points += role.points;
                    breakdown.roles.count++;
                }
            });
        });

        breakdown.campaignSubmissions = events.filter((e): e is CampaignEvent => e.type === 'campaign').filter(c => c.entries?.some(entry => entry.userId === user.id)).length;
        breakdown.campaignVotes = (user.votedCampaignEntryIds || []).length;
        const wins = events.filter((e): e is CampaignEvent => e.type === 'campaign').filter(c => c.winners?.includes(user.id)).length;
        breakdown.campaignWins = wins * 5;
        breakdown.questAnswers = quests.filter(q => q.identityQuestion?.answers.some(a => a.userId === user.id) || q.multipleChoiceQuestion?.answers.some(a => a.userId === user.id)).length;

        projects.forEach(project => {
            project.tasks?.forEach(task => {
                if (isTaskCompleted(project.id, task.id)) {
                    breakdown.tasks.points += task.points;
                    breakdown.tasks.count++;
                }
            });
        });

        user.nftHoldings?.forEach(holding => {
            // FIX: Explicitly type `project` to guide TypeScript's inference within the complex `useMemo` hook.
            const project: Project | undefined = projectsById.get(holding.projectId);
            if (project?.nftCollections) {
                // FIX: TypeScript can now correctly infer the type of `project.nftCollections`.
                project.nftCollections.forEach(collection => {
                    let nftPoints = 0;
                    if (collection.oneTimePoints) nftPoints += collection.oneTimePoints;
                    if (collection.pointsPerDay) nftPoints += collection.pointsPerDay * holding.daysHeld;
                    
                    if (nftPoints > 0) {
                        breakdown.nfts.points += nftPoints;
                        breakdown.nfts.count++;
                    }
                });
            }
        });

        const findTier = (tiers: PointTier[] | undefined, amount: number): PointTier | undefined => {
            if (!tiers) return undefined;
            return tiers.find(tier => 
                amount >= tier.minAmount && (tier.maxAmount === null || amount <= tier.maxAmount)
            );
        };
        user.tokenHoldings?.forEach(holding => {
            // FIX: Explicitly type `project` to guide TypeScript's inference within the complex `useMemo` hook.
            const project: Project | undefined = projectsById.get(holding.projectId);
            if (project?.tokenHoldingTiers) {
                // FIX: TypeScript can now correctly infer the type of `project.tokenHoldingTiers`.
                const tier = findTier(project.tokenHoldingTiers, holding.amount);
                if (tier && tier.pointsPerDay > 0) {
                    const tokenPoints = tier.pointsPerDay * holding.daysHeld;
                    breakdown.tokens.points += tokenPoints;
                    breakdown.tokens.count++;
                }
            }
        });
        
        // --- MANUAL ADJUSTMENTS ---
        const manualRewardsAdjustments: ManualTirthAdjustment[] = [];
        (user.manualTirthAdjustments || []).forEach(adj => {
            if (adj.category === 'tasks') {
                breakdown.tasks.points += adj.points;
            } else if (adj.category === 'wins') {
                breakdown.campaignWins += adj.points;
            } else if (adj.category === 'rewards') {
                breakdown.rewards += adj.points;
                manualRewardsAdjustments.push(adj);
            }
        });

        const totalTirth = Object.values(breakdown)
            .map(categoryValue => {
                if (typeof categoryValue === 'number') {
                    return categoryValue;
                }
                // Check if it's an object with a numeric 'points' property
                if (typeof categoryValue === 'object' && categoryValue && 
                    'points' in categoryValue && typeof (categoryValue as any).points === 'number') {
                    return (categoryValue as { points: number }).points;
                }
                return 0;
            })
            .reduce((sum, points) => sum + points, 0);

        return { tirthBreakdown: breakdown, totalTirth: Math.round(totalTirth), rewardsAdjustments: manualRewardsAdjustments };
    }, [user, projects, events, quests, isTaskCompleted]);
    
    return (
        <div className="space-y-6">
            <div className="neu-outset-card p-4 text-center">
                <p className="text-sm font-semibold text-on-surface-variant">Total Tirth Points</p>
                <p className="text-4xl font-bold text-accent">{totalTirth.toLocaleString()}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-on-surface-variant">Engagement</h3>
                    <PointEntry icon={<Vote />} label="Project Votes" points={tirthBreakdown.projectVotes} subtext={`${tirthBreakdown.projectVotes} vote(s)`} />
                    <PointEntry icon={<Vote />} label="Campaign Votes" points={tirthBreakdown.campaignVotes} subtext={`${tirthBreakdown.campaignVotes} vote(s)`} />
                    <PointEntry icon={<FilePen />} label="Campaign Submissions" points={tirthBreakdown.campaignSubmissions} subtext={`${tirthBreakdown.campaignSubmissions} submission(s)`} />
                    <PointEntry icon={<FilePen />} label="Quest Answers" points={tirthBreakdown.questAnswers} subtext={`${tirthBreakdown.questAnswers} answer(s)`} />
                    <PointEntry icon={<Trophy />} label="Campaign Wins" points={tirthBreakdown.campaignWins} subtext={`${tirthBreakdown.campaignWins > 0 ? 'From wins & adjustments' : ''}`} />
                </div>
                 <div className="space-y-4">
                    <h3 className="font-bold text-lg text-on-surface-variant">Contributions</h3>
                    <PointEntry icon={<ClipboardCheck />} label="Task Completion" points={tirthBreakdown.tasks.points} subtext={`from ${tirthBreakdown.tasks.count} task(s)`} />
                    {rewardsAdjustments.map((adj, index) => (
                        <PointEntry key={index} icon={<Award />} label="Reward" points={adj.points} subtext={adj.reason} />
                    ))}
                 </div>
            </div>

             <div>
                <h3 className="font-bold text-lg text-on-surface-variant mb-2">Holding & Roles</h3>
                 <div className="space-y-2">
                    <PointEntry icon={<Shield />} label="Discord Roles" points={tirthBreakdown.roles.points} subtext={`from ${tirthBreakdown.roles.count} role(s)`} />
                    <PointEntry icon={<Gem />} label="NFT Holding" points={Math.round(tirthBreakdown.nfts.points)} subtext={`from ${tirthBreakdown.nfts.count} collection(s)`} />
                    <PointEntry icon={<Banknote />} label="Token Holding" points={Math.round(tirthBreakdown.tokens.points)} subtext={`from ${tirthBreakdown.tokens.count} token type(s)`} />
                </div>
            </div>
        </div>
    );
};

// Main page component
const PointsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const userId = searchParams.get('user');
    const [activeTab, setActiveTab] = useState<'credo' | 'tirth'>('tirth');

    const { user, projects, events, quests } = useMemo(() => {
        const allUsers = getUsers();
        const user = allUsers.find(u => u.id === userId);
        return {
            user,
            projects: getProjects(),
            events: getEvents(),
            quests: getQuests()
        };
    }, [userId]);

    if (!user) {
        return <Loader message="User not found..." />;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={() => navigate(`/profile?user=${user.id}`)} className="neu-button px-4 py-2 flex items-center gap-2">
                <ArrowLeft size={16} /> Back to Profile
            </button>
            <div className="neu-card p-6 flex flex-col sm:flex-row items-center gap-6">
                <img src={user.profilePic || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} className="w-24 h-24 rounded-full border-4 border-surface bg-background object-contain p-1" />
                <div className="text-center sm:text-left">
                    <h1 className="text-4xl font-display font-bold text-on-surface">{user.name}</h1>
                    <h2 className="text-2xl font-display font-semibold text-on-surface-variant">Points Breakdown</h2>
                </div>
            </div>

            <div className="neu-card p-2 sm:p-4">
                 <div className="flex border-b border-border/10 mb-4">
                    <button onClick={() => setActiveTab('tirth')} className={`neu-tab-button ${activeTab === 'tirth' ? 'active' : ''}`}><Star className="inline mr-2" size={16} /> Tirth Points</button>
                    <button onClick={() => setActiveTab('credo')} className={`neu-tab-button ${activeTab === 'credo' ? 'active' : ''}`}><Award className="inline mr-2" size={16} /> Credo Points</button>
                </div>
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="p-2 sm:p-4"
                    >
                        {activeTab === 'credo' ? <CredoPointsTab user={user} projects={projects} /> : <TirthPointsTab user={user} projects={projects} events={events} quests={quests} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PointsPage;