// --- CUSTOM APP TYPES ---

export type Ido = Tables<'idos'> & {
    projects?: Project;
};
export type Meme = Tables<'memes'> & {
    projects?: Project;
};
export type Nft = Tables<'nfts'> & {
    projects?: Project;
};

// Extend auto-generated types for app-specific usage
export type User = Tables<'users'> & {
    // Add any custom client-side properties here if needed
    name?: string;
    discordId?: string;
    discordRoles?: {
        id: string;
        name: string;
        points: number;
        serverId?: string;
        roleId?: string;
    }[];
    associatedProjectIds?: string[];
    profile_pic?: string;
    profile_pic_url?: string;
    nickname?: string;
    walletAddress?: string;
    socials?: {
        twitter?: string;
        discord?: string;
        github?: string;
    };
    nftHoldings?: { projectId: string; daysHeld: number }[];
    tokenHoldings?: { projectId: string; amount: number; daysHeld: number }[];
    manualCredoPoints?: number;
    projectsBuilding?: string[];
    vouchedFor?: string[];
    discordUsername?: string;
    votedProjectIds?: string[];
    votedCampaignEntryIds?: string[];
    manualHintAdjustments?: ManualHintAdjustment[];
    points?: number;
};

export interface ManualHintAdjustment {
    category: 'tasks' | 'wins' | 'rewards';
    points: number;
    reason: string;
}

export type Project = Tables<'projects'> & {
    // Example of extending with client-side computed properties
    votes?: { up: number; down: number; voters: { userId: string; vote: 'up' | 'down' }[] };
    category?: string[];
    logo?: string;
    banner?: string;
    links?: {
        websites: { label: string; url: string }[];
        twitter: string | null;
        discord: string | null;
    };
    events?: Event[];
    team?: TeamMember[];
    discordRoles?: DiscordRole[];
    nftCollections?: NftCollection[];
    coins?: Coin[];
    tokenHoldingTiers?: PointTier[];
    tasks?: Task[];
    token?: string;
    tokenHoldingSettings?: {
        name?: string;
        contractAddress?: string;
        link?: string;
    };
    isCrowned?: boolean;
    isNew?: boolean;
    isHot?: boolean;
    dropStatus?: DropStatus;
    ticker?: string;
    idoDetails?: IdoDetails;
    raise?: string;
    longDescription?: string;
    isPublished?: boolean;
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    tasksInfo?: {
        totalTasks: number;
        cost: number;
        categories: string[];
    };
    rewardType?: 'Airdrop' | 'Whitelist' | 'Points' | 'NFT';
    strategy_walkthrough?: string[];
    has_pending_changes?: boolean;
    pending_changes?: {
        links?: {
            [key: string]: string;
        };
    };
};

export interface IdoDetails {
    tokenPrice?: string;
    totalSupply?: string;
    vestingSchedule?: string;
}

export type ProjectCategory = 'defi' | 'dex' | 'nft' | 'gaming' | 'rwa' | 'infrastructure' | 'wallet' | 'depin' | 'ai' | 'meme' | 'launchpad' | 'prediction market' | 'social' | 'other infra' | 'identity' | 'dev tooling' | 'privacy' | 'other apps' | 'betting' | 'governance' | 'analytics' | 'gaming infra' | 'account abstraction';

export type DropStatus = 'ongoing' | 'upcoming' | 'completed';

export type Quest = Tables<'quests'> & {
    // Custom properties for different quest types
    status?: 'ongoing' | 'past' | 'upcoming';
    endTime?: number;
    category?: string;
    title?: string;
    identityQuestion?: {
        title: string;
        prompt: string;
        description?: string;
        answers: { id: string; userId: string; username: string; answer: string }[];
    };
    multipleChoiceQuestion?: {
        title: string;
        prompt: string;
        description?: string;
        options: string[];
        correctAnswerIndex: number;
        answers: { userId: string; answerIndex: number }[];
    };
    max_submissions_per_user?: number;
    entries?: QuestEntry[];
};

export type Event = {
    id: string;
    type: 'campaign' | 'milestone' | 'ama';
    title: string;
    description: string;
    date: number; // timestamp
    projectName: string;
    status: 'pending' | 'approved' | 'rejected' | 'draft';
};

