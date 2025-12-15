import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProjects, getSiteContentSettings } from '../src/services/dataService';
import { Project, Task } from '../src/types';
import { ChevronRight, Search, ClipboardList, Clock, DollarSign, Gift, ArrowUp, ArrowDown } from 'lucide-react';
import { useCompletedTasks } from '../utils/helpers';
import PaginationControls from '../components/common/PaginationControls';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';

type SortableKeys = 'name' | 'totalTasks' | 'cost' | 'progress' | 'rewardType';

// --- TABLE COMPONENT ---
interface TasksTableProps {
    projects: Project[];
    sortConfig: { key: SortableKeys; direction: 'ascending' | 'descending' };
    requestSort: (key: SortableKeys) => void;
    getCompletedCount: (projectId: string) => number;
}

const TasksTable: React.FC<TasksTableProps> = ({ projects, sortConfig, requestSort, getCompletedCount }) => {
    const navigate = useNavigate();

    const SortableHeader: React.FC<{ sortKey: SortableKeys; children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ sortKey, children, className, style }) => {
        const isSorted = sortConfig.key === sortKey;
        return (
            <th className={`px-1 py-2 text-left text-sm font-display font-bold text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors ${className}`} onClick={() => requestSort(sortKey)} style={style}>
                <div className="flex items-center gap-1">
                    {children}
                    {isSorted && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                </div>
            </th>
        );
    };

    return (
        <div className="bg-[#faf0ff] rounded-xl shadow-lg overflow-x-auto text-on-surface border border-border/5 mobile-table-container">
            <table className="w-full min-w-[600px]" style={{tableLayout: 'fixed'}}>
                <thead className="border-b border-border/10">
                    <tr>
                        <SortableHeader sortKey="name" style={{width: "30%"}}>Project</SortableHeader>
                        <SortableHeader sortKey="totalTasks" style={{width: "15%"}}>Total Tasks</SortableHeader>
                        <SortableHeader sortKey="cost" style={{width: "12%"}}>Cost</SortableHeader>
                        <SortableHeader sortKey="rewardType" style={{width: "15%"}}>Reward</SortableHeader>
                        <SortableHeader sortKey="progress" style={{width: "20%"}}>Your Progress</SortableHeader>
                        <th className="px-1 py-2" style={{width: "8%"}}></th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map(project => {
                        const total = project.tasksInfo?.totalTasks || 0;
                        const completed = getCompletedCount(project.id);
                        const progress = total > 0 ? completed / total : 0;
                        return (
                            <tr key={project.id} className="hover:bg-border/10 transition-colors border-b border-border/10 last:border-b-0">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <img className="h-10 w-10 rounded-lg bg-surface-container object-cover p-1" src={project.logo} alt={`${project.name} logo`} />
                                        <div>
                                            <div className="text-lg font-heading font-medium text-on-surface">{project.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-on-surface">{project.tasksInfo?.totalTasks}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-on-surface">{project.tasksInfo?.cost === 0 ? 'Free' : `$${project.tasksInfo?.cost}`}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-base">
                                    {project.rewardType ? <span className={`px-2 py-0.5 font-bold rounded-full bg-primary/20 text-primary`}>{project.rewardType}</span> : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="w-full bg-surface-container rounded-full h-2.5 neu-shadow-inset-xs">
                                            <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }}></div>
                                        </div>
                                        <span className="text-sm font-semibold w-10 text-right">{Math.round(progress * 100)}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => navigate(`/${project.name.toLowerCase()}/tasks`)} className="neu-button px-4 py-1.5 text-sm font-semibold flex items-center gap-1">
                                        Start Tasks <ChevronRight size={14} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};


const TasksPage = () => {
    // Hooks and State
    const [projects, setProjects] = useState<Project[]>([]);
    const { getCompletedCount } = useCompletedTasks();
    const [searchTerm, setSearchTerm] = useState('');
    const [rewardFilter, setRewardFilter] = useState('all');
    const [costFilter, setCostFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(12);

    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [settings, setSettings] = useState<any>({ tasks: { title: "Task Hub", subtitle: "Complete tasks from ecosystem projects to earn rewards and climb the leaderboard.", featuredProjectIds: [] } });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const projects = await getProjects();
                const siteSettings = await getSiteContentSettings();
                setAllProjects(projects);
                setSettings(siteSettings.tasks);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const featuredProjects = useMemo(() => {
        if (!settings?.featuredProjectIds) return [];
        const featuredIds = new Set(settings.featuredProjectIds);
        return (allProjects || [])
            .filter(p => featuredIds.has(p.id))
            .slice(0, 8); // Max 8 items
    }, [allProjects, settings]);
    
    useEffect(() => {
        const fetchProjects = async () => {
            const projectsData = await getProjects();
            setProjects(projectsData.filter(p => p.tasksInfo && p.tasksInfo.totalTasks > 0));
        };
        fetchProjects();
    }, []);

    const filteredAndSortedProjects = useMemo(() => {
        let filtered = [...projects];

        if (searchTerm) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (rewardFilter !== 'all') {
            filtered = filtered.filter(p => p.rewardType === rewardFilter);
        }
        if (costFilter !== 'all') {
            const isFree = costFilter === 'free';
            filtered = filtered.filter(p => isFree ? p.tasksInfo?.cost === 0 : p.tasksInfo && p.tasksInfo?.cost > 0);
        }
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(p => p.tasksInfo?.categories.includes(categoryFilter));
        }

        if (sortConfig) {
            filtered.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                if (sortConfig.key === 'totalTasks' || sortConfig.key === 'cost') {
                    aValue = a.tasksInfo?.[sortConfig.key] ?? 0;
                    bValue = b.tasksInfo?.[sortConfig.key] ?? 0;
                } else if (sortConfig.key === 'progress') {
                    const totalA = a.tasksInfo?.totalTasks || 0;
                    const completedA = getCompletedCount(a.id);
                    aValue = totalA > 0 ? completedA / totalA : 0;
                    
                    const totalB = b.tasksInfo?.totalTasks || 0;
                    const completedB = getCompletedCount(b.id);
                    bValue = totalB > 0 ? completedB / totalB : 0;
                } else if (sortConfig.key === 'rewardType') {
                    aValue = a.rewardType || 'zz';
                    bValue = b.rewardType || 'zz';
                }
                else {
                    aValue = a[sortConfig.key as keyof Project];
                    bValue = b[sortConfig.key as keyof Project];
                }

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [projects, searchTerm, rewardFilter, costFilter, categoryFilter, sortConfig, getCompletedCount]);

    const { paginatedProjects, totalPages } = useMemo(() => {
        const total = filteredAndSortedProjects.length;
        const pages = Math.ceil(total / pageSize);
        const paginated = filteredAndSortedProjects.slice(
            currentPage * pageSize,
            (currentPage + 1) * pageSize
        );
        return { paginatedProjects: paginated, totalPages: pages };
    }, [filteredAndSortedProjects, currentPage, pageSize]);
    
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm, rewardFilter, costFilter, categoryFilter, sortConfig, pageSize]);

    const requestSort = (key: SortableKeys) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    };
    
    const allTaskCategories = useMemo(() => {
        const categories = new Set<string>();
        projects.forEach(p => {
            p.tasksInfo?.categories.forEach(cat => categories.add(cat));
        });
        return Array.from(categories).sort();
    }, [projects]);
    
    if (isLoading || !settings) {
        return <div className="flex justify-center items-center h-96"><Loader /></div>;
    }

    return (
        <div className="max-w-[84rem] mx-auto w-full space-y-8 px-4 sm:px-6">
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
                        <Link
                            key={project.id}
                            to={`/${project.name.toLowerCase()}`}
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
                        </Link>
                    ))}
                </div>
            </div>
            
            <div className="neu-card p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70" size={18} />
                    <input type="text" placeholder="Search projects..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="neu-inset-input w-full pl-10" />
                </div>
                <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                    <div>
                        <label className="text-xs font-semibold text-on-surface-variant">Reward</label>
                        <select value={rewardFilter} onChange={e => setRewardFilter(e.target.value)} className="neu-control neu-select w-full mt-1">
                            <option value="all">All</option><option value="Airdrop">Airdrop</option><option value="Whitelist">Whitelist</option><option value="Points">Points</option><option value="NFT">NFT</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-xs font-semibold text-on-surface-variant">Cost</label>
                        <select value={costFilter} onChange={e => setCostFilter(e.target.value)} className="neu-control neu-select w-full mt-1">
                            <option value="all">All</option><option value="free">Free</option><option value="paid">Paid</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-xs font-semibold text-on-surface-variant">Category</label>
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="neu-control neu-select w-full mt-1">
                            <option value="all">All</option>
                            {allTaskCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-on-surface-variant">Sort By</label>
                        <select value={sortConfig.key} onChange={e => requestSort(e.target.value as SortableKeys)} className="neu-control neu-select w-full mt-1">
                            <option value="name">Name</option>
                            <option value="progress">Your Progress</option>
                            <option value="totalTasks">Total Tasks</option>
                            <option value="cost">Cost</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {paginatedProjects.length > 0 ? (
                <TasksTable
                    projects={paginatedProjects}
                    sortConfig={sortConfig}
                    requestSort={requestSort}
                    getCompletedCount={getCompletedCount}
                />
            ) : (
                <EmptyState
                    title="No Tasks Found"
                    description="There are currently no tasks to display. Please check back later for new opportunities."
                />
            )}

            {totalPages > 0 && (
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                    totalItems={filteredAndSortedProjects.length}
                    pageSizeOptions={[12, 24, 36]}
                />
            )}
        </div>
    );
};

export default TasksPage;