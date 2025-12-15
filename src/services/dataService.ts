// This file contains all the data access functions for the application.
// It interacts with a Supabase backend.

import {
    User, Event, Project, Quest, CredoSettings,
    WeeklyDiscordEvent, SiteContentSettings,
    Collaboration as Collab, CollaborationTask as CollabTask, RewardCard, UserCollaborationProgress,
    RaffleReward, UserCardPurchase, MysteryCard, CollabProject
} from '../types';
import { supabase } from './supabaseClient';

// --- DATA ACCESS FUNCTIONS ---

// USERS
export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }
    // Map platform_username to name for client-side consistency
    return data.map(user => ({ ...user, name: user.platform_username })) as User[];
};

export const getUserById = async (id: string): Promise<User | undefined> => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) {
        console.error('Error fetching user by id:', error);
        return undefined;
    }
    return data as User;
}

export const getUserByWallet = async (address: string): Promise<User | undefined> => {
    const { data, error } = await supabase.from('users').select('*').eq('wallet_address', address).single();
    if (error) {
        // Not finding a user isn't necessarily an error to log everywhere.
        if (error.code !== 'PGRST116') {
            console.error('Error fetching user by wallet:', error);
        }
        return undefined;
    }
    return data as User;
};

export const createUserWithWallet = async (address: string): Promise<User | null> => {
    const { data, error } = await supabase.from('users').insert({ wallet_address: address, name: `User ${address.slice(0, 6)}`, role: 'member' }).select().single();
    if (error) {
        console.error('Error creating user with wallet:', error);
        return null;
    }
    return data as User;
};


// PROJECTS
export const getProjects = (options?: { includePending?: boolean }): Promise<Project[]> => {
    return getProjectsFromDB(options);
};

export const getIdos = async (): Promise<any[]> => {
    const { data, error } = await supabase.from('idos').select(`
        *,
        projects (*)
    `);
    if (error) {
        console.error('Error fetching idos:', error);
        return [];
    }
    return data.map(ido => ({ ...ido, ...ido.projects }));
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
    const projects = await getProjectsFromDB({ includePending: true });
    return projects.find(p => p.id === id || p.name.toLowerCase() === id.toLowerCase());
}
export const getMemes = async (): Promise<any[]> => {
    const { data, error } = await supabase.from('memes').select('*');
    if (error) {
        console.error('Error fetching memes:', error);
        return [];
    }
    return data;
};

export const addOrUpdateMeme = async (meme: any): Promise<boolean> => {
    const { error } = await supabase.from('memes').upsert(meme);
    if (error) {
        console.error("Failed to save meme", error);
        return false;
    }
    return true;
}

export const getNfts = async (): Promise<any[]> => {
    const { data, error } = await supabase.from('nfts').select('*');
    if (error) {
        console.error('Error fetching nfts:', error);
        return [];
    }
    return data;
};

export const addOrUpdateNft = async (nft: any): Promise<boolean> => {
    const { error } = await supabase.from('nfts').upsert(nft);
    if (error) {
        console.error("Failed to save nft", error);
        return false;
    }
    return true;
}

// EVENTS
export const getEvents = async (): Promise<Event[]> => {
    const { data, error } = await supabase.from('campaigns').select('*');
    if (error) {
        console.error('Error fetching events from campaigns table:', error);
        return [];
    }
    // Filter or transform data as needed to match Event type
    return data as unknown as Event[];
};

export const enterCampaign = async (campaignId: string, userId: string, link: string): Promise<{ success: boolean, message: string }> => {
    // First check if the campaign exists and is active
    const { data: campaign } = await supabase.from('campaigns').select('*').eq('id', campaignId).single();

    if (!campaign) {
        return { success: false, message: 'Campaign not found.' };
    }

    if (campaign.status !== 'approved') {
        return { success: false, message: 'This campaign is not active.' };
    }

    const now = Date.now();
    if (now < campaign.startTime || now > campaign.endTime) {
        return { success: false, message: 'This campaign is not currently accepting entries.' };
    }

    // Check if user already submitted an entry
    const { data: existingEntries } = await supabase
        .from('campaign_entries')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('user_id', userId);

    if (existingEntries && existingEntries.length > 0) {
        return { success: false, message: 'You have already submitted an entry for this campaign.' };
    }

    // Add the entry
    const { error } = await supabase.from('campaign_entries').insert({
        campaign_id: campaignId,
        user_id: userId,
        link: link,
        votes: { up: 0, down: 0 },
        voters: []
    });

    if (error) {
        console.error('Error submitting campaign entry:', error);
        return { success: false, message: 'Failed to submit entry.' };
    }

    return { success: true, message: 'Your entry has been submitted successfully!' };
};

export const voteCampaignEntry = async (entryId: string, userId: string, voteType: 'up' | 'down'): Promise<{ success: boolean, message: string }> => {
    // Get the entry
    const { data: entry, error: entryError } = await supabase
        .from('campaign_entries')
        .select('*')
        .eq('id', entryId)
        .single();

    if (entryError || !entry) {
        console.error('Error fetching campaign entry:', entryError);
        return { success: false, message: 'Entry not found.' };
    }

    // Check if user already voted
    const existingVoteIndex = entry.voters?.findIndex((v: any) => v.userId === userId);
    let updatedVoters = [...(entry.voters || [])];
    let updatedVotes = { ...entry.votes };

    if (existingVoteIndex >= 0) {
        const existingVote = updatedVoters[existingVoteIndex].vote;

        // If same vote type, remove the vote (toggle off)
        if (existingVote === voteType) {
            updatedVoters = updatedVoters.filter((_, i) => i !== existingVoteIndex);
            updatedVotes[voteType] -= 1;
        } else {
            // Change vote type
            updatedVoters[existingVoteIndex].vote = voteType;
            updatedVotes[existingVote] -= 1;
            updatedVotes[voteType] += 1;
        }
    } else {
        // Add new vote
        updatedVoters.push({ userId, vote: voteType });
        updatedVotes[voteType] += 1;
    }

    // Update the entry
    const { error: updateError } = await supabase
        .from('campaign_entries')
        .update({
            votes: updatedVotes,
            voters: updatedVoters
        })
        .eq('id', entryId);

    if (updateError) {
        console.error('Error updating campaign entry votes:', updateError);
        return { success: false, message: 'Failed to register vote.' };
    }

    return { success: true, message: 'Vote registered successfully!' };
};

