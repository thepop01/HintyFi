// This file contains all the data access functions for the application.
// It interacts with a Supabase backend.

import {
    User, Event, Project, Quest, CredoSettings,
    WeeklyDiscordEvent, SiteContentSettings
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
    const { error } = await supabase.from('projects').upsert(project);
    if (error) {
        console.error("Failed to save project", error);
        return false;
    }
    return true;
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
    const { data, error } = await supabase.from('user_discord_roles').select('*').order('assigned_at');
    if (error) {
        console.error('Error fetching weekly discord events:', error);
        return [];
    }
    return data;
};

export const addOrUpdateWeeklyDiscordEvent = async (event: WeeklyDiscordEvent): Promise<boolean> => {
    const { error } = await supabase.from('user_discord_roles').upsert(event);
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
      team: p.team || [],
      discordRoles: p.discordRoles || [],
      nftCollections: p.nftCollections || [],
      coins: p.coins || [],
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