import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Trophy } from 'lucide-react';
import { Collaboration, Project } from '../src/types';
import { getCollaborations, getProjectsFromDB, getCollabProjects } from '../src/services/dataService';
import CollabHero from '../components/collab/CollabHero';
import CollabCard from '../components/collab/CollabCard';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import PaginationControls from '../components/common/PaginationControls';
import ScrollToTopButton from '../components/common/ScrollToTopButton';


const CollabPage: React.FC = () => {
    const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(12);


    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [collaborationsData, projectsData, extraProjectsData] = await Promise.all([
                    getCollaborations(),
                    getProjectsFromDB({ includePending: false }),
                    getCollabProjects()
                ]);

                // Map extra projects to Project type
                const mappedExtraProjects = extraProjectsData.map(ep => ({
                    id: ep.id,
                    name: ep.name,
                    logo: ep.logo_url,
                    logo_url: ep.logo_url,
                    links: { twitter: ep.twitter_url, websites: [], discord: null },
                    // Default minimal fields
                    category: [],
                    votes: { up: 0, down: 0, voters: [] },
                    events: [],
                    team: [],
                    discordRoles: [],
                    nftCollections: [],
                    coins: []
                } as unknown as Project));

                setCollaborations(collaborationsData);
                setProjects([...projectsData, ...mappedExtraProjects]);
            } catch (error) {
                console.error('Error loading collaboration data:', error);
                setCollaborations([]);
                setProjects([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const runningCollaborations = collaborations.filter(c => c.status === 'running');
    const pastCollaborations = collaborations.filter(c => c.status === 'past');

    const { paginatedRunning, totalRunningPages } = React.useMemo(() => {
        const total = runningCollaborations.length;
        const pages = Math.ceil(total / pageSize);
        const paginated = runningCollaborations.slice(
            currentPage * pageSize,
            (currentPage + 1) * pageSize
        );
        return { paginatedRunning: paginated, totalRunningPages: pages };
    }, [runningCollaborations, currentPage, pageSize]);

    const { paginatedPast, totalPastPages } = React.useMemo(() => {
        const total = pastCollaborations.length;
        const pages = Math.ceil(total / pageSize);
        const paginated = pastCollaborations.slice(
            currentPage * pageSize,
            (currentPage + 1) * pageSize
        );
        return { paginatedPast: paginated, totalPastPages: pages };
    }, [pastCollaborations, currentPage, pageSize]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen">
            {/* Simple Page Header */}
            <div className="max-w-[84rem] mx-auto px-4 sm:px-6 mb-8">
                <div className="text-center">
                    <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-[rgb(var(--color-background))] tracking-widest uppercase [text-shadow:2px_2px_3px_rgba(0,0,0,0.5),_-2px_-2px_3px_rgba(255,255,255,0.08)]">
                        Collabs
                    </h1>
                    <p className="text-xl text-on-background-variant mt-4 max-w-2xl mx-auto">
                        Partner with leading projects and earn exclusive rewards through collaborative tasks
                    </p>
                </div>
            </div>

            {/* Hero Section */}
            <CollabHero collaborations={runningCollaborations} projects={projects} />

            <div className="max-w-[84rem] mx-auto px-4 sm:px-6">
                {/* Running Collaborations Section */}
                <div className="mt-12 md:mt-16 lg:mt-20">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-on-background">
                                Running Collabs
                            </h2>
                            <p className="text-base sm:text-lg font-subheading text-on-background-variant mt-1">
                                Active partnerships you can participate in now.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-on-background-variant">
                            <Calendar size={16} />
                            <span>{runningCollaborations.length} active</span>
                        </div>
                    </div>

                    {runningCollaborations.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {paginatedRunning.map((collaboration, index) => (
                                    <motion.div
                                        key={collaboration.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.4 }}
                                    >
                                        <CollabCard
                                            collaboration={collaboration}
                                            projects={projects.filter(p => collaboration.participating_projects.includes(p.id))}
                                            onClick={() => {
                                                // Navigate to individual collaboration page
                                                window.location.href = `/collabs/${collaboration.slug}`;
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {totalRunningPages > 1 && (
                                <div className="mt-8">
                                    <PaginationControls
                                        currentPage={currentPage}
                                        totalPages={totalRunningPages}
                                        onPageChange={setCurrentPage}
                                        pageSize={pageSize}
                                        onPageSizeChange={setPageSize}
                                        totalItems={runningCollaborations.length}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <EmptyState
                            icon={<Users size={48} />}
                            title="No Running Collabs"
                            description="There are currently no active collaborations. Check back soon for new partnership opportunities!"
                        />
                    )}
                </div>

                {/* Past Collaborations Section */}
                <div className="mt-16 md:mt-20 lg:mt-24">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-on-background">
                                Past Collabs
                            </h2>
                            <p className="text-base sm:text-lg font-subheading text-on-background-variant mt-1">
                                Completed partnerships and their results.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-on-background-variant">
                            <Trophy size={16} />
                            <span>{pastCollaborations.length} completed</span>
                        </div>
                    </div>

                    {pastCollaborations.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {paginatedPast.map((collaboration, index) => (
                                    <motion.div
                                        key={collaboration.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.4 }}
                                    >
                                        <CollabCard
                                            collaboration={collaboration}
                                            projects={projects.filter(p => collaboration.participating_projects.includes(p.id))}
                                            onClick={() => {
                                                // For past collaborations, navigate to full page
                                                window.location.href = `/collabs/${collaboration.slug}`;
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {totalPastPages > 1 && (
                                <div className="mt-8">
                                    <PaginationControls
                                        currentPage={currentPage}
                                        totalPages={totalPastPages}
                                        onPageChange={setCurrentPage}
                                        pageSize={pageSize}
                                        onPageSizeChange={setPageSize}
                                        totalItems={pastCollaborations.length}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <EmptyState
                            icon={<Trophy size={48} />}
                            title="No Past Collabs"
                            description="No collaborations have been completed yet."
                        />
                    )}
                </div>
            </div>

            {/* Scroll to Top Button */}
            <ScrollToTopButton scrollableSelector="body" />
        </div>
    );
};

export default CollabPage;