// QUESTS
export const getQuests = async (): Promise<Quest[]> => {
    const { data, error } = await supabase.from('quests').select('*');
    if (error) {
        console.error('Error fetching quests:', error);
        return [];
    }
    return data as Quest[];
};

export const getQuestById = async (id: string): Promise<Quest | undefined> => {
    const { data, error } = await supabase.from('quests').select('*').eq('id', id).single();
    if (error) {
        console.error('Error fetching quest by id:', error);
        return undefined;
    }
    return data as Quest;
};

export const submitQuestEntry = async (questId: string, userId: string, twitterLink: string): Promise<{ success: boolean, message: string }> => {
    const { data: quest } = await supabase.from('quests').select('status, max_submissions_per_user, entries').eq('id', questId).single();
    if (!quest) return { success: false, message: 'Quest not found.' };

    if (quest.status !== 'ongoing') return { success: false, message: 'This quest is no longer active.' };

    const userSubmissions = (quest.entries || []).filter((e: any) => e.userId === userId).length;
    if (userSubmissions >= (quest.max_submissions_per_user || 1)) return { success: false, message: `You have reached the submission limit of ${quest.max_submissions_per_user}.` };

    const { error } = await supabase.from('quest_entries').insert({ quest_id: questId, user_id: userId, twitter_link: twitterLink });

    if (error) {
        console.error('Error submitting quest entry:', error);
        return { success: false, message: 'Failed to submit entry.' };
    }
    return { success: true, message: 'Entry submitted successfully!' };
};

export const voteQuestEntry = async (questId: string, entryId: string, userId: string): Promise<boolean> => {
    // This logic would need to be more robust, likely within a Supabase function (stored procedure)
    // to handle the vote/unvote atomically.
    console.warn("voteQuestEntry is not fully implemented for Supabase yet.");
    return false;
};

export const submitIdentityAnswer = async (questId: string, userId: string, answer: string): Promise<{ success: boolean, message: string }> => {
    const { error } = await supabase.from('quest_answers').insert({ quest_id: questId, user_id: userId, answer: answer });
    if (error) {
        console.error('Error submitting identity answer:', error);
        return { success: false, message: 'Failed to submit answer.' };
    }
    return { success: true, message: 'Your answer has been submitted!' };
};

export const submitMultipleChoiceAnswer = async (questId: string, userId: string, answerIndex: number): Promise<{ success: boolean, message: string }> => {
    const { error } = await supabase.from('quest_multiple_choice_answers').insert({ quest_id: questId, user_id: userId, answer_index: answerIndex });
    if (error) {
        console.error('Error submitting multiple choice answer:', error);
        return { success: false, message: 'Failed to submit answer.' };
    }
    return { success: true, message: 'Your answer has been submitted!' };
};


// --- ADMIN FUNCTIONS ---

export const updateUser = async (updatedUser: User): Promise<boolean> => {
    const { error } = await supabase.from('users').update(updatedUser).eq('id', updatedUser.id);
    if (error) {
        console.error("Failed to update user", error);
        return false;
    }
    return true;
}

export const addOrUpdateProject = async (project: Project): Promise<boolean> => {
    try {
        // 1. Prepare base project data (only fields that exist in projects table)
        const baseProjectData: any = {
            id: project.id,
            name: project.name,
            description: project.description,
            long_description: project.longDescription,
            logo_url: project.logo,
            banner_url: project.banner,
            twitter_url: project.links?.twitter,
            discord_url: project.links?.discord,
            website_urls: project.links?.websites?.map(w => w.url) || [],
            approval_status: project.approvalStatus,
            status: project.status,
            stage: project.stage,
            is_crowned: project.isCrowned,
            is_new: project.isNew,
            is_hot: project.isHot,
            is_published: project.isPublished,
            drop_status: project.dropStatus,
            reward_type: project.rewardType,
            raise_amount: project.raise,
            token_symbol: project.ticker,
            strategy_walkthrough: project.strategy_walkthrough,
            pending_changes: project.pending_changes,
            has_pending_changes: project.has_pending_changes,
            // Token holding settings (stored as separate columns in projects table)
            token_holding_settings_name: project.tokenHoldingSettings?.name,
            token_holding_settings_contract: project.tokenHoldingSettings?.contractAddress,
            token_holding_settings_link: project.tokenHoldingSettings?.link,
        };

        // 2. Upsert base project
        const { data: savedProject, error: projectError } = await supabase
            .from('projects')
            .upsert(baseProjectData)
            .select()
            .single();

        if (projectError) {
            console.error("Failed to save project:", projectError);
            return false;
        }

        const projectId = savedProject.id;

        // 3. Sync Categories (junction table - delete and re-insert)
        if (project.category && project.category.length > 0) {
            // First, delete existing category associations
            await supabase
                .from('project_categories')
                .delete()
                .eq('project_id', projectId);

            // Get category IDs from category names
            const { data: categoryData } = await supabase
                .from('categories')
                .select('id, name')
                .in('name', project.category);

            if (categoryData && categoryData.length > 0) {
                const categoryInserts = categoryData.map(cat => ({
                    project_id: projectId,
                    category_id: cat.id
                }));

                await supabase
                    .from('project_categories')
                    .insert(categoryInserts);
            }
        }

        // 4. Upsert Discord Roles
        if (project.discordRoles && project.discordRoles.length > 0) {
            for (const role of project.discordRoles) {
                await supabase.from('discord_roles').upsert({
                    id: role.id,
                    project_id: projectId,
                    name: role.name,
                    points: role.points,
                    server_id: role.serverId,
                    role_id: role.roleId,
                    description: role.description,
                    perk_type: role.perks?.[0]?.type,
                    perk_description: role.perks?.[0]?.description
                });
            }
        }

        // 5. Upsert NFT Collections
        if (project.nftCollections && project.nftCollections.length > 0) {
            for (const nft of project.nftCollections) {
                const { data: savedNft } = await supabase.from('nft_collections').upsert({
                    id: nft.id,
                    project_id: projectId,
                    name: nft.name,
                    image_url: nft.image,
                    points_per_day: nft.pointsPerDay,
                    one_time_points: nft.oneTimePoints,
                    network: nft.network,
                    status: nft.status,
                    supply: nft.supply,
                    mint_price: nft.mintPrice,
                    floor_price: nft.floorPrice,
                    is_visible_on_nft_page: nft.isVisibleOnNftPage,
                    urls: nft.link ? [nft.link] : []
                }).select().single();

                // Handle NFT perks if they exist
                if (savedNft && nft.perks && nft.perks.length > 0) {
                    for (const perk of nft.perks) {
                        await supabase.from('nft_perks').upsert({
                            collection_id: savedNft.id,
                            perk_type: perk.perk.type,
                            perk_description: perk.perk.description,
                            holding_requirement_count: perk.holdingRequirement.count,
                            granting_project_name: perk.perk.grantingProjectName,
                            granting_project_image_url: perk.perk.grantingProjectImage
                        });
                    }
                }
            }
        }

        // 6. Upsert Coins (memes table)
        if (project.coins && project.coins.length > 0) {
            for (const coin of project.coins) {
                await supabase.from('memes').upsert({
                    id: coin.id,
                    project_id: projectId,
                    name: coin.name,
                    image_url: coin.imageUrl || coin.image,
                    contract_address: coin.contractAddress,
                    link: coin.link,
                    network: coin.network,
                    status: coin.status,
                    type: coin.type,
                    supply: coin.supply,
                    market_price: coin.marketPrice
                });
            }
        }

        // 7. Upsert Team Members
        if (project.team && project.team.length > 0) {
            for (const member of project.team) {
                await supabase.from('team_members').upsert({
                    id: member.discordUserId || crypto.randomUUID(),
                    project_id: projectId,
                    name: member.name,
                    role: member.role,
                    twitter_url: member.twitterUrl || member.socials?.twitter,
                    linkedin_url: member.linkedinUrl,
                    photo_url: member.photoUrl
                });
            }
        }

        // 8. Upsert Token Holding Tiers (delete and re-insert for simplicity)
        if (project.tokenHoldingTiers && project.tokenHoldingTiers.length > 0) {
            // Delete existing tiers
            await supabase
                .from('token_holding_tiers')
                .delete()
                .eq('project_id', projectId);

            // Insert new tiers
            const tierInserts = project.tokenHoldingTiers.map(tier => ({
                project_id: projectId,
                min_amount: tier.minAmount,
                max_amount: tier.maxAmount,
                points_per_day: tier.pointsPerDay
            }));

            await supabase
                .from('token_holding_tiers')
                .insert(tierInserts);
        }

        return true;
    } catch (error) {
        console.error("Failed to save project and relations:", error);
        return false;
    }
}

