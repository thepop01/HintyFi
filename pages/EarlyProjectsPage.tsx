import React, { useState, useMemo, useEffect } from 'react';
import { getProjects, getUsers } from '../src/services/dataService';
import { Project, ProjectCategory, User } from '../src/types';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Globe, ArrowUp, ArrowDown, Crown } from 'lucide-react';
import { Dna, Gem, Gamepad2, Users as UsersIcon, Repeat, Building, Layers, Wallet, Cpu, BrainCircuit, Flame, Rocket, TrendingUp, MessageCircle, Wrench, Shield, Code, Eye, Package, Dice6, Vote, BarChart3, Gamepad, UserCheck } from 'lucide-react';
import { fuzzySearch } from '../utils/helpers';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';

const XSocialIcon: React.FC = () => (
    <div className="bg-black w-full h-full rounded-md flex items-center justify-center p-1.5">
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-current text-white"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
    </div>
);

const DiscordIcon: React.FC = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-current text-[#5865F2]"><title>Discord</title><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4464.8257-.618 1.2295a18.298 18.298 0 00-5.4849 0c-.1716-.4038-.407-.8542-.618-1.2295a.0741.0741 0 00-.0785-.0371 19.7363 19.7363 0 00-4.8851 1.5152.0699.0699 0 00-.0321.027c-3.3757 5.9272-3.3757 11.7582 0 17.6854a.0699.0699 0 00.0321.027c1.5872.4839 3.1632.844 4.8851 1.05.0741.0053.1328-.0213.1593-.0838.2215-.5533.432-1.1281.5937-1.7292a.0741.0741 0 00-.0426-.0891 16.5913 16.5913 0 01-1.4239-.8199.0741.0741 0 01-.0053-.1064c.2057-.2825.401-.5754.578-.8578a.0741.0741 0 01.0991-.0106c.0053.0053.0106.0053.0159.0106 2.3051 1.2825 4.9543 1.2825 7.2594 0 .0053-.0053.0106-.0053.0159-.0106a.0741.0741 0 01.0991.0106c.177.2824.3723.5753.578.8578a.0741.0741 0 01-.0053.1064 16.5913 16.5913 0 01-1.4239.8199.0741.0741 0 00-.0426.0891c.1617.6011.3722 1.1759.5937 1.7292.0266.0625.0852.0891.1593.0838 1.7219-.206 3.2979-.5661 4.8851-1.05a.0699.0699 0 00.0321-.027c3.3757-5.9272 3.3757-11.7582 0-17.6854a.0699.0699 0 00-.0321-.027zm-5.4232 12.336c-1.3813 0-2.5024-1.1636-2.5024-2.5929s1.1211-2.5929 2.5024-2.5929c1.3813 0 2.5024 1.1636 2.5024 2.5929s-1.1211 2.5929-2.5024 2.5929zm-5.3283 0c-1.3813 0-2.5024-1.1636-2.5024-2.5929s1.1211-2.5929 2.5024-2.5929c1.3813 0 2.5024 1.1636 2.5024 2.5929 0 1.4293-1.1211 2.5929-2.5024 2.5929z"/></svg>
);

const allCategories: ProjectCategory[] = ['defi', 'dex', 'nft', 'gaming', 'rwa', 'infrastructure', 'wallet', 'depin', 'ai', 'meme', 'launchpad', 'prediction market', 'social', 'other infra', 'identity', 'dev tooling', 'privacy', 'other apps', 'betting', 'governance', 'analytics', 'gaming infra', 'account abstraction'];
const categoryConfig: Record<ProjectCategory, { icon: React.ReactElement<{ size?: number | string; className?: string }>; label: string }> = {
    defi: { icon: <Dna size={14} />, label: 'DeFi' },
    dex: { icon: <Repeat size={14} />, label: 'DEX' },
    nft: { icon: <Gem size={14} />, label: 'NFT' },
    gaming: { icon: <Gamepad2 size={14} />, label: 'Gaming' },

    rwa: { icon: <Building size={14} />, label: 'RWA' },
    infrastructure: { icon: <Layers size={14} />, label: 'Infrastructure' },
    wallet: { icon: <Wallet size={14} />, label: 'Wallets' },
    depin: { icon: <Cpu size={14} />, label: 'DePIN' },
    ai: { icon: <BrainCircuit size={14} />, label: 'AI' },
    meme: { icon: <Flame size={14} />, label: 'Meme' },
    launchpad: { icon: <Rocket size={14} />, label: 'Launchpad' },
    'prediction market': { icon: <TrendingUp size={14} />, label: 'Prediction Market' },
    social: { icon: <MessageCircle size={14} />, label: 'Social' },
    'other infra': { icon: <Wrench size={14} />, label: 'Other Infra' },
    identity: { icon: <UserCheck size={14} />, label: 'Identity' },
    'dev tooling': { icon: <Code size={14} />, label: 'Dev Tooling' },
    privacy: { icon: <Shield size={14} />, label: 'Privacy' },
    'other apps': { icon: <Package size={14} />, label: 'Other Apps' },
    betting: { icon: <Dice6 size={14} />, label: 'Betting' },
    governance: { icon: <Vote size={14} />, label: 'Governance' },
    analytics: { icon: <BarChart3 size={14} />, label: 'Analytics' },
    'gaming infra': { icon: <Gamepad size={14} />, label: 'Gaming Infra' },
    'account abstraction': { icon: <Eye size={14} />, label: 'Account Abstraction' },
};

