import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Project, ProjectCategory, DropStatus } from '../src/types';
import { getProjects, voteProject, getProjectById, getSiteContentSettings } from '../src/services/dataService';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, Gem, Gamepad2, Users, Repeat, Building, Layers, Wallet, Search, ChevronRight, ArrowUp, ArrowDown, Cpu, BrainCircuit, Flame, Rocket, Crown, History, Loader, Inbox } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ProjectProfileInline } from '../components/ecosystem/ProjectDetailInline';
import { useDebounce } from '../hooks/useDebounce';
import { fuzzySearch } from '../utils/helpers';
import PaginationControls from '../components/common/PaginationControls';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useClickOutside } from '../hooks/useClickOutside';
import { usePrefetch } from '../hooks/usePrefetch';

const categoryConfig: Record<ProjectCategory, { icon: React.ReactElement<{ size?: number | string; className?: string }>; label: string, color: string }> = {
  defi: { icon: <Dna size={12} />, label: 'DeFi', color: 'text-purple-500' },
  dex: { icon: <Repeat size={12} />, label: 'DEX', color: 'text-emerald-500' },
  nft: { icon: <Gem size={12} />, label: 'NFT', color: 'text-sky-500' },
  gaming: { icon: <Gamepad2 size={12} />, label: 'Gaming', color: 'text-red-500' },
  socialfi: { icon: <Users size={12} />, label: 'SocialFi', color: 'text-teal-500' },
  rwa: { icon: <Building size={12} />, label: 'RWA', color: 'text-orange-500' },
  infrastructure: { icon: <Layers size={12} />, label: 'Infrastructure', color: 'text-slate-500' },
  wallet: { icon: <Wallet size={12} />, label: 'Wallets', color: 'text-green-500' },
  depin: { icon: <Cpu size={12} />, label: 'DePIN', color: 'text-fuchsia-500' },
  ai: { icon: <BrainCircuit size={12} />, label: 'AI', color: 'text-cyan-500' },
  meme: { icon: <Flame size={12} />, label: 'Meme', color: 'text-yellow-500' },
  launchpad: { icon: <Rocket size={12} />, label: 'Launchpad', color: 'text-rose-500' },
};

type SortableKeys = 'name' | 'stage' | 'supply' | 'marketPrice' | 'sentiment';

const isCrowned = (project: Project): boolean => {
    const hasRolePoints = project.discordRoles?.some(role => role.points && role.points > 0);
    const hasNftPoints = project.nftCollections?.some(collection => collection.pointsPerDay && collection.pointsPerDay > 0);
    const hasTokenPoints = project.tokenHoldingTiers && project.tokenHoldingTiers.length > 0;
    return !!(hasRolePoints || hasNftPoints || hasTokenPoints);
};