export const addOrUpdateIdo = async (ido: any): Promise<boolean> => {
    const { error } = await supabase.from('idos').upsert(ido);
    if (error) {
        console.error("Failed to save ido", error);
        return false;
    }
    return true;
}

export const addOrUpdateQuest = async (quest: Quest): Promise<boolean> => {
    const { error } = await supabase.from('quests').upsert(quest);
    if (error) {
        console.error("Failed to save quest", error);
        return false;
    }
    return true;
};

// --- SUPER ADMIN FUNCTIONS ---

export const updateUserHintPoints = async (userId: string, pointDelta: number): Promise<boolean> => {
    // This should be a Supabase function to avoid race conditions
    const { error } = await supabase.rpc('increment_hint_points', { user_id_in: userId, points_in: pointDelta });
    if (error) {
        console.error("Failed to update hint points", error);
        return false;
    }
    return true;
};
export const addPointsToUser = async (userId: string, credoUpdate: { credo: number }, hintUpdate: { points: number, category: string, reason: string }): Promise<boolean> => {
    // This function can be expanded to log the reason for the point change.
    // For now, it just updates the points.
    console.log(`Adding points to user ${userId}`, { credoUpdate, hintUpdate });
    return updateUserHintPoints(userId, hintUpdate.points);
};

export const removePointsFromUser = async (userId: string, credoUpdate: { credo: number }, hintUpdate: { points: number, category: string, reason: string }): Promise<boolean> => {
    // This function can be expanded to log the reason for the point change.
    // For now, it just updates the points.
    console.log(`Removing points from user ${userId}`, { credoUpdate, hintUpdate });
    return updateUserHintPoints(userId, -hintUpdate.points);
};

export const getCredoSettings = async (): Promise<CredoSettings> => {
    const { data, error } = await supabase.from('user_token_holdings').select('*').limit(1);
    if (error) {
        console.error('Error fetching credo settings:', error);
        return { roleBasedPartnerProjectNames: [], nftBasedPartnerProjectNames: [], tokenBasedPartnerProjectNames: [], sliderProjectNames: [], sliderNftNames: [] };
    }
    return (data && data[0]) || { roleBasedPartnerProjectNames: [], nftBasedPartnerProjectNames: [], tokenBasedPartnerProjectNames: [], sliderProjectNames: [], sliderNftNames: [] };
};

export const updateCredoSettings = async (settings: CredoSettings): Promise<boolean> => {
    const { error } = await supabase.from('user_token_holdings').update(settings).eq('id', 1); // Assuming one row of settings
    if (error) {
        console.error("Failed to save credo settings", error);
        return false;
    }
    return true;
};

export const getWeeklyDiscordEvents = async (): Promise<WeeklyDiscordEvent[]> => {
    const { data, error } = await supabase.from('weekly_discord_events').select('*').order('date_time', { ascending: false });
    if (error) {
        console.error('Error fetching weekly discord events:', error);
        return [];
    }
    // Transform database format to app format
    return (data || []).map(event => ({
        id: event.id,
        name: event.name,
        title: event.name, // Alias for compatibility
        description: event.reward || '',
        serverName: event.server_name,
        discordEventLink: event.discord_event_link,
        dateTime: event.date_time,
        type: event.type,
        customTypeLabel: event.custom_type_label,
        image: event.image,
        reward: event.reward
    }));
};

