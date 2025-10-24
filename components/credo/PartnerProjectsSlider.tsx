import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { getProjects, getCredoSettings } from '../../src/services/dataService';
import { Project } from '../../src/types';
import { Award } from 'lucide-react';

const ProjectSliderCard: React.FC<{ project: Project }> = ({ project }) => {
    const pointsSummary = useMemo(() => {
        const summaries: string[] = [];

        if (project.discordRoles && project.discordRoles.length > 0) {
            summaries.push(`Points for roles`);
        }

        if (project.nftCollections && project.nftCollections.length > 0) {
            const totalPoints = project.nftCollections.reduce((sum, coll) => sum + (coll.pointsPerDay || 0), 0);
            if (totalPoints > 0) {
                summaries.push(`NFT Holding: Up to ${totalPoints}pt/day`);
            }
        }

        if (project.tokenHoldingTiers && project.tokenHoldingTiers.length > 0) {
            const maxPts = Math.max(...project.tokenHoldingTiers.map(t => t.pointsPerDay));
            summaries.push(`Holding: Up to ${maxPts}pt/day`);
        }

        return summaries.slice(0, 2); // Show top 2 opportunities for brevity
    }, [project]);

    return (
        <ReactRouterDOM.Link 
            to={`/project/${project.id}`} 
            className="neu-outset-card group block w-full h-full p-3 transition-all duration-300 ease-in-out hover:!shadow-[10px_10px_20px_#0e0018,_-10px_-10px_20px_#3a0062,_0_0_15px_rgba(var(--color-primary),0.4)] flex flex-col items-center text-center"
        >
            <div className="flex-grow flex flex-col items-center justify-center gap-2">
                <img src={project.logo} alt={project.name} className="w-16 h-16 rounded-full bg-surface/50 object-contain p-1 transition-transform group-hover:scale-110" loading="lazy" decoding="async" />
                <h3 className="font-bold text-lg text-on-surface w-full group-hover:text-primary transition-colors truncate">{project.name}</h3>
            </div>
            
            {pointsSummary.length > 0 && (
                <div className="text-xs text-on-surface-variant w-full mt-auto pt-2 border-t border-border/10 space-y-1 flex-shrink-0">
                    {pointsSummary.map((summary, i) => (
                        <div key={i} className="flex items-center justify-center gap-1.5">
                            <Award size={12} className="text-accent flex-shrink-0" />
                            <p className="truncate">{summary}</p>
                        </div>
                    ))}
                </div>
            )}
        </ReactRouterDOM.Link>
    );
};

const PartnerProjectsSlider: React.FC = () => {
    const partnerProjects = useMemo(() => {
        const allProjects = getProjects();
        const settings = getCredoSettings();
        return settings.sliderProjectNames.map(name => allProjects.find(p => p.name === name)).filter((p): p is Project => p !== undefined);
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [isMeasured, setIsMeasured] = useState(false);

    useLayoutEffect(() => {
        const checkOverflow = () => {
            if (containerRef.current && contentRef.current && !isMeasured) {
                const containerWidth = containerRef.current.clientWidth;
                const contentWidth = contentRef.current.scrollWidth;
                setIsOverflowing(contentWidth > containerWidth);
                setIsMeasured(true);
            }
        };

        checkOverflow();

        const handleResize = () => setIsMeasured(false);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMeasured, partnerProjects]);

    if (partnerProjects.length === 0) return null;

    const animationDuration = `${partnerProjects.length * 4}s`;

    const renderContent = () => {
        if (isOverflowing) {
            const slides = [...partnerProjects, ...partnerProjects];
            return (
                <div className="flex w-max marquee group-hover:[animation-play-state:paused]" style={{ animationDuration }}>
                    {slides.map((project, index) => (
                        <div key={`${project.id}-${index}`} className="w-48 h-48 mr-6 flex-shrink-0">
                            <ProjectSliderCard project={project} />
                        </div>
                    ))}
                </div>
            );
        }
        return (
            <div className="flex justify-center w-full">
                {partnerProjects.map((project, index) => (
                    <div key={`${project.id}-${index}`} className="w-48 h-48 mr-6 flex-shrink-0 last:mr-0">
                        <ProjectSliderCard project={project} />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div ref={containerRef} className="w-full overflow-hidden relative group py-4">
            {isOverflowing && (
                <>
                    <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-[rgb(var(--color-background))] to-transparent z-10 pointer-events-none" />
                    <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-[rgb(var(--color-background))] to-transparent z-10 pointer-events-none" />
                </>
            )}
            
            {/* Render a simple, non-duplicated list for measurement first */}
            {!isMeasured ? (
                <div ref={contentRef} className="flex invisible">
                    {partnerProjects.map((project) => (
                        <div key={project.id} className="w-48 h-48 mr-6 flex-shrink-0 last:mr-0">
                            <ProjectSliderCard project={project} />
                        </div>
                    ))}
                </div>
            ) : renderContent()}
        </div>
    );
};

export default PartnerProjectsSlider;