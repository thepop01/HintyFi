import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Project, NftCollection, DisplayCollection } from '../src/types';
import { getProjects, getProjectById, getSiteContentSettings } from '../src/services/dataService';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, ArrowUp, ArrowDown, Loader, Inbox } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { ProjectProfileInline } from '../components/ecosystem/ProjectDetailInline';
import { useDebounce } from '../hooks/useDebounce';
import { fuzzySearch } from '../utils/helpers';
import PaginationControls from '../components/common/PaginationControls';
import { usePrefetch } from '../hooks/usePrefetch';

// --- TYPES ---
type SortableKeys = 'collection' | 'stage' | 'supply' | 'mintPrice' | 'floorPrice' | 'sentiment' | 'perksIn';

// --- HELPER FUNCTIONS ---
const parseValue = (value?: string): number => {
    if (!value || value === 'N/A') return -1;
    const cleaned = value.replace(/,|\$/g, '');
    let multiplier = 1;
    if (cleaned.endsWith('M')) multiplier = 1e6;
    else if (cleaned.endsWith('K')) multiplier = 1e3;
    
    return parseFloat(cleaned) * multiplier;
};

// --- TABLE COMPONENT ---
interface NftCollectionsTableProps {
    collections: DisplayCollection[];
    onRowClick: (id: string) => void;
    expandedCollectionId: string | null;
    requestSort: (key: SortableKeys) => void;
    sortConfig: { key: SortableKeys; direction: 'ascending' | 'descending' } | null;
    currentPage: number;
    pageSize: number;
    isLoading: boolean;
}