const EarlyProjectsPage: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const projectsData = await getProjects();
                const earlyProjects = projectsData.filter(p => p.stage === 'Early');
                setProjects(earlyProjects);
                const usersData = await getUsers();
                setAllUsers(usersData);
            } catch (error) {
                console.error("Error fetching early projects data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const usersByName = useMemo(() => {
        const map = new Map<string, User>();
        allUsers.forEach(user => {
            if (user && user.name) {
                map.set(user.name.toLowerCase(), user);
            }
        });
        return map;
    }, [allUsers]);

    const filteredAndSortedProjects = useMemo(() => {
        let filtered = projects.filter(p => p && p.name && p.category);

        if (searchTerm) {
            filtered = filtered.filter(p => fuzzySearch(searchTerm, p.name));
        }
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(p => p.category && Array.isArray(p.category) && p.category.includes(categoryFilter as ProjectCategory));
        }

        return [...filtered].sort((a, b) => {
            const nameA = a.name ? a.name.toLowerCase() : '';
            const nameB = b.name ? b.name.toLowerCase() : '';
            if (sortDirection === 'asc') {
                return nameA.localeCompare(nameB);
            }
            return nameB.localeCompare(nameA);
        });

    }, [projects, searchTerm, categoryFilter, sortDirection]);

    const toggleSort = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-96"><Loader /></div>;
    }

    return (
        <div className="max-w-5xl mx-auto">
            <header className="mb-8">
                <h1 className="text-4xl font-bold font-display text-on-background">Early Projects</h1>
                <p className="text-lg text-on-background-variant mt-1">An exclusive look at new projects with high potential, currently in their early stage.</p>
            </header>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/10">
                <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="neu-inset-input w-full pl-9"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm font-semibold text-on-surface-variant whitespace-nowrap">Filter by:</span>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="neu-control neu-select w-full"
                    >
                        <option value="all">All Categories</option>
                        {allCategories.map(cat => <option key={cat} value={cat}>{categoryConfig[cat].label}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm font-semibold text-on-surface-variant whitespace-nowrap">Sort by:</span>
                    <button onClick={toggleSort} className="neu-button active w-full flex items-center justify-center gap-2">
                        <span>Name</span>
                        {sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {filteredAndSortedProjects.length > 0 ? (
                    filteredAndSortedProjects.map((project, index) => (
                        <div key={project.id} className="relative">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className=""
                            >
                                <Link to={`/${project.name ? project.name.toLowerCase() : project.id || ''}`} className="block bg-white/50 rounded-xl shadow-md p-4 neu-outset-card hover:!shadow-outset-lg-hover hover:-translate-y-0.5 transition-all duration-200">
                                    <div className="flex flex-col md:flex-row items-start gap-6">
                                        {/* Left Column */}
                                        <div className="flex-shrink-0 w-full md:w-40 text-center flex flex-row md:flex-col items-center gap-4">
                                            <div className="w-20 h-20 md:w-32 md:h-32 bg-[rgb(var(--color-accent))] rounded-full flex items-center justify-center p-1 neu-shadow-inset-sm flex-shrink-0 overflow-hidden">
                                                <img src={project.logo} alt={project.name} className="w-full h-full object-cover rounded-full" />
                                            </div>
                                            <div className="text-left md:text-center">
                                                <h2 className="font-bold text-xl text-on-surface">{project.name}</h2>
                                                <div className="flex flex-wrap justify-start md:justify-center gap-2 mt-2">
                                                    {Array.isArray(project.category) ? project.category.map(cat => {
                                                        const categoryInfo = categoryConfig[cat];
                                                        if (!categoryInfo) {
                                                            console.warn(`Category "${cat}" not found in categoryConfig for project "${project.name || project.id || 'unknown'}"`);
                                                            return null;
                                                        }
                                                        return (
                                                            <div key={cat} className="flex items-center gap-1 text-xs text-on-surface-variant font-semibold">
                                                                {React.cloneElement(categoryInfo.icon, { className: 'text-current' })}
                                                                <span>{categoryInfo.label}</span>
                                                            </div>
                                                        );
                                                    }) : <div className="text-xs text-on-surface-variant font-semibold">No categories</div>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className="flex-grow">
                                            <p className="text-on-surface-variant leading-relaxed">{project.longDescription || project.description || 'No description available'}</p>
                                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-black/10">
                                                <div className="flex items-center gap-2">
                                                    {project.links && project.links.websites && Array.isArray(project.links.websites) && project.links.websites.map((site, i) => (
                                                         <a key={i} href={site.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="neu-inset-control w-8 h-8 p-1.5 flex items-center justify-center" title={site.label}><Globe size={18} /></a>
                                                    ))}
                                                    {project.links && project.links.twitter && <a href={project.links.twitter} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="neu-inset-control w-8 h-8 p-1 flex items-center justify-center" title="X (Twitter)"><XSocialIcon /></a>}
                                                    {project.links && project.links.discord && <a href={project.links.discord} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="neu-inset-control w-8 h-8 p-1 flex items-center justify-center" title="Discord"><DiscordIcon /></a>}
                                                </div>
                                                <div className="flex items-center -space-x-2">
                                                    {(project.team || []).slice(0, 3).map(member => {
                                                        const user = usersByName.get(member.name.toLowerCase());
                                                        const photo = member.photoUrl || user?.profile_pic_url || `https://i.pravatar.cc/32?u=${member.name}`;
                                                        return <img key={member.name} src={photo} alt={member.name} title={member.name} className="w-8 h-8 rounded-full border-2 border-white bg-surface" />;
                                                    })}
                                                    {(project.team?.length || 0) > 3 && (
                                                        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold border-2 border-white">
                                                            +{(project.team?.length || 0) - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        </div>
                    ))
                ) : (
                    <EmptyState 
                        title="No Projects Found"
                        description="There are currently no early projects to display. Please check back later for new and upcoming projects."
                    />
                )}
            </div>
        </div>
    );
};

export default EarlyProjectsPage;