export const addOrUpdateWeeklyDiscordEvent = async (event: WeeklyDiscordEvent): Promise<boolean> => {
    const { error } = await supabase.from('weekly_discord_events').upsert({
        id: event.id,
        name: event.name,
        server_name: event.serverName,
        discord_event_link: event.discordEventLink,
        date_time: event.dateTime,
        type: event.type,
        custom_type_label: event.customTypeLabel,
        image: event.image,
        reward: event.reward
    });
    if (error) {
        console.error("Failed to save weekly event", error);
        return false;
    }
    return true;
};

export const getSiteContentSettings = async (): Promise<SiteContentSettings> => {
    const { data, error } = await supabase.from('campaign_voting_settings').select('*').limit(1);
    if (error) {
        console.error('Error fetching site content settings:', error);
    }
    const fallback: SiteContentSettings = {
        campaigns: { title: "Where creativity gets rewarded.", subtitle: "Participate in community events and quests to earn recognition and prizes.", featuredProjectIds: [] },
        tasks: { title: "Task Hub", subtitle: "Complete tasks from ecosystem projects to earn rewards and climb the leaderboard.", featuredProjectIds: [] },
        earlyProjects: { title: "Alpha Floor", subtitle: "Get the scoop on promising projects in their early and pre-launch stages.", featuredProjectIds: [] },
        ido: { title: "Project Launches", subtitle: "Discover the next wave of token generation events and initial offerings.", featuredProjectIds: [] },
        meme: { title: "Meme Central", subtitle: "Explore the latest and greatest meme coins in the ecosystem.", featuredProjectIds: [] },
        nft: { title: "NFT Showcase", subtitle: "A curated look at the most notable NFT collections and their utility.", featuredProjectIds: [] },
        thisWeek: { title: "This Week's Highlights", subtitle: "A snapshot of key events, drops, and campaigns happening now.", featuredProjectIds: [] }
    };
    return (data && data[0]) || fallback;
};

export const updateSiteContentSettings = async (settings: SiteContentSettings): Promise<boolean> => {
    const { error } = await supabase.from('campaign_voting_settings').update(settings).eq('id', 1); // Assuming one row
    if (error) {
        console.error("Failed to save site content settings", error);
        return false;
    }
    return true;
};

export const updateUserPermissions = async (userId: string, role: User['role'], associatedProjectIds: string[]): Promise<boolean> => {
    const { error } = await supabase.from('users').update({ role, associatedProjectIds: role === 'project_admin' ? associatedProjectIds : [] }).eq('id', userId);
    if (error) {
        console.error("Failed to update user permissions", error);
        return false;
    }
    return true;
}

export const updateProjectStatus = async (projectId: string, status: 'approved' | 'rejected'): Promise<boolean> => {
    const { error } = await supabase.from('projects').update({ approval_status: status }).eq('id', projectId);
    if (error) {
        console.error(`Failed to update project status for ${projectId}`, error);
        return false;
    }
    return true;
}

export const deleteItem = async (tableName: string, itemId: string): Promise<boolean> => {
    const { error } = await supabase.from(tableName).delete().eq('id', itemId);
    if (error) {
        console.error(`Failed to delete item from ${tableName}`, error);
        return false;
    }
    return true;
}

export const addOrUpdateEvent = async (event: Event): Promise<boolean> => {
    const { error } = await supabase.from('campaigns').upsert(event);
    if (error) {
        console.error("Failed to save event to campaigns table", error);
        return false;
    }
    return true;
}

export const selectCampaignWinners = async (campaignId: string, winnerIds: string[]): Promise<boolean> => {
    // First get the campaign
    const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

    if (campaignError || !campaign) {
        console.error('Error fetching campaign:', campaignError);
        return false;
    }

    // Get all entries for this campaign
    const { data: entries, error: entriesError } = await supabase
        .from('campaign_entries')
        .select('*')
        .eq('campaign_id', campaignId);

    if (entriesError) {
        console.error('Error fetching campaign entries:', entriesError);
        return false;
    }

    // Update the campaign with winners
    const { error: updateCampaignError } = await supabase
        .from('campaigns')
        .update({ winners: winnerIds })
        .eq('id', campaignId);

    if (updateCampaignError) {
        console.error('Error updating campaign winners:', updateCampaignError);
        return false;
    }

    // Mark winning entries
    for (const entry of entries || []) {
        const isWinner = winnerIds.includes(entry.id);
        const { error: updateEntryError } = await supabase
            .from('campaign_entries')
            .update({ isWinner })
            .eq('id', entry.id);

        if (updateEntryError) {
            console.error(`Error updating entry ${entry.id}:`, updateEntryError);
            // Continue with other entries even if one fails
        }
    }

    return true;
}

export const getCategoriesFromDB = async (): Promise<string[]> => {
    const { data, error } = await supabase
        .from('categories')
        .select('name');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data.map(c => c.name.toLowerCase().trim());
};

export const getProjectsFromDB = async (options?: { includePending?: boolean }): Promise<Project[]> => {
    // Regular database query
    {
        let query = supabase
            .from('projects')
            .select(`
        *,
        project_categories (
          categories (
            name
          )
        ),
        user_project_votes (
          user_id,
          vote_type
        ),
        users (
          id
        ),
        discord_roles (
          id,
          name,
          points,
          server_id,
          role_id,
          description,
          perk_type,
          perk_description
        ),
        nft_collections (
          id,
          name,
          image_url,
          points_per_day,
          one_time_points,
          status,
          supply,
          mint_price,
          floor_price,
          is_visible_on_nft_page,
          urls,
          nft_perks (
            id,
            perk_type,
            perk_description,
            holding_requirement_count,
            granting_project_name,
            granting_project_image_url,
            granting_project_id
          )
        ),
        memes (
          id,
          name,
          image_url,
          contract_address,
          link,
          network,
          status,
          type,
          supply,
          market_price
        ),
        team_members (
          id,
          name,
          role,
          twitter_url,
          linkedin_url,
          photo_url
        ),
        token_holding_tiers (
          id,
          min_amount,
          max_amount,
          points_per_day
        )
      `);

        if (!options?.includePending) {
            query = query.eq('approval_status', 'approved');
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching projects:', JSON.stringify(error, null, 2));
            return [];
        }

        // Transform regular projects only
        return transformProjectData(data);
    }

    // Production mode - regular database query
    let query = supabase
        .from('projects')
        .select(`
      *,
      project_categories (
        categories (
          name
        )
      ),
      user_project_votes (
        user_id,
        vote_type
      ),
      users (
        id
      ),
      discord_roles (
        id,
        name,
        points,
        server_id,
        role_id,
        description,
        perk_type,
        perk_description
      ),
      nft_collections (
        id,
        name,
        image_url,
        points_per_day,
        one_time_points,
        status,
        supply,
        mint_price,
        floor_price,
        is_visible_on_nft_page,
        urls,
        nft_perks (
          id,
          perk_type,
          perk_description,
          holding_requirement_count,
          granting_project_name,
          granting_project_image_url,
          granting_project_id
        )
      ),
      memes (
        id,
        name,
        image_url,
        contract_address,
        link,
        network,
        status,
        type,
        supply,
        market_price
      ),
      team_members (
        id,
        name,
        role,
        twitter_url,
        linkedin_url,
        photo_url
      ),
      token_holding_tiers (
        id,
        min_amount,
        max_amount,
        points_per_day
      )
    `);

    if (!options?.includePending) {
        query = query.eq('approval_status', 'approved');
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching projects:', JSON.stringify(error, null, 2));
        return [];
    }

    return transformProjectData(data);
};