export type CampaignEvent = Event & {
    type: 'campaign';
    entries?: CampaignEntry[];
    endTime: number;
    startTime: number;
    winners?: any[];
    numberOfWinners?: number;
    reward?: string;
    details?: {
        introduction?: string;
        timeline?: CampaignTimelineItem[];
        eligibility?: string;
        tracks?: string;
        resourcesAndSupport?: string;
        aboutUs?: string;
        prizes?: string;
    };
    image?: string;
    category?: string;
};

export interface CampaignEntry {
    id: string;
    userId: string;
    link: string;
    votes: { up: number; down: number };
    voters: { userId: string; vote: 'up' | 'down' }[];
}

export interface CampaignTimelineItem {
    label: string;
    date: string;
}


// --- OTHER INTERFACES ---

export interface TeamMember {
    name: string;
    role: string;
    twitterUrl?: string;
    linkedinUrl?: string;
    photoUrl?: string;
    discordUserId?: string;
    discordUsername?: string;
    socials?: {
        twitter?: string;
        discord?: string;
        github?: string;
    };
}

export interface DiscordRole {
    id: string;
    name: string;
    points: number;
    serverId?: string;
    roleId?: string;
    description?: string;
    perks?: Perk[];
}

export interface NftCollection {
    id: string;
    name: string;
    image: string;
    pointsPerDay: number;
    oneTimePoints?: number;
    perks?: NftPerk[];
    contractAddress?: string;
    link?: string;
    network?: 'mainnet' | 'testnet';
    status?: 'draft' | 'published';
    supply?: string;
    mintPrice?: string;
    floorPrice?: string;
    isVisibleOnNftPage?: boolean;
}

export interface Coin {
    id: string;
    name: string;
    symbol: string;
    imageUrl: string;
    type?: 'meme' | 'ecosystem';
    network?: 'mainnet' | 'testnet';
    contractAddress?: string;
    link?: string;
    image?: string;
    status?: 'draft' | 'published';
    supply?: string;
    marketPrice?: string;
}

export interface QuestEntry {
    id: string;
    userId: string;
    username: string;
    twitterLink: string;
    votes: number;
    voters: string[];
}

export interface CredoSettings {
    roleBasedPartnerProjectNames: string[];
    nftBasedPartnerProjectNames: string[];
    tokenBasedPartnerProjectNames: string[];
    sliderProjectNames: string[];
    sliderNftNames: string[];
}

export interface WeeklyDiscordEvent {
    id: string;
    title: string;
    description: string;
    dateTime: number; // timestamp
    type?: 'community' | 'gaming' | 'mint' | 'ama' | 'creative' | 'other';
    name?: string;
    serverName?: string;
    discordEventLink?: string;
    image?: string;
    customTypeLabel?: string;
    reward?: string;
}

export interface SiteContentSettings {
    campaigns: { title: string; subtitle: string; featuredProjectIds: string[] };
    tasks: { title: string; subtitle: string; featuredProjectIds: string[] };
    earlyProjects: { title: string; subtitle: string; featuredProjectIds: string[] };
    ido: { title: string; subtitle: string; featuredProjectIds: string[] };
    meme: { title: string; subtitle: string; featuredProjectIds: string[] };
    nft: { title: string; subtitle: string; featuredProjectIds: string[] };
    thisWeek: { title: string; subtitle: string; featuredProjectIds: string[] };
}

export interface LinkItem {
    label: string;
    url: string;
}

export interface PointTier {
    minAmount: number;
    maxAmount: number | null;
    pointsPerDay: number;
}

export type PerkType = 'Airdrop' | 'GTD' | 'FCFS' | 'Free Mint';

export interface Perk {
    description: string;
    type: PerkType;
    grantingProjectName?: string;
    grantingProjectImage?: string;
}

export interface DisplayCollection extends NftCollection {
  projectName: string;
  projectStage?: string;
  perksIn?: {
    projectName: string;
    projectLogo: string;
    projectId: string;
  }[];
  projectId?: string;
}

export interface PerkRequirement {
    count: number;
    collectionName: string;
    projectName: string;
}

export interface NftPerk {
    holdingRequirement: PerkRequirement;
    perk: Perk;
}