const NftCollectionsTable: React.FC<NftCollectionsTableProps> = ({
    collections, onRowClick, expandedCollectionId, requestSort, sortConfig, currentPage, pageSize, isLoading
}) => {
    const allProjects = useMemo(() => getProjects(), []);

    const SortableHeader: React.FC<{ sortKey: SortableKeys; children: React.ReactNode; className?: string }> = ({ sortKey, children, className }) => {
        const isSorted = sortConfig?.key === sortKey;
        return (
            <th className={`px-6 py-3 text-left text-lg font-display font-bold text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors ${className}`} onClick={() => requestSort(sortKey)}>
                <div className="flex items-center gap-1">
                    {children}
                    {isSorted && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                </div>
            </th>
        );
    };

    return (
        <div className="bg-[#e6e1fe] rounded-xl shadow-lg overflow-x-auto text-on-surface border border-border/5">
            <table className="w-full min-w-[1000px]">
                <thead className="bg-surface/50">
                    <tr>
                        <th className="px-4 py-3 text-left text-lg font-display font-bold text-on-surface-variant w-12 text-center">#</th>
                        <SortableHeader sortKey="collection">Collection</SortableHeader>
                        <SortableHeader sortKey="stage">Stage</SortableHeader>
                        <SortableHeader sortKey="supply">Supply</SortableHeader>
                        <SortableHeader sortKey="mintPrice">Mint Price</SortableHeader>
                        <SortableHeader sortKey="floorPrice">Floor Price</SortableHeader>
                        <SortableHeader sortKey="sentiment">Sentiment</SortableHeader>
                        <SortableHeader sortKey="perksIn">Perks In</SortableHeader>
                        <th className="px-6 py-3 text-left text-lg font-display font-bold text-on-surface-variant">Links</th>
                        <th className="px-4 py-3 w-12"></th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr><td colSpan={10} className="text-center py-12"><div className="flex justify-center items-center gap-2 text-on-surface-variant"><Loader size={16} className="animate-spin" /><span>Loading collections...</span></div></td></tr>
                    ) : collections.length > 0 ? (
                        collections.map((collection, index) => {
                            const isExpanded = collection.id === expandedCollectionId;
                            const project = allProjects.find(p => p.id === collection.projectId);
                            const sentimentScore = project ? project.votes.up - project.votes.down : 0;
                            const sentimentColor = sentimentScore > 0 ? 'text-green-500' : sentimentScore < 0 ? 'text-red-500' : 'text-on-surface';
                            return (
                                <React.Fragment key={collection.id}>
                                    <tr className="hover:bg-border/10 transition-colors cursor-pointer border-b border-white" onClick={() => onRowClick(collection.id)}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-on-surface-variant text-center">{currentPage * pageSize + index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <img className="h-12 w-12 rounded-lg bg-surface-container object-contain" src={collection.image} alt={`${collection.name} logo`} loading="lazy" />
                                                <div>
                                                    <div className="text-lg font-heading font-medium text-on-surface">{collection.name}</div>
                                                    <ReactRouterDOM.Link
                                                        to={`/project/${collection.projectId}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-sm text-on-surface-variant hover:text-primary hover:underline transition-colors"
                                                    >
                                                        {collection.projectName}
                                                    </ReactRouterDOM.Link>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-on-surface">{collection.projectStage || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-on-surface">{collection.supply || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-on-surface">{collection.mintPrice || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-on-surface">{collection.floorPrice || 'N/A'}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-base font-semibold ${sentimentColor}`}>{sentimentScore > 0 ? `+${sentimentScore}` : sentimentScore}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {collection.perksIn.length > 0 ? (
                                                <div className="flex items-center -space-x-2">
                                                    {collection.perksIn.slice(0, 2).map(p => (
                                                        <ReactRouterDOM.Link to={`/project/${p.projectId}`} key={p.projectId} onClick={e => e.stopPropagation()}>
                                                            <img src={p.projectLogo} alt={p.projectName} title={p.projectName} className="w-8 h-8 rounded-full border-2 border-surface bg-background object-contain" />
                                                        </ReactRouterDOM.Link>
                                                    ))}
                                                    {collection.perksIn.length > 2 && (
                                                        <div
                                                            className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold border-2 border-surface"
                                                            title={`${collection.perksIn.length - 2} more project(s)`}
                                                        >
                                                            +{collection.perksIn.length - 2}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-on-surface-variant">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {collection.link ? (
                                                <a
                                                    href={collection.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="neu-button px-3 py-1.5 text-sm font-semibold"
                                                >
                                                    View
                                                </a>
                                            ) : (
                                                <span className="text-on-surface-variant text-sm">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4"><motion.div animate={{ rotate: isExpanded ? 90 : 0 }}><ChevronRight size={18} /></motion.div></td>
                                    </tr>
                                    <AnimatePresence>
                                        {isExpanded && project && (
                                            <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                <td colSpan={10} className="p-0 bg-[#ddd7fe]">
                                                    <ProjectProfileInline project={project} collection={collection} />
                                                </td>
                                            </motion.tr>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            )
                        })
                    ) : (
                        <tr><td colSpan={10} className="p-0"><EmptyState icon={<Inbox size={48} />} title="No Collections Found" description="Your search did not return any results." /></td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}


// --- MAIN PAGE COMPONENT ---
const NFTPage: React.FC = () => {
    const [allCollections, setAllCollections] = useState<DisplayCollection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCollectionId, setExpandedCollectionId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'floorPrice', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    
    const { settings, projects } = useMemo(() => {
        const publicProjects = getProjects();
        return {
            settings: getSiteContentSettings().nft,
            projects: publicProjects
        };
    }, []);

    const featuredProjects = useMemo(() => {
        const featuredIds = new Set(settings.featuredProjectIds);
        return projects
            .filter(p => featuredIds.has(p.id))
            .slice(0, 8); // Max 8 items
    }, [projects, settings]);

    useEffect(() => {
        setIsLoading(true);
        const allProjects = getProjects();
        const projectMap = new Map<string, Project>(allProjects.map(p => [p.name, p]));

        const processedCollections: DisplayCollection[] = allProjects.flatMap(project =>
            (project.nftCollections || [])
                .filter(collection => collection.status === 'published' && collection.isVisibleOnNftPage !== false)
                .map(collection => {
                    const perksIn: { projectName: string; projectLogo: string; projectId: string; }[] = [];
                    const uniquePerkProjects = new Set<string>();

                    // Directly read the perks defined on THIS collection to see where they grant benefits
                    for (const perk of collection.perks) {
                        const grantingProjectName = perk.perk.grantingProjectName;
                        if (grantingProjectName && !uniquePerkProjects.has(grantingProjectName)) {
                            const grantingProject = projectMap.get(grantingProjectName);
                            if (grantingProject) {
                                perksIn.push({
                                    projectName: grantingProject.name,
                                    projectLogo: grantingProject.logo,
                                    projectId: grantingProject.id,
                                });
                            } else if (perk.perk.grantingProjectImage) {
                                // Handle "newly added" projects that don't exist in the main list
                                perksIn.push({
                                    projectName: grantingProjectName,
                                    projectLogo: perk.perk.grantingProjectImage,
                                    projectId: `temp_${grantingProjectName.replace(/\s+/g, '_')}`,
                                });
                            }
                             uniquePerkProjects.add(grantingProjectName);
                        }
                    }

                    return {
                        ...collection,
                        projectId: project.id,
                        projectName: project.name,
                        projectStage: project.stage,
                        perksIn,
                    };
                })
        );
        setAllCollections(processedCollections);
        setIsLoading(false);
    }, []);

    const filteredAndSortedCollections = useMemo(() => {
        const allProjects = getProjects();
        const projectMap = new Map(allProjects.map(p => [p.id, p]));

        let filtered = allCollections.filter(c =>
            fuzzySearch(debouncedSearchTerm, c.name) || fuzzySearch(debouncedSearchTerm, c.projectName)
        );

        if (sortConfig) {
            filtered.sort((a, b) => {
                let aValue: any, bValue: any;
                switch (sortConfig.key) {
                    case 'collection': aValue = a.name; bValue = b.name; break;
                    case 'stage': const order = { 'Private': 1, 'Early': 2, 'Pre-Launch': 3, 'Launched': 4 }; aValue = a.projectStage ? order[a.projectStage] : 5; bValue = b.projectStage ? order[b.projectStage] : 5; break;
                    case 'supply': aValue = parseValue(a.supply); bValue = parseValue(b.supply); break;
                    case 'mintPrice': aValue = parseValue(a.mintPrice); bValue = parseValue(b.mintPrice); break;
                    case 'floorPrice': aValue = parseValue(a.floorPrice); bValue = parseValue(b.floorPrice); break;
                    case 'sentiment':
                        const projectA = projectMap.get(a.projectId);
                        const projectB = projectMap.get(b.projectId);
                        aValue = projectA ? projectA.votes.up - projectA.votes.down : -Infinity;
                        bValue = projectB ? projectB.votes.up - projectB.votes.down : -Infinity;
                        break;
                    case 'perksIn': aValue = a.perksIn.length; bValue = b.perksIn.length; break;
                    default: aValue = 0; bValue = 0;
                }
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [allCollections, debouncedSearchTerm, sortConfig]);

    const { paginatedCollections, totalPages } = useMemo(() => {
        const total = filteredAndSortedCollections.length;
        const pages = Math.ceil(total / pageSize);
        const paginated = filteredAndSortedCollections.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
        return { paginatedCollections: paginated, totalPages: pages };
    }, [filteredAndSortedCollections, currentPage, pageSize]);
    
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

            <div className="flex justify-end mb-6">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70" size={18} />
                    <input
                        type="text" placeholder="Search collections or projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="neu-inset-control w-full pl-9 pr-4 py-2 text-on-surface placeholder:text-on-surface-variant/70"
                    />
                </div>
            </div>

            <NftCollectionsTable
                collections={paginatedCollections}
                isLoading={isLoading}
                onRowClick={(id) => setExpandedCollectionId(expandedCollectionId === id ? null : id)}
                expandedCollectionId={expandedCollectionId}
                requestSort={requestSort}
                sortConfig={sortConfig}
                currentPage={currentPage}
                pageSize={pageSize}
            />
            
            {paginatedCollections.length > 0 && (
                <div className="mt-6">
                    <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} pageSize={pageSize} onPageSizeChange={setPageSize} totalItems={filteredAndSortedCollections.length} pageSizeOptions={[10, 25, 50]} />
                </div>
            )}
        </div>
    );
};

export default NFTPage;