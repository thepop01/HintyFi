import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProjects, getSiteContentSettings } from '../src/services/dataService';
import { Project, DropStatus } from '../src/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Search, DollarSign, CheckCircle, Clock, Package } from 'lucide-react';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import PaginationControls from '../components/common/PaginationControls';
import { useDebounce } from '../hooks/useDebounce';
import { fuzzySearch } from '../utils/helpers';


const IDOCard: React.FC<{ project: Project }> = ({ project }) => {
    const navigate = useNavigate();
    const statusConfig: Record<DropStatus, { text: string; color: string; icon: React.ReactNode }> = {
        upcoming: { text: 'Upcoming', color: 'border-blue-500 bg-blue-500/10 text-blue-400', icon: <Clock size={14} /> },
        ongoing: { text: 'Ongoing', color: 'border-green-500 bg-green-500/10 text-green-400', icon: <motion.div className="w-3 h-3 rounded-full bg-green-500" animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 1.5, repeat: Infinity }} /> },
        completed: { text: 'Completed', color: 'border-gray-500 bg-gray-500/10 text-gray-400', icon: <CheckCircle size={14} /> },
    };
    const status = project.dropStatus ? statusConfig[project.dropStatus] : null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="neu-outset-card rounded-xl overflow-hidden flex flex-col group cursor-pointer"
            onClick={() => navigate(`/${project.name.toLowerCase()}`)}
        >
            <div className="relative h-40">
                <img src={project.banner} alt={`${project.name} banner`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                {status && (
                    <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 text-xs font-bold rounded-full backdrop-blur-sm border ${status.color}`}>
                        {status.icon}
                        {status.text}
                    </div>
                )}
                <div className="absolute -bottom-8 left-4">
                    <img src={project.logo} alt={project.name} className="w-16 h-16 rounded-full bg-surface-container object-contain p-1 border-4 border-[rgb(var(--color-background))] neu-shadow-outset-sm transition-transform duration-300 group-hover:scale-110" />
                </div>
            </div>

            <div className="p-4 pt-10 flex-grow flex flex-col">
                <h3 className="font-display font-bold text-xl text-on-surface truncate group-hover:text-primary transition-colors">{project.name}</h3>
                {project.ticker && <p className="text-sm font-semibold text-primary">{project.ticker}</p>}

                <div className="flex-grow my-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div className="flex items-start gap-2">
                        <DollarSign size={16} className="text-on-surface-variant mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-on-surface-variant">Token Price</p>
                            <p className="font-bold text-on-surface">{project.idoDetails?.tokenPrice || 'TBA'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <Package size={16} className="text-on-surface-variant mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-on-surface-variant">Total Supply</p>
                            <p className="font-bold text-on-surface">{project.idoDetails?.totalSupply || 'TBA'}</p>
                        </div>
                    </div>
                    <div className="col-span-2 flex items-start gap-2">
                         <Clock size={16} className="text-on-surface-variant mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-on-surface-variant">Vesting</p>
                            <p className="font-bold text-on-surface">{project.idoDetails?.vestingSchedule || 'TBA'}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border/10 flex justify-between items-center">
                     <div>
                        <p className="text-sm font-semibold text-on-surface-variant">Raise</p>
                        <p className="text-lg font-bold text-on-surface">{project.raise || 'TBA'}</p>
                    </div>
                    <button className="neu-button active px-4 py-2 text-sm font-bold">
                        View Details
                    </button>
                </div>
            </div>
        </motion.div>
    );
};


const IDOPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<'upcoming' | 'ongoing' | 'completed' | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(9);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [settings, setSettings] = useState<any>({ title: "Project Launches", subtitle: "Discover the next wave of token generation events and initial offerings.", featuredProjectIds: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const projectsData = await getProjects();
                const siteSettingsData = await getSiteContentSettings();
                setAllProjects(projectsData);
                setSettings(siteSettingsData.ido);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    
    const launchpadProjects = useMemo(() =>
        (allProjects || []).filter(p => p.category.includes('launchpad') && p.isPublished),
    [allProjects]);

    const featuredProjects = useMemo(() => {
        if (!settings?.featuredProjectIds) return [];
        const featuredIds = new Set(settings.featuredProjectIds);
        return (allProjects || [])
            .filter(p => featuredIds.has(p.id))
            .slice(0, 8);
    }, [allProjects, settings]);

    const filteredAndSortedProjects = useMemo(() => {
        let filtered = launchpadProjects.filter(p => fuzzySearch(debouncedSearchTerm, p.name));

        if (sortOption !== 'all') {
            filtered = filtered.filter(p => p.dropStatus === sortOption);
        }

        const statusOrder: Record<DropStatus, number> = { ongoing: 1, upcoming: 2, completed: 3 };
        filtered.sort((a, b) => {
            const statusA = a.dropStatus ? statusOrder[a.dropStatus] : 4;
            const statusB = b.dropStatus ? statusOrder[b.dropStatus] : 4;
            return statusA - statusB;
        });

        return filtered;
    }, [launchpadProjects, debouncedSearchTerm, sortOption]);

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
    }, [searchTerm, sortOption, pageSize]);

    if (isLoading || !settings) {
        return <div className="flex justify-center items-center h-96"><Loader /></div>;
    }

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

             <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70" size={18} />
                    <input
                        type="text" placeholder="Search IDOs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="neu-inset-input w-full pl-9"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setSortOption('all')} className={`neu-tab-button ${sortOption === 'all' ? 'active' : ''}`}>All</button>
                    <button onClick={() => setSortOption('ongoing')} className={`neu-tab-button ${sortOption === 'ongoing' ? 'active' : ''}`}>Ongoing</button>
                    <button onClick={() => setSortOption('upcoming')} className={`neu-tab-button ${sortOption === 'upcoming' ? 'active' : ''}`}>Upcoming</button>
                    <button onClick={() => setSortOption('completed')} className={`neu-tab-button ${sortOption === 'completed' ? 'active' : ''}`}>Completed</button>
                </div>
            </div>

            {paginatedProjects.length > 0 ? (
                 <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedProjects.map(project => (
                            <IDOCard key={project.id} project={project} />
                        ))}
                    </div>
                    <div className="mt-8">
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            pageSize={pageSize}
                            onPageSizeChange={setPageSize}
                            totalItems={filteredAndSortedProjects.length}
                            pageSizeOptions={[9, 18, 27]}
                        />
                    </div>
                </>
            ) : (
                <EmptyState
                    icon={<Rocket size={48} />}
                    title="No IDOs Found"
                    description="There are currently no IDOs to display. Please check back later for new and upcoming launches."
                />
            )}
        </div>
    );
};

export default IDOPage;