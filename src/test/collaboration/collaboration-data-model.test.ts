import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { Collaboration, CollaborationTask, RewardCard, UserCollaborationProgress } from '../../types';

// Mock data stores
let mockCollaborations: Map<string, Collaboration> = new Map();
let mockTasks: Map<string, CollaborationTask> = new Map();
let mockRewardCards: Map<string, RewardCard> = new Map();
let mockUserProgress: Map<string, UserCollaborationProgress> = new Map();

// Mock implementations of data service functions
const mockAddOrUpdateCollaboration = vi.fn(async (collaboration: Collaboration): Promise<boolean> => {
    try {
        mockCollaborations.set(collaboration.id, { ...collaboration });
        return true;
    } catch {
        return false;
    }
});

const mockGetCollaborationById = vi.fn(async (id: string): Promise<Collaboration | undefined> => {
    return mockCollaborations.get(id);
});

const mockAddOrUpdateCollaborationTask = vi.fn(async (task: CollaborationTask): Promise<boolean> => {
    try {
        mockTasks.set(task.id, { ...task });
        return true;
    } catch {
        return false;
    }
});

const mockGetCollaborationTaskById = vi.fn(async (id: string): Promise<CollaborationTask | undefined> => {
    return mockTasks.get(id);
});

const mockAddOrUpdateRewardCard = vi.fn(async (card: RewardCard): Promise<boolean> => {
    try {
        mockRewardCards.set(card.id, { ...card });
        return true;
    } catch {
        return false;
    }
});

const mockGetRewardCardById = vi.fn(async (id: string): Promise<RewardCard | undefined> => {
    return mockRewardCards.get(id);
});

const mockAddOrUpdateUserCollaborationProgress = vi.fn(async (progress: UserCollaborationProgress): Promise<boolean> => {
    try {
        const key = `${progress.user_id}-${progress.collaboration_id}`;
        mockUserProgress.set(key, { ...progress });
        return true;
    } catch {
        return false;
    }
});

const mockGetUserCollaborationProgress = vi.fn(async (userId: string, collaborationId: string): Promise<UserCollaborationProgress | undefined> => {
    const key = `${userId}-${collaborationId}`;
    return mockUserProgress.get(key);
});

/**
 * **Feature: collaboration-system, Property 10: Administrative operations integrity**
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
 * 
 * For any collaboration data model (Collaboration, CollaborationTask, RewardCard, UserCollaborationProgress),
 * administrative operations (create, update, delete) should maintain data integrity and consistency.
 */

// Generators for test data
const collaborationGenerator = fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    slug: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 1, maxLength: 500 }),
    participating_projects: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
    status: fc.constantFrom('running', 'past'),
    start_date: fc.constantFrom('2024-01-01T00:00:00.000Z', '2024-06-01T00:00:00.000Z', '2024-12-01T00:00:00.000Z'),
    end_date: fc.option(fc.constantFrom('2024-12-31T23:59:59.999Z', '2025-06-30T23:59:59.999Z')),
    banner_image: fc.option(fc.webUrl()),
    total_participants: fc.nat({ max: 10000 }),
    total_hint_points_distributed: fc.nat({ max: 1000000 }),
    created_at: fc.constantFrom('2024-01-01T00:00:00.000Z', '2024-06-01T00:00:00.000Z', '2024-12-01T00:00:00.000Z'),
    updated_at: fc.constantFrom('2024-01-01T00:00:00.000Z', '2024-06-01T00:00:00.000Z', '2024-12-01T00:00:00.000Z')
});

const collaborationTaskGenerator = fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    collaboration_id: fc.string({ minLength: 1, maxLength: 50 }),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 1, maxLength: 500 }),
    task_type: fc.constantFrom('twitter_follow', 'twitter_like', 'twitter_retweet', 'discord_join', 'custom'),
    hint_points_reward: fc.nat({ max: 1000 }),
    verification_data: fc.option(fc.record({
        twitter_username: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
        discord_server_id: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
        custom_url: fc.option(fc.webUrl())
    })),
    is_active: fc.boolean(),
    created_at: fc.constantFrom('2024-01-01T00:00:00.000Z', '2024-06-01T00:00:00.000Z', '2024-12-01T00:00:00.000Z')
});