// Helper function to transform project data
const transformProjectData = (data: any[]): Project[] => {

    // Helper function to normalize category names from database to frontend keys
    const normalizeCategoryName = (dbName: string): string => {
        return dbName.toLowerCase().trim();
    };

    const transformedProjects = data.map((p: any) => {
        const categories = (p.project_categories || [])
            .map((pc: any) => pc.categories?.name) // Use optional chaining
            .filter(Boolean)
            .map((name: string) => normalizeCategoryName(name));

        const votes = p.user_project_votes || [];
        const up = votes.filter((v: any) => v.vote_type === 'up').length;
        const down = votes.filter((v: any) => v.vote_type === 'down').length;
        const voters = votes.map((v: any) => ({ userId: v.user_id, vote: v.vote_type }));

        // Transform NFT collections from database format to app format
        const nftCollections = (p.nft_collections || []).map((nft: any) => ({
            id: nft.id,
            name: nft.name,
            image: nft.image_url,
            pointsPerDay: nft.points_per_day || 0,
            oneTimePoints: nft.one_time_points,
            status: nft.status,
            supply: nft.supply,
            mintPrice: nft.mint_price,
            floorPrice: nft.floor_price,
            isVisibleOnNftPage: nft.is_visible_on_nft_page,
            link: nft.urls?.[0] || null,
            perks: (nft.nft_perks || []).map((perk: any) => ({
                holdingRequirement: {
                    count: perk.holding_requirement_count || 1,
                    collectionName: nft.name,
                    projectName: p.name,
                },
                perk: {
                    type: perk.perk_type,
                    description: perk.perk_description,
                    grantingProjectName: perk.granting_project_name,
                    grantingProjectImage: perk.granting_project_image_url,
                },
            })),
        }));

        // Transform Discord Roles
        const discordRoles = (p.discord_roles || []).map((role: any) => ({
            id: role.id,
            name: role.name,
            points: role.points || 0,
            serverId: role.server_id,
            roleId: role.role_id,
            description: role.description,
            perks: role.perk_type ? [{
                type: role.perk_type,
                description: role.perk_description
            }] : []
        }));

        // Transform Memes/Coins
        const coins = (p.memes || []).map((meme: any) => ({
            id: meme.id,
            name: meme.name,
            symbol: meme.name, // Assuming name is used as symbol
            imageUrl: meme.image_url,
            type: meme.type,
            network: meme.network,
            contractAddress: meme.contract_address,
            link: meme.link,
            status: meme.status,
            supply: meme.supply,
            marketPrice: meme.market_price
        }));

        // Transform Team Members
        const team = (p.team_members || []).map((member: any) => ({
            name: member.name,
            role: member.role,
            twitterUrl: member.twitter_url,
            linkedinUrl: member.linkedin_url,
            photoUrl: member.photo_url
        }));

        // Transform Token Holding Tiers
        const tokenHoldingTiers = (p.token_holding_tiers || []).map((tier: any) => ({
            minAmount: tier.min_amount,
            maxAmount: tier.max_amount,
            pointsPerDay: tier.points_per_day || 0
        }));

        // Build token holding settings from project fields
        const tokenHoldingSettings = (p.token_holding_settings_name || p.token_holding_settings_contract || p.token_holding_settings_link) ? {
            name: p.token_holding_settings_name,
            contractAddress: p.token_holding_settings_contract,
            link: p.token_holding_settings_link
        } : undefined;

        return {
            ...p,
            logo: p.logo_url,
            banner: p.banner_url,
            category: categories,
            votes: { up, down, voters },
            // Ensure other fields that might be null are handled gracefully
            links: {
                websites: (p.website_urls || []).map((url: string) => ({ label: 'Website', url })),
                twitter: p.twitter_url,
                discord: p.discord_url,
            },
            events: p.events || [],
            team: team,
            discordRoles: discordRoles,
            nftCollections: nftCollections,
            coins: coins,
            tokenHoldingTiers: tokenHoldingTiers,
            tokenHoldingSettings: tokenHoldingSettings,
            isCrowned: p.is_crowned,
            isNew: p.is_new,
            isHot: p.is_hot,
        } as Project;
    });

    return transformedProjects;
};

