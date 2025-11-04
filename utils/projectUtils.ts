import { Project } from '../src/types';

export const getProjectPath = (project: Project | { id: string; name: string }) => {
    // Convert project name to URL-friendly format
    const urlName = project.name.toLowerCase().replace(/\s+/g, '-');
    return `/${urlName}`;
};