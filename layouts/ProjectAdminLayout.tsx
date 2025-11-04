import React, { useMemo, useState, useEffect } from 'react';
import { Outlet, useParams, Link } from 'react-router-dom';
import { getProjectById } from '../src/services/dataService';
import Loader from '../components/common/Loader';
import { ArrowLeft } from 'lucide-react';
import ProjectAdminNavbar from '../components/admin/ProjectAdminNavbar';
import { useDataRefresher } from '../hooks/useDataRefresher';
import { Project } from '../src/types';

const ProjectAdminLayout: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { dataVersion } = useDataRefresher();
    const [project, setProject] = useState<Project | null>(null);

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) {
                setProject(null);
                return;
            }
            const projectData = await getProjectById(id);
            setProject(projectData);
        };
        fetchProject();
    }, [id, dataVersion]);


    if (!project) {
        return <Loader message="Loading project data..." />;
    }

    return (
        <div>
            {/* This header uses negative margins to break out of the parent padding and create a full-width section */}
            <div className="bg-surface-container/50 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 mb-6 p-4 border-b border-border/10">
                <div className="max-w-[84rem] mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/admin" className="neu-button p-2">
                                <ArrowLeft size={20} />
                            </Link>
                            <img src={project.logo_url} alt={project.name} className="w-12 h-12 rounded-lg bg-surface object-contain p-1" />
                            <div>
                                <h1 className="text-2xl font-display font-bold text-on-surface">{project.name}</h1>
                                <p className="text-sm text-on-surface-variant">Project Dashboard</p>
                            </div>
                        </div>
                    </div>
                    <ProjectAdminNavbar projectId={project.id} />
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto">
                <Outlet context={{ project }} />
            </div>
        </div>
    );
};

export default ProjectAdminLayout;