const ProjectTable: React.FC<{
    projects: Project[];
    onRowClick: (id: string) => void;
    expandedProjectId: string | null;
    requestSort: (key: SortableKeys) => void;
    sortConfig: { key: SortableKeys; direction: 'ascending' | 'descending' } | null;
    currentPage: number;
    pageSize: number;
    isLoading: boolean;
}> = ({ projects, onRowClick, expandedProjectId, requestSort, sortConfig, currentPage, pageSize, isLoading }) => {
    const { prefetch } = usePrefetch(getProjectById);

    const SortableHeader: React.FC<{ sortKey: SortableKeys; children: React.ReactNode; className?: string }> = ({ sortKey, children, className }) => {
        const isSorted = sortConfig?.key === sortKey;
        return (
            <th
                className={`px-6 py-3 text-left text-lg font-display font-bold text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors ${className}`}
                onClick={() => requestSort(sortKey)}
            >
                <div className="flex items-center gap-1">
                    {children}
                    {isSorted && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                </div>
            </th>
        );
    };
    
    return (
        <div className="bg-[#faf0ff] rounded-xl shadow-lg overflow-x-auto text-on-surface border border-border/5">
            <table className="w-full min-w-[1000px]">
                <thead className="bg-surface/50">
                    <tr>
                        <th className="px-4 py-3 text-left text-lg font-display font-bold text-on-surface-variant w-12 text-center">#</th>
                        <SortableHeader sortKey="name">Name</SortableHeader>
                        <SortableHeader sortKey="stage">Stage</SortableHeader>
                        <SortableHeader sortKey="supply">Supply</SortableHeader>
                        <SortableHeader sortKey="marketPrice">Market Price</SortableHeader>
                        <SortableHeader sortKey="sentiment">Sentiment Score</SortableHeader>
                        <th className="px-6 py-3 w-12"></th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={7} className="text-center py-12">
                                <div className="flex justify-center items-center gap-2 text-on-surface-variant">
                                    <Loader size={16} className="animate-spin" />
                                    <span>Loading projects...</span>
                                </div>
                            </td>
                        </tr>
                    ) : projects.length > 0 ? (
                        projects.map((project, index) => {
                            const isExpanded = project.id === expandedProjectId;
                            const sentimentScore = project.votes.up - project.votes.down;
                            const sentimentColor = sentimentScore > 0 ? 'text-green-500' : sentimentScore < 0 ? 'text-red-500' : 'text-on-surface';
                            const publishedMeme = project.coins?.find(c => c.type === 'meme' && c.status === 'published');
                            return (
                            <React.Fragment key={project.id}>
                                <motion.tr
                                    layout="position"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    className="hover:bg-border/10 transition-colors cursor-pointer border-b border-border/10"
                                    onClick={() => onRowClick(project.id)}
                                    onMouseEnter={() => prefetch(project.id)}
                                >
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-on-surface-variant text-center">{currentPage * pageSize + index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 rounded-full bg-surface-container object-cover" src={project.logo} alt={`${project.name} logo`} loading="lazy" />
                                            <div className="ml-4">
                                                <div className="flex items-center gap-2">
                                                    <ReactRouterDOM.Link
                                                        to={`/project/${project.id}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-lg font-heading font-medium text-on-surface hover:text-primary transition-all duration-200 inline-block transform hover:scale-105"
                                                    >
                                                        {project.name}
                                                    </ReactRouterDOM.Link>
                                                    {isCrowned(project) && <span title="Crowned Project"><Crown size={16} className="text-yellow-500 fill-yellow-500" /></span>}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    {project.category.map(cat => (
                                                        <div key={cat} className={`flex items-center gap-1 text-sm px-2 py-0.5 rounded-full font-semibold ${categoryConfig[cat].color.replace('text-', 'bg-')} text-on-primary`}>
                                                            {React.cloneElement(categoryConfig[cat].icon, { size: 14 })}
                                                            <span className="font-heading font-bold">{categoryConfig[cat].label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-on-surface font-semibold">{project.stage || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-on-surface font-semibold">{publishedMeme?.supply || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-on-surface font-semibold">{publishedMeme?.marketPrice || 'N/A'}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-base font-semibold ${sentimentColor}`}>
                                        {sentimentScore > 0 ? `+${sentimentScore}` : sentimentScore}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
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
                        )})
                    ) : (
                         <tr>
                            <td colSpan={7} className="p-0">
                                <EmptyState
                                    icon={<Inbox size={48} />}
                                    title="No Projects Found"
                                    description="Your search did not return any results. Try adjusting your criteria."
                                />
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

const MemePage: React.FC = () => {
    const [displayProjects, setDisplayProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
    const [pageSize, setPageSize] = useState(25);
    const [currentPage, setCurrentPage] = useState(0);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const { history, addSearchTerm, clearHistory } = useSearchHistory('meme-search-history');
    const searchWrapperRef = useRef<HTMLDivElement>(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    useClickOutside(searchWrapperRef, () => setIsSearchFocused(false));

    const { currentUser } = useAuth();
    const { addToast } = useToast();

    const { allProjects, settings } = useMemo(() => {
        const allProjectsData = getProjects();
        const siteSettings = getSiteContentSettings();
        return {
            allProjects: allProjectsData,
            settings: siteSettings.meme
        };
    }, []);

    const projects = useMemo(() => allProjects.filter(p => p.category.includes('meme') && p.coins?.some(c => c.type === 'meme' && c.status === 'published')), [allProjects]);

    const featuredProjects = useMemo(() => {
        const featuredIds = new Set(settings.featuredProjectIds);
        return allProjects
            .filter(p => featuredIds.has(p.id))
            .slice(0, 8);
    }, [allProjects, settings]);

    useEffect(() => {
        setDisplayProjects(projects);
        setIsLoading(false);
    }, [projects]);
    
    const searchSuggestions = useMemo(() => {
        if (!debouncedSearchTerm) return [];
        return projects.filter(p => fuzzySearch(debouncedSearchTerm, p.name)).slice(0, 5);
    }, [debouncedSearchTerm, projects]);
    
    const handleSearchSelect = (term: string) => { setSearchTerm(term); addSearchTerm(term); setIsSearchFocused(false); };
    const handleSearchSubmit = () => { addSearchTerm(searchTerm); setIsSearchFocused(false); };

    const filteredAndSortedProjects = useMemo(() => {
        let filtered = displayProjects;
        if (debouncedSearchTerm) { filtered = filtered.filter(p => fuzzySearch(debouncedSearchTerm, p.name)); }
        
        const parseNumericString = (val: string | undefined) => {
            if (!val || val === 'N/A') return -1;
            return parseFloat(val.replace(/[$,]/g, ''));
        };

        if (sortConfig) {
            return [...filtered].sort((a, b) => {
                let aValue: any, bValue: any;
                if (sortConfig.key === 'sentiment') {
                    aValue = a.votes.up - a.votes.down;
                    bValue = b.votes.up - b.votes.down;
                } else if (sortConfig.key === 'supply') {
                    aValue = parseNumericString(a.coins?.find(c => c.type === 'meme' && c.status === 'published')?.supply);
                    bValue = parseNumericString(b.coins?.find(c => c.type === 'meme' && c.status === 'published')?.supply);
                } else if (sortConfig.key === 'marketPrice') {
                    aValue = parseNumericString(a.coins?.find(c => c.type === 'meme' && c.status === 'published')?.marketPrice);
                    bValue = parseNumericString(b.coins?.find(c => c.type === 'meme' && c.status === 'published')?.marketPrice);
                } else if (sortConfig.key === 'stage') {
                    const order: Record<'Private' | 'Early' | 'Pre-Launch' | 'Launched', number> = { 'Private': 1, 'Early': 2, 'Pre-Launch': 3, 'Launched': 4 };
                    aValue = a.stage ? order[a.stage] : 5;
                    bValue = b.stage ? order[b.stage] : 5;
                } else {
                    aValue = a.name;
                    bValue = b.name;
                }

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [displayProjects, debouncedSearchTerm, sortConfig]);

    const { paginatedProjects, totalPages } = useMemo(() => {
        const total = filteredAndSortedProjects.length;
        const pages = Math.ceil(total / pageSize);
        const paginated = filteredAndSortedProjects.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
        return { paginatedProjects: paginated, totalPages: pages };
    }, [filteredAndSortedProjects, currentPage, pageSize]);
    
    useEffect(() => { setCurrentPage(0); }, [debouncedSearchTerm, sortConfig, pageSize]);

    const requestSort = (key: SortableKeys) => {
        setSortConfig(prev => ({ key, direction: prev?.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending' }));
    };

    return (
        <div className="max-w-[84rem] mx-auto">
            <div className="neu-inset-panel mb-8 p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center gap-8">
                <div className="flex-shrink-0 w-full sm:w-1/3 text-center sm:text-left">
                    <h1 className="text-4xl sm:text-5xl font-display font-bold text-on-surface">
                        {settings.title}
                    </h1>
                    <p className="text-lg text-on-surface-variant mt-2 max-w-sm mx-auto sm:mx-0">
                        {settings.subtitle}
                    </p>
                </div>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {featuredProjects.map(project => (
                        <ReactRouterDOM.Link
                            key={project.id}
                            to={`/project/${project.id}`}
                            className="relative aspect-square neu-outset-card p-0 group transition-transform duration-200 hover:scale-105 overflow-hidden rounded-md"
                        >
                            <img
                                src={project.logo}
                                alt={project.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                                <p className="font-bold text-white text-xs text-center truncate drop-shadow-md">{project.name}</p>
                            </div>
                        </ReactRouterDOM.Link>
                    ))}
                </div>
            </div>
            
            <div ref={searchWrapperRef} className="mb-6 relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70" size={20} />
                <input
                    type="text" placeholder="Search meme projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)} onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }}
                    className="neu-inset-control w-full pl-10 pr-4 py-2 text-on-surface placeholder:text-on-surface-variant/70 text-base"
                />
                 <AnimatePresence>
                    {isSearchFocused && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full mt-2 w-full bg-[rgb(var(--color-surface-container))] rounded-lg shadow-lg z-50 border border-border/10 overflow-hidden"
                        >
                            {searchTerm.length === 0 && history.length > 0 && (
                                <div>
                                    <div className="flex justify-between items-center px-3 py-2 bg-surface/50"><h4 className="text-xs font-bold text-on-surface-variant">RECENT</h4><button onClick={clearHistory} className="text-xs text-on-surface-variant/70 hover:text-primary">Clear</button></div>
                                    {history.map(term => <button key={term} onClick={() => handleSearchSelect(term)} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-primary/10"><History size={16} className="text-on-surface-variant" /><span>{term}</span></button>)}
                                </div>
                            )}
                            {searchTerm.length > 0 && searchSuggestions.length > 0 && (
                                <div>
                                    <h4 className="px-3 py-2 bg-surface/50 text-xs font-bold text-on-surface-variant">SUGGESTIONS</h4>
                                    {searchSuggestions.map(p => <button key={p.id} onClick={() => handleSearchSelect(p.name)} className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-primary/10"><img src={p.logo} alt={p.name} className="w-6 h-6 rounded-full"/><span>{p.name}</span></button>)}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <ProjectTable
                projects={paginatedProjects}
                isLoading={isLoading}
                onRowClick={(id) => setExpandedProjectId(expandedProjectId === id ? null : id)}
                expandedProjectId={expandedProjectId}
                requestSort={requestSort}
                sortConfig={sortConfig}
                currentPage={currentPage}
                pageSize={pageSize}
            />
            
            {paginatedProjects.length > 0 && (
                <div className="mt-6">
                    <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} pageSize={pageSize} onPageSizeChange={setPageSize} totalItems={filteredAndSortedProjects.length} />
                </div>
            )}
        </div>
    );
};

export default MemePage;