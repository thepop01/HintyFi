import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Project, ProjectCategory, DropStatus } from '../src/types';
import { getProjectsFromDB, voteProject, getProjectById, getCategoriesFromDB } from '../src/services/dataService';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, Gem, Gamepad2, Repeat, Building, Layers, Wallet, Search, ChevronRight, ArrowUp, ArrowDown, Cpu, BrainCircuit, Flame, Rocket, Star, Crown, History, Loader, Inbox, Sparkles, TrendingUp, MessageCircle, Wrench, Shield, Code, Eye, Package, Dice6, Vote, BarChart3, Gamepad, UserCheck } from 'lucide-react';
import EcosystemHero from '../components/ecosystem/EcosystemHero';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SentimentVoteControl from '../components/ecosystem/SentimentVoteControl';
import { ProjectProfileInline } from '../components/ecosystem/ProjectDetailInline';
import { useDebounce } from '../hooks/useDebounce';
import { fuzzySearch, canVote } from '../utils/helpers';
import PaginationControls from '../components/common/PaginationControls';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useClickOutside } from '../hooks/useClickOutside';
import { usePrefetch } from '../hooks/usePrefetch';

const categoryConfig: Record<string, { icon: React.ReactElement<{ size?: number | string; className?: string }>; label: string, color: string }> = {
    defi: { icon: <Dna size={12} />, label: 'DeFi', color: 'text-purple-500' },
    dex: { icon: <Repeat size={12} />, label: 'DEX', color: 'text-emerald-500' },
    nft: { icon: <Gem size={12} />, label: 'NFT', color: 'text-sky-500' },
    gaming: { icon: <Gamepad2 size={12} />, label: 'Gaming', color: 'text-red-500' },

    rwa: { icon: <Building size={12} />, label: 'RWA', color: 'text-orange-500' },
    infrastructure: { icon: <Layers size={12} />, label: 'Infrastructure', color: 'text-slate-500' },
    wallet: { icon: <Wallet size={12} />, label: 'Wallets', color: 'text-green-500' },
    depin: { icon: <Cpu size={12} />, label: 'DePIN', color: 'text-fuchsia-500' },
    ai: { icon: <BrainCircuit size={12} />, label: 'AI', color: 'text-cyan-500' },
    meme: { icon: <Flame size={12} />, label: 'Meme', color: 'text-yellow-500' },
    launchpad: { icon: <Rocket size={12} />, label: 'Launchpad', color: 'text-rose-500' },
    'prediction market': { icon: <TrendingUp size={12} />, label: 'Prediction Market', color: 'text-indigo-500' },
    social: { icon: <MessageCircle size={12} />, label: 'Social', color: 'text-pink-500' },
    'other infra': { icon: <Wrench size={12} />, label: 'Other Infra', color: 'text-gray-500' },
    identity: { icon: <UserCheck size={12} />, label: 'Identity', color: 'text-blue-500' },
    'dev tooling': { icon: <Code size={12} />, label: 'Dev Tooling', color: 'text-green-600' },
    privacy: { icon: <Shield size={12} />, label: 'Privacy', color: 'text-slate-600' },
    'other apps': { icon: <Package size={12} />, label: 'Other Apps', color: 'text-amber-500' },
    betting: { icon: <Dice6 size={12} />, label: 'Betting', color: 'text-red-600' },
    governance: { icon: <Vote size={12} />, label: 'Governance', color: 'text-violet-500' },
    analytics: { icon: <BarChart3 size={12} />, label: 'Analytics', color: 'text-emerald-600' },
    'gaming infra': { icon: <Gamepad size={12} />, label: 'Gaming Infra', color: 'text-red-400' },
    'account abstraction': { icon: <Eye size={12} />, label: 'Account Abstraction', color: 'text-cyan-600' },
};


type SortableKeys = 'name' | 'stage' | 'raise' | 'dropStatus' | 'sentiment';

