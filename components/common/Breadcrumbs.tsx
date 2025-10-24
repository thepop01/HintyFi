
import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getProjectById, getEventById, getQuestById } from '../../src/services/dataService';

const capitalize = (s: string) => {
    if (!s) return '';
    // Handle special cases like 'IDO'
    if (s.toLowerCase() === 'ido') return 'IDO/ICO';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    
    const breadcrumbs = useMemo(() => {
        const pathnames = location.pathname.split('/').filter(x => x);

        if (pathnames.length === 0) {
            return []; // Home page
        }

        const crumbs = [{ name: 'Home', to: '/' }];

        const first = pathnames[0];
        const second = pathnames[1];
        const third = pathnames[2];

        // Top-level, non-dynamic pages
        const singlePathMap: Record<string, string> = {
            'campaigns': 'Campaigns',
            'tasks': 'Tasks',
            'this-week': 'This Week',
            'credo': 'Credo',
            'profile': 'Profile',
            'admin': 'Admin Dashboard',
            'super-admin': 'Super Admin',
            'early-projects': 'Early',
        };

        if (pathnames.length === 1 && singlePathMap[first]) {
            crumbs.push({ name: singlePathMap[first], to: location.pathname });
            return crumbs;
        }

        // Special top-level groups like /ecosystem/*
        if (first === 'ecosystem' && second) {
            const name = capitalize(second);
            crumbs.push({ name, to: location.pathname });
            return crumbs;
        }

        // Dynamic pages: /campaign/:id, /quest/:id, /project/:id
        if (first === 'campaign' && second) {
            crumbs.push({ name: 'Campaigns', to: '/campaigns' });
            const event = getEventById(second);
            if (event) crumbs.push({ name: event.title, to: location.pathname });
            return crumbs;
        }

        if (first === 'quest' && second) {
            crumbs.push({ name: 'Campaigns', to: '/campaigns' });
            const quest = getQuestById(second);
            if (quest) crumbs.push({ name: quest.title, to: `/quest/${second}` });
            if (third === 'identity') {
                crumbs.push({ name: 'Identity', to: location.pathname });
            }
            return crumbs;
        }
        
        if (first === 'project' && second) {
            const project = getProjectById(second);
            if (project) crumbs.push({ name: project.name, to: `/project/${second}` });
            if (third) {
                const tabMap: Record<string, string> = {
                    'tasks': 'Tasks',
                    'leaderboard': 'Leaderboard',
                };
                if(tabMap[third]) crumbs.push({ name: tabMap[third], to: location.pathname });
            }
            return crumbs;
        }

        // Admin pages: /admin/project/:id/*
        if (first === 'admin' && second === 'project' && third) {
            crumbs.push({ name: 'Admin Dashboard', to: '/admin' });
            const project = getProjectById(third);
            if (project) crumbs.push({ name: project.name, to: `/admin/project/${third}` });

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
            return crumbs;
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
                const project = getProjectById(third);
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
            return crumbs;
        }

        return []; // Return empty for paths not explicitly handled
    }, [location.pathname]);
    
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