export interface UserTokenHolding {
    projectId: string;
    amount: number;
    daysHeld: number;
}
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PendingChanges = {
    links?: {
        [key: string]: string;
    };
};

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      campaign_submission_votes: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          submission_id: string | null
          vote_value: number | null
          voter_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          submission_id?: string | null
          vote_value?: number | null
          voter_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          submission_id?: string | null
          vote_value?: number | null
          voter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_submission_votes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_submission_votes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "campaign_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_submission_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_submissions: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          is_winner: boolean | null
          points_earned: number | null
          status: string | null
          submission_data: Json
          submission_type: string | null
          submission_url: string | null
          total_votes: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          is_winner?: boolean | null
          points_earned?: number | null
          status?: string | null
          submission_data: Json
          submission_type?: string | null
          submission_url?: string | null
          total_votes?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          is_winner?: boolean | null
          points_earned?: number | null
          status?: string | null
          submission_data?: Json
          submission_type?: string | null
          submission_url?: string | null
          total_votes?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_submissions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_voting_settings: {
        Row: {
          allow_self_vote: boolean | null
          campaign_id: string | null
          created_at: string | null
          id: string
          is_voting_enabled: boolean | null
          max_votes_per_user: number | null
          min_votes_per_user: number | null
          updated_at: string | null
          vote_end_date: string | null
          vote_start_date: string | null
        }
        Insert: {
          allow_self_vote?: boolean | null
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          is_voting_enabled?: boolean | null
          max_votes_per_user?: number | null
          min_votes_per_user?: number | null
          updated_at?: string | null
          vote_end_date?: string | null
          vote_start_date?: string | null
        }
        Update: {
          allow_self_vote?: boolean | null
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          is_voting_enabled?: boolean | null
          max_votes_per_user?: number | null
          min_votes_per_user?: number | null
          updated_at?: string | null
          vote_end_date?: string | null
          vote_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_voting_settings_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          allow_submissions: boolean | null
          banner_url: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          max_submissions_per_user: number | null
          name: string
          project_id: string | null
          start_date: string | null
          submission_end_date: string | null
          submission_start_date: string | null
          total_rewards: number | null
          updated_at: string | null
        }
        Insert: {
          allow_submissions?: boolean | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_submissions_per_user?: number | null
          name: string
          project_id?: string | null
          start_date?: string | null
          submission_end_date?: string | null
          submission_start_date?: string | null
          total_rewards?: number | null
          updated_at?: string | null
        }
        Update: {
          allow_submissions?: boolean | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_submissions_per_user?: number | null
          name?: string
          project_id?: string | null
          start_date?: string | null
          submission_end_date?: string | null
          submission_start_date?: string | null
          total_rewards?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      discord_roles: {
        Row: {
          description: string | null
          id: string
          name: string
          perk_description: string | null
          perk_type: string | null
          points: number | null
          project_id: string | null
          role_id: string | null
          server_id: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          perk_description?: string | null
          perk_type?: string | null
          points?: number | null
          project_id?: string | null
          role_id?: string | null
          server_id?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          perk_description?: string | null
          perk_type?: string | null
          points?: number | null
          project_id?: string | null
          role_id?: string | null
          server_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discord_roles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      idos: {
        Row: {
          created_at: string | null
          id: string
          ido_date: string | null
          price: string | null
          project_id: string
          published_at: string | null
          raise_amount: string | null
          status: string | null
          supply: string | null
          updated_at: string | null
          valuation: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ido_date?: string | null
          price?: string | null
          project_id: string
          published_at?: string | null
          raise_amount?: string | null
          status?: string | null
          supply?: string | null
          updated_at?: string | null
          valuation?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ido_date?: string | null
          price?: string | null
          project_id?: string
          published_at?: string | null
          raise_amount?: string | null
          status?: string | null
          supply?: string | null
          updated_at?: string | null
          valuation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "idos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      memes: {
        Row: {
          contract_address: string | null
          created_at: string | null
          id: string
          image_url: string | null
          link: string | null
          market_price: string | null
          name: string
          network: string | null
          project_id: string
          published_at: string | null
          status: string | null
          supply: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          contract_address?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          market_price?: string | null
          name: string
          network?: string | null
          project_id: string
          published_at?: string | null
          status?: string | null
          supply?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          contract_address?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          market_price?: string | null
          name?: string
          network?: string | null
          project_id?: string
          published_at?: string | null
          status?: string | null
          supply?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_collections: {
        Row: {
          floor_price: string | null
          id: string
          image_url: string | null
          is_visible_on_nft_page: boolean | null
          mint_price: string | null
          name: string
          network: string | null
          one_time_points: number | null
          points_per_day: number | null
          project_id: string | null
          status: string | null
          supply: string | null
          urls: string[] | null
        }
        Insert: {
          floor_price?: string | null
          id?: string
          image_url?: string | null
          is_visible_on_nft_page?: boolean | null
          mint_price?: string | null
          name: string
          network?: string | null
          one_time_points?: number | null
          points_per_day?: number | null
          project_id?: string | null
          status?: string | null
          supply?: string | null
          urls?: string[] | null
        }
        Update: {
          floor_price?: string | null
          id?: string
          image_url?: string | null
          is_visible_on_nft_page?: boolean | null
          mint_price?: string | null
          name?: string
          network?: string | null
          one_time_points?: number | null
          points_per_day?: number | null
          project_id?: string | null
          status?: string | null
          supply?: string | null
          urls?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "nft_collections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_perks: {
        Row: {
          collection_id: string | null
          granting_project_id: string | null
          granting_project_image_url: string | null
          granting_project_name: string | null
          holding_requirement_count: number | null
          id: string
          perk_description: string | null
          perk_type: string | null
        }
        Insert: {
          collection_id?: string | null
          granting_project_id?: string | null
          granting_project_image_url?: string | null
          granting_project_name?: string | null
          holding_requirement_count?: number | null
          id?: string
          perk_description?: string | null
          perk_type?: string | null
        }
        Update: {
          collection_id?: string | null
          granting_project_id?: string | null
          granting_project_image_url?: string | null
          granting_project_name?: string | null
          holding_requirement_count?: number | null
          id?: string
          perk_description?: string | null
          perk_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nft_perks_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "nft_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nft_perks_granting_project_id_fkey"
            columns: ["granting_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      nfts: {
        Row: {
          created_at: string | null
          floor_price: string | null
          id: string
          image_url: string | null
          link: string | null
          mint_price: string | null
          name: string
          network: string | null
          project_id: string
          published_at: string | null
          status: string | null
          supply: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          floor_price?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          mint_price?: string | null
          name: string
          network?: string | null
          project_id: string
          published_at?: string | null
          status?: string | null
          supply?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          floor_price?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          mint_price?: string | null
          name?: string
          network?: string | null
          project_id?: string
          published_at?: string | null
          status?: string | null
          supply?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nfts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_categories: {
        Row: {
          category_id: string
          project_id: string
        }
        Insert: {
          category_id: string
          project_id: string
        }
        Update: {
          category_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_categories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          approval_status: string | null
          banner_url: string | null
          created_at: string | null
          description: string | null
          discord_url: string | null
          drop_status: string | null
          followers_x: number | null
          has_pending_changes: boolean | null
          id: string
          is_crowned: boolean | null
          is_hot: boolean | null
          is_new: boolean | null
          is_published: boolean | null
          logo_url: string | null
          long_description: string | null
          members_discord: number | null
          name: string
          nft_volume: number | null
          pending_changes: Json | null
          raise_amount: string | null
          reward_type: string | null
          stage: string | null
          status: string | null
          strategy_walkthrough: string[] | null
          token_holding_settings_contract: string | null
          token_holding_settings_link: string | null
          token_holding_settings_name: string | null
          token_symbol: string | null
          twitter_url: string | null
          website_urls: string[] | null
        }
        Insert: {
          approval_status?: string | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          discord_url?: string | null
          drop_status?: string | null
          followers_x?: number | null
          has_pending_changes?: boolean | null
          id?: string
          is_crowned?: boolean | null
          is_hot?: boolean | null
          is_new?: boolean | null
          is_published?: boolean | null
          logo_url?: string | null
          long_description?: string | null
          members_discord?: number | null
          name: string
          nft_volume?: number | null
          pending_changes?: Json | null
          raise_amount?: string | null
          reward_type?: string | null
          stage?: string | null
          status?: string | null
          strategy_walkthrough?: string[] | null
          token_holding_settings_contract?: string | null
          token_holding_settings_link?: string | null
          token_holding_settings_name?: string | null
          token_symbol?: string | null
          twitter_url?: string | null
          website_urls?: string[] | null
        }
        Update: {
          approval_status?: string | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          discord_url?: string | null
          drop_status?: string | null
          followers_x?: number | null
          has_pending_changes?: boolean | null
          id?: string
          is_crowned?: boolean | null
          is_hot?: boolean | null
          is_new?: boolean | null
          is_published?: boolean | null
          logo_url?: string | null
          long_description?: string | null
          members_discord?: number | null
          name?: string
          nft_volume?: number | null
          pending_changes?: Json | null
          raise_amount?: string | null
          reward_type?: string | null
          stage?: string | null
          status?: string | null
          strategy_walkthrough?: string[] | null
          token_holding_settings_contract?: string | null
          token_holding_settings_link?: string | null
          token_holding_settings_name?: string | null
          token_symbol?: string | null
          twitter_url?: string | null
          website_urls?: string[] | null
        }
        Relationships: []
      }
      quests: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          max_completions: number | null
          name: string
          quest_type: string | null
          required_tasks_count: number | null
          reward_points: number | null
          reward_type: string | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_completions?: number | null
          name: string
          quest_type?: string | null
          required_tasks_count?: number | null
          reward_points?: number | null
          reward_type?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_completions?: number | null
          name?: string
          quest_type?: string | null
          required_tasks_count?: number | null
          reward_points?: number | null
          reward_type?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          name: string
          quest_id: string | null
          reward_points: number | null
          task_config: Json | null
          task_type: string
          updated_at: string | null
          verification_type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name: string
          quest_id?: string | null
          reward_points?: number | null
          task_config?: Json | null
          task_type: string
          updated_at?: string | null
          verification_type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name?: string
          quest_id?: string | null
          reward_points?: number | null
          task_config?: Json | null
          task_type?: string
          updated_at?: string | null
          verification_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          linkedin_url: string | null
          name: string
          photo_url: string | null
          project_id: string | null
          role: string | null
          twitter_url: string | null
        }
        Insert: {
          id?: string
          linkedin_url?: string | null
          name: string
          photo_url?: string | null
          project_id?: string | null
          role?: string | null
          twitter_url?: string | null
        }
        Update: {
          id?: string
          linkedin_url?: string | null
          name?: string
          photo_url?: string | null
          project_id?: string | null
          role?: string | null
          twitter_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      token_holding_tiers: {
        Row: {
          id: string
          max_amount: number | null
          min_amount: number
          points_per_day: number | null
          project_id: string | null
        }
        Insert: {
          id?: string
          max_amount?: number | null
          min_amount: number
          points_per_day?: number | null
          project_id?: string | null
        }
        Update: {
          id?: string
          max_amount?: number | null
          min_amount?: number
          points_per_day?: number | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_holding_tiers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens: {
        Row: {
          category: string | null
          contract_address: string | null
          id: string
          image_url: string | null
          is_visible_on_meme_page: boolean | null
          market_price: string | null
          name: string
          network: string | null
          project_id: string | null
          status: string | null
          supply: string | null
          symbol: string | null
          urls: string[] | null
        }
        Insert: {
          category?: string | null
          contract_address?: string | null
          id?: string
          image_url?: string | null
          is_visible_on_meme_page?: boolean | null
          market_price?: string | null
          name: string
          network?: string | null
          project_id?: string | null
          status?: string | null
          supply?: string | null
          symbol?: string | null
          urls?: string[] | null
        }
        Update: {
          category?: string | null
          contract_address?: string | null
          id?: string
          image_url?: string | null
          is_visible_on_meme_page?: boolean | null
          market_price?: string | null
          name?: string
          network?: string | null
          project_id?: string | null
          status?: string | null
          supply?: string | null
          symbol?: string | null
          urls?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "tokens_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_discord_roles: {
        Row: {
          assigned_at: string | null
          id: string
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_discord_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "discord_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_discord_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_nft_holdings: {
        Row: {
          collection_id: string | null
          current_holding: boolean | null
          first_acquired_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          collection_id?: string | null
          current_holding?: boolean | null
          first_acquired_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          collection_id?: string | null
          current_holding?: boolean | null
          first_acquired_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_nft_holdings_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "nft_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_nft_holdings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_nft_points_history: {
        Row: {
          action: string | null
          collection_id: string | null
          created_at: string | null
          daily_points_earned: number | null
          id: string
          one_time_points: number | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          collection_id?: string | null
          created_at?: string | null
          daily_points_earned?: number | null
          id?: string
          one_time_points?: number | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          collection_id?: string | null
          created_at?: string | null
          daily_points_earned?: number | null
          id?: string
          one_time_points?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_nft_points_history_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "nft_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_nft_points_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_project_admin_access: {
        Row: {
          granted_at: string | null
          project_id: string
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          project_id: string
          user_id: string
        }
        Update: {
          granted_at?: string | null
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_project_admin_access_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_project_admin_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_project_votes: {
        Row: {
          created_at: string | null
          id: string
          project_id: string | null
          user_id: string | null
          vote_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
          vote_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
          vote_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_project_votes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_project_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quest_progress: {
        Row: {
          completed_at: string | null
          completion_count: number | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          quest_id: string | null
          total_points_earned: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completion_count?: number | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          quest_id?: string | null
          total_points_earned?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completion_count?: number | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          quest_id?: string | null
          total_points_earned?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_quest_progress_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quest_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_task_completions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          points_earned: number | null
          quest_id: string | null
          task_id: string | null
          updated_at: string | null
          user_id: string | null
          verification_proof: Json | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          points_earned?: number | null
          quest_id?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_proof?: Json | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          points_earned?: number | null
          quest_id?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_proof?: Json | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_task_completions_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_task_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_task_completions_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_team_memberships: {
        Row: {
          id: string
          joined_at: string | null
          project_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          project_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          project_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_team_memberships_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_team_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_token_holdings: {
        Row: {
          amount: number
          id: string
          last_updated_at: string | null
          token_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          id?: string
          last_updated_at?: string | null
          token_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          id?: string
          last_updated_at?: string | null
          token_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_token_holdings_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_token_holdings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_vouches: {
        Row: {
          created_at: string | null
          id: string
          project_id: string | null
          vouchee_user_id: string | null
          voucher_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          vouchee_user_id?: string | null
          voucher_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          vouchee_user_id?: string | null
          voucher_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_vouches_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_vouches_vouchee_user_id_fkey"
            columns: ["vouchee_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_vouches_voucher_user_id_fkey"
            columns: ["voucher_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          banner_url: string | null
          created_at: string | null
          credo_points: number | null
          discord_profile_pic_url: string | null
          email: string | null
          hint_points: number | null
          id: string
          manual_hint_points: number | null
          permissions: Json | null
          platform_user_id: string | null
          platform_username: string
          profile_pic_url: string | null
          role: string | null
          twitter_handle: string | null
          twitter_profile_pic_url: string | null
          updated_at: string | null
          wallet_address: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          credo_points?: number | null
          discord_profile_pic_url?: string | null
          email?: string | null
          hint_points?: number | null
          id?: string
          manual_hint_points?: number | null
          permissions?: Json | null
          platform_user_id?: string | null
          platform_username: string
          profile_pic_url?: string | null
          role?: string | null
          twitter_handle?: string | null
          twitter_profile_pic_url?: string | null
          updated_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          credo_points?: number | null
          discord_profile_pic_url?: string | null
          email?: string | null
          hint_points?: number | null
          id?: string
          manual_hint_points?: number | null
          permissions?: Json | null
          platform_user_id?: string | null
          platform_username?: string
          profile_pic_url?: string | null
          role?: string | null
          twitter_handle?: string | null
          twitter_profile_pic_url?: string | null
          updated_at?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export interface Achievement {
    id: string;
    logo: string;
    title: string;
    achievedItems: { name: string; points: number }[];
    points: number;
    isAchieved: boolean;
    type: 'partner';
    project: Project;
    userId: string;
}

export type Task = Tables<'tasks'> & {
    status?: 'draft' | 'pending' | 'approved' | 'rejected';
    title?: string;
    points?: number;
    platform?: 'x' | 'discord' | 'guild' | 'youtube' | 'website' | 'testnet';
    link?: string;
};

