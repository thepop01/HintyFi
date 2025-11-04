import React, { useMemo, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, NftCollection } from '../../src/types';
type PerkType = 'Airdrop' | 'GTD' | 'FCFS' | 'Free Mint';
type NftPerk = {
    holdingRequirement: {
        count: number;
        collectionName?: string;
        projectName?: string;
    };
    perk: {
        type: PerkType;
        description: string;
        grantingProjectName?: string;
        grantingProjectImage?: string;
    };
};
type DisplayCollection = NftCollection & { perks: NftPerk[], projectName: string };
import { getProjects } from '../../src/services/dataService';
import { Globe, ArrowRight, Award, FileText, Gem, UserCheck, Banknote, ChevronDown } from 'lucide-react';

const XSocialIcon = () => (
    <div className="bg-black w-5 h-5 rounded-md flex items-center justify-center">
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 fill-current text-white"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
    </div>
);

const DiscordIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current"><title>Discord</title><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4464.8257-.618 1.2295a18.298 18.298 0 00-5.4849 0c-.1716-.4038-.407-.8542-.618-1.2295a.0741.0741 0 00-.0785-.0371 19.7363 19.7363 0 00-4.8851 1.5152.0699.0699 0 00-.0321.027c-3.3757 5.9272-3.3757 11.7582 0 17.6854a.0699.0699 0 00.0321.027c1.5872.4839 3.1632.844 4.8851 1.05.0741.0053.1328-.0213.1593-.0838.2215-.5533.432-1.1281.5937-1.7292a.0741.0741 0 00-.0426-.0891 16.5913 16.5913 0 01-1.4239-.8199.0741.0741 0 01-.0053-.1064c.2057-.2825.401-.5754.578-.8578a.0741.0741 0 01.0991-.0106c.0053.0053.0106.0053.0159.0106 2.3051 1.2825 4.9543 1.2825 7.2594 0 .0053-.0053.0106-.0053.0159-.0106a.0741.0741 0 01.0991.0106c.177.2824.3723.5753.578.8578a.0741.0741 0 01-.0053.1064 16.5913 16.5913 0 01-1.4239.8199.0741.0741 0 00-.0426.0891c.1617.6011.3722 1.1759.5937 1.7292.0266.0625.0852.0891.1593.0838 1.7219-.206 3.2979-.5661 4.8851-1.05a.0699.0699 0 00.0321-.027c-3.3757-5.9272 3.3757-11.7582 0-17.6854a.0699.0699 0 00-.0321-.027zm-5.4232 12.336c-1.3813 0-2.5024-1.1636-2.5024-2.5929s1.1211-2.5929 2.5024-2.5929c1.3813 0 2.5024 1.1636 2.5024 2.5929s-1.1211 2.5929-2.5024 2.5929zm-5.3283 0c-1.3813 0-2.5024-1.1636-2.5024-2.5929s1.1211-2.5929 2.5024-2.5929c1.3813 0 2.5024 1.1636 2.5024 2.5929 0 1.4293-1.1211 2.5929-2.5024 2.5929z"/></svg>
);

const ButtonLink: React.FC<{ href?: string; icon?: React.ReactNode; label: string; className?: string }> = ({ href, icon, label, className = '' }) => {
    if (!href) return null;
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`neu-control flex items-center gap-2 px-3 py-1.5 text-sm font-semibold overflow-hidden ${className}`}
        >
            {icon}
            <span>{label}</span>
        </a>
    );
};

