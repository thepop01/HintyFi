import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Event, CampaignEvent, Quest, Project, ProjectCategory } from '../src/types';
import { getEvents, getQuests, getProjects, getEventById, getSiteContentSettings } from '../src/services/dataService';
import { Globe, ChevronDown, Users, Megaphone, Calendar, ClipboardList, Search, CheckCircle, History, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../hooks/useDebounce';
import { fuzzySearch } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import PaginationControls from '../components/common/PaginationControls';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useClickOutside } from '../hooks/useClickOutside';
import { usePrefetch } from '../hooks/usePrefetch';
import EmptyState from '../components/common/EmptyState';


const getCampaignDateInfo = (campaign: CampaignEvent, viewType: 'live' | 'upcoming' | 'ended'): string => {
    const now = Date.now();
    const endTime = campaign.endTime;

    if (viewType === 'live') {
        const diff = endTime - now;
        if (diff <= 0) return "Ending soon";

        const hoursLeft = diff / (1000 * 60 * 60);

        if (hoursLeft > 24) {
            const days = Math.ceil(hoursLeft / 24);
            return `Ends in ${days} day${days > 1 ? 's' : ''}`;
        }
        
        if (hoursLeft >= 1) {
            const roundedHours = Math.ceil(hoursLeft);
            return `Ends in ${roundedHours} hour${roundedHours > 1 ? 's' : ''}`;
        }

        return "Ends in < 1 hour";
    }

    if (viewType === 'ended') {
        return `Ended: ${new Date(endTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    }
    
    return '';
};

// --- Reward Type Helper ---
const getRewardTypes = (rewardString: string): ('currency' | 'role' | 'points' | 'token')[] => {
    const types: ('currency' | 'role' | 'points' | 'token')[] = [];
    if (!rewardString) return types;
    const lowerReward = rewardString.toLowerCase();
    
    if (/\$|\b(usdc|eth|sol)\b/.test(lowerReward)) {
        types.push('currency');
    }
    if (/\brole\b/.test(lowerReward)) {
        types.push('role');
    }
    if (/\bpoints\b/.test(lowerReward)) {
        types.push('points');
    }
    if (/\btokens?\b/.test(lowerReward)) {
        types.push('token');
    }
    return types;
};

const ProjectCampaignGroupSkeleton: React.FC = () => (
    <div className="neu-card overflow-hidden p-4 animate-pulse">
        <header className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-surface-container" />
            <div className="ml-4 flex-grow space-y-2">
                <div className="h-5 w-1/2 bg-surface-container rounded" />
                <div className="h-3 w-1/4 bg-surface-container rounded" />
            </div>
            <div className="w-6 h-6 bg-surface-container rounded-full" />
        </header>
    </div>
);


// --- Main Page Component ---
const CampaignPage: React.FC = () => {
    const location = ReactRouterDOM.useLocation();
    const navigate = ReactRouterDOM.useNavigate();
    const [searchParams, setSearchParams] = ReactRouterDOM.useSearchParams();


    // Data State
    const [events, setEvents] = useState<Event[]>([]);
    const [quests, setQuests] = useState<Quest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const contentSettings = useMemo(() => getSiteContentSettings(), []);

    // UI State
    const getInitialCampaignView = () => {
        const hash = location.hash;
        if (hash === '#campaigns-upcoming') return 'upcoming';
        if (hash === '#campaigns-ended') return 'ended';
        return 'live';
    };
    const getInitialQuestView = () => {
        const hash = location.hash;
        if (hash === '#quests-past') return 'past';
        return 'ongoing';
    };

    const [campaignView, setCampaignView] = useState<'live' | 'upcoming' | 'ended'>(getInitialCampaignView());
    const [questView, setQuestView] = useState<'ongoing' | 'past'>(getInitialQuestView());

    // Filter & Sort State
    const allProjectCategories: ProjectCategory[] = ['defi', 'dex', 'nft', 'gaming', 'socialfi', 'rwa', 'infrastructure', 'wallet', 'depin', 'ai', 'meme', 'launchpad'];
    type SortOption = 'date' | 'participants' | 'name' | 'newest';
    
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [activeCategory, setActiveCategory] = useState<'all' | ProjectCategory>(searchParams.get('category') as any || 'all');
    const [rewardTypeFilter, setRewardTypeFilter] = useState<'all' | 'currency' | 'role' | 'points' | 'token'>(searchParams.get('reward') as any || 'all');
    const [sortOption, setSortOption] = useState<SortOption>(searchParams.get('sort') as any || 'date');
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 0);
    const [pageSize, setPageSize] = useState(Number(searchParams.get('pageSize')) || 12);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const { history, addSearchTerm, clearHistory } = useSearchHistory('campaign-search-history');
    const searchWrapperRef = useRef<HTMLDivElement>(null);
    useClickOutside(searchWrapperRef, () => setIsSearchFocused(false));

    // Effect to sync state changes to URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (activeCategory !== 'all') params.set('category', activeCategory);
        if (rewardTypeFilter !== 'all') params.set('reward', rewardTypeFilter);
        if (sortOption !== 'date') params.set('sort', sortOption);
        if (pageSize !== 12) params.set('pageSize', String(pageSize));
        if (currentPage !== 0) params.set('page', String(currentPage));

        setSearchParams(params, { replace: true });
    }, [searchTerm, activeCategory, rewardTypeFilter, sortOption, pageSize, currentPage, setSearchParams]);


    // Data Fetching
    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setEvents(getEvents());
            setQuests(getQuests());
            setIsLoading(false);
        }, 750); // Simulate network request
    }, []);

    // Update state when hash changes (e.g., browser back/forward)
    useEffect(() => {
        setCampaignView(getInitialCampaignView());
        setQuestView(getInitialQuestView());
    }, [location.hash]);

    // Handlers to update state and URL hash
    const handleSetCampaignView = (view: 'live' | 'upcoming' | 'ended') => {
        setCampaignView(view);
        setSortOption('date'); // Reset sort on tab change
        navigate({ hash: `campaigns-${view}` }, { replace: true });
    };
    const handleSetQuestView = (view: 'ongoing' | 'past') => {
        setQuestView(view);
        navigate({ hash: `quests-${view}` }, { replace: true });
    };

    const { allCampaignEvents, featuredCampaigns } = useMemo(() => {
        const campaigns = events.filter((e): e is CampaignEvent => e.type === 'campaign');
        const projects = getProjects();
        
        const publicCampaigns = campaigns;

        const featuredIds = new Set(contentSettings.campaigns.featuredProjectIds);
        
        const featured = publicCampaigns.filter(c => {
            const project = projects.find(p => p.name === c.projectName);
            return project && featuredIds.has(project.id);
        });

        // If not enough featured, fill with most popular
        if (featured.length < 8) {
            const popular = [...publicCampaigns]
                .sort((a, b) => (b.entries?.length || 0) - (a.entries?.length || 0))
                .filter(c => !featured.some(f => f.id === c.id));
            featured.push(...popular.slice(0, 8 - featured.length));
        }
        
        return { allCampaignEvents: publicCampaigns, featuredCampaigns: featured.slice(0, 8) };
    }, [events, contentSettings]);

    // --- ProjectCampaignGroup Component ---
    interface ProjectCampaignGroupProps {
        project: Project | undefined;
        campaigns: CampaignEvent[];
        viewType: 'live' | 'upcoming' | 'ended';
    }
    const ProjectCampaignGroup: React.FC<ProjectCampaignGroupProps> = ({ project, campaigns, viewType }) => {
        const [isOpen, setIsOpen] = useState(false);
        const campaignCount = campaigns.length;
        const { currentUser } = useAuth();
        const { prefetch } = usePrefetch(getEventById);

        return (
            <div className="neu-card overflow-hidden">
                <button 
                    className="flex items-center p-4 cursor-pointer hover:bg-surface/30 transition-colors w-full text-left"
                    onClick={() => setIsOpen(!isOpen)}
                    role="button"
                    aria-expanded={isOpen}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsOpen(!isOpen)}
                >
                    {project ? (
                        <img src={project.logo} alt={project.name} className="w-12 h-12 rounded-full bg-surface" decoding="async" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center">
                            <Users size={24} className="text-primary"/>
                        </div>
                    )}
                    <div className="ml-4 flex-grow">
                        <h3 className="font-bold text-xl text-on-surface">{project?.name || 'Community Campaigns'}</h3>
                        <p className="text-sm text-on-surface-variant">{campaignCount} {viewType} campaign{campaignCount !== 1 ? 's' : ''}</p>
                    </div>
                    <ChevronDown 
                        size={24} 
                        className={`text-on-surface-variant transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                </button>
                <AnimatePresence>
                    {isOpen && (
                        <motion.section
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 border-t border-border/10 space-y-3">
                                {campaigns.map(campaign => {
                                    const dateInfo = getCampaignDateInfo(campaign, viewType);
                                    const userHasEntered = currentUser ? campaign.entries?.some(entry => entry.userId === currentUser.id) : false;
                                    return (
                                        <div key={campaign.id} className="neu-outset-card p-3" onMouseEnter={() => prefetch(campaign.id)}>
                                            {/* Line 1: Title & Button */}
                                            <div className="flex justify-between items-center gap-4">
                                                <div className="flex-grow flex items-center gap-2 min-w-0">
                                                    {userHasEntered && (
                                                        <span title="You have participated in this campaign">
                                                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                                                        </span>
                                                    )}
                                                    <p className="font-semibold text-on-surface truncate">{campaign.title}</p>
                                                </div>
                                                <button onClick={() => navigate(`/campaign/${campaign.id}`)} className="neu-button px-4 py-1.5 text-sm flex-shrink-0">
                                                    View
                                                </button>
                                            </div>
                                            {/* Line 2: Meta Info */}
                                            <div className="flex items-center gap-4 text-sm text-on-surface-variant mt-1">
                                                {dateInfo && <span className="font-semibold">{dateInfo}</span>}
                                                <span className="font-medium">{campaign.entries?.length || 0} Participants</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>
            </div>
        );
    };


    // --- QuestCard Component (now inside CampaignPage to use its scope) ---
    type DisplayableQuestItem = Quest & {
        isIdentity?: boolean;
        parentQuestId?: string;
        descriptionText: string;
        entryCount: number;
    };

    interface QuestCardProps {
        quest: DisplayableQuestItem;
    }

    const QuestCard: React.FC<QuestCardProps> = ({ quest }) => {
        const navigate = ReactRouterDOM.useNavigate();
        const isEnded = quest.status === 'past';
        const navigationPath = quest.isIdentity ? `/quest/${quest.parentQuestId}/identity` : `/quest/${quest.id}`;
        
        const imageForCategory = (category: string) => {
            switch(category) {
                case 'Gaming': return "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
                case 'Meme': return "https://images.pexels.com/photos/825947/pexels-photo-825947.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
                case 'Art': return "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
                // FIX: Corrected the case of 'identity' to 'Identity' to match the type definition.
                case 'Identity': return "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
                default: return `https://picsum.photos/seed/${quest.id}/400/400`;
            }
        };
        
        return (
            <div 
                onClick={() => navigate(navigationPath)}
                className="relative neu-outset-card flex flex-col h-full overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-1 group"
            >
                <div className="relative h-48 w-full">
                    <img src={imageForCategory(quest.category)} alt={quest.title} className="w-full h-full object-cover" decoding="async"/>
                    {isEnded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div 
                                className="absolute text-white font-black text-6xl uppercase tracking-widest border-4 border-white px-4 py-2 bg-black/30 backdrop-blur-sm"
                                style={{
                                    transform: 'rotate(-15deg)',
                                    textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
                                    fontFamily: "'Bebas Neue', cursive"
                                }}
                            >
                                DONE
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 flex flex-col flex-grow bg-surface/30">
                    <h3 className="font-bold text-lg text-on-surface mt-1 truncate group-hover:text-primary transition-colors">{quest.title}</h3>
                    <p className="text-sm text-on-surface-variant line-clamp-2 flex-grow mt-1">
                        {quest.descriptionText}
                    </p>
                    <div className="mt-3 pt-3 border-t border-border/10 flex items-center justify-end text-sm text-on-surface-variant">
                        <span className="font-semibold">{quest.entryCount} {quest.isIdentity ? 'Answers' : 'Entries'}</span>
                    </div>
                </div>
            </div>
        );
    };

    const searchSuggestions = useMemo(() => {
        if (!debouncedSearchTerm) return [];
        return allCampaignEvents
            .filter(c => fuzzySearch(debouncedSearchTerm, c.title))
            .slice(0, 5);
    }, [debouncedSearchTerm, allCampaignEvents]);

    const handleSearchSelect = (term: string) => {
        setSearchTerm(term);
        addSearchTerm(term);
        setIsSearchFocused(false);
    };

    const handleSearchSubmit = () => {
        addSearchTerm(searchTerm);
        setIsSearchFocused(false);
    };

    const finalCampaignGroups = useMemo(() => {
        let filteredCampaigns = allCampaignEvents;
        const allProjects = getProjects();
        const projectMap = new Map<string, Project>();
        allProjects.forEach(p => p.name && projectMap.set(p.name, p));

        if (debouncedSearchTerm) {
            filteredCampaigns = filteredCampaigns.filter(campaign => 
                fuzzySearch(debouncedSearchTerm, campaign.title) ||
                fuzzySearch(debouncedSearchTerm, campaign.description) ||
                (campaign.projectName && fuzzySearch(debouncedSearchTerm, campaign.projectName))
            );
        }

        if (activeCategory !== 'all') {
            filteredCampaigns = filteredCampaigns.filter(campaign => {
                if (!campaign.projectName) return false;
                const project = projectMap.get(campaign.projectName);
                return project ? project.category.includes(activeCategory) : false;
            });
        }
        
        if (rewardTypeFilter !== 'all') {
            filteredCampaigns = filteredCampaigns.filter(campaign => {
                const types = getRewardTypes(campaign.reward);
                return types.includes(rewardTypeFilter);
            });
        }
        
        const now = Date.now();
        const campaignsByStatus = {
            live: filteredCampaigns.filter(c => c.startTime <= now && c.endTime > now),
            upcoming: filteredCampaigns.filter(c => c.startTime > now),
            ended: filteredCampaigns.filter(c => c.endTime <= now)
        };
        
        const campaignsToGroup = campaignsByStatus[campaignView];
        const groupedByProject = new Map<string, { project: Project | undefined; campaigns: CampaignEvent[] }>();

        for (const campaign of campaignsToGroup) {
            const projectName = campaign.projectName || 'Community Campaigns';
            if (!groupedByProject.has(projectName)) {
                const project = allProjects.find(p => p.name === projectName);
                groupedByProject.set(projectName, { project, campaigns: [] });
            }
            groupedByProject.get(projectName)!.campaigns.push(campaign);
        }
        
        const groupedArray = Array.from(groupedByProject.values());

        return groupedArray.sort((a, b) => {
            switch (sortOption) {
                case 'name':
                    const nameA = a.project?.name || 'zzzz';
                    const nameB = b.project?.name || 'zzzz';
                    return nameA.localeCompare(nameB);
                case 'participants':
                    const participantsA = a.campaigns.reduce((sum, c) => sum + (c.entries?.length || 0), 0);
                    const participantsB = b.campaigns.reduce((sum, c) => sum + (c.entries?.length || 0), 0);
                    return participantsB - participantsA;
                case 'newest':
                    const newestStartA = Math.max(...a.campaigns.map(c => c.startTime));
                    const newestStartB = Math.max(...b.campaigns.map(c => c.startTime));
                    return newestStartB - newestStartA;
                case 'date':
                default:
                    if (campaignView === 'live') {
                        const earliestEndA = Math.min(...a.campaigns.map(c => c.endTime));
                        const earliestEndB = Math.min(...b.campaigns.map(c => c.endTime));
                        return earliestEndA - earliestEndB;
                    }
                    if (campaignView === 'upcoming') {
                        const earliestStartA = Math.min(...a.campaigns.map(c => c.startTime));
                        const earliestStartB = Math.min(...b.campaigns.map(c => c.startTime));
                        return earliestStartA - earliestStartB;
                    }
                    if (campaignView === 'ended') {
                        const latestEndA = Math.max(...a.campaigns.map(c => c.endTime));
                        const latestEndB = Math.max(...b.campaigns.map(c => c.endTime));
                        return latestEndB - latestEndA;
                    }
                    return 0;
            }
        });
    }, [allCampaignEvents, campaignView, debouncedSearchTerm, activeCategory, sortOption, rewardTypeFilter]);

    const { paginatedGroups, totalPages } = useMemo(() => {
        const total = finalCampaignGroups.length;
        const pages = Math.ceil(total / pageSize);
        const paginated = finalCampaignGroups.slice(
            currentPage * pageSize,
            (currentPage + 1) * pageSize
        );
        return { paginatedGroups: paginated, totalPages: pages };
    }, [finalCampaignGroups, currentPage, pageSize]);
    
    useEffect(() => {
        setCurrentPage(0);
    }, [campaignView, debouncedSearchTerm, activeCategory, sortOption, rewardTypeFilter, pageSize]);

    const getSortDateLabel = () => {
        switch (campaignView) {
            case 'live': return 'Ending Soonest';
            case 'upcoming': return 'Starting Soonest';
            case 'ended': return 'Ended Most Recently';
            default: return 'Default';
        }
    };

    // Memoized Data for Quests (unrolled)
    const displayedQuests = useMemo(() => {
        const relevantQuests = questView === 'ongoing'
            ? quests.filter(q => q.status === 'ongoing')
            : quests.filter(q => q.status === 'past').sort((a, b) => b.endTime - a.endTime);

        const displayItems: DisplayableQuestItem[] = [];

        relevantQuests.forEach(quest => {
            displayItems.push({
                ...quest,
                descriptionText: `Weekly community quest for the best ${quest.category} submissions.`,
                entryCount: quest.entries?.length || 0,
            });
            
            if (quest.identityQuestion && quest.identityQuestion.title) {
                displayItems.push({
                    ...quest,
                    id: `${quest.id}-identity`,
                    parentQuestId: quest.id,
                    title: quest.identityQuestion.title,
                    category: 'Identity',
                    isIdentity: true,
                    descriptionText: quest.identityQuestion.prompt,
                    entryCount: quest.identityQuestion.answers?.length || 0,
                    entries: [] 
                });
            }
        });

        return displayItems;
    }, [quests, questView]);


    return (
        <div className="max-w-[84rem] mx-auto w-full flex flex-col gap-12">
            <div className="neu-inset-panel mb-8 p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center gap-8">
                <div className="flex-shrink-0 w-full sm:w-1/3 text-center sm:text-left">
                    <h1 className="text-4xl sm:text-5xl font-display font-bold text-on-surface">
                        {contentSettings.campaigns.title}
                    </h1>
                    <p className="text-lg text-on-surface-variant mt-2 max-w-sm mx-auto sm:mx-0">
                        {contentSettings.campaigns.subtitle}
                    </p>
                </div>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {featuredCampaigns.map(campaign => (
                        <ReactRouterDOM.Link
                            key={campaign.id}
                            to={`/campaign/${campaign.id}`}
                            className="relative aspect-square neu-outset-card p-0 group transition-transform duration-200 hover:scale-105 overflow-hidden rounded-md"
                        >
                            <img
                                src={campaign.image}
                                alt={campaign.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                                <p className="font-bold text-white text-xs text-center truncate drop-shadow-md">{campaign.title}</p>
                            </div>
                        </ReactRouterDOM.Link>
                    ))}
                </div>
            </div>
            {/* Weekly Quest Section */}
            <section id="quests">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <div>
                <h2 className="text-3xl font-display font-bold tracking-tight text-on-background">Weekly Quest</h2>
                <p className="text-lg font-subheading text-on-background-variant">Submit your highlights and vote for the best content!</p>
                </div>
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <button onClick={() => handleSetQuestView('ongoing')} className={`neu-button px-4 py-1.5 text-base font-display ${questView === 'ongoing' ? 'active' : ''}`}>
                    Ongoing
                </button>
                <button onClick={() => handleSetQuestView('past')} className={`neu-button px-4 py-1.5 text-base font-display ${questView === 'past' ? 'active' : ''}`}>
                    Past
                </button>
                </div>
            </div>
            {displayedQuests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayedQuests.map(quest => (
                            <QuestCard key={quest.id} quest={quest} />
                        ))}
                    </div>
                ) : (
                    <div className="neu-card p-8 text-center text-on-background-variant">
                        No {questView} quest available right now. Check back soon!
                    </div>
                )}
            </section>
            
            {/* Campaign Section */}
            <section id="campaigns">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-display font-bold tracking-tight text-on-background">Campaigns</h2>
                    <p className="text-lg font-subheading text-on-background-variant">Track all ongoing and upcoming community campaigns.</p>
                </div>
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    <button onClick={() => handleSetCampaignView('live')} className={`neu-button px-4 py-1.5 text-base font-display ${campaignView === 'live' ? 'active' : ''}`}>
                        Live
                    </button>
                    <button onClick={() => handleSetCampaignView('upcoming')} className={`neu-button px-4 py-1.5 text-base font-display ${campaignView === 'upcoming' ? 'active' : ''}`}>
                        Upcoming
                    </button>
                    <button onClick={() => handleSetCampaignView('ended')} className={`neu-button px-4 py-1.5 text-base font-display ${campaignView === 'ended' ? 'active' : ''}`}>
                        Ended
                    </button>
                </div>
                </div>

                <div className="mb-6 p-4 neu-card flex flex-col md:flex-row gap-4 items-center justify-between flex-wrap">
                    <div ref={searchWrapperRef} className="relative w-full md:w-auto md:max-w-xs">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { handleSearchSubmit(); } }}
                            className="neu-inset-control w-full pl-12 pr-4 py-2 text-on-surface placeholder:text-on-surface-variant/70 text-base"
                            aria-label="Search campaigns"
                        />
                         <AnimatePresence>
                            {isSearchFocused && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
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
                                            {searchSuggestions.map(c => <button key={c.id} onClick={() => handleSearchSelect(c.title)} className="w-full text-left px-3 py-2 hover:bg-primary/10 truncate">{c.title}</button>)}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="flex items-center gap-x-4 gap-y-2 flex-wrap justify-start md:justify-end">
                        <div className="flex items-center gap-2">
                            <label htmlFor="category-filter" className="text-sm font-semibold text-on-surface-variant flex-shrink-0">Category:</label>
                            <select
                                id="category-filter"
                                value={activeCategory}
                                onChange={(e) => setActiveCategory(e.target.value as any)}
                                className="neu-control neu-select px-3 py-1.5 text-sm font-sans font-semibold"
                            >
                                <option value="all">All</option>
                                {allProjectCategories.map(cat => (
                                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label htmlFor="reward-filter" className="text-sm font-semibold text-on-surface-variant flex-shrink-0">Reward:</label>
                            <select
                                id="reward-filter"
                                value={rewardTypeFilter}
                                onChange={(e) => setRewardTypeFilter(e.target.value as any)}
                                className="neu-control neu-select px-3 py-1.5 text-sm font-sans font-semibold"
                            >
                                <option value="all">All</option>
                                <option value="currency">Currency</option>
                                <option value="role">Role</option>
                                <option value="points">Points</option>
                                <option value="token">Token</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label htmlFor="sort-filter" className="text-sm font-semibold text-on-surface-variant flex-shrink-0">Sort by:</label>
                            <select
                                id="sort-filter"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value as any)}
                                className="neu-control neu-select px-3 py-1.5 text-sm font-sans font-semibold"
                            >
                                <option value="date">{getSortDateLabel()}</option>
                                <option value="newest">Newest</option>
                                <option value="participants">Most Participants</option>
                                <option value="name">Project Name (A-Z)</option>
                            </select>
                        </div>
                    </div>
                </div>


                {isLoading ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => <ProjectCampaignGroupSkeleton key={i} />)}
                    </div>
                ) : paginatedGroups.length > 0 ? (
                    <>
                        {/* Mobile view (1 column) */}
                        <div className="grid grid-cols-1 gap-6 md:hidden">
                            {paginatedGroups.map(({ project, campaigns }) => (
                                <ProjectCampaignGroup
                                    key={project?.id || 'community-campaigns'}
                                    project={project}
                                    campaigns={campaigns}
                                    viewType={campaignView}
                                />
                            ))}
                        </div>

                        {/* Tablet view (2 columns) */}
                        <div className="hidden md:flex xl:hidden gap-6">
                            {Array.from({ length: 2 }).map((_, colIndex) => (
                                <div key={colIndex} className="w-1/2 flex flex-col gap-6">
                                    {paginatedGroups
                                        .filter((_, itemIndex) => itemIndex % 2 === colIndex)
                                        .map(({ project, campaigns }) => (
                                            <ProjectCampaignGroup
                                                key={project?.id || 'community-campaigns'}
                                                project={project}
                                                campaigns={campaigns}
                                                viewType={campaignView}
                                            />
                                        ))}
                                </div>
                            ))}
                        </div>
                        
                        {/* Desktop view (3 columns) */}
                        <div className="hidden xl:flex gap-6">
                            {Array.from({ length: 3 }).map((_, colIndex) => (
                                <div key={colIndex} className="w-1/3 flex flex-col gap-6">
                                    {paginatedGroups
                                        .filter((_, itemIndex) => itemIndex % 3 === colIndex)
                                        .map(({ project, campaigns }) => (
                                            <ProjectCampaignGroup
                                                key={project?.id || 'community-campaigns'}
                                                project={project}
                                                campaigns={campaigns}
                                                viewType={campaignView}
                                            />
                                        ))}
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8">
                            <PaginationControls 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                pageSize={pageSize}
                                onPageSizeChange={setPageSize}
                                totalItems={finalCampaignGroups.length}
                                pageSizeOptions={[12, 24, 48]}
                            />
                        </div>
                    </>
                ) : (
                    <EmptyState
                        icon={<Inbox size={48} />}
                        title="No Campaigns Found"
                        description="Your search and filter combination did not return any results. Try adjusting your criteria."
                    />
                )}
            </section>
        </div>
    );
};

export default CampaignPage;