export const voteProject = async (projectId: string, user: User, vote: 'up' | 'down'): Promise<void> => {
    // First, check if a vote already exists
    const { data: existingVote, error: selectError } = await supabase
        .from('user_project_votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking for existing vote:', selectError);
        return;
    }

    if (existingVote) {
        // If the user is casting the same vote again, delete the vote (un-vote)
        if (existingVote.vote_type === vote) {
            const { error: deleteError } = await supabase
                .from('user_project_votes')
                .delete()
                .eq('id', existingVote.id);
            if (deleteError) {
                console.error('Error deleting vote:', deleteError);
            }
        } else {
            // If the user is changing their vote, update the existing record
            const { error: updateError } = await supabase
                .from('user_project_votes')
                .update({ vote_type: vote })
                .eq('id', existingVote.id);
            if (updateError) {
                console.error('Error updating vote:', updateError);
            }
        }
    } else {
        // If no vote exists, insert a new one
        const { error: insertError } = await supabase
            .from('user_project_votes')
            .insert({
                user_id: user.id,
                project_id: projectId,
                vote_type: vote,
            });
        if (insertError) {
            console.error('Error inserting new vote:', insertError);
        }
    }
};
export const vouchForUser = async (voterId: string, vouchForId: string): Promise<{ success: boolean, message: string }> => {
    // This should be a Supabase function to handle the vouching logic atomically.
    console.warn("vouchForUser is not fully implemented for Supabase yet.");
    return { success: false, message: "Vouching is not yet implemented." };
};
export const updateUserInDB = async (user: User) => {
    console.log('Updating user in DB:', user);
    const { data, error } = await supabase
        .from('users')
        .update({
            platform_username: user.platform_username,
            profile_pic_url: user.profile_pic_url,
            discord_id: user.discordId,
            // ensure all fields are updated
            role: user.role,
            hint_points: user.hint_points,
            credo_points: user.credo_points,
            discord_roles: user.discordRoles,
            associated_project_ids: user.associatedProjectIds,
        })
        .eq('discord_id', user.discordId);

    if (error) {
        console.error('Error updating user:', error);
    } else {
        console.log('User updated successfully:', data);
    }

    return { data, error };
};
// --- NEW SUPABASE FUNCTIONS ---

// Get user profile with all data
export async function getUserProfile(userId: string) {
    const { data, error } = await supabase
        .from('users')
        .select(`
            *,
            user_discord_roles (discord_roles (*)),
            user_nft_holdings (nft_collections (*)),
            user_token_holdings (tokens (*))
        `)
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
    return data;
}

// Vote on project
export async function voteOnProject(userId: string, projectId: string, voteType: 'up' | 'down') {
    // Note: canUserVote logic is not defined in the provided snippet.
    // You may need to implement this check based on your application's rules.
    // const canVote = await canUserVote(userId); 
    // if (!canVote) throw new Error("Not eligible to vote");

    const { error } = await supabase
        .from('user_project_votes')
        .upsert({
            user_id: userId,
            project_id: projectId,
            vote_type: voteType
        }, { onConflict: 'user_id,project_id' });

    if (error) {
        console.error('Error voting on project:', error);
        throw error;
    }
}

// Get projects by category
export async function getProjectsByCategory(categoryName: string) {
    const { data, error } = await supabase
        .from('projects')
        .select(`
            *,
            project_categories!inner(
                categories!inner(name)
            )
        `)
        .eq('project_categories.categories.name', categoryName);

    if (error) {
        console.error('Error fetching projects by category:', error);
        return [];
    }
    return data;
}

export const syncUserProfile = async (authUser: any) => {
    // Check if user exists in users table
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .single();

    // If not, create (backup in case trigger didn't fire)
    if (!existingUser) {
        const { error } = await supabase.from('users').insert({
            id: authUser.id,
            email: authUser.email,
            platform_user_id: authUser.user_metadata?.provider_id,
            name: authUser.user_metadata?.name,
            platform_username: authUser.user_metadata?.name,
            profile_pic_url: authUser.user_metadata?.avatar_url,
        });
        if (error) {
            console.error('Error creating user profile:', error);
        }
    }
};
export const isCultOwner = (walletAddress: string): boolean => {
    // TODO: Implement actual logic to check for CULT ownership
    console.warn(`isCultOwner check is not implemented. Wallet: ${walletAddress}`);
    return false;
};

// --- COLLABORATION SYSTEM FUNCTIONS ---

// COLLABORATIONS
export const getCollaborations = async (): Promise<Collab[]> => {
    const { data, error } = await supabase.from('collaborations').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching collaborations:', error);
        return [];
    }
    return data as Collab[];
};

export const getCollabById = async (id: string): Promise<Collab | undefined> => {
    const { data, error } = await supabase.from('collaborations').select('*').eq('id', id).single();
    if (error) {
        console.error('Error fetching collaboration by id:', error);
        return undefined;
    }
    return data as Collab;
};

export const getCollabBySlug = async (slug: string): Promise<Collab | undefined> => {
    const { data, error } = await supabase.from('collaborations').select('*').eq('slug', slug).single();
    if (error) {
        console.error('Error fetching collaboration by slug:', error);
        // Try by ID for backward compatibility
        return getCollabById(slug);
    }
    return data as Collab;
};



export const addOrUpdateCollaboration = async (collaboration: Collab): Promise<boolean> => {
    const { error } = await supabase.from('collaborations').upsert(collaboration);
    if (error) {
        console.error("Failed to save collaboration", error);
        return false;
    }
    return true;
};

export const getCollabProjects = async (): Promise<CollabProject[]> => {
    const { data, error } = await supabase.from('collab_projects').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching collab projects:', error);
        return [];
    }
    return data as CollabProject[];
};

export const addOrUpdateCollabProject = async (project: CollabProject): Promise<boolean> => {
    const { error } = await supabase.from('collab_projects').upsert(project);
    if (error) {
        console.error("Failed to save collab project", error);
        return false;
    }
    return true;
};

// COLLABORATION TASKS
export const getCollabTasks = async (collaborationId: string): Promise<CollabTask[]> => {
    const { data, error } = await supabase.from('collaboration_tasks').select('*').eq('collaboration_id', collaborationId).eq('is_active', true);
    if (error) {
        console.error('Error fetching collaboration tasks:', error);
        return [];
    }
    return data as CollabTask[];
};

export const getCollabTaskById = async (id: string): Promise<CollabTask | undefined> => {
    const { data, error } = await supabase.from('collaboration_tasks').select('*').eq('id', id).single();
    if (error) {
        console.error('Error fetching collaboration task by id:', error);
        return undefined;
    }
    return data as CollabTask;
};

export const addOrUpdateCollaborationTask = async (task: CollabTask): Promise<boolean> => {
    const { error } = await supabase.from('collaboration_tasks').upsert(task);
    if (error) {
        console.error("Failed to save collaboration task", error);
        return false;
    }
    return true;
};

