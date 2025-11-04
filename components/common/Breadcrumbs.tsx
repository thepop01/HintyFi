
import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getProjectById, getQuestById, getUserById, getUsers } from '../../src/services/dataService';
import { useAuth } from '../../context/AuthContext';

const capitalize = (s: string) => {
    if (!s) return '';
    // Handle special cases like 'IDO'
    if (s.toLowerCase() === 'ido') return 'IDO/ICO';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const { currentUser } = useAuth();
    
    const [breadcrumbs, setBreadcrumbs] = useState<{ name: string, to: string }[]>([]);

    useEffect(() => {
        const generateBreadcrumbs = async () => {
            const pathnames = location.pathname.split('/').filter(x => x);

            if (pathnames.length === 0) {
                setBreadcrumbs([]); // Home page
                return;
            }

            const crumbs = [{ name: 'Home', to: '/' }];

            const first = pathnames[0];
            const second = pathnames[1];
            const third = pathnames[2];

            // Handle profile pages specifically
            if (first === 'ledger' && second) {
                crumbs.push({ name: 'Ledger', to: '/ledger' });
                const user = await getUserById(second);
                if (user) {
                    crumbs.push({ name: user.platform_username, to: `/ledger/${second}` });
                    if (third === 'points') {
                        crumbs.push({ name: `${user.platform_username} Points`, to: location.pathname });
                    }
                } else {
                    crumbs.push({ name: 'User Profile', to: location.pathname });
                }
                setBreadcrumbs(crumbs);
                return;
            }

            // Top-level, non-dynamic pages
            const singlePathMap: Record<string, string> = {
                'campaigns': 'Campaigns',
                'tasks': 'Tasks',
                'this-week': 'This Week',
                'ledger': 'Ledger',
                'admin': 'Admin Dashboard',
                'super-admin': 'Super Admin',
                'early-projects': 'Early',
            };

            if (pathnames.length === 1 && singlePathMap[first]) {
                crumbs.push({ name: singlePathMap[first], to: location.pathname });
                setBreadcrumbs(crumbs);
                return;
            }

            // Handle NFT, IDO, and Meme pages
            if (first === 'nft' || first === 'ido' || first === 'meme') {
                const name = capitalize(first);
                crumbs.push({ name, to: location.pathname });
                setBreadcrumbs(crumbs);
                return;
            }

            // Dynamic pages: /campaign/:id, /quest/:id, /project/:id
            if (first === 'campaign' && second) {
                crumbs.push({ name: 'Campaigns', to: '/campaigns' });
                crumbs.push({ name: second, to: location.pathname });
                setBreadcrumbs(crumbs);
                return;
            }

            if (first === 'quest' && second) {
                crumbs.push({ name: 'Campaigns', to: '/campaigns' });
                const quest = await getQuestById(second);
                if (quest) crumbs.push({ name: quest.name, to: `/quest/${second}` });
                if (third === 'identity') {
                    crumbs.push({ name: 'Identity', to: location.pathname });
                }
                setBreadcrumbs(crumbs);
                return;
            }
            
            if (first === 'project' && second) {
                const project = await getProjectById(second);
                if (project) crumbs.push({ name: project.name, to: `/${project.name.toLowerCase()}` });
                if (third) {
                    const tabMap: Record<string, string> = {
                        'tasks': 'Tasks',
                        'leaderboard': 'Leaderboard',
                    };
                    if(tabMap[third]) crumbs.push({ name: tabMap[third], to: location.pathname });
                }
                setBreadcrumbs(crumbs);
                return;
            }

            // Admin pages: /admin/project/:id/*
            if (first === 'admin' && second === 'project' && third) {
                crumbs.push({ name: 'Admin Dashboard', to: '/admin' });
                const project = await getProjectById(third);
                if (project) crumbs.push({ name: project.name, to: `/admin/project/${project.name.toLowerCase()}` });

                if (pathnames[3]) {
                    const tab = pathnames[3];
                    const tabMap: Record<string, string> = {
                        'edit': 'Edit Project',
                        'campaigns': 'Campaigns',
                        'tasks': 'Tasks',
                        'nfts-memes': 'NFTs & Memes',
                        'discord-roles': 'Discord Roles'
                    };
                    if(tabMap[tab]) crumbs.push({ name: tabMap[tab], to: location.pathname });
                }
                setBreadcrumbs(crumbs);
                return;
            }

            // Super Admin pages: /super-admin/*
            if (first === 'super-admin') {
                crumbs.push({ name: 'Super Admin', to: '/super-admin' });
                
                const tabMap: Record<string, string> = {
                    'users': 'Users',
                    'project-detail': 'Project Detail',
                    'content': 'Manage Content',
                    'quests': 'Manage Quests',
                    'nfts': 'Manage NFT',
                    'memes': 'Manage Meme',
                    'idos': 'Manage IDO',
                    'project-management': 'Project Management',
                };

                if (second && tabMap[second]) {
                    const path = location.pathname.split('/').slice(0, 3).join('/');
                    crumbs.push({ name: tabMap[second], to: path });
                }

                if (second === 'project-management' && third) {
                    const project = await getProjectById(third);
                    if (project) crumbs.push({ name: project.name, to: `/super-admin/project-management/${third}` });
                    if (pathnames[3]) {
                        const subTab = pathnames[3];
                        const subTabMap: Record<string, string> = {
                            'points': 'Points Settings',
                            'info': 'Info Settings',
                            'status': 'Status',
                            'campaigns': 'Campaign Verification',
                            'tasks': 'Task Verification',
                        };
                        if(subTabMap[subTab]) crumbs.push({ name: subTabMap[subTab], to: location.pathname });
                    }
                }
                
                if ((second === 'nfts' || second === 'memes' || second === 'idos') && third) {
                    if (third === 'add') crumbs.push({ name: 'Add', to: location.pathname });
                    else if (third === 'edit') crumbs.push({ name: 'Edit', to: location.pathname });
                }
                setBreadcrumbs(crumbs);
                return;
            }

            setBreadcrumbs([]); // Return empty for paths not explicitly handled
        };

        generateBreadcrumbs();
    }, [location.pathname, location.search, currentUser]);
    
    if (breadcrumbs.length <= 1) {
        return null;
    }

    return (
        <nav aria-label="breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant flex-wrap">
            {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                    <React.Fragment key={crumb.to + index}>
                        {index > 0 && <ChevronRight size={16} />}
                        {isLast ? (
                            <span className="font-semibold text-on-surface truncate max-w-xs">{crumb.name}</span>
                        ) : (
                            <Link to={crumb.to} className="hover:text-primary transition-colors">{crumb.name}</Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;
