import React, { useMemo, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { getUsers, getProjects, isCultOwner } from '../../src/services/dataService';
import { User, Project, PointTier } from '../../src/types';
import Card from '../common/Card';
import { ShieldCheck } from 'lucide-react';
import PaginationControls from '../common/PaginationControls';

const CommunitySheet: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    
    const { users, projects } = useMemo(() => ({
        users: getUsers(),
        projects: getProjects(),
    }), []);

    const memberData = useMemo(() => {
        const projectsByName = new Map<string, Project>();
        projects.forEach(project => {
            projectsByName.set(project.name, project);
        });

        return users
            .map(user => {
                const buildingProjects = (user.projectsBuilding || [])
                    .map(name => projectsByName.get(name))
                    .filter((p): p is Project => p !== undefined);
                
                // Credo points are now 0 for everyone.
                const credoPoints = 0;

                return {
                    ...user,
                    score: credoPoints,
                    buildingProjects: buildingProjects
                };
            })
            // Sort by Tirth points as Credo score is 0 for all
            .sort((a, b) => (b.tirthPoints || 0) - (a.tirthPoints || 0));

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
                            <th className="px-6 py-3 text-sm font-display font-bold text-on-surface-variant">Tirth Points</th>
                            <th className="px-6 py-3 text-sm font-display font-bold text-on-surface-variant">Building</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                        {paginatedMembers.map((member, index) => {
                            const rank = currentPage * pageSize + index + 1;
                            const isOwner = isCultOwner(member.walletAddress);
                            return (
                                <tr key={member.id} className="hover:bg-border/10 transition-colors">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-on-surface-variant text-center font-semibold">{rank}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <img className="h-8 w-8 rounded-full bg-surface-container" src={`https://i.pravatar.cc/32?u=${member.id}`} alt={member.name} />
                                            <ReactRouterDOM.Link to={`/profile?user=${member.id}`} className="font-semibold text-base text-on-surface hover:underline">
                                                {member.name}
                                            </ReactRouterDOM.Link>
                                            {isOwner && (
                                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-400" title="Verified CULT Owner">
                                                    <ShieldCheck size={12} />
                                                    <span className="text-xs font-bold">Verified</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-on-surface-variant capitalize">{member.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-primary">{member.score.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-accent">{member.tirthPoints?.toLocaleString() || 'N/A'}</td>
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