import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { getEvents, enterCampaign, voteCampaignEntry, getProjects, getUsers } from '../src/services/dataService';
import { CampaignEvent, Project, CampaignEntry, User, CampaignTimelineItem } from '../src/types';
import GiveawayDetailView from '../components/events/GiveawayDetailView';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Send, Trophy, Calendar, Globe, Tag, ChevronDown, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getCampaignStatus = (campaign: CampaignEvent): { text: string; color: string, textColor: string } => {
    const now = Date.now();
    if (now < campaign.startTime) return { text: "Upcoming", color: "bg-blue-100", textColor: "text-blue-800" };
    if (now > campaign.endTime) return { text: "Ended", color: "bg-gray-200", textColor: "text-gray-700" };
    return { text: "Live", color: "bg-green-100", textColor: "text-green-800" };
};

// --- NEW DetailsTab Component ---
const DetailsTab: React.FC<{ campaign: CampaignEvent }> = ({ campaign }) => {
    const { details, description } = campaign;
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    const sections = useMemo(() => {
        if (!details) return [];
        return [
            { id: 'introduction', title: 'Introduction', content: details.introduction },
            { id: 'timeline', title: 'Timeline', content: details.timeline },
            { id: 'eligibility', title: 'Eligibility', content: details.eligibility },
            { id: 'tracks', title: 'Tracks', content: details.tracks },
            { id: 'resources', title: 'Resources and Support', content: details.resourcesAndSupport },
            { id: 'about', title: 'About us', content: details.aboutUs },
        ].filter(section => section.content);
    }, [details]);

    const [activeSection, setActiveSection] = useState(sections.length > 0 ? sections[0].id : '');

    useEffect(() => {
        const scrollContainer = document.querySelector('main');
        if (!scrollContainer || sections.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { root: scrollContainer, rootMargin: '-40% 0px -59% 0px', threshold: 0 }
        );

        sections.forEach(section => {
            const el = sectionRefs.current[section.id];
            if (el) observer.observe(el);
        });

        return () => {
            sections.forEach(section => {
                const el = sectionRefs.current[section.id];
                if (el) observer.unobserve(el);
            });
        };
    }, [sections]);

    if (!details) {
        return (
            <div className="prose prose-invert max-w-none text-on-surface-variant p-4">
                <p>{description}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 p-4">
            <aside className="w-full md:w-1/4 lg:w-1/5 md:sticky top-24 self-start">
                <h3 className="font-bold text-sm uppercase text-on-surface-variant/70 tracking-wider mb-4">OUTLINE</h3>
                <nav>
                    <ul className="space-y-3">
                        {sections.map(section => (
                            <li key={section.id}>
                                <a 
                                    href={`#${section.id}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        sectionRefs.current[section.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className={`block font-semibold transition-colors text-lg ${activeSection === section.id ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                                >
                                    {section.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            <div className="w-full md:w-3/4 lg:w-4/5 space-y-8">
                {sections.map(section => (
                    <section 
                        key={section.id} 
                        id={section.id} 
                        ref={el => { sectionRefs.current[section.id] = el; }}
                        className="neu-outset-card p-6 rounded-lg"
                    >
                        <h2 className="text-3xl font-bold font-display text-on-surface mb-4">{section.title}</h2>
                        {Array.isArray(section.content) ? (
                            <div className="relative pl-6 border-l-2 border-primary/20">
                                {(section.content as CampaignTimelineItem[]).map((item, index) => (
                                    <div key={index} className="relative mb-6">
                                        <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-primary border-4 border-[rgb(var(--color-background))]"></div>
                                        <p className="font-bold text-on-surface">{item.label}</p>
                                        <p className="text-sm text-on-surface-variant">{item.date}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">{section.content}</p>
                        )}
                    </section>
                ))}
            </div>
        </div>
    );
};

// --- NEW SubmissionForm Component ---
const SubmissionForm: React.FC<{ campaign: CampaignEvent, onEnter: (link: string) => void }> = ({ campaign, onEnter }) => {
    const [link, setLink] = useState('');
    const { currentUser } = useAuth();
    const isLive = Date.now() >= campaign.startTime && Date.now() <= campaign.endTime;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (link.trim()) {
            onEnter(link);
            setLink('');
        }
    };

    if (!isLive) return null;

    if (!currentUser) {
        return (
            <div className="text-center neu-card p-6 mb-6">
                <p className="font-semibold text-on-surface-variant">Connect your wallet to submit an entry.</p>
            </div>
        );
    }
    
    const hasUserEntered = campaign.entries?.some(e => e.userId === currentUser.id);

    if (hasUserEntered) {
        return (
            <div className="text-center neu-card p-6 mb-6">
                <p className="font-semibold text-green-500">You've successfully submitted an entry!</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-3 neu-card p-4 mb-6">
            <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://your-submission-link.com"
                className="neu-inset-control w-full px-4 py-2"
                required
            />
            <button type="submit" className="neu-button active flex-shrink-0 flex items-center gap-2 px-6 py-2">
                <Send size={18} />
                <span>Submit</span>
            </button>
        </form>
    );
};


// --- MAIN PAGE COMPONENT ---
export default function CampaignDetailPage() {
    const { id } = ReactRouterDOM.useParams();
    const navigate = ReactRouterDOM.useNavigate();
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const [dataVersion, setDataVersion] = useState(0);
    const [activeTab, setActiveTab] = useState<'submissions' | 'details'>('submissions');
    const [isTimelineOpen, setIsTimelineOpen] = useState(true);
    const [isPrizeDetailsOpen, setIsPrizeDetailsOpen] = useState(false);


    const [campaign, setCampaign] = useState<CampaignEvent | null>(null);
    const [project, setProject] = useState<Project | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            const events = await getEvents();
            const campaignData = events.find(e => e.id === id && e.type === 'campaign') as CampaignEvent | undefined;
            if (campaignData) {
                setCampaign(campaignData);
                const projects = await getProjects();
                const projectData = projects.find(p => p.name === campaignData.projectName);
                setProject(projectData || null);
            }
        };
        fetchData();
    }, [id, dataVersion]);

    const handleEnterCampaign = async (link: string) => {
        if (!campaign || !currentUser) return;
        const result = await enterCampaign(campaign.id, currentUser.id, link);
        addToast(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            setDataVersion(v => v + 1); // Refresh data
        }
    };
    
    const handleVote = async (entryId: string, vote: 'up' | 'down') => {
        if (!campaign || !currentUser) {
            addToast('Please connect your wallet to vote.', 'info');
            return;
        }
        const result = await voteCampaignEntry(entryId, currentUser.id, vote);
        addToast(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            setDataVersion(v => v + 1); // Refresh data
        }
    };

    const { prizeValue, prizeCurrency } = useMemo(() => {
        if (!campaign) return { prizeValue: null, prizeCurrency: null };
        const reward = campaign.reward || '';
        const match = reward.match(/(\$|€|£)?\s*([0-9,]+(?:\.[0-9]+)?)/);
        if (match) {
            const value = match[2];
            const currencyMatch = reward.match(/(USDC|USD|ETH|SOL)/i);
            const currency = currencyMatch ? currencyMatch[0].toUpperCase() : 'USD';
            return { prizeValue: value, prizeCurrency: currency };
        }
        return { prizeValue: null, prizeCurrency: null };
    }, [campaign]);

    const timelineItems = useMemo(() => {
        if (!campaign) return [];
        const items = [];
        if (campaign.details?.timeline) {
            items.push(...campaign.details.timeline);
        } else {
             items.push({ label: 'Submission Starts', date: new Date(campaign.startTime).toISOString() });
             items.push({ label: 'Deadline', date: new Date(campaign.endTime).toISOString() });
        }
        return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [campaign]);

    const formatDateForTimeline = (dateString: string) => {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString; 
        const pad = (num: number) => num.toString().padStart(2, '0');
        return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
     const formatShortDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    };


    if (!campaign) {
        return (
            <div className="text-center py-10 max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-on-surface">Campaign not found</h2>
                 <button onClick={() => navigate('/campaigns')} className="mt-4 neu-button px-4 py-2 flex items-center gap-2 mx-auto">
                    <ArrowLeft size={16} />
                    Back to Campaigns
                </button>
            </div>
        );
    }
    
    const status = getCampaignStatus(campaign);
    const duration = `${formatShortDate(campaign.startTime)} - ${formatShortDate(campaign.endTime)}`;


    return (
        <div className="space-y-8">
            {/* New Hero */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 relative rounded-2xl overflow-hidden shadow-lg aspect-[16/10]">
                     <img src={campaign.image} alt={campaign.title} className="absolute inset-0 w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                     <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-display font-extrabold drop-shadow-lg leading-tight">{campaign.title}</h1>
                            <p className="mt-2 text-lg md:text-xl max-w-xl opacity-90">{campaign.description}</p>
                        </div>
                     </div>
                     <div className="absolute bottom-0 left-0 right-0 p-8 pt-0 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="mt-8 pt-4 border-t border-white/20 flex items-center gap-8 text-sm text-white">
                            <div>
                                <p className="opacity-70 flex items-center gap-1.5"><Trophy size={14}/> Prize Pool</p>
                                <p className="font-bold text-lg">{(campaign.reward || '').split(" ")[0]}</p>
                            </div>
                             <div>
                                <p className="opacity-70 flex items-center gap-1.5"><Calendar size={14}/> Duration</p>
                                <p className="font-bold text-lg">{duration}</p>
                            </div>
                             <div>
                                <p className="opacity-70 flex items-center gap-1.5"><Globe size={14}/> Location</p>
                                <p className="font-bold text-lg">Online</p>
                            </div>
                        </div>
                     </div>
                </div>
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg flex flex-col text-gray-800 divide-y divide-gray-200">
                    <div className="p-6">
                        <button 
                            onClick={() => setIsPrizeDetailsOpen(!isPrizeDetailsOpen)} 
                            className="w-full flex justify-between items-center text-left disabled:cursor-default group"
                            disabled={!campaign.details?.prizes}
                        >
                            <h3 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <Trophy size={16} /> Prize Pool
                            </h3>
                            {campaign.details?.prizes && (
                                <ChevronDown size={20} className={`text-gray-400 transition-transform group-hover:text-gray-600 ${isPrizeDetailsOpen ? 'rotate-180' : ''}`} />
                            )}
                        </button>
                        <div className="mt-2">
                             {prizeValue ? (
                                <p className="text-4xl font-bold text-orange-500">
                                    {prizeValue} <span className="text-3xl text-gray-500">{prizeCurrency}</span>
                                </p>
                            ) : (
                                <p className="text-lg font-semibold text-gray-700">{campaign.reward || ''}</p>
                            )}
                        </div>
                        <AnimatePresence>
                            {isPrizeDetailsOpen && campaign.details?.prizes && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                    animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="text-sm text-gray-600 whitespace-pre-wrap border-t border-gray-200 pt-4">
                                        {campaign.details.prizes}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="p-6">
                        <button onClick={() => setIsTimelineOpen(!isTimelineOpen)} className="w-full flex justify-between items-center text-left">
                             <h3 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <Calendar size={16} /> Event Timeline
                            </h3>
                             <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${status.color} ${status.textColor}`}>{status.text}</span>
                                <ChevronDown size={20} className={`text-gray-400 transition-transform ${isTimelineOpen ? 'rotate-180' : ''}`} />
                            </div>
                        </button>
                         <AnimatePresence>
                            {isTimelineOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                    animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-3">
                                        {timelineItems.map((item, index) => {
                                            const isExtended = item.label.toLowerCase().includes('extended');
                                            return (
                                                <div key={index} className="flex justify-between items-center text-sm">
                                                    <p className="font-medium text-gray-600">{item.label}</p>
                                                    <p className={`font-mono ${isExtended ? 'text-red-500 font-bold' : 'text-gray-500'}`}>{formatDateForTimeline(item.date)}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            )}
                         </AnimatePresence>
                    </div>

                    <div className="p-6">
                        <h3 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <Globe size={16} /> Location
                        </h3>
                         <p className="mt-2 font-semibold text-gray-700">Virtual</p>
                    </div>
                    
                    <div className="p-6">
                        <h3 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <Tag size={16} /> Tags
                        </h3>
                         <div className="mt-2 flex flex-wrap gap-2">
                            <span className="text-xs font-bold px-2 py-1 rounded bg-orange-100 text-orange-800 capitalize">{campaign.category}</span>
                         </div>
                    </div>
                     {project && (
                         <div className="p-6">
                            <h3 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <Briefcase size={16} /> Organizer
                            </h3>
                            <ReactRouterDOM.Link to={`/${project.name.toLowerCase()}`} className="mt-2 font-semibold text-gray-700 hover:text-primary transition-colors flex items-center gap-2">
                                <img src={project.logo} alt={project.name} className="w-6 h-6 rounded-full" />
                                {project.name}
                            </ReactRouterDOM.Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="px-8 sm:px-16 lg:px-24">
                <div className="neu-card p-4">
                    <div className="flex border-b border-border/10 mb-4">
                        <button onClick={() => setActiveTab('submissions')} className={`neu-tab-button ${activeTab === 'submissions' ? 'active' : ''}`}>Submissions ({campaign.entries?.length || 0})</button>
                        <button onClick={() => setActiveTab('details')} className={`neu-tab-button ${activeTab === 'details' ? 'active' : ''}`}>Details</button>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'submissions' ? (
                                <div className="space-y-6">
                                    <SubmissionForm campaign={campaign} onEnter={handleEnterCampaign} />
                                    <GiveawayDetailView campaign={campaign as any} submissions={campaign.entries as any || []} onVote={handleVote} />
                                </div>
                            ) : (
                                <DetailsTab campaign={campaign} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}