// MYSTERY CARDS
export const getMysteryCard = async (collaborationId: string): Promise<MysteryCard | undefined> => {
    const { data, error } = await supabase.from('mystery_cards').select('*').eq('collaboration_id', collaborationId).eq('is_active', true).single();
    if (error) {
        console.error('Error fetching mystery card:', error);
        return undefined;
    }
    return data as MysteryCard;
};

export const getMysteryCardById = async (id: string): Promise<MysteryCard | undefined> => {
    const { data, error } = await supabase.from('mystery_cards').select('*').eq('id', id).single();
    if (error) {
        console.error('Error fetching mystery card by id:', error);
        return undefined;
    }
    return data as MysteryCard;
};

export const addOrUpdateMysteryCard = async (card: MysteryCard): Promise<boolean> => {
    const { error } = await supabase.from('mystery_cards').upsert(card);
    if (error) {
        console.error("Failed to save mystery card", error);
        return false;
    }
    return true;
};

// LEGACY REWARD CARDS (for backward compatibility)
export const getRewardCards = async (collaborationId: string): Promise<RewardCard[]> => {
    // Convert mystery card to reward card format for backward compatibility
    const mysteryCard = await getMysteryCard(collaborationId);
    if (!mysteryCard) return [];

    return [{
        id: mysteryCard.id,
        collaboration_id: mysteryCard.collaboration_id,
        title: mysteryCard.title,
        description: mysteryCard.description,
        hint_points_cost: mysteryCard.hint_points_cost,
        max_cards_per_user: mysteryCard.max_cards_per_user,
        purchased_count: mysteryCard.purchased_count,
        is_active: mysteryCard.is_active,
        can_purchase: mysteryCard.can_purchase,
        can_open: mysteryCard.can_open,
        raffle_pool: mysteryCard.raffle_pool,
        rarity: 'legendary' as const,
        reward_type: 'whitelist_guaranteed' as const,
        reward_data: { whitelist_spots: 1 },
        claimed_count: mysteryCard.purchased_count,
        total_available: 999999 // No limit in new system
    }];
};

export const getRewardCardById = async (id: string): Promise<RewardCard | undefined> => {
    const mysteryCard = await getMysteryCardById(id);
    if (!mysteryCard) return undefined;

    return {
        id: mysteryCard.id,
        collaboration_id: mysteryCard.collaboration_id,
        title: mysteryCard.title,
        description: mysteryCard.description,
        hint_points_cost: mysteryCard.hint_points_cost,
        max_cards_per_user: mysteryCard.max_cards_per_user,
        purchased_count: mysteryCard.purchased_count,
        is_active: mysteryCard.is_active,
        can_purchase: mysteryCard.can_purchase,
        can_open: mysteryCard.can_open,
        raffle_pool: mysteryCard.raffle_pool,
        rarity: 'legendary' as const,
        reward_type: 'whitelist_guaranteed' as const,
        reward_data: { whitelist_spots: 1 },
        claimed_count: mysteryCard.purchased_count,
        total_available: 999999 // No limit in new system
    };
};

// RAFFLE SYSTEM FUNCTIONS

export const purchaseMysteryCard = async (cardId: string, userId: string): Promise<{ success: boolean, message: string }> => {
    const card = await getMysteryCardById(cardId);
    if (!card) {
        return { success: false, message: 'Mystery card not found.' };
    }

    if (!card.can_purchase) {
        return { success: false, message: 'This card is no longer available for purchase.' };
    }

    // Check user's current card count for this collaboration
    const userPurchases = await getUserCardPurchases(userId, card.collaboration_id);
    if (userPurchases.length >= card.max_cards_per_user) {
        return { success: false, message: `You have reached the maximum limit of ${card.max_cards_per_user} cards for this collaboration.` };
    }

    // Check user's hint points balance
    const userProgress = await getUserCollaborationProgress(userId, card.collaboration_id);
    if (!userProgress || userProgress.earned_hint_points < card.hint_points_cost) {
        return { success: false, message: 'Insufficient hint points.' };
    }

    // Create purchase record
    const purchase: UserCardPurchase = {
        id: `purchase-${Date.now()}-${userId}`,
        user_id: userId,
        card_id: cardId,
        collaboration_id: card.collaboration_id,
        purchased_at: new Date().toISOString(),
        is_opened: false
    };

    // Update card purchased count and user progress
    const updatedCard = { ...card, purchased_count: card.purchased_count + 1 };
    const updatedProgress = {
        ...userProgress,
        earned_hint_points: userProgress.earned_hint_points - card.hint_points_cost
    };

    // In a real implementation, these would be atomic transactions
    const cardUpdateSuccess = await addOrUpdateMysteryCard(updatedCard);
    const progressUpdateSuccess = await addOrUpdateUserCollaborationProgress(updatedProgress);
    const purchaseSuccess = await addUserCardPurchase(purchase);

    if (!cardUpdateSuccess || !progressUpdateSuccess || !purchaseSuccess) {
        return { success: false, message: 'Failed to process card purchase.' };
    }

    return { success: true, message: 'Mystery card purchased successfully! You can open it after the collaboration ends.' };
};

// Legacy function for backward compatibility
export const purchaseRewardCard = async (cardId: string, userId: string): Promise<{ success: boolean, message: string }> => {
    return purchaseMysteryCard(cardId, userId);
};

export const openPurchasedCard = async (purchaseId: string, userId: string): Promise<{ success: boolean, message: string, reward?: RaffleReward }> => {
    const purchase = await getUserCardPurchase(purchaseId);
    if (!purchase || purchase.user_id !== userId) {
        return { success: false, message: 'Purchase not found.' };
    }

    if (purchase.is_opened) {
        return { success: false, message: 'This card has already been opened.' };
    }

    const card = await getRewardCardById(purchase.card_id);
    if (!card) {
        return { success: false, message: 'Card not found.' };
    }

    if (!card.can_open) {
        return { success: false, message: 'Cards cannot be opened yet. Wait for the collaboration to end.' };
    }

    // Run raffle to determine reward
    const wonReward = runRaffle(card.raffle_pool);

    // Update purchase record
    const updatedPurchase = {
        ...purchase,
        is_opened: true,
        opened_at: new Date().toISOString(),
        reward_won: wonReward
    };

    const success = await updateUserCardPurchase(updatedPurchase);
    if (!success) {
        return { success: false, message: 'Failed to process card opening.' };
    }

    return {
        success: true,
        message: wonReward ? `Congratulations! You won: ${wonReward.title}` : 'Better luck next time!',
        reward: wonReward
    };
};

