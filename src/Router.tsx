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
const IDOPage = lazy(() => import('../pages/IDOPage'));
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


// Admin Pages (New Structure)
const AdminProjectSelectionPage = lazy(() => import('../pages/admin/AdminProjectSelectionPage'));
const ProjectAdminLayout = lazy(() => import('../layouts/ProjectAdminLayout'));
const AdminEditProjectPage = lazy(() => import('../pages/admin/project/AdminEditProjectPage'));
const AdminProjectCampaignsPage = lazy(() => import('../pages/admin/project/AdminProjectCampaignsPage'));
const AdminProjectTasksPage = lazy(() => import('../pages/admin/project/AdminProjectTasksPage'));
const AdminProjectNftsMemesPage = lazy(() => import('../pages/admin/project/AdminProjectNftsMemesPage'));
const AdminProjectDiscordRolesPage = lazy(() => import('../pages/admin/project/AdminProjectDiscordRolesPage'));


// Super Admin Pages & Layout
const SuperAdminLayout = lazy(() => import('../pages/SuperAdminPage'));
const UserManagementTab = lazy(() => import('../components/admin/UserManagementTab'));
const ManageProjectDetail = lazy(() => import('../components/admin/manageprojectdetail'));
const ContentManagementTab = lazy(() => import('../components/admin/ContentManagementTab'));
const ManageQuestsTab = lazy(() => import('../components/admin/ManageQuestsTab'));
const ManageNftTab = lazy(() => import('../components/admin/ManageNftTab'));
const AddNftCollectionPage = lazy(() => import('../components/admin/AddNftCollectionPage'));
const EditNftCollectionPage = lazy(() => import('../components/admin/EditNftCollectionPage'));
const ManageMemeTab = lazy(() => import('../components/admin/ManageMemeTab'));
const AddMemePage = lazy(() => import('../components/admin/AddMemePage'));
const ManageIdoTab = lazy(() => import('../components/admin/ManageIdoTab'));
const AddIdoPage = lazy(() => import('../pages/admin/AddIdoPage'));
const ManageThisWeekTab = lazy(() => import('../pages/admin/superadmin/ManageThisWeekTab'));


// Super Admin Project Management Pages & Layout
const SuperAdminProjectLayout = lazy(() => import('../layouts/SuperAdminProjectLayout'));
const ProjectPointsSettingsTab = lazy(() => import('../pages/admin/superadmin/ProjectPointsSettingsTab'));
const ProjectInfoSettingsTab = lazy(() => import('../pages/admin/superadmin/ProjectInfoSettingsTab'));
const ProjectStatusSettingsTab = lazy(() => import('../pages/admin/superadmin/ProjectStatusSettingsTab'));
const ProjectCampaignsVerificationTab = lazy(() => import('../pages/admin/superadmin/ProjectCampaignsVerificationTab'));
const ProjectTasksVerificationTab = lazy(() => import('../pages/admin/superadmin/ProjectTasksVerificationTab'));
const AddProjectPage = lazy(() => import('../pages/admin/superadmin/AddProjectPage'));


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

                                    <ReactRouterDOM.Route path="quest/:id/identity" element={<QuestIdentityPage />} />
                                    <ReactRouterDOM.Route path="quest/:id" element={<QuestDetailPage />} />
                                    <ReactRouterDOM.Route path="campaign/:id" element={<CampaignDetailPage />} />
                                    <ReactRouterDOM.Route path="nft" element={<NFTPage />} />
                                    <ReactRouterDOM.Route path="ido" element={<IDOPage />} />
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
                                            <ReactRouterDOM.Route path="content" element={<ContentManagementTab />} />
                                            <ReactRouterDOM.Route path="quests" element={<ManageQuestsTab />} />
                                            <ReactRouterDOM.Route path="nfts" element={<ManageNftTab />} />
                                            <ReactRouterDOM.Route path="nfts/add" element={<AddNftCollectionPage />} />
                                            <ReactRouterDOM.Route path="nfts/edit/:projectId/:collectionId" element={<EditNftCollectionPage />} />
                                            <ReactRouterDOM.Route path="memes" element={<ManageMemeTab />} />
                                            <ReactRouterDOM.Route path="memes/add" element={<AddMemePage />} />
                                            <ReactRouterDOM.Route path="idos" element={<ManageIdoTab />} />
                                            <ReactRouterDOM.Route path="idos/add" element={<AddIdoPage />} />
                                            <ReactRouterDOM.Route path="this-week" element={<ManageThisWeekTab />} />
                                            <ReactRouterDOM.Route path="project-management/:id" element={<SuperAdminProjectLayout />}>
                                                <ReactRouterDOM.Route index element={<ReactRouterDOM.Navigate to="points" replace />} />
                                                <ReactRouterDOM.Route path="points" element={<ProjectPointsSettingsTab />} />
                                                <ReactRouterDOM.Route path="info" element={<ProjectInfoSettingsTab />} />
                                                <ReactRouterDOM.Route path="status" element={<ProjectStatusSettingsTab />} />
                                                <ReactRouterDOM.Route path="campaigns" element={<ProjectCampaignsVerificationTab />} />
                                                <ReactRouterDOM.Route path="tasks" element={<ProjectTasksVerificationTab />} />
                                            </ReactRouterDOM.Route>
                                        </ReactRouterDOM.Route>
                                    </ReactRouterDOM.Route>

                                    {/* Admin Routes */}
                                    <ReactRouterDOM.Route element={<ProtectedRoute roles={['project_admin', 'super_admin']} />}>
                                        <ReactRouterDOM.Route path="admin" element={<AdminProjectSelectionPage />} />
                                        <ReactRouterDOM.Route path="admin/project/:id" element={<ProjectAdminLayout />}>
                                            <ReactRouterDOM.Route index element={<ReactRouterDOM.Navigate to="edit" replace />} />
                                            <ReactRouterDOM.Route path="edit" element={<AdminEditProjectPage />} />
                                            <ReactRouterDOM.Route path="campaigns" element={<AdminProjectCampaignsPage />} />
                                            <ReactRouterDOM.Route path="tasks" element={<AdminProjectTasksPage />} />
                                            <ReactRouterDOM.Route path="nfts-memes" element={<AdminProjectNftsMemesPage />} />
                                            <ReactRouterDOM.Route path="discord-roles" element={<AdminProjectDiscordRolesPage />} />
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
