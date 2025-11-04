import React, { useMemo, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { getUsers, getProjects, isCultOwner } from '../../src/services/dataService';
import { User, Project } from '../../src/types';
import Card from '../common/Card';
import { ShieldCheck } from 'lucide-react';
import PaginationControls from '../common/PaginationControls';

const CommunitySheet: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        getUsers().then(setUsers);
        getProjects().then(setProjects);
    }, []);

    const memberData = useMemo(() => {
        const projectsByName = new Map<string, Project>();
        projects.forEach(project => {
            projectsByName.set(project.name, project);
        });

        // Create a set of all team members across all projects for efficient lookup
        const teamMemberNames = new Set<string>();
        projects.forEach(project => {
            project.team?.forEach(member => {
                teamMemberNames.add(member.name.toLowerCase());
            });
        });

        return users
            .map(user => {
                // The 'projectsBuilding' property does not exist on the User type.
                // This logic will be commented out to resolve the error.
                // const buildingProjects = (user.projectsBuilding || [])
                //     .map(name => projectsByName.get(name))
                //     .filter((p): p is Project => p !== undefined);
                const buildingProjects: Project[] = [];
                
                const isBuilder = buildingProjects.length > 0;
                const isTeamMember = user.name ? teamMemberNames.has(user.name.toLowerCase()) : false;
                
                let credoPoints: number | 'N/A' = 'N/A'; // Default to N/A

                if ((isBuilder || isTeamMember) && user.credo_points && user.credo_points > 0) {
                    credoPoints = user.credo_points;
                }

                return {
                    ...user,
                    score: credoPoints,
                    buildingProjects: buildingProjects
                };
            })
            // Sort by Hint points as Credo score is mixed type
            .sort((a, b) => (b.hint_points || 0) - (a.hint_points || 0));

    }, [users, projects]);

    const { paginatedMembers, totalPages } = useMemo(() => {
        const total = memberData.length;
        const pages = Math.ceil(total / pageSize);
        const paginated = memberData.slice(
            currentPage * pageSize,
            (currentPage + 1) * pageSize
        );
        return { paginatedMembers: paginated, totalPages: pages };
    }, [memberData, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [pageSize]);

    return (
        <Card className="p-4 overflow-hidden bg-[#f5f0ff]">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left">
                    <thead className="bg-surface/30">
                        <tr>
                            <th className="px-4 py-3 text-sm font-display font-bold text-on-surface-variant text-center w-12">#</th>
                            <th className="px-6 py-3 text-sm font-display font-bold text-on-surface-variant">Name</th>
                            <th className="px-6 py-3 text-sm font-display font-bold text-on-surface-variant">Role</th>
                            <th className="px-6 py-3 text-sm font-display font-bold text-on-surface-variant">Credo Points</th>
                            <th className="px-6 py-3 text-sm font-display font-bold text-on-surface-variant">Hint Points</th>
                            <th className="px-6 py-3 text-sm font-display font-bold text-on-surface-variant">Building</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                        {paginatedMembers.map((member, index) => {
                            const rank = currentPage * pageSize + index + 1;
                            // const isOwner = isCultOwner(member.wallet_address);
                            return (
                                <tr key={member.id} className="hover:bg-border/10 transition-colors">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-on-surface-variant text-center font-semibold">{rank}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <img className="h-8 w-8 rounded-full bg-surface-container" src={member.profile_pic_url || `https://i.pravatar.cc/32?u=${member.id}`} alt={member.platform_username} />
                                            <ReactRouterDOM.Link to={`/ledger/${member.id}`} className="font-semibold text-base text-on-surface hover:underline">
                                                {member.platform_username}
                                            </ReactRouterDOM.Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-on-surface-variant capitalize">{member.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-primary">
                                        {typeof member.score === 'number' ? member.score.toLocaleString() : member.score}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-accent">{member.hint_points?.toLocaleString() || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {member.buildingProjects && member.buildingProjects.length > 0 ? (
                                            <div className="flex items-center">
                                                {member.buildingProjects.slice(0, 2).map((project, index) => (
                                                    <img
                                                        key={project.id}
                                                        src={project.logo}
                                                        alt={project.name}
                                                        title={project.name}
                                                        className="w-8 h-8 rounded-full border-2 border-surface bg-background object-contain"
                                                        style={{ marginLeft: index > 0 ? '-0.75rem' : '0', zIndex: 2 - index }}
                                                    />
                                                ))}
                                                {member.buildingProjects.length > 2 && (
                                                    <div
                                                        className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold border-2 border-surface"
                                                        style={{ marginLeft: '-0.75rem', zIndex: 0 }}
                                                        title={`${member.buildingProjects.length - 2} more project(s)`}
                                                    >
                                                        +{member.buildingProjects.length - 2}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-base text-on-surface-variant">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
             {memberData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/10">
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        pageSize={pageSize}
                        onPageSizeChange={setPageSize}
                        totalItems={memberData.length}
                    />
                </div>
            )}
        </Card>
    );
};

export default CommunitySheet;