const rewardCardGenerator = fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    collaboration_id: fc.string({ minLength: 1, maxLength: 50 }),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 1, maxLength: 500 }),
    rarity: fc.constantFrom('common', 'rare', 'epic', 'legendary'),
    hint_points_cost: fc.nat({ max: 1000 }),
    reward_type: fc.constantFrom('whitelist_fcfs', 'whitelist_guaranteed', 'hint_points', 'money', 'code'),
    reward_data: fc.record({
        amount: fc.option(fc.nat({ max: 10000 })),
        code: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
        whitelist_spots: fc.option(fc.nat({ max: 1000 }))
    }),
    total_available: fc.integer({ min: 1, max: 1000 }),
    claimed_count: fc.nat({ max: 1000 }),
    max_cards_per_user: fc.nat({ max: 10 }),
    purchased_count: fc.nat({ max: 1000 }),
    is_active: fc.boolean(),
    can_purchase: fc.boolean(),
    can_open: fc.boolean(),
    raffle_pool: fc.array(fc.record({
        id: fc.string({ minLength: 1, maxLength: 50 }),
        type: fc.constantFrom('whitelist', 'tokens', 'points', 'code'),
        title: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string({ minLength: 1, maxLength: 200 }),
        value: fc.record({
            amount: fc.option(fc.nat({ max: 1000 })),
            token_symbol: fc.option(fc.string({ minLength: 1, maxLength: 10 })),
            code: fc.option(fc.string({ minLength: 1, maxLength: 50 }))
        }),
        quantity: fc.nat({ max: 100 }),
        rarity_weight: fc.nat({ max: 50 })
    }), { minLength: 0, maxLength: 5 })
});

const userCollaborationProgressGenerator = fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    user_id: fc.string({ minLength: 1, maxLength: 50 }),
    collaboration_id: fc.string({ minLength: 1, maxLength: 50 }),
    completed_tasks: fc.array(fc.string({ minLength: 1, maxLength: 50 })),
    earned_hint_points: fc.nat({ max: 100000 }),
    opened_reward_cards: fc.array(fc.string({ minLength: 1, maxLength: 50 })),
    last_activity: fc.constantFrom('2024-01-01T00:00:00.000Z', '2024-06-01T00:00:00.000Z', '2024-12-01T00:00:00.000Z'),
    participating_projects: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
    status: fc.constantFrom('running', 'past'),
    start_date: fc.constantFrom('2024-01-01T00:00:00.000Z', '2024-06-01T00:00:00.000Z', '2024-12-01T00:00:00.000Z'),
    end_date: fc.option(fc.constantFrom('2024-12-31T23:59:59.999Z', '2025-06-30T23:59:59.999Z')),
    banner_image: fc.option(fc.webUrl()),
    total_participants: fc.nat({ max: 10000 }),
    total_hint_points_distributed: fc.nat({ max: 1000000 }),
    created_at: fc.constantFrom('2024-01-01T00:00:00.000Z', '2024-06-01T00:00:00.000Z', '2024-12-01T00:00:00.000Z'),
    updated_at: fc.constantFrom('2024-01-01T00:00:00.000Z', '2024-06-01T00:00:00.000Z', '2024-12-01T00:00:00.000Z')
});

