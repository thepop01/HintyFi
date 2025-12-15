import React, { Suspense, lazy } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { getProjects } from './services/dataService';
import { useAuth } from './context/AuthContext';
import ScrollToTop from '../components/common/ScrollToTop';
import Loader from '../components/common/Loader';
import Layout from '../components/layout/Layout';

// Lazy load all page components for code splitting
const CampaignPage = lazy(() => import('../pages/CampaignPage'));
const EcosystemPage = lazy(() => import('../pages/EcosystemPage'));
const LedgerPage = lazy(() => import('../pages/LedgerPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const CampaignDetailPage = lazy(() => import('../pages/CampaignDetailPage'));
const ProjectProfilePage = lazy(() => import('../pages/ProjectProfilePage'));
const QuestDetailPage = lazy(() => import('../pages/QuestDetailPage'));
const QuestIdentityPage = lazy(() => import('../pages/QuestIdentityPage'));

const MemePage = lazy(() => import('../pages/MemePage'));
const NFTPage = lazy(() => import('../pages/NFTPage'));
const EarlyProjectsPage = lazy(() => import('../pages/EarlyProjectsPage'));
const TasksPage = lazy(() => import('../pages/TasksPage'));
const ProjectTasksPage = lazy(() => import('../pages/ProjectTasksPage'));
const ProjectLeaderboardPage = lazy(() => import('../pages/ProjectLeaderboardPage'));
const ThisWeekPage = lazy(() => import('../pages/ThisWeekPage'));
const PointsPage = lazy(() => import('../pages/PointsPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const ProtectedRoute = lazy(() => import('../components/auth/ProtectedRoute'));

// Collaboration Pages
const CollabPage = lazy(() => import('../pages/CollabPage'));
const IndividualCollabPage = lazy(() => import('../pages/IndividualCollabPage'));





// Super Admin Pages & Layout
const SuperAdminLayout = lazy(() => import('../pages/SuperAdminPage'));
const UserManagementTab = lazy(() => import('../components/admin/UserManagementTab'));
const ManageProjectDetail = lazy(() => import('../components/admin/manageprojectdetail'));
const ManageEventsPage = lazy(() => import('../pages/admin/superadmin/ManageEventsPage'));
const ManageCollabsPage = lazy(() => import('../pages/admin/superadmin/ManageCollabsPage'));
const ManageNftTab = lazy(() => import('../components/admin/ManageNftTab'));
const AddNftCollectionPage = lazy(() => import('../components/admin/AddNftCollectionPage'));
const EditNftCollectionPage = lazy(() => import('../components/admin/EditNftCollectionPage'));





// Super Admin Project Management Pages & Layout
const SuperAdminProjectLayout = lazy(() => import('../layouts/SuperAdminProjectLayout'));
const ProjectPointsSettingsTab = lazy(() => import('../pages/admin/superadmin/ProjectPointsSettingsTab'));
const ProjectInfoSettingsTab = lazy(() => import('../pages/admin/superadmin/ProjectInfoSettingsTab'));
const ProjectStatusSettingsTab = lazy(() => import('../pages/admin/superadmin/ProjectStatusSettingsTab'));
const AddProjectPage = lazy(() => import('../pages/admin/superadmin/AddProjectPage'));
const ManageProjectsPage = lazy(() => import('../pages/admin/superadmin/ManageProjectsPage'));


// Redirect helper for legacy /project/:id routes -> maps ID to the new name-based path when possible
const ProjectRedirect: React.FC = () => {
    const { id } = ReactRouterDOM.useParams();
    // find project by id or name (case-insensitive)
    const [target, setTarget] = React.useState<string | null>(null);

    React.useEffect(() => {
        const findProject = async () => {
            const projects = await getProjects();
            const project = projects.find(p => p.id === id) || projects.find(p => p.name.toLowerCase() === id?.toLowerCase());
            const targetPath = project ? `/${project.name.toLowerCase()}` : `/project/${id}`;
            setTarget(targetPath);
        };
        findProject();
    }, [id]);

    if (!target) {
        return <Loader />;
    }

    return <ReactRouterDOM.Navigate to={target} replace />;
};

// Redirect helper for legacy /collab/:id routes -> redirect to /collabs/:id
const CollabRedirect: React.FC = () => {
    const { id } = ReactRouterDOM.useParams();
    return <ReactRouterDOM.Navigate to={`/collabs/${id}`} replace />;
};

const Login = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <h1 className="text-3xl font-bold">Login Page</h1>
        </div>
    )
}


export default function Router() {
    const { currentUser, loading } = useAuth()

    if (loading) return <div className="text-center mt-10">Loading...</div>

    return (
        <ReactRouterDOM.BrowserRouter>
            <>
                <ScrollToTop />
                <div className="max-w-[1920px] mx-auto app-container">
                    <div className="min-h-screen text-on-background font-sans tracking-wider">
                        <Suspense fallback={<Loader />}>
                            <ReactRouterDOM.Routes>
                                <ReactRouterDOM.Route path="/" element={<Layout />}>
                                    {/* Public Routes */}
                                    <ReactRouterDOM.Route index element={<ReactRouterDOM.Navigate to="/ecosystem" replace />} />
                                    <ReactRouterDOM.Route path="ecosystem" element={<EcosystemPage />} />
                                    <ReactRouterDOM.Route path="campaigns" element={<CampaignPage />} />
                                    <ReactRouterDOM.Route path="tasks" element={<TasksPage />} />
                                    <ReactRouterDOM.Route path="this-week" element={<ThisWeekPage />} />
                                    <ReactRouterDOM.Route path="collaborations" element={<CollabPage />} />
                                    <ReactRouterDOM.Route path="collabs" element={<CollabPage />} />
                                    <ReactRouterDOM.Route path="collabs/:id" element={<IndividualCollabPage />} />
                                    {/* Redirect old /collab URLs to /collabs */}
                                    <ReactRouterDOM.Route path="collab" element={<ReactRouterDOM.Navigate to="/collabs" replace />} />
                                    <ReactRouterDOM.Route path="collab/:id" element={<CollabRedirect />} />

                                    <ReactRouterDOM.Route path="quest/:id/identity" element={<QuestIdentityPage />} />
                                    <ReactRouterDOM.Route path="quest/:id" element={<QuestDetailPage />} />
                                    <ReactRouterDOM.Route path="campaign/:id" element={<CampaignDetailPage />} />
                                    <ReactRouterDOM.Route path="nft" element={<NFTPage />} />

                                    <ReactRouterDOM.Route path="meme" element={<MemePage />} />

                                    {/* Early Projects is now public, with internal checks */}
                                    <ReactRouterDOM.Route path="early-projects" element={<EarlyProjectsPage />} />
                                    <ReactRouterDOM.Route path="ledger" element={<LedgerPage />} />

                                    {/* Protected User Profile Routes */}
                                    <ReactRouterDOM.Route path="profile" element={<ProfilePage />} />
                                    <ReactRouterDOM.Route path="ledger/:id" element={<ProfilePage />} />
                                    <ReactRouterDOM.Route path="ledger/:id/points" element={<PointsPage />} />

                                    {/* Project routes - new name-based routing at root (/:id).
                                        Legacy /project/:id/* routes are kept but redirect to the new name-based path
                                        so old bookmarks continue to work. Static routes above are matched first. */}

                                    {/* New root-level project routes (name or id accepted by page components) */}
                                    <ReactRouterDOM.Route path=":id/*" element={<ProjectProfilePage />} />
                                    <ReactRouterDOM.Route path=":id/tasks" element={<ProjectTasksPage />} />
                                    <ReactRouterDOM.Route path=":id/leaderboard" element={<ProjectLeaderboardPage />} />

                                    {/* Legacy routes: redirect to the new root-level path. */}
                                    <ReactRouterDOM.Route path="project/:id/*" element={<ProjectRedirect />} />
                                    <ReactRouterDOM.Route path="project/:id/tasks" element={<ProjectRedirect />} />
                                    <ReactRouterDOM.Route path="project/:id/leaderboard" element={<ProjectRedirect />} />

                                    <ReactRouterDOM.Route path="auth/callback" element={<AuthCallback />} />

                                    {/* Project Routes */}
                                    <ReactRouterDOM.Route path="project" element={<ReactRouterDOM.Navigate to="/ecosystem" replace />} />

                                    {/* Super Admin Routes */}
                                    {/* Super Admin Routes */}
                                    <ReactRouterDOM.Route element={<ProtectedRoute roles={['super_admin']} />}>
                                        <ReactRouterDOM.Route path="super-admin" element={<SuperAdminLayout />}>
                                            <ReactRouterDOM.Route index element={<ReactRouterDOM.Navigate to="users" replace />} />
                                            <ReactRouterDOM.Route path="users" element={<UserManagementTab />} />
                                            <ReactRouterDOM.Route path="project-detail/add" element={<AddProjectPage />} />
                                            <ReactRouterDOM.Route path="project-detail" element={<ManageProjectDetail />} />
                                            <ReactRouterDOM.Route path="project-detail/manage" element={<ManageProjectsPage />} />
                                            <ReactRouterDOM.Route path="events" element={<ManageEventsPage />} />
                                            <ReactRouterDOM.Route path="collabs" element={<ManageCollabsPage />} />
                                            <ReactRouterDOM.Route path="nfts" element={<ManageNftTab />} />
                                            <ReactRouterDOM.Route path="nfts/add" element={<AddNftCollectionPage />} />
                                            <ReactRouterDOM.Route path="nfts/edit/:projectId/:collectionId" element={<EditNftCollectionPage />} />



                                            <ReactRouterDOM.Route path="project-detail/:id" element={<SuperAdminProjectLayout />}>
                                                <ReactRouterDOM.Route index element={<ReactRouterDOM.Navigate to="points" replace />} />
                                                <ReactRouterDOM.Route path="points" element={<ProjectPointsSettingsTab />} />
                                                <ReactRouterDOM.Route path="info" element={<ProjectInfoSettingsTab />} />
                                                <ReactRouterDOM.Route path="status" element={<ProjectStatusSettingsTab />} />
                                            </ReactRouterDOM.Route>
                                        </ReactRouterDOM.Route>
                                    </ReactRouterDOM.Route>


                                </ReactRouterDOM.Route>
                            </ReactRouterDOM.Routes>
                        </Suspense>
                    </div>
                </div>
            </>
        </ReactRouterDOM.BrowserRouter>
    )
}
