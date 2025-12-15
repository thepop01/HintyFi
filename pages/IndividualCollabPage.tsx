import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Trophy, ArrowLeft, Target } from 'lucide-react';
import {
    Collaboration,
    Project,
    CollaborationTask,
    MysteryCard,
    UserCollaborationProgress,
    UserCardPurchase
} from '../src/types';
import {
    getCollabBySlug,
    getProjectsFromDB,
    getCollabTasks,
    getMysteryCard,
    getUserCollaborationProgress,
    completeCollabTask,
    purchaseMysteryCard,
    getUserCardPurchases,
    getCollabProjects
} from '../src/services/dataService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CollabDetailHero from '../components/collab/CollabDetailHero';
import CollabTaskTable from '../components/collab/CollabTaskTable';
import CollabTaskStatusTracker from '../components/collab/CollabTaskStatusTracker';
import MysteryCardPurchase from '../components/collab/MysteryCardPurchase';
import PurchasedCardsDisplay from '../components/collab/PurchasedCardsDisplay';
import RewardsWonDisplay from '../components/collab/RewardsWonDisplay';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

import ScrollToTopButton from '../components/common/ScrollToTopButton';

const IndividualCollabPage: React.FC = () => {
    console.log("IndividualCollabPage loaded");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { addToast } = useToast();

    const [collaboration, setCollaboration] = useState<Collaboration | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<CollaborationTask[]>([]);
    const [mysteryCard, setMysteryCard] = useState<MysteryCard | null>(null);
    const [userPurchases, setUserPurchases] = useState<UserCardPurchase[]>([]);
    const [userProgress, setUserProgress] = useState<UserCollaborationProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Set document title when collaboration is loaded
    useEffect(() => {
        if (collaboration) {
            document.title = `${collaboration.title} - Collab | HintyFi`;
        }
        return () => {
            document.title = 'HintyFi'; // Reset title when component unmounts
        };
    }, [collaboration]);

    useEffect(() => {
        const loadData = async () => {
            if (!id) {
                setError('Collab ID not provided');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                // Load collaboration details
                const collaborationData = await getCollabBySlug(id);
                if (!collaborationData) {
                    setError('Collab not found');
                    setIsLoading(false);
                    return;
                }

                setCollaboration(collaborationData);

                // Load all related data in parallel
                const [
                    projectsData,
                    tasksData,
                    mysteryCardData,
                    userProgressData,
                    userPurchasesData,
                    extraProjectsData
                ] = await Promise.all([
                    getProjectsFromDB({ includePending: false }),
                    getCollabTasks(collaborationData.id),
                    getMysteryCard(collaborationData.id),
                    currentUser ? getUserCollaborationProgress(currentUser.id, collaborationData.id) : Promise.resolve(null),
                    currentUser ? getUserCardPurchases(currentUser.id, collaborationData.id) : Promise.resolve([])
                ]);

                // Filter projects to only those participating in this collaboration
                const participatingProjects = projectsData.filter(p =>
                    collaborationData.participating_projects.includes(p.id)
                );

                setProjects(participatingProjects);
                setTasks(tasksData);
                setMysteryCard(mysteryCardData || null);
                setUserProgress(userProgressData);
                setUserPurchases(userPurchasesData);

            } catch (error) {
                console.error('Error loading collaboration data:', error);
                setError('Failed to load collaboration data');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id, currentUser]);

    const handleTaskComplete = async (taskId: string) => {
        if (!currentUser || !collaboration) {
            throw new Error('User not authenticated or collaboration not loaded');
        }

        try {
            // Complete the task on the backend
            const result = await completeCollabTask(taskId, currentUser.id);

            if (!result.success) {
                throw new Error(result.message);
            }

            // Reload user progress after task completion
            const updatedProgress = await getUserCollaborationProgress(currentUser.id, collaboration.id);
            setUserProgress(updatedProgress);

            // Update collaboration stats if needed
            const updatedCollaboration = await getCollabBySlug(collaboration.slug);
            if (updatedCollaboration) {
                setCollaboration(updatedCollaboration);
            }

        } catch (error) {
            console.error('Error completing task:', error);
            throw error; // Re-throw to be handled by TaskTable
        }
    };

    const handleMysteryCardPurchase = async (cardId: string): Promise<{ success: boolean; message: string }> => {
        if (!currentUser || !collaboration) {
            return { success: false, message: 'Please connect your wallet to purchase mystery cards.' };
        }

        try {
            // Purchase the mystery card
            const result = await purchaseMysteryCard(cardId, currentUser.id);

            if (result.success) {
                // Reload user progress, mystery card and purchases after purchase
                const [updatedProgress, updatedCard, updatedPurchases] = await Promise.all([
                    getUserCollaborationProgress(currentUser.id, collaboration.id),
                    getMysteryCard(collaboration.id),
                    getUserCardPurchases(currentUser.id, collaboration.id)
                ]);
                setUserProgress(updatedProgress);
                setMysteryCard(updatedCard || null);
                setUserPurchases(updatedPurchases);

                // Update collaboration stats if needed
                const updatedCollaboration = await getCollabBySlug(collaboration.slug);
                if (updatedCollaboration) {
                    setCollaboration(updatedCollaboration);
                }

                return {
                    success: true,
                    message: result.message
                };
            } else {
                return {
                    success: false,
                    message: result.message
                };
            }
        } catch (error) {
            console.error('Error purchasing mystery card:', error);
            return {
                success: false,
                message: 'Failed to purchase mystery card. Please try again.'
            };
        }
    };

    const handleCardOpened = async () => {
        if (!currentUser || !collaboration) return;
        // Reload purchases to reflect opened status
        const updatedPurchases = await getUserCardPurchases(currentUser.id, collaboration.id);
        setUserPurchases(updatedPurchases);
    };

    if (isLoading) {
        return <Loader />;
    }

    if (error || !collaboration) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <EmptyState
                    icon={<Users size={48} />}
                    title="Collab Not Found"
                    description={error || "The collab you're looking for doesn't exist or has been removed."}
                />
            </div>
        );
    }

    const isRunning = collaboration.status === 'running';
    const completedTasks = userProgress?.completed_tasks.length || 0;
    const totalTasks = tasks.length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="min-h-screen">

            <div className="max-w-[84rem] mx-auto px-4 sm:px-6">
                {/* Back Navigation */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/collabs')}
                        className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Collabs</span>
                    </button>
                </div>

                {/* Simple Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <h1 className="text-4xl lg:text-6xl font-display font-extrabold text-on-background tracking-tight">
                            {collaboration.title}
                        </h1>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${isRunning
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-gray-500/20 text-gray-500'
                            }`}>
                            {isRunning ? <Trophy size={16} /> : <Trophy size={16} />}
                            <span>{isRunning ? 'Active' : 'Completed'}</span>
                        </div>
                    </div>

                    <p className="text-lg text-on-background-variant max-w-4xl">
                        {collaboration.description}
                    </p>
                </div>
            </div>

            {/* Hero Section */}
            <CollabDetailHero
                collaboration={collaboration}
                projects={projects}
            />

            <div className="max-w-[84rem] mx-auto px-4 sm:px-6">


                {/* Tasks Section */}
                <div className="mt-12 md:mt-16">
                    <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-on-background">
                            Collab Tasks
                        </h2>
                        <p className="text-base sm:text-lg font-subheading text-on-background-variant mt-1">
                            Complete tasks to earn hint points and unlock rewards.
                        </p>
                    </div>

                    {tasks.length > 0 ? (
                        <div className="space-y-6">
                            {/* Task Status Tracker (only show if user is logged in) */}
                            {currentUser && (
                                <CollabTaskStatusTracker
                                    tasks={tasks}
                                    userProgress={userProgress}
                                    collaborationTitle={collaboration.title}
                                />
                            )}

                            {/* Task Table */}
                            <CollabTaskTable
                                tasks={tasks}
                                userProgress={userProgress}
                                onTaskComplete={handleTaskComplete}
                                isCollaborationRunning={isRunning}
                            />
                        </div>
                    ) : (
                        <EmptyState
                            icon={<Target size={48} />}
                            title="No Tasks Available"
                            description="There are currently no tasks available for this collaboration."
                        />
                    )}
                </div>

                {/* Mystery Cards Section */}
                <div className="mt-12 md:mt-16">
                    <div className="mb-8">
                        <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-on-background">
                            Mystery Cards
                        </h2>
                        <p className="text-base sm:text-lg font-subheading text-on-background-variant mt-1">
                            {isRunning
                                ? "Buy mystery cards with hint points during the collaboration. Open them after it ends to reveal your rewards!"
                                : "The collaboration has ended! Open your purchased cards to reveal your rewards."
                            }
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Mystery Card Purchase */}
                        <div className="lg:col-span-1">
                            <MysteryCardPurchase
                                mysteryCard={mysteryCard}
                                userProgress={userProgress}
                                userPurchases={userPurchases.length}
                                onPurchase={handleMysteryCardPurchase}
                                isCollabRunning={isRunning}
                            />
                        </div>

                        {/* User's Cards and Rewards */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Purchased Cards Display */}
                            {currentUser && (
                                <PurchasedCardsDisplay
                                    purchases={userPurchases}
                                    isCollabRunning={isRunning}
                                />
                            )}

                            {/* Rewards Won Display */}
                            {currentUser && (
                                <RewardsWonDisplay
                                    purchases={userPurchases}
                                    isCollabRunning={isRunning}
                                    onCardOpened={handleCardOpened}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll to Top Button */}
            <ScrollToTopButton scrollableSelector="body" />
        </div>
    );
};

export default IndividualCollabPage;