// Raffle algorithm
const runRaffle = (rafflePool: RaffleReward[]): RaffleReward | null => {
    // Filter available rewards (quantity > 0)
    const availableRewards = rafflePool.filter(reward => reward.quantity > 0);
    if (availableRewards.length === 0) return null;

    // Calculate total weight
    const totalWeight = availableRewards.reduce((sum, reward) => sum + reward.rarity_weight, 0);

    // Generate random number
    const random = Math.random() * totalWeight;

    // Find winning reward
    let currentWeight = 0;
    for (const reward of availableRewards) {
        currentWeight += reward.rarity_weight;
        if (random <= currentWeight) {
            // Decrease quantity (in real implementation, this would be atomic)
            reward.quantity -= 1;
            return reward;
        }
    }

    return null;
};

// Helper functions for user card purchases
export const addUserCardPurchase = async (purchase: UserCardPurchase): Promise<boolean> => {
    const { error } = await supabase.from('user_card_purchases').insert(purchase);
    if (error) {
        console.error("Failed to save card purchase", error);
        return false;
    }
    return true;
};

export const getUserCardPurchase = async (purchaseId: string): Promise<UserCardPurchase | undefined> => {
    const { data, error } = await supabase.from('user_card_purchases').select('*').eq('id', purchaseId).single();
    if (error) {
        console.error('Error fetching card purchase:', error);
        return undefined;
    }
    return data as UserCardPurchase;
};

export const updateUserCardPurchase = async (purchase: UserCardPurchase): Promise<boolean> => {
    const { error } = await supabase.from('user_card_purchases').update(purchase).eq('id', purchase.id);
    if (error) {
        console.error("Failed to update card purchase", error);
        return false;
    }
    return true;
};

export const getUserCardPurchases = async (userId: string, collaborationId?: string): Promise<UserCardPurchase[]> => {
    let query = supabase.from('user_card_purchases').select('*').eq('user_id', userId);
    if (collaborationId) {
        query = query.eq('collaboration_id', collaborationId);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching user card purchases:', error);
        return [];
    }
    return data as UserCardPurchase[];
};

// Legacy function - now redirects to purchase
export const openRewardCard = async (cardId: string, userId: string): Promise<{ success: boolean, message: string, reward?: any }> => {
    return purchaseRewardCard(cardId, userId);
};

// USER COLLABORATION PROGRESS
export const getUserCollaborationProgress = async (userId: string, collaborationId: string): Promise<UserCollaborationProgress | undefined> => {
    const { data, error } = await supabase.from('user_collaboration_progress').select('*').eq('user_id', userId).eq('collaboration_id', collaborationId).single();
    if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Error fetching user collaboration progress:', error);
        }
        return undefined;
    }
    return data as UserCollaborationProgress;
};

export const getUserCollaborationProgressAll = async (userId: string): Promise<UserCollaborationProgress[]> => {
    const { data, error } = await supabase.from('user_collaboration_progress').select('*').eq('user_id', userId);
    if (error) {
        console.error('Error fetching user collaboration progress:', error);
        return [];
    }
    return data as UserCollaborationProgress[];
};

export const addOrUpdateUserCollaborationProgress = async (progress: UserCollaborationProgress): Promise<boolean> => {
    const { error } = await supabase.from('user_collaboration_progress').upsert(progress);
    if (error) {
        console.error("Failed to save user collaboration progress", error);
        return false;
    }
    return true;
};

export const completeCollabTask = async (taskId: string, userId: string): Promise<{ success: boolean, message: string }> => {
    const task = await getCollabTaskById(taskId);
    if (!task) {
        return { success: false, message: 'Task not found.' };
    }

    // Get or create user progress
    let userProgress = await getUserCollaborationProgress(userId, task.collaboration_id);
    if (!userProgress) {
        // Get collaboration details to populate required fields
        const collaboration = await getCollabById(task.collaboration_id);
        userProgress = {
            id: '', // Will be generated by database
            user_id: userId,
            collaboration_id: task.collaboration_id,
            completed_tasks: [],
            earned_hint_points: 0,
            opened_reward_cards: [],
            last_activity: new Date().toISOString(),
            participating_projects: collaboration?.participating_projects || [],
            status: collaboration?.status || 'running',
            start_date: collaboration?.start_date || new Date().toISOString(),
            end_date: collaboration?.end_date,
            banner_image: collaboration?.banner_image,
            total_participants: collaboration?.total_participants || 0,
            total_hint_points_distributed: collaboration?.total_hint_points_distributed || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }

    // Check if task is already completed
    if (userProgress.completed_tasks.includes(taskId)) {
        return { success: false, message: 'Task already completed.' };
    }

    // Update progress
    const updatedProgress = {
        ...userProgress,
        completed_tasks: [...userProgress.completed_tasks, taskId],
        earned_hint_points: userProgress.earned_hint_points + task.hint_points_reward,
        last_activity: new Date().toISOString()
    };

    const success = await addOrUpdateUserCollaborationProgress(updatedProgress);
    if (!success) {
        return { success: false, message: 'Failed to update progress.' };
    }

    return { success: true, message: `Task completed! You earned ${task.hint_points_reward} hint points.` };
};

// HINT POINTS MANAGEMENT
export const getUserHintPointsBalance = async (userId: string): Promise<number> => {
    const { data, error } = await supabase.from('user_hint_points').select('available_points').eq('user_id', userId).single();
    if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Error fetching user hint points balance:', error);
        }
        return 0;
    }
    return data.available_points || 0;
};

export const updateUserHintPointsBalance = async (userId: string, pointsDelta: number): Promise<boolean> => {
    // This should be a Supabase function to handle atomically
    const { error } = await supabase.rpc('update_user_hint_points', {
        user_id_in: userId,
        points_delta: pointsDelta
    });
    if (error) {
        console.error("Failed to update user hint points balance", error);
        return false;
    }
    return true;
};