const PerkTypeBadge: React.FC<{ type: PerkType }> = ({ type }) => {
    const styles: Record<PerkType, string> = {
        'Airdrop': 'bg-green-500/20 text-green-400',
        'GTD': 'bg-blue-500/20 text-blue-400',
        'FCFS': 'bg-amber-800/80 text-amber-100',
        'Free Mint': 'bg-purple-500/20 text-purple-400',
    };
    const style = styles[type] || 'bg-gray-500/20 text-gray-400';
    return <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${style} flex-shrink-0`}>{type}</span>;
};

const PerkProjectBar: React.FC<{ grantingProject: Project | { id: string; name: string; logo: string }; perks: NftPerk[] }> = ({ grantingProject, perks }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="neu-outset-card overflow-hidden flex flex-col h-min">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 text-left group"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    <img src={'logo_url' in grantingProject ? grantingProject.logo_url : grantingProject.logo} alt={grantingProject.name} className="w-8 h-8 rounded-full bg-surface" />
                    <h4 className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors">{grantingProject.name}</h4>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown size={20} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 border-t border-border/10 space-y-2 bg-[#ede9ff]">
                            {perks.map((perkData, index) => (
                                <div key={index} className="bg-surface-container rounded-lg p-2 text-sm border border-border/5">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="font-semibold text-on-surface flex-grow">{perkData.perk.description}</p>
                                        <PerkTypeBadge type={perkData.perk.type} />
                                    </div>
                                    <p className="text-xs text-on-surface-variant mt-1 pt-1 border-t border-border/10">
                                        Requires: Hold {perkData.holdingRequirement.count}+ of this collection
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


export const ProjectProfileInline: React.FC<{ project: Project; collection?: DisplayCollection; showDescription?: boolean; showSocialLinks?: boolean; targetCollectionName?: string; showPerks?: boolean; showAllLinks?: boolean; }> = ({ project, collection, showDescription = true, showSocialLinks = true, targetCollectionName, showPerks = true, showAllLinks = true }) => {
    
    // New compact view for NFT Page
    if (collection) {
        const [allProjects, setAllProjects] = useState<Project[]>([]);

        useEffect(() => {
            getProjects({ includePending: true }).then(setAllProjects);
        }, []);

        const groupedPerks = useMemo(() => {
            const grouped = new Map<string, { grantingProject: Project | { id: string, name: string, logo: string }, perks: NftPerk[] }>();
            if (!collection.perks) return grouped;

            // Directly process the perks defined on the collection to see where they grant benefits
            for (const perkData of collection.perks) {
                // The requirement must be for holding this collection itself (no external projectName)
                if (perkData.holdingRequirement.projectName) continue;

                const grantingProjectName = perkData.perk.grantingProjectName || collection.projectName;
                if (!grantingProjectName) continue;

                if (!grouped.has(grantingProjectName)) {
                    const grantingProject = allProjects.find(p => p.name === grantingProjectName);
                    if (grantingProject) {
                        grouped.set(grantingProjectName, { grantingProject, perks: [] });
                    } else if (perkData.perk.grantingProjectImage) {
                        // Handle admin-added projects that don't exist in the main list
                        const tempProject = { id: `temp_${grantingProjectName.replace(/\s+/g, '_')}`, name: grantingProjectName, logo: perkData.perk.grantingProjectImage };
                        grouped.set(grantingProjectName, { grantingProject: tempProject, perks: [] });
                    }
                }
                
                if (grouped.has(grantingProjectName)) {
                    grouped.get(grantingProjectName)!.perks.push(perkData);
                }
            }
            return grouped;
        }, [collection, allProjects]);


        const groupedPerksArray = Array.from(groupedPerks.values());
        
        // For lg (3 columns)
        const lgColumns: (typeof groupedPerksArray)[] = [[], [], []];
        groupedPerksArray.forEach((item, i) => lgColumns[i % 3].push(item));

        // For md (2 columns)
        const mdColumns: (typeof groupedPerksArray)[] = [[], []];
        groupedPerksArray.forEach((item, i) => mdColumns[i % 2].push(item));

        return (
            <div className="p-4">
                {groupedPerksArray.length === 0 ? (
                    <p className="text-sm text-on-surface-variant text-center py-4">Holding this collection does not currently grant specific benefits in other projects.</p>
                ) : (
                    <>
                        {/* Small screens: 1 column (default behavior) */}
                        <div className="md:hidden flex flex-col gap-3">
                          {groupedPerksArray.map(({ grantingProject, perks }) => (
                            <PerkProjectBar key={grantingProject.id} grantingProject={grantingProject} perks={perks} />
                          ))}
                        </div>

                        {/* Medium screens: 2 columns */}
                        <div className="hidden md:flex lg:hidden gap-3">
                          {mdColumns.map((column, i) => (
                            <div key={i} className="flex flex-col gap-3 w-1/2">
                              {column.map(({ grantingProject, perks }) => (
                                <PerkProjectBar key={grantingProject.id} grantingProject={grantingProject} perks={perks} />
                              ))}
                            </div>
                          ))}
                        </div>

                        {/* Large screens: 3 columns */}
                        <div className="hidden lg:flex gap-3">
                          {lgColumns.map((column, i) => (
                            <div key={i} className="flex flex-col gap-3 w-1/3">
                              {column.map(({ grantingProject, perks }) => (
                                <PerkProjectBar key={grantingProject.id} grantingProject={grantingProject} perks={perks} />
                              ))}
                            </div>
                          ))}
                        </div>
                    </>
                )}
            </div>
        );
    }
    
    const [allProjects, setAllProjects] = useState<Project[]>([]);

    useEffect(() => {
        getProjects({ includePending: true }).then(setAllProjects);
    }, []);
    
    const collectionsToShow = useMemo(() => {
        if (collection) return [collection];
        if (!project.nftCollections) return [];
        if (targetCollectionName) {
            return project.nftCollections.filter(c => c.name === targetCollectionName);
        }
        return project.nftCollections;
    }, [project.nftCollections, targetCollectionName, collection]);


    // Fallback to original layout for other pages (like Ecosystem)
    return (
        <motion.div 
            className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
        >
            {/* --- ABOUT (FULL WIDTH) --- */}
             {showAllLinks && showDescription && (
                <div className="lg:col-span-3">
                    <h3 className="flex items-center gap-2 font-bold font-display text-base mb-3 text-on-surface-variant">
                        <FileText size={18} />
                        <span>About</span>
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{project.long_description || project.description}</p>
                </div>
            )}
            
            {/* --- LEFT COLUMN --- */}
            <div className="lg:col-span-2 space-y-6">
                <div>
                    <h3 className="flex items-center gap-2 font-bold font-display text-base mb-3 text-on-surface">
                        <Globe size={18} />
                        <span>Links</span>
                    </h3>
                    <div className="space-y-4">
                        {showAllLinks && showSocialLinks && (
                            <div>
                                <h4 className="flex items-center gap-2 font-bold text-xs text-on-surface-variant uppercase mb-2">
                                    <ArrowRight size={14} /> Socials
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {project.website_urls?.map((url, i) => (
                                         <ButtonLink key={i} href={url} icon={<img src={project.logo_url} alt={project.name} className="w-5 h-5 rounded-full object-contain" />} label={`Website ${i+1}`} />
                                    ))}
                                    <ButtonLink href={project.twitter_url} icon={<XSocialIcon />} label="X" />
                                    <ButtonLink href={project.discord_url} icon={<DiscordIcon />} label="Discord" />
                                </div>
                            </div>
                        )}


                        {(collectionsToShow.length > 0) && (
                            <div>
                                <h4 className="flex items-center gap-2 font-bold text-xs text-on-surface-variant uppercase mb-2">
                                    <ArrowRight size={14} /> NFTs
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {collectionsToShow.map(collection => (
                                        <ButtonLink key={collection.id} href={''} icon={<Gem size={18}/>} label={`${collection.name}`} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN --- */}
            <div className="lg:col-span-1 space-y-6">
            </div>
        </motion.div>
    );
};