const renderDropStatus = (status?: DropStatus) => {
    if (!status) return <span className="text-on-surface-variant">N/A</span>;
    const styles: Record<DropStatus, { text: string; bg: string, pulse?: boolean }> = {
        ongoing: { text: 'text-green-900', bg: 'bg-green-300', pulse: true },
        upcoming: { text: 'text-blue-900', bg: 'bg-blue-300' },
        completed: { text: 'text-gray-900', bg: 'bg-gray-300' },
    };
    const style = styles[status];
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <div className="flex items-center gap-2">
            {style.pulse && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>}
            <span className={`px-2 py-0.5 rounded-full text-sm font-bold font-heading ${style.bg} ${style.text}`}>
                {statusText}
            </span>
        </div>
    );
};

const ProjectTable: React.FC<{
    projects: Project[];
    totalProjects: number;
    onRowClick: (id: string) => void;
    expandedProjectId: string | null;
    requestSort: (key: SortableKeys) => void;
    sortConfig: { key: SortableKeys; direction: 'ascending' | 'descending' } | null;
    currentPage: number;
    pageSize: number;
    onVote: (projectId: string, vote: 'up' | 'down') => void;
    isLoading: boolean;
}> = ({ projects, totalProjects, onRowClick, expandedProjectId, requestSort, sortConfig, currentPage, pageSize, onVote, isLoading }) => {
    const { prefetch } = usePrefetch(getProjectById);

    const SortableHeader: React.FC<{ sortKey: SortableKeys; children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ sortKey, children, className, style }) => {
        const isSorted = sortConfig?.key === sortKey;
        return (
            <th
                className={`px-1 py-2 text-left text-sm font-display font-bold text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors ${className}`}
                onClick={() => requestSort(sortKey)}
                style={style}
            >
                <div className="flex items-center gap-1">
                    {children}
                    {isSorted && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                </div>
            </th>
        );
    };

    return (
        <div className="bg-[#faf0ff] rounded-xl shadow-lg overflow-x-auto text-on-surface border border-border/5 mobile-table-container">
            <table className="w-full min-w-[600px]">
                <thead className="bg-surface/50">
                    <tr>
                        <th className="px-1 py-2 text-left text-sm font-display font-bold text-on-surface-variant text-center" style={{width: "40px"}}>#</th>
                        <SortableHeader sortKey="name" className="" style={{width: "35%"}}>Name</SortableHeader>
                        <SortableHeader sortKey="stage" className="" style={{width: "12%"}}>Stage</SortableHeader>
                        <SortableHeader sortKey="raise" className="" style={{width: "12%"}}>Raise</SortableHeader>
                        <SortableHeader sortKey="dropStatus" className="" style={{width: "18%"}}>WL/Drop Info</SortableHeader>
                        <SortableHeader sortKey="sentiment" className="" style={{width: "18%"}}>Sentiment</SortableHeader>
                        <th className="py-2 text-center" style={{width: "40px"}}></th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={7} className="text-center py-8">
                                <div className="flex justify-center items-center gap-2 text-on-surface-variant">
                                    <Loader size={16} className="animate-spin" />
                                    <span>Filtering {totalProjects} projects...</span>
                                </div>
                            </td>
                        </tr>
                    ) : projects.length > 0 ? (
                        projects.map((project, index) => {
                            const isExpanded = project.id === expandedProjectId;

                            return (
                                <React.Fragment key={project.id}>
                                    <motion.tr
                                        layout="position"
                                        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                                        className="relative border-b border-border/10 transition-colors hover:bg-border/10 cursor-pointer"
                                        onClick={() => onRowClick(project.id)}
                                        onMouseEnter={() => prefetch(project.id)}
                                        whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                                    >
                                        <td className="px-1 py-2 whitespace-nowrap text-xs text-on-surface-variant text-center">{currentPage * pageSize + index + 1}</td>
                                        <td className="px-1 py-2">
                                            <div className="flex items-center overflow-hidden">
                                                <img className="h-6 w-6 sm:h-8 sm:w-8 project-logo-mobile rounded-full bg-surface-container object-cover flex-shrink-0" src={project.logo} alt={`${project.name} logo`} loading="lazy" />
                                                <div className="ml-1.5 sm:ml-2 min-w-0 flex-1">
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        <ReactRouterDOM.Link
                                                            to={`/${project.name.toLowerCase()}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-xs sm:text-sm font-heading font-medium text-on-surface hover:text-primary transition-all duration-200 inline-block transform hover:scale-105 truncate"
                                                        >
                                                            {project.name}
                                                        </ReactRouterDOM.Link>
                                                        {project.is_crowned && <span title="Crowned Project"><Crown size={10} className="text-yellow-500 fill-yellow-500 sm:w-3 sm:h-3 flex-shrink-0" /></span>}
                                                        {project.is_new && <span className="px-1 py-0.5 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400 hidden sm:inline flex-shrink-0">New</span>}
                                                        {project.is_hot && <span className="px-1 py-0.5 text-xs font-bold rounded-full bg-red-500/20 text-red-400 hidden sm:inline flex-shrink-0">Hot</span>}
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1 overflow-hidden">
                                                        {project.category.slice(0, 2).map(cat => {
                                                            const categoryInfo = categoryConfig[cat];
                                                            if (!categoryInfo) {
                                                                console.warn(`Category "${cat}" not found in categoryConfig for project "${project.name}"`);
                                                                return null;
                                                            }
                                                            return (
                                                                <div key={cat} className={`flex items-center gap-0.5 text-xs px-1 py-0.5 rounded-full font-semibold category-badge-mobile ${categoryInfo.color.replace('text-', 'bg-')} text-on-primary flex-shrink-0`}>
                                                                    {React.cloneElement(categoryInfo.icon, { size: 8 })}
                                                                    <span className="font-heading font-bold hidden sm:inline text-xs">{categoryInfo.label}</span>
                                                                </div>
                                                            );
                                                        })}
                                                        {project.category.length > 2 && (
                                                            <span className="text-xs text-on-surface-variant flex-shrink-0">+{project.category.length - 2}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-1 py-2 whitespace-nowrap text-sm text-on-surface font-semibold">{project.stage || 'N/A'}</td>
                                        <td className="px-1 py-2 whitespace-nowrap text-sm text-on-surface font-semibold">{project.raise_amount || 'N/A'}</td>
                                        <td className="px-1 py-2 whitespace-nowrap">{renderDropStatus(project.drop_status as DropStatus)}</td>
                                        <td className="px-1 py-2 whitespace-nowrap">
                                            <SentimentVoteControl project={project} onVote={onVote} />
                                        </td>
                                        <td className="py-2 whitespace-nowrap text-center">
                                            <motion.div
                                                className="inline-block"
                                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <ChevronRight size={18} />
                                            </motion.div>
                                        </td>
                                    </motion.tr>
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <td colSpan={7} className="p-0 bg-surface/20">
                                                    <ProjectProfileInline project={project} showPerks={false} />
                                                </td>
                                            </motion.tr>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            )
                        })
                    ) : (
                        <tr>
                            <td colSpan={7} className="p-0">
                                <EmptyState
                                    icon={<Inbox size={48} />}
                                    title="No Projects Found"
                                    description="Your search and filter combination did not return any results. Try adjusting your criteria."
                                />
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const EcosystemPage: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
    const [allCategories, setAllCategories] = useState<ProjectCategory[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | 'all' | 'new' | 'hot' | 'crowned'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
    const [pageSize, setPageSize] = useState(25);
    const [currentPage, setCurrentPage] = useState(0);
    const [stageFilter, setStageFilter] = useState<'all' | 'Private' | 'Early' | 'Pre-Launch' | 'Launched'>('all');

    const [typedWord1, setTypedWord1] = useState('');
    const [typedWord2, setTypedWord2] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);

    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const { history, addSearchTerm, clearHistory } = useSearchHistory('ecosystem-search-history');
    const searchWrapperRef = useRef<HTMLDivElement>(null);
    useClickOutside(searchWrapperRef, () => setIsSearchFocused(false));

    const { currentUser } = useAuth();
    const { addToast } = useToast();

    const handleVote = (projectId: string, vote: 'up' | 'down') => {
        if (!currentUser) {
            addToast('Please connect your wallet to vote.', 'info');
            return;
        }

        const voteCheck = canVote(currentUser);
        if (!voteCheck.canVote) {
            addToast(voteCheck.reason, 'error');
            return;
        }

        // Optimistic UI Update
        setProjects(prevProjects =>
            prevProjects.map(p => {
                if (p.id !== projectId) return p;

                const newProject = { ...p, votes: { ...p.votes, voters: [...p.votes.voters] } };
                const voterIndex = newProject.votes.voters.findIndex(v => v.userId === currentUser.id);

                if (voterIndex > -1) {
                    const existingVote = newProject.votes.voters[voterIndex];
                    if (existingVote.vote === vote) { // Un-vote
                        newProject.votes.voters.splice(voterIndex, 1);
                        if (vote === 'up') newProject.votes.up--;
                        else newProject.votes.down--;
                    } else { // Change vote
                        if (existingVote.vote === 'up') newProject.votes.up--; else newProject.votes.down--;
                        if (vote === 'up') newProject.votes.up++; else newProject.votes.down++;
                        existingVote.vote = vote;
                    }
                } else { // New vote
                    newProject.votes.voters.push({ userId: currentUser.id, vote });
                    if (vote === 'up') newProject.votes.up++; else newProject.votes.down++;
                }
                return newProject;
            })
        );

        // Persist change
        voteProject(projectId, currentUser, vote);

        const votedProject = projects.find(p => p.id === projectId);
        addToast('Your vote has been submitted!', 'success', votedProject?.logo);
    };

    const wordPairs = useMemo(() => [
        { word1: "Opportunity", word2: "giants" },
        { word1: "Builders", word2: "legends" },
        { word1: "Vision", word2: "reality" },
        { word1: "Creators", word2: "icons" },
        { word1: "Steps", word2: "milestones" },
        { word1: "Innovation", word2: "impact" }
    ], []);

    const TYPING_SPEED = 60;
    const DELETING_SPEED = 60;
    const PAUSE_DURATION = 1000;

    useEffect(() => {
        const handleTyping = () => {
            const { word1, word2 } = wordPairs[loopNum % wordPairs.length];

            if (isDeleting) {
                // Deleting
                const updatedWord1 = word1.substring(0, typedWord1.length - 1);
                const updatedWord2 = word2.substring(0, typedWord2.length - 1);
                setTypedWord1(updatedWord1);
                setTypedWord2(updatedWord2);

                if (updatedWord1 === '' && updatedWord2 === '') {
                    setIsDeleting(false);
                    setLoopNum(loopNum + 1);
                }
            } else {
                // Typing
                const updatedWord1 = word1.substring(0, typedWord1.length + 1);
                const updatedWord2 = word2.substring(0, typedWord2.length + 1);
                setTypedWord1(updatedWord1);
                setTypedWord2(updatedWord2);

                if (updatedWord1 === word1 && updatedWord2 === word2) {
                    // Pause at end of typing
                    setTimeout(() => {
                        setIsDeleting(true);
                    }, PAUSE_DURATION);
                }
            }
        };

        const timeout = setTimeout(handleTyping, isDeleting ? DELETING_SPEED : TYPING_SPEED);

        return () => clearTimeout(timeout);
    }, [typedWord1, typedWord2, isDeleting, loopNum, wordPairs]);


    useEffect(() => {
        // Load projects from Supabase
        const loadProjects = async () => {
            try {
                setIsLoading(true);
                const [projectsData, categoriesData] = await Promise.all([
                   getProjectsFromDB({ includePending: false }),
                   getCategoriesFromDB()
                ]);
                setProjects(projectsData);
                setAllCategories(categoriesData as ProjectCategory[]);
            } catch (error) {
                console.error('Error loading projects:', error);
                setProjects([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadProjects();
    }, []);

    useEffect(() => {
        // Don't show loader on initial mount because the first useEffect handles it
        if (projects.length >= 0) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 300); // Should be same as debounce delay for consistency
            return () => clearTimeout(timer);
        }
    }, [debouncedSearchTerm, activeCategory, sortConfig?.key, sortConfig?.direction, stageFilter, projects.length]);

    useEffect(() => {
        setCurrentPage(0);
    }, [activeCategory, debouncedSearchTerm, pageSize, stageFilter]);

    const searchSuggestions = useMemo(() => {
        if (!debouncedSearchTerm) return [];
        return projects
            .filter(p => fuzzySearch(debouncedSearchTerm, p.name))
            .slice(0, 5);
    }, [debouncedSearchTerm, projects]);

    const handleSearchSelect = (term: string) => {
        setSearchTerm(term);
        addSearchTerm(term);
        setIsSearchFocused(false);
    };

    const handleSearchSubmit = () => {
        addSearchTerm(searchTerm);
        setIsSearchFocused(false);
    };

    const filteredAndSortedProjects = useMemo(() => {
        let filtered = projects;

        if (activeCategory === 'new') {
            filtered = projects.filter(p => p.is_new);
        } else if (activeCategory === 'hot') {
            filtered = projects.filter(p => p.is_hot);
        } else if (activeCategory === 'crowned') {
            filtered = projects.filter(p => p.is_crowned);
        } else if (activeCategory !== 'all') {
            filtered = projects.filter(p => p.category.includes(activeCategory));
        }

        if (stageFilter !== 'all') {
            filtered = filtered.filter(p => p.stage === stageFilter);
        }

        if (debouncedSearchTerm) {
            filtered = filtered.filter(p => fuzzySearch(debouncedSearchTerm, p.name));
        }

        if (sortConfig) {
            return [...filtered].sort((a, b) => {
                let aValue: string | number;
                let bValue: string | number;

                if (sortConfig.key === 'sentiment') {
                    aValue = a.votes.up - a.votes.down;
                    bValue = b.votes.up - b.votes.down;
                } else if (sortConfig.key === 'dropStatus') {
                    const statusOrder: Record<DropStatus, number> = { ongoing: 1, upcoming: 2, completed: 3 };
                    aValue = a.drop_status ? statusOrder[a.drop_status] : 4;
                    bValue = b.drop_status ? statusOrder[b.drop_status] : 4;
                } else if (sortConfig.key === 'raise') {
                    const parseRaise = (raise: string | undefined) => {
                        if (!raise || raise === 'N/A') return -1;
                        return parseFloat(raise.replace('$', '').replace('M', '')) * 1000000;
                    };
                    aValue = parseRaise(a.raise_amount);
                    bValue = parseRaise(b.raise_amount);
                } else if (sortConfig.key === 'stage') {
                    const stageOrder: Record<'Private' | 'Early' | 'Pre-Launch' | 'Launched', number> = { 'Private': 1, 'Early': 2, 'Pre-Launch': 3, 'Launched': 4 };
                    aValue = a.stage ? stageOrder[a.stage] : 5;
                    bValue = b.stage ? stageOrder[b.stage] : 5;
                } else if (sortConfig.key === 'name') {
                    aValue = a.name;
                    bValue = b.name;
                }
                else {
                    aValue = a[sortConfig.key] as string | number;
                    bValue = b[sortConfig.key] as string | number;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [projects, activeCategory, debouncedSearchTerm, sortConfig, stageFilter]);

    const { paginatedProjects, totalPages } = useMemo(() => {
        const total = filteredAndSortedProjects.length;
        const pages = Math.ceil(total / pageSize);
        const paginated = filteredAndSortedProjects.slice(
            currentPage * pageSize,
            (currentPage + 1) * pageSize
        );
        return { paginatedProjects: paginated, totalPages: pages };
    }, [filteredAndSortedProjects, currentPage, pageSize]);

    // Only show categories that have projects
    const availableCategories = useMemo(() => {
        const categoriesWithProjects = new Set<string>();
        projects.forEach(project => {
            project.category.forEach(cat => {
                if (categoryConfig[cat]) {
                    categoriesWithProjects.add(cat);
                }
            });
        });
        const filteredCategories = allCategories.filter(cat => categoriesWithProjects.has(cat as ProjectCategory));
        
        // Sort categories alphabetically by label
        return filteredCategories.sort((a, b) => {
            const labelA = categoryConfig[a]?.label || a;
            const labelB = categoryConfig[b]?.label || b;
            return labelA.localeCompare(labelB);
        });
    }, [projects, allCategories]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-5xl lg:text-7xl ecosystem-main-title font-display font-extrabold text-[rgb(var(--color-background))] tracking-widest uppercase [text-shadow:2px_2px_3px_rgba(0,0,0,0.5),_-2px_-2px_3px_rgba(255,255,255,0.08)]">
                    The Vault
                </h1>
                <h2
                    className="text-[36px] ecosystem-subtitle text-on-background-variant flex flex-wrap items-center justify-start mt-2 min-h-12"
                    style={{ fontFamily: "'Bangers', cursive" }}
                    aria-live="polite"
                >
                    <Star size={28} className="text-purple-500 fill-purple-500 mr-3" />
                    <span className="text-on-background">{typedWord1}</span>
                    <span className="text-on-background-variant ml-2">today,</span>

                    <span className="text-on-background ml-2">{typedWord2}</span>
                    <span className="text-on-background-variant ml-2">tomorrow.</span>
                </h2>
            </div>

            <EcosystemHero projects={projects} activeCategory={activeCategory} />

            <div className="max-w-[84rem] mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 mt-12 md:mt-16 lg:mt-20">
                    <div className="mb-4 sm:mb-0">
                        <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-on-background">All Projects</h2>
                        <p className="text-base sm:text-lg font-subheading text-on-background-variant mt-1">Filter and sort to find projects that interest you.</p>
                    </div>
                    <div className="flex items-center gap-2 stage-filter-mobile">
                        <span className="text-sm font-semibold text-on-surface-variant">Stage:</span>
                        <select
                            value={stageFilter}
                            onChange={(e) => setStageFilter(e.target.value as any)}
                            className="neu-control neu-select px-3 py-1.5 text-sm font-sans font-semibold focus:ring-primary focus:border-primary"
                        >
                            <option value="all">All Stages</option>
                            <option value="Private">Private</option>
                            <option value="Early">Early</option>
                            <option value="Pre-Launch">Pre-Launch</option>
                            <option value="Launched">Launched</option>
                        </select>
                    </div>
                </div>

                {/* Filters */}
                <div className="py-3 mb-6 md:flow-root">
                    <div ref={searchWrapperRef} className="w-full mb-4 md:mb-0 md:w-[35%] md:float-left md:pr-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                            <input
                                type="text"
                                placeholder="Search collections or projects"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { handleSearchSubmit(); } }}
                                className="neu-inset-control search-input-mobile w-full pl-12 pr-4 py-3 text-lg text-on-surface placeholder:text-on-surface-variant/70"
                            />
                            <AnimatePresence>
                                {isSearchFocused && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full mt-2 w-full bg-surface/95 backdrop-blur-md rounded-lg shadow-lg z-50 border border-border/10 overflow-hidden max-h-64 overflow-y-auto"
                                    >
                                        {searchTerm.length === 0 && history.length > 0 && (
                                            <div>
                                                <div className="flex justify-between items-center px-3 py-2 bg-surface/50">
                                                    <h4 className="text-xs font-bold text-on-surface-variant">RECENT</h4>
                                                    <button onClick={clearHistory} className="text-xs text-on-surface-variant/70 hover:text-primary transition-colors">Clear</button>
                                                </div>
                                                {history.map((term) => (
                                                    <button key={term} onClick={() => handleSearchSelect(term)} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-primary/10 text-on-surface">
                                                        <History size={16} className="text-on-surface-variant" />
                                                        <span>{term}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {searchTerm.length > 0 && searchSuggestions.length > 0 && (
                                            <div>
                                                <h4 className="px-3 py-2 bg-surface/50 text-xs font-bold text-on-surface-variant">SUGGESTIONS</h4>
                                                {searchSuggestions.map((project) => (
                                                    <button key={project.id} onClick={() => handleSearchSelect(project.name)} className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-primary/10">
                                                        <img src={project.logo} alt={project.name} className="w-6 h-6 rounded-full" />
                                                        <span className="text-on-surface">{project.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {searchTerm.length > 0 && searchSuggestions.length === 0 && debouncedSearchTerm && (
                                            <div className="px-3 py-4 text-center text-sm text-on-surface-variant">
                                                No projects found for "{searchTerm}"
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-start gap-2 filter-buttons-container">
                        <div className="skeu-button-wrapper">
                            <input
                                type="radio"
                                id="cat-all"
                                name="category-filter"
                                className="skeu-button-input"
                                checked={activeCategory === 'all'}
                                onChange={() => setActiveCategory('all')}
                            />
                            <label htmlFor="cat-all" className="skeu-button">
                                All Projects
                            </label>
                        </div>
                        <div className="skeu-button-wrapper">
                            <input
                                type="radio"
                                id="cat-new"
                                name="category-filter"
                                className="skeu-button-input"
                                checked={activeCategory === 'new'}
                                onChange={() => setActiveCategory('new')}
                            />
                            <label htmlFor="cat-new" className="skeu-button">
                                <Sparkles size={14} className="text-blue-300" />
                                <span>New</span>
                            </label>
                        </div>
                        <div className="skeu-button-wrapper">
                            <input
                                type="radio"
                                id="cat-hot"
                                name="category-filter"
                                className="skeu-button-input"
                                checked={activeCategory === 'hot'}
                                onChange={() => setActiveCategory('hot')}
                            />
                            <label htmlFor="cat-hot" className="skeu-button">
                                <Flame size={14} className="text-red-400" />
                                <span>Hot</span>
                            </label>
                        </div>
                        <div className="skeu-button-wrapper">
                            <input
                                type="radio"
                                id="cat-crowned"
                                name="category-filter"
                                className="skeu-button-input"
                                checked={activeCategory === 'crowned'}
                                onChange={() => setActiveCategory('crowned')}
                            />
                            <label htmlFor="cat-crowned" className="skeu-button">
                                <Crown size={14} className="text-yellow-400" />
                                <span>Crowned</span>
                            </label>
                        </div>
                        {availableCategories.map(cat => {
                            const category = categoryConfig[cat];
                            return (
                                <div key={cat} className="skeu-button-wrapper">
                                    <input
                                        type="radio"
                                        id={`cat-${cat}`}
                                        name="category-filter"
                                        className="skeu-button-input"
                                        checked={activeCategory === cat}
                                        onChange={() => setActiveCategory(cat)}
                                    />
                                    <label htmlFor={`cat-${cat}`} className="skeu-button">
                                        {category.icon}
                                        <span>{category.label}</span>
                                    </label>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Project Table */}
                <ProjectTable
                    projects={paginatedProjects}
                    totalProjects={projects.length}
                    isLoading={isLoading}
                    onRowClick={(id) => setExpandedProjectId(expandedProjectId === id ? null : id)}
                    expandedProjectId={expandedProjectId}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onVote={handleVote}
                />

                {paginatedProjects.length > 0 && (
                    <div className="mt-6 pagination-mobile">
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            pageSize={pageSize}
                            onPageSizeChange={setPageSize}
                            totalItems={filteredAndSortedProjects.length}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EcosystemPage;
