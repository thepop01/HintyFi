import React, { useMemo, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { getProjects, getEvents } from '../src/services/dataService';
import { Project, Event } from '../src/types';
import ProjectProfileView from '../components/project/ProjectProfileView';
import { ArrowLeft } from 'lucide-react';

// Skeleton/Loading component
const ProjectProfileSkeleton: React.FC = () => (
    <div className="animate-pulse space-y-8">
        {/* Skeleton Hero */}
        <div className="relative min-h-[40vh] md:min-h-[50vh] w-full rounded-lg bg-surface/50 -mt-4">
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6">
                <div className="w-28 h-28 rounded-2xl bg-surface-container" />
                <div className="h-12 w-64 bg-surface-container rounded-md mt-6" />
                <div className="h-4 w-48 bg-surface-container rounded-md mt-4" />
                <div className="flex items-center justify-center gap-3 mt-6">
                    <div className="w-10 h-10 rounded-full bg-surface-container" />
                    <div className="w-10 h-10 rounded-full bg-surface-container" />
                    <div className="w-10 h-10 rounded-full bg-surface-container" />
                </div>
            </div>
        </div>
        
        {/* Skeleton Main Content */}
        <main className="max-w-5xl mx-auto space-y-8 px-4 sm:px-0">
            <div className="neu-card p-6">
                <div className="h-8 w-48 bg-surface-container rounded-md mb-4" />
                <div className="space-y-2">
                    <div className="h-4 w-full bg-surface-container rounded-md" />
                    <div className="h-4 w-full bg-surface-container rounded-md" />
                    <div className="h-4 w-3/4 bg-surface-container rounded-md" />
                </div>
            </div>
            <div className="neu-card p-6">
                <div className="h-8 w-48 bg-surface-container rounded-md mb-4" />
                <div className="space-y-3">
                    <div className="h-16 w-full bg-surface-container rounded-lg" />
                    <div className="h-16 w-full bg-surface-container rounded-lg" />
                </div>
            </div>
        </main>
    </div>
);


export default function ProjectProfilePage() {
    const { id } = ReactRouterDOM.useParams();
    const navigate = ReactRouterDOM.useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Simulate a network delay for a better loading experience
        const timer = setTimeout(() => {
            if (!id) {
                setLoading(false);
                return;
            };

            const allProjects = getProjects({ includePending: true }); 
            const projectData = allProjects.find(p => p.id === id);

            if (!projectData || projectData.approvalStatus !== 'approved') {
                setProject(null);
                setEvents([]);
            } else {
                const projectEvents = getEvents().filter(e => e.projectName === projectData.name);
                setProject(projectData);
                setEvents(projectEvents);
            }
            setLoading(false);
        }, 500); // 500ms delay to show loading state

        return () => clearTimeout(timer);
    }, [id]);

    if (loading) {
        return <ProjectProfileSkeleton />;
    }

    if (!project) {
        return (
            <div className="text-center py-10 max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-on-surface">Project not found</h2>
                <button onClick={() => navigate('/ecosystem')} className="mt-4 neu-button px-4 py-2 flex items-center gap-2 mx-auto">
                    <ArrowLeft size={16} />
                    Back to Ecosystem
                </button>
            </div>
        );
    }

    return <ProjectProfileView project={project} events={events} />;
}