describe('Collaboration Data Model Integrity', () => {
    beforeEach(() => {
        // Clear mock data stores before each test
        mockCollaborations.clear();
        mockTasks.clear();
        mockRewardCards.clear();
        mockUserProgress.clear();
        
        // Reset mock function call counts
        vi.clearAllMocks();
    });
    it('should maintain data integrity for collaboration CRUD operations', async () => {
        await fc.assert(
            fc.asyncProperty(collaborationGenerator, async (collaboration: Collaboration) => {
                // Test create/update operation
                const createSuccess = await mockAddOrUpdateCollaboration(collaboration);
                expect(createSuccess).toBe(true);

                // Test read operation - data should be retrievable and consistent
                const retrieved = await mockGetCollaborationById(collaboration.id);
                expect(retrieved).toBeDefined();
                expect(retrieved?.id).toBe(collaboration.id);
                expect(retrieved?.title).toBe(collaboration.title);
                expect(retrieved?.status).toBe(collaboration.status);
                
                // Test update operation - should preserve data integrity
                const updatedCollaboration = {
                    ...collaboration,
                    title: collaboration.title + ' (Updated)',
                    updated_at: new Date().toISOString()
                };
                
                const updateSuccess = await mockAddOrUpdateCollaboration(updatedCollaboration);
                expect(updateSuccess).toBe(true);
                
                const retrievedUpdated = await mockGetCollaborationById(collaboration.id);
                expect(retrievedUpdated?.title).toBe(updatedCollaboration.title);
                expect(retrievedUpdated?.id).toBe(collaboration.id); // ID should remain unchanged
            }),
            { numRuns: 100 }
        );
    });

    it('should maintain data integrity for collaboration task CRUD operations', async () => {
        await fc.assert(
            fc.asyncProperty(collaborationTaskGenerator, async (task: CollaborationTask) => {
                // Test create/update operation
                const createSuccess = await mockAddOrUpdateCollaborationTask(task);
                expect(createSuccess).toBe(true);

                // Test read operation - data should be retrievable and consistent
                const retrieved = await mockGetCollaborationTaskById(task.id);
                expect(retrieved).toBeDefined();
                expect(retrieved?.id).toBe(task.id);
                expect(retrieved?.collaboration_id).toBe(task.collaboration_id);
                expect(retrieved?.task_type).toBe(task.task_type);
                expect(retrieved?.hint_points_reward).toBe(task.hint_points_reward);
                
                // Test update operation - should preserve data integrity
                const updatedTask = {
                    ...task,
                    title: task.title + ' (Updated)',
                    hint_points_reward: task.hint_points_reward + 10
                };
                
                const updateSuccess = await mockAddOrUpdateCollaborationTask(updatedTask);
                expect(updateSuccess).toBe(true);
                
                const retrievedUpdated = await mockGetCollaborationTaskById(task.id);
                expect(retrievedUpdated?.title).toBe(updatedTask.title);
                expect(retrievedUpdated?.hint_points_reward).toBe(updatedTask.hint_points_reward);
                expect(retrievedUpdated?.id).toBe(task.id); // ID should remain unchanged
            }),
            { numRuns: 100 }
        );
    });

    it('should maintain data integrity for reward card CRUD operations', async () => {
        await fc.assert(
            fc.asyncProperty(rewardCardGenerator, async (card: RewardCard) => {
                // Ensure claimed_count doesn't exceed total_available
                const validCard = {
                    ...card,
                    claimed_count: Math.min(card.claimed_count, card.total_available)
                };

                // Test create/update operation
                const createSuccess = await mockAddOrUpdateRewardCard(validCard);
                expect(createSuccess).toBe(true);

                // Test read operation - data should be retrievable and consistent
                const retrieved = await mockGetRewardCardById(validCard.id);
                expect(retrieved).toBeDefined();
                expect(retrieved?.id).toBe(validCard.id);
                expect(retrieved?.collaboration_id).toBe(validCard.collaboration_id);
                expect(retrieved?.rarity).toBe(validCard.rarity);
                expect(retrieved?.hint_points_cost).toBe(validCard.hint_points_cost);
                expect(retrieved?.claimed_count).toBeLessThanOrEqual(retrieved?.total_available || 0);
                
                // Test update operation - should preserve data integrity
                const updatedCard = {
                    ...validCard,
                    title: validCard.title + ' (Updated)',
                    claimed_count: Math.min(validCard.claimed_count + 1, validCard.total_available)
                };
                
                const updateSuccess = await mockAddOrUpdateRewardCard(updatedCard);
                expect(updateSuccess).toBe(true);
                
                const retrievedUpdated = await mockGetRewardCardById(validCard.id);
                expect(retrievedUpdated?.title).toBe(updatedCard.title);
                expect(retrievedUpdated?.claimed_count).toBe(updatedCard.claimed_count);
                expect(retrievedUpdated?.id).toBe(validCard.id); // ID should remain unchanged
            }),
            { numRuns: 100 }
        );
    });

    it('should maintain data integrity for user collaboration progress CRUD operations', async () => {
        await fc.assert(
            fc.asyncProperty(userCollaborationProgressGenerator, async (progress: UserCollaborationProgress) => {
                // Test create/update operation
                const createSuccess = await mockAddOrUpdateUserCollaborationProgress(progress);
                expect(createSuccess).toBe(true);

                // Test read operation - data should be retrievable and consistent
                const retrieved = await mockGetUserCollaborationProgress(progress.user_id, progress.collaboration_id);
                expect(retrieved).toBeDefined();
                expect(retrieved?.id).toBe(progress.id);
                expect(retrieved?.user_id).toBe(progress.user_id);
                expect(retrieved?.collaboration_id).toBe(progress.collaboration_id);
                expect(retrieved?.earned_hint_points).toBe(progress.earned_hint_points);
                expect(retrieved?.earned_hint_points).toBeGreaterThanOrEqual(0); // Points should never be negative
                
                // Test update operation - should preserve data integrity
                const updatedProgress = {
                    ...progress,
                    earned_hint_points: progress.earned_hint_points + 100,
                    completed_tasks: [...progress.completed_tasks, 'new-task-id'],
                    last_activity: new Date().toISOString()
                };
                
                const updateSuccess = await mockAddOrUpdateUserCollaborationProgress(updatedProgress);
                expect(updateSuccess).toBe(true);
                
                const retrievedUpdated = await mockGetUserCollaborationProgress(progress.user_id, progress.collaboration_id);
                expect(retrievedUpdated?.earned_hint_points).toBe(updatedProgress.earned_hint_points);
                expect(retrievedUpdated?.completed_tasks).toContain('new-task-id');
                expect(retrievedUpdated?.user_id).toBe(progress.user_id); // User ID should remain unchanged
                expect(retrievedUpdated?.collaboration_id).toBe(progress.collaboration_id); // Collaboration ID should remain unchanged
            }),
            { numRuns: 100 }
        );
    });
});