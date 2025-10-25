// This file contains type definitions for the application.

// General
export type ProjectCategory = 'defi' | 'dex' | 'nft' | 'gaming' | 'socialfi' | 'rwa' | 'infrastructure' | 'wallet' | 'depin' | 'ai' | 'meme' | 'launchpad';
export type DropStatus = 'ongoing' | 'upcoming' | 'completed';
export type PerkType = 'Airdrop' | 'GTD' | 'FCFS' | 'Free Mint';
export type EventCategory = 'community' | 'defi' | 'nft' | 'gaming' | 'art';

// Perks and Collections
export interface Perk {
  type: PerkType;
  description: string;
  grantingProjectName?: string;
  grantingProjectImage?: string;
}

export interface HoldingRequirement {
  count: number;
  projectName?: string;
  collectionName?: string;
}

export interface NftPerk {
  holdingRequirement: HoldingRequirement;
  perk: Perk;
}

export interface NftCollection {
  id: string;
  name: string;
  image: string;
  contractAddress?: string;
  link: string;
  network: 'mainnet' | 'testnet';
  supply?: string;
  mintPrice?: string;
  floorPrice?: string;
  perks: NftPerk[];
  pointsPerDay?: number;
  oneTimePoints?: number;
  status: 'published' | 'draft';
  isVisibleOnNftPage?: boolean;
}

export interface DisplayCollection extends NftCollection {
    projectId: string;
    projectName: string;
    projectStage?: Project['stage'];
    perksIn: { projectName: string; projectLogo: string; projectId: string; }[];
}


// Team and Roles
export interface TeamMember {
  name: string;
  role: string;
  discordUserId?: string;
  discordUsername?: string;
  photoUrl?: string;
  socials?: {
    twitter?: string;
    linkedin?: string;
  };
}

export interface DiscordRole {
    serverId: string;
    roleId: string;
    name: string;
    description: string;
    points?: number;
    perk?: Perk;
}

// Utility and Coins
export interface Utility {
    title: string;
    description: string;
    image: string;
    link: { url: string; label: string };
    outcome: 'Whitelist' | 'Airdrop' | 'Freemint';
}

export interface Coin {
    id: string;
    type: 'meme' | 'ecosystem';
    network: 'mainnet' | 'testnet';
    name: string;
    contractAddress: string;
    link: string;
    image: string;
    supply?: string;
    marketPrice?: string;
    status?: 'published' | 'draft';
}

// Tasks
export interface Task {
    id: string;
    title: string;
    description: string;
    type: 'community' | 'social' | 'creative' | 'on-chain';
    platform: 'guild' | 'x' | 'discord' | 'youtube' | 'website' | 'testnet';
    points: number;
    link: string;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
}

// Points and Holdings
export interface PointTier {
    minAmount: number;
    maxAmount: number | null;
    pointsPerDay: number;
}

export interface UserNftHolding {
    projectId: string;
    daysHeld: number;
}

export interface UserTokenHolding {
    projectId: string;
    amount: number;
    daysHeld: number;
}

// User
export interface User {
    id: string;
    name: string;
    role: 'member' | 'project_admin' | 'super_admin';
    walletAddress?: string;
    discordId?: string;
    profilePic?: string;
    bio?: string;
    socials?: {
        twitter?: string;
        discord?: string;
    };
    tirthPoints?: number;
    manualCredoPoints?: number;
    votedProjectIds?: string[];
    votedCampaignEntryIds?: string[];
    vouchedFor?: string[];
    projectsBuilding?: string[];
    discordRoles?: string[];
    nftHoldings?: UserNftHolding[];
    tokenHoldings?: UserTokenHolding[];
    associatedProjectIds?: string[];
    permissions?: {
        canDeleteProjects?: boolean;
        canDeleteEvents?: boolean;
        canDeleteHighlights?: boolean;
    };
    banner?: string;
    discordUsername?: string;
    nickname?: string;
}


// Events
export interface AmaEvent {
  id: string;
  type: 'ama';
  title: string;
  description: string;
  image: string;
  pinned: boolean;
  category: EventCategory;
  projectName?: string;
  eventTime: number;
  links: { title: string; url: string }[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
}

export interface CampaignEntry {
  id: string;
  username: string;
  userId: string;
  link: string;
  votes: {
    up: number;
    down: number;
  };
  voters: { userId: string; vote: 'up' | 'down' }[];
  isWinner?: boolean;
}

export interface CampaignTimelineItem {
  label: string;
  date: string;
}

export interface CampaignEvent {
  id: string;
  type: 'campaign';
  title: string;
  description: string;
  image: string;
  pinned: boolean;
  category: EventCategory;
  projectName?: string;
  startTime: number;
  endTime: number;
  reward: string;
  entries?: CampaignEntry[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  numberOfWinners?: number;
  winners?: string[];
  details?: {
      introduction?: string;
      timeline?: CampaignTimelineItem[];
      prizes?: string;
      eligibility?: string;
      tracks?: string;
      resourcesAndSupport?: string;
      aboutUs?: string;
  }
}

export type Event = AmaEvent | CampaignEvent;


// Project
export interface Project {
    id: string;
    name: string;
    logo: string;
    banner: string;
    description: string;
    longDescription: string;
    links: {
        website: string;
        twitter?: string;
        discord?: string;
        whitelistInfo?: string;
        coinLink?: string;
        magicEden?: { mainnet?: string; testnet?: string; };
        memeCoin?: { mainnet?: string; testnet?: string; };
    };
    events: Event[];
    status: 'ongoing' | 'beta';
    category: ProjectCategory[];
    token?: string;
    team?: TeamMember[];
    raise?: string;
    stage?: 'Private' | 'Early' | 'Pre-Launch' | 'Launched';
    ticker?: string;
    utility?: Utility;
    discordRoles?: DiscordRole[];
    nftCollections?: NftCollection[];
    coins?: Coin[];
    dropStatus?: DropStatus;
    createdAt: number;
    followersX?: number;
    membersDiscord?: number;
    votes: {
        up: number;
        down: number;
        voters: { userId: string; vote: 'up' | 'down' }[];
    };
    approvalStatus: 'approved' | 'pending' | 'rejected';
    tokenHoldingSettings?: {
        name: string;
        contractAddress: string;
        link: string;
    };
    tokenHoldingTiers?: PointTier[];
    investors?: { name: string; logoUrl: string }[];
    tasksInfo?: {
        cost: number;
        timeMinutes: number;
        categories: string[];
        totalTasks: number;
    } | null;
    tasks?: Task[];
    rewardType?: 'Airdrop' | 'Whitelist' | 'NFT' | 'Points' | null;
    isCrowned?: boolean;
    isNew?: boolean;
    isHot?: boolean;
    isPublished?: boolean;
    nftVolume?: number;
    strategyWalkthrough?: string[];
    hasPendingChanges?: boolean;
    pendingChanges?: {
        links?: Partial<Project['links']>;
    };
    idoDetails?: {
        tokenPrice: string;
        vestingSchedule: string;
        totalSupply: string;
    };
}

// Quests
export interface QuestEntry {
    id: string;
    userId: string;
    twitterLink: string;
    username: string;
    votes: number;
    voters: string[];
}

export interface QuestAnswer {
    id: string;
    userId: string;
    username: string;
    answer: string;
    timestamp: number;
}

export interface MultipleChoiceAnswer {
    id: string;
    userId: string;
    username: string;
    answerIndex: number;
    timestamp: number;
}

export interface MultipleChoiceQuestion {
    title: string;
    prompt: string;
    options: string[];
    correctAnswerIndex: number;
}

export interface Quest {
    id: string;
    title: string;
    category: 'Gaming' | 'Meme' | 'Art' | 'Identity';
    startTime: number;
    endTime: number;
    status: 'ongoing' | 'past';
    entries?: QuestEntry[];
    maxSubmissionsPerUser?: number;
    pointsForSubmission?: number;
    // FIX: Added missing 'pointsForWinning' property to the Quest interface.
    pointsForWinning?: number;
    identityQuestion?: {
        title: string;
        prompt: string;
        answers: QuestAnswer[];
    };
    multipleChoiceQuestion?: MultipleChoiceQuestion & {
        answers: MultipleChoiceAnswer[];
    };
}

// Settings
export interface CredoSettings {
    roleBasedPartnerProjectNames: string[];
    nftBasedPartnerProjectNames: string[];
    tokenBasedPartnerProjectNames: string[];
    sliderProjectNames: string[];
    sliderNftNames: string[];
}

export interface WeeklyDiscordEvent {
    id: string;
    name: string;
    dateTime: number;
    reward: string;
    serverName: string;
    partnerServerName?: string;
    type: 'gaming' | 'community' | 'mint' | 'ama' | 'creative';
    discordEventLink: string;
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
