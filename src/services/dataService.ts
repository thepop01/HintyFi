// This file contains all the mock data and data access functions for the application.
// In a real application, this would be replaced with API calls to a backend service.

import { uid } from '../../utils/helpers';
import { 
    User, Event, Project, CampaignEntry, CampaignEvent, ProjectCategory, TeamMember, 
    Utility, DiscordRole, DropStatus, PointTier, UserNftHolding, UserTokenHolding, 
    Quest, QuestEntry, QuestAnswer, CredoSettings, NftPerk, NftCollection, 
    Task, WeeklyDiscordEvent, SiteContentSettings, Coin, AmaEvent, EventCategory, MultipleChoiceAnswer
} from '../types';

// Add a version to force data refresh
const DATA_VERSION = 'v1.0';

// Local storage helpers
const load = <T,>(k: string, fallback: T): T => {
  try {
    const versionKey = `${k}_version`;
    const storedVersion = localStorage.getItem(versionKey);
    const raw = localStorage.getItem(k);
    
    // If data version doesn't match or no data exists, use fallback
    if (storedVersion !== DATA_VERSION || !raw) {
      save(k, fallback);
      localStorage.setItem(versionKey, DATA_VERSION);
      return fallback;
    }
    
    return JSON.parse(raw);
  } catch { 
    save(k, fallback);
    return fallback; 
  }
};

const save = <T,>(k: string, v: T) => {
    localStorage.setItem(k, JSON.stringify(v));
    localStorage.setItem(`${k}_version`, DATA_VERSION);
    window.dispatchEvent(new CustomEvent('datachanged'));
};

// Mock Data for Blockchain Features
const CULT_OWNER_ADDRESSES = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Alice
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Bob
];

const mockInvestors = [
  { name: '1kx', logoUrl: 'https://i.ibb.co/L5k2Hxb/1kx.jpg' },
  { name: 'Variant', logoUrl: 'https://i.ibb.co/yQ5g0R5/variant.png' },
  { name: 'a16z', logoUrl: 'https://i.ibb.co/3kZ5j6y/a16z.png' },
  { name: 'Paradigm', logoUrl: 'https://i.ibb.co/8XY5g3D/paradigm.png' },
  { name: 'Sequoia', logoUrl: 'https://i.ibb.co/CVC2M2T/sequoia.png' },
  { name: 'Dragonfly', logoUrl: 'https://i.ibb.co/bF9Zf8p/dragonfly.png' },
  { name: 'Electric Capital', logoUrl: 'https://i.ibb.co/P48n3hP/electric.png' },
  { name: 'Placeholder', logoUrl: 'https://i.ibb.co/D8dYh7Q/placeholder.png' },
  { name: 'Fabric Ventures', logoUrl: 'https://i.ibb.co/YyV3fJj/fabric.png' },
  { name: 'Coinbase Ventures', logoUrl: 'https://i.ibb.co/Yd4Bw5r/coinbase.png' },
];

const mockTaskCategories = ['Social', 'Testnet', 'Gaming', 'Bounty', 'Node', 'Fill Form', 'Quiz'];
const mockRewardTypes: (Project['rewardType'])[] = ['Airdrop', 'Whitelist', 'NFT', 'Points', null];

// Seeding logic
const seedData = () => {
  const defaultUser: User = { id: "u_admin", name: "Admin", role: "super_admin" as const };
  const now = Date.now();
  const d = (days: number) => 1000 * 60 * 60 * 24 * days;
  
  const users: User[] = [
    defaultUser, 
    { 
      id: "u_1", 
      name: "alice", 
      role: "member", 
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      discordId: '273462001309384704',
      discordUsername: 'alice.eth',
      nickname: 'AliceInWonderland',
      profilePic: "https://images.pexels.com/photos/7319163/pexels-photo-7319163.jpeg?auto=compress&cs=tinysrgb&w=400",
      socials: {
        twitter: "alice_crypto",
        discord: "alice#1234",
        github: "alice-crypto"
      },
      projectsBuilding: ['Opals', 'CULT', 'Monadata AI'],
      discordRoles: ['Community Contributor', 'Artist', 'Cultist', 'Initiate', 'Genesis Holder'],
      tirthPoints: 12345,
      manualCredoPoints: 0,
      votedProjectIds: [],
      votedCampaignEntryIds: [],
      vouchedFor: [],
      nftHoldings: [
        { projectId: 'proj_45', daysHeld: 15 } // Opals Genesis Cards
      ],
      tokenHoldings: [
        { projectId: 'proj_45', amount: 50000, daysHeld: 15 } // Opals Token
      ]
    }, 
    { 
      id: "u_2", 
      name: "bob", 
      role: "project_admin", 
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      discordId: '273462001309384705',
      socials: {
        twitter: "bob_builder",
        discord: "bob#5678"
      },
      projectsBuilding: [],
      discordRoles: ['Animator', 'High Priest', 'with full access'],
      tirthPoints: 9870,
      manualCredoPoints: 0,
      votedProjectIds: [],
      votedCampaignEntryIds: [],
      vouchedFor: [],
      associatedProjectIds: [], 
      permissions: {
        canDeleteProjects: false,
        canDeleteEvents: true,
        canDeleteHighlights: true,
      },
    },
    { 
      id: "u_3", 
      name: "Cynthia", 
      role: "member",
      discordId: '273462001309384706',
      socials: { twitter: "CynthiaGamer" },
      projectsBuilding: ['Valor Quest', 'Showdown'],
      discordRoles: ['Gamer Guild'],
      tirthPoints: 8400,
      manualCredoPoints: 0,
      votedProjectIds: [],
      votedCampaignEntryIds: [],
      vouchedFor: [],
    }, 
    { 
      id: "u_4", 
      name: "David", 
      role: "member",
      discordId: '273462001309384707',
      socials: { twitter: "David_DeFi" },
      discordRoles: ['Early Supporter'],
      tirthPoints: 7650,
      manualCredoPoints: 0,
      votedProjectIds: [],
      votedCampaignEntryIds: [],
      vouchedFor: [],
      nftHoldings: [
        { projectId: 'proj_7', daysHeld: 30 } // CULT Initiate Pass
      ],
      tokenHoldings: [
        { projectId: 'proj_7', amount: 250000, daysHeld: 30 } // CULT Token
      ]
    },
    { 
      id: "u_5", 
      name: "Eve", 
      role: "member",
      discordId: '273462001309384708',
      projectsBuilding: ['Kizzy'],
      discordRoles: ['Community Contributor'],
      tirthPoints: 10500,
      manualCredoPoints: 0,
      votedProjectIds: [],
      votedCampaignEntryIds: [],
      vouchedFor: [],
    },
    { 
      id: "u_6", 
      name: "Frank", 
      role: "member",
      discordId: '273462001309384709',
      socials: { twitter: "FrankieMemes" },
      discordRoles: ['Meme Lord'],
      tirthPoints: 6320,
      manualCredoPoints: 0,
      votedProjectIds: [],
      votedCampaignEntryIds: [],
      vouchedFor: [],
    },
    { 
      id: "u_7", 
      name: "Grace", 
      role: "member",
      discordId: '273462001309384710',
      socials: { twitter: "Grace3D" },
      projectsBuilding: ['Sunscreen'],
      discordRoles: ['3D Modeler'],
      tirthPoints: 11200,
      manualCredoPoints: 0,
      votedProjectIds: [],
      votedCampaignEntryIds: [],
      vouchedFor: [],
      tokenHoldings: [
        { projectId: 'proj_68', amount: 1000000, daysHeld: 50 } // Valor Quest Token
      ]
    },
  ];

  // --- QUEST DATA ---
  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1...
  
  // Set start to the most recent Monday
  const startOfThisWeek = new Date(today);
  startOfThisWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  startOfThisWeek.setHours(0, 0, 0, 0);

  // Set end to the upcoming Saturday midnight
  const endOfThisWeek = new Date(startOfThisWeek);
  endOfThisWeek.setDate(startOfThisWeek.getDate() + 5);
  endOfThisWeek.setHours(23, 59, 59, 999);

  const pastQuestEntries: QuestEntry[] = [
    { id: uid(), userId: 'u_6', twitterLink: 'https://twitter.com/FrankieMemes/status/123', username: 'Frank', votes: 152, voters: [] },
    { id: uid(), userId: 'u_1', twitterLink: 'https://twitter.com/alice_crypto/status/456', username: 'alice', votes: 128, voters: [] },
    { id: uid(), userId: 'u_2', twitterLink: 'https://twitter.com/bob_builder/status/789', username: 'bob', votes: 97, voters: [] },
  ];

  const ongoingQuestEntries: QuestEntry[] = [
     { id: uid(), userId: 'u_3', twitterLink: 'https://twitter.com/CynthiaGamer/status/111', username: 'Cynthia', votes: 45, voters: [] },
     { id: uid(), userId: 'u_4', twitterLink: 'https://twitter.com/David_DeFi/status/222', username: 'David', votes: 32, voters: [] },
  ];
  
  const sampleAnswers: QuestAnswer[] = [
    { id: uid(), userId: 'u_4', username: 'David', answer: 'The one with the sunglasses, obviously.', timestamp: Date.now() - d(0.1) },
    { id: uid(), userId: 'u_5', username: 'Eve', answer: 'OG NAD is the strongest.', timestamp: Date.now() - d(0.2) },
  ];

  const quests: Quest[] = [
    {
      id: 'q_ongoing_1',
      title: 'Week 2: Best Gaming Setup',
      category: 'Gaming',
      startTime: startOfThisWeek.getTime(),
      endTime: endOfThisWeek.getTime(),
      status: 'ongoing',
      entries: ongoingQuestEntries,
      maxSubmissionsPerUser: 7,
      pointsForSubmission: 50,
      identityQuestion: {
        title: "Week 2: Who is it?",
        prompt: "Who is the strongest NAD?",
        answers: sampleAnswers,
      },
      multipleChoiceQuestion: {
        title: "Pop Quiz!",
        prompt: "Which project introduced the concept of 'Proof of Hype'?",
        options: ["FairSwap", "CULT", "NodeLink", "Opals"],
        correctAnswerIndex: 1,
        answers: [],
      }
    },
    {
      id: 'q_past_1',
      title: 'Week 1: Funniest Crypto Meme',
      category: 'Meme',
      startTime: startOfThisWeek.getTime() - d(7),
      endTime: endOfThisWeek.getTime() - d(7),
      status: 'past',
      entries: pastQuestEntries,
      maxSubmissionsPerUser: 7,
      pointsForSubmission: 50,
    }
  ];
  
  // Helper to create dates for the current month
  const createDate = (day: number, hour: number = 12, minute: number = 0): number => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), day, hour, minute).getTime();
  };

  const createMockEntries = (count: number): CampaignEntry[] => {
    const mockUsers = [
        { id: 'u_1', name: 'alice' },
        { id: 'u_2', name: 'bob' },
        { id: 'u_3', name: 'Cynthia' },
        { id: 'u_4', name: 'David' },
        { id: 'u_5', name: 'Eve' },
        { id: 'u_6', name: 'Frank' },
        { id: 'u_7', name: 'Grace' },
        { id: 'u_admin', name: 'Admin' },
    ];
    
    const entries: CampaignEntry[] = [];
    for (let i = 0; i < count; i++) {
        const user = mockUsers[i % mockUsers.length];
        entries.push({
            id: uid(),
            username: user.name,
            userId: user.id, // Use real mock user ID
            link: `https://example.com/art/${uid()}`,
            votes: {
                up: Math.floor(Math.random() * 100),
                down: Math.floor(Math.random() * 20),
            },
            voters: [],
        });
    }
    // Shuffle to make it look more random
    return entries.sort(() => 0.5 - Math.random());
  };

  const events: Event[] = [
    { 
        id: uid(), 
        type: 'ama',
        title: "AMA with Founder of FairSwap", 
        description: "Join us for a live Twitter Space AMA with the founder of FairSwap. We'll discuss the future of decentralized exchanges, liquidity provision, and their upcoming v3 launch. Get your questions ready!", 
        image: "https://images.pexels.com/photos/375677/pexels-photo-375677.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", 
        pinned: true,
        category: 'defi',
        projectName: 'FairSwap',
        eventTime: now + d(1),
        status: 'approved',
        links: [
            { title: 'Join Twitter Space', url: 'https://twitter.com/i/spaces/123' },
            { title: 'FairSwap Website', url: 'https://example.com' }
        ]
    },
    // ---- NEW FEATURED EVENTS ----
    {
        id: uid(),
        type: 'ama',
        title: "Exploring the Future of Web3 Gaming",
        description: "An in-depth discussion with leading game developers on the intersection of blockchain, NFTs, and interactive entertainment. Discover what's next for play-to-earn and the metaverse.",
        image: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: true,
        category: 'gaming',
        projectName: 'Valor Quest',
        eventTime: now + d(4),
        status: 'approved',
        links: [{ title: 'Join the Conversation', url: '#' }]
    },
    {
        id: uid(),
        type: 'campaign',
        title: "Monad TGE Announcement",
        description: "The official announcement for the Monad Token Generation Event. Mark your calendars! More details about the launch, tokenomics, and airdrop criteria will be released as we get closer to the date.",
        image: "https://images.pexels.com/photos/1183099/pexels-photo-1183099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: true,
        category: 'defi',
        projectName: 'Monarch',
        startTime: now + d(10),
        endTime: now + d(17),
        status: 'approved',
        reward: "This is an informational event. Stay tuned for airdrop announcements.",
    },
    {
        id: uid(),
        type: 'ama',
        title: "Deep Dive: DAO Governance Models",
        description: "Join us for a panel with founders of major DAOs as they discuss different governance models, voter apathy, and the future of decentralized organizations.",
        image: "https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: true,
        category: 'defi',
        eventTime: now + d(5),
        status: 'approved',
        links: [{ title: 'Join the Panel', url: '#' }]
    },
    {
        id: uid(),
        type: 'ama',
        title: "NFT Security Workshop: Protect Your Assets",
        description: "Learn from top security experts how to protect your valuable NFTs from scams and hacks. We'll cover wallet security, identifying fake mints, and best practices.",
        image: "https://images.pexels.com/photos/5980862/pexels-photo-5980862.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: true,
        category: 'nft',
        eventTime: now + d(8),
        status: 'approved',
        links: [{ title: 'Register for Workshop', url: '#' }]
    },
    {
        id: uid(),
        type: 'campaign',
        title: "Community Logo Redesign Contest",
        description: "We're looking for a new look! Submit your best design for the new CULT project logo. The winning design will be adopted and the creator will receive a huge prize.",
        image: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: true,
        category: 'community',
        projectName: 'CULT',
        startTime: now,
        endTime: now + d(20),
        reward: "$2,000 USDC for the winning design and the exclusive 'Community Brand Shaper' role in Discord.",
        numberOfWinners: 3,
        entries: createMockEntries(25),
        status: 'approved',
        details: {
            introduction: "To celebrate our community growth, we are hosting a hackathon-style contest to redesign the official CULT project logo. We are looking for a design that embodies our values of decentralization, creativity, and cultural significance in the crypto space. Whether you're a professional designer or a passionate community member, we want to see your vision for CULT.",
            timeline: [
                { label: 'Contest Announcement', date: 'June 10, 2025' },
                { label: 'Submission Period Opens', date: 'June 11, 2025' },
                { label: 'AMA with CULT Founders', date: 'June 18, 2025' },
                { label: 'Submission Deadline', date: 'July 1, 2025' },
                { label: 'Community Voting Period', date: 'July 2 - July 8, 2025' },
                { label: 'Winner Announcement', date: 'July 10, 2025' },
            ],
            prizes: "The winning designer will receive a grand prize of $2,000 USDC. Additionally, they will be awarded the exclusive 'Brand Shaper' role in our Discord, signifying their foundational contribution to the CULT identity. The winning logo will be adopted across all official CULT platforms and materials.",
            eligibility: "This contest is open to all members of the CULT community. Submissions must be original work and should be submitted in SVG and high-resolution PNG format. Teams of up to two are permitted.",
            resourcesAndSupport: "All participants will receive access to branding guidelines, and a dedicated Discord channel for questions and feedback.",
            aboutUs: "CULT is a community-driven project focused on the intersection of crypto, art, and culture."
        }
    },
    {
        id: uid(),
        type: 'ama',
        title: "Tech Talk: A Beginner's Guide to ZK-Proofs",
        description: "Zero-knowledge proofs are changing the game for privacy and scaling. Join our lead developer for an easy-to-understand breakdown of what they are and why they matter.",
        image: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: true,
        category: 'defi',
        eventTime: now + d(9),
        status: 'approved',
        links: [{ title: 'Watch on YouTube', url: '#' }]
    },
    {
        id: uid(),
        type: 'ama',
        title: "The Future of Music NFTs",
        description: "A conversation with artists and platform builders who are revolutionizing the music industry with blockchain technology. We'll discuss royalties, fan ownership, and new creative possibilities.",
        image: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: true,
        category: 'nft',
        eventTime: now + d(11),
        status: 'approved',
        links: [{ title: 'Tune In on Spaces', url: '#' }]
    },
    {
        id: uid(),
        type: 'campaign',
        title: "3D Metaverse Asset Creation",
        description: "Calling all 3D artists! Design a unique wearable or object for our partner's metaverse, 'NovaRealm'. The best creations will be minted and integrated into the world.",
        image: "https://images.pexels.com/photos/2156/sky-earth-space-working.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: true,
        category: 'art',
        projectName: 'Valor Quest',
        startTime: now + d(2),
        endTime: now + d(22),
        status: 'approved',
        reward: "Top 3 designs will be minted as official NovaRealm assets. Creators receive 50% of all primary sales revenue.",
        numberOfWinners: 3,
        entries: createMockEntries(25)
    },
    {
        id: uid(),
        type: 'ama',
        title: "Fireside Chat with CryptoCred",
        description: "Join us for an exclusive, informal chat with renowned crypto trader and analyst CryptoCred. We'll talk market trends, trading psychology, and his outlook for the next quarter.",
        image: "https://images.pexels.com/photos/7788009/pexels-photo-7788009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: true,
        category: 'community',
        eventTime: now + d(13),
        status: 'approved',
        links: [{ title: 'Join the AMA', url: '#' }]
    },
    {
        id: uid(),
        type: 'ama',
        title: "Panel: Cross-Chain Interoperability",
        description: "Leaders from top interoperability protocols discuss the challenges and solutions for a seamless multi-chain future. A must-watch for anyone building or investing in a cross-chain world.",
        image: "https://images.pexels.com/photos/8942366/pexels-photo-8942366.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: true,
        category: 'defi',
        projectName: 'NodeLink',
        eventTime: now + d(15),
        status: 'approved',
        links: [{ title: 'Watch the Panel', url: '#' }]
    },
    // ----------------------------
    { 
        id: uid(), 
        type: 'campaign',
        title: "Pixel Art Showcase (Ended)", 
        description: "A celebration of pixel art! We showcased the best pixel artists in our community.", 
        image: "https://images.pexels.com/photos/682933/pexels-photo-682933.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", 
        pinned: false,
        category: 'art',
        projectName: 'CULT',
        startTime: now - d(20),
        endTime: now - d(10),
        status: 'approved',
        reward: "Top 3 artists each received a grant of $500 to create a new piece for the community vault.",
        numberOfWinners: 3,
        entries: createMockEntries(25), 
    },
    { 
        id: uid(), 
        type: 'ama',
        title: "Solidity Smart Contract Workshop", 
        description: "For all the builders! A hands-on workshop covering advanced smart contract patterns like EIP-2535 (Diamonds). Hosted by our lead dev, 'CodeWizard'. A link to the live stream and GitHub repo will be provided.", 
        image: "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", 
        pinned: false,
        category: 'defi',
        eventTime: now + d(3),
        status: 'approved',
        links: [
            { title: 'YouTube Livestream', url: 'https://youtube.com/live/123' },
            { title: 'Workshop GitHub Repo', url: 'https://github.com/example' }
        ]
    },
    { 
        id: uid(), 
        type: 'ama',
        title: "CryptoHub Community Town Hall", 
        description: "Join the core team for our monthly town hall. We'll discuss the roadmap for Q3, cover recent feature launches, and open the floor for an extended Q&A session. Your feedback is crucial!", 
        image: "https://images.pexels.com/photos/2422294/pexels-photo-2422294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", 
        pinned: false,
        category: 'community',
        eventTime: now + d(6),
        status: 'approved',
        links: [
            { title: 'Join Discord Stage', url: 'https://discord.com/stage/123' }
        ]
    },
    { 
        id: uid(), 
        type: 'campaign',
        title: "CyberWarriors Community Tournament", 
        description: "Show off your skills in the first official CryptoHub CyberWarriors tournament. Submit a link to your best gameplay clip. The clips with the most votes will be featured on our homepage! Huge prizes for the top 3 players.", 
        image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", 
        pinned: false,
        category: 'gaming',
        projectName: 'CyberWarriors',
        startTime: now,
        endTime: now + d(14),
        status: 'approved',
        reward: "Prize Pool: $5,000. 1st: $2.5k, 2nd: $1.5k, 3rd: $1k. Champion gets a unique in-game tournament winner skin.",
        numberOfWinners: 3,
        entries: createMockEntries(25), 
    },
    // ---- NEW MOCK GIVEAWAYS ----
    {
        id: uid(),
        type: 'campaign',
        title: "NFT Sticker Pack Creation",
        description: "Design a pack of 5 crypto-themed stickers. The winning pack will be minted as an NFT collection on Opals.",
        image: "https://images.pexels.com/photos/57690/pexels-photo-57690.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: false,
        category: 'nft',
        projectName: 'Opals',
        startTime: now - d(1),
        endTime: now + d(4),
        status: 'approved',
        reward: "Winning artist receives 1 ETH and 10 editions of the minted sticker pack.",
        numberOfWinners: 1,
        entries: createMockEntries(25),
        details: {
            introduction: "Flex your creative muscles and design a unique sticker pack for the Opals community! We're looking for fun, crypto-native designs that capture the spirit of NFTs and our ecosystem. The winning pack will be minted and distributed to the community.",
            prizes: "The grand prize winner will receive 1 ETH and 10 editions of the newly minted NFT sticker pack. Two runners-up will each receive 0.25 ETH."
        }
    },
    {
        id: uid(),
        type: 'campaign',
        title: "Showdown 'Best Combo' Video Contest",
        description: "Record and submit your most impressive combo in Showdown. The community will vote for the most stylish and effective play.",
        image: "https://images.pexels.com/photos/7915440/pexels-photo-7915440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: false,
        category: 'gaming',
        projectName: 'Showdown',
        startTime: now - d(1),
        endTime: now + d(6),
        status: 'approved',
        reward: "Exclusive 'Combo King' in-game title + 500 USDC",
        numberOfWinners: 1,
        entries: createMockEntries(25),
    },
    {
        id: uid(),
        type: 'campaign',
        title: "Monarch Meme Marathon",
        description: "The Monarch has arrived! Create the best memes about our new iGaming platform. Let your creativity run wild!",
        image: "https://images.pexels.com/photos/4195342/pexels-photo-4195342.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: false,
        category: 'community',
        projectName: 'Monarch',
        startTime: now - d(3),
        endTime: now + d(4),
        status: 'approved',
        reward: "Prize pool of $1000 for the top 5 memes.",
        numberOfWinners: 5,
        entries: createMockEntries(25),
    },
    {
        id: uid(),
        type: 'campaign',
        title: "Design a Virtual World Asset for Rumi",
        description: "Help build the Rumi metaverse. Design a unique 3D asset (e.g., a building, a vehicle, a wearable). The winning asset will be integrated into the world.",
        image: "https://images.pexels.com/photos/8172776/pexels-photo-8172776.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: false,
        category: 'art',
        projectName: 'Rumi',
        startTime: now - d(10),
        endTime: now + d(20),
        status: 'approved',
        reward: "$1500 USDC and the creator will be credited in-game.",
        numberOfWinners: 1,
        entries: createMockEntries(25),
    },
    {
        id: uid(),
        type: 'campaign',
        title: "Unbox the Rarest Item!",
        description: "Open a lootbox on Lootify and share a screenshot or video of your rarest pull. The luckiest unboxing wins a grand prize.",
        image: "https://images.pexels.com/photos/57690/pexels-photo-57690.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: false,
        category: 'nft',
        projectName: 'Lootify',
        startTime: now - d(2),
        endTime: now + d(5),
        status: 'approved',
        reward: "A legendary 1-of-1 NFT from the Lootify Vault.",
        numberOfWinners: 1,
        entries: createMockEntries(25),
    },
    {
        id: uid(),
        type: 'campaign',
        title: "Valor Quest Fan Art Competition",
        description: "Draw, paint, or render your favorite character or scene from the world of Valor Quest.",
        image: "https://images.pexels.com/photos/7440263/pexels-photo-7440263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: false,
        category: 'gaming',
        projectName: 'Valor Quest',
        startTime: now + d(7),
        endTime: now + d(21),
        status: 'approved',
        reward: "The winner's art will be featured on the game's loading screen, plus a $1,000 prize.",
        numberOfWinners: 1,
        entries: createMockEntries(25)
    },
    {
        id: uid(),
        type: 'campaign',
        title: "SocialFi Slogan Challenge (Ended)",
        description: "We needed a new slogan for Kizzy, and the community delivered!",
        image: "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: false,
        category: 'community',
        projectName: 'Kizzy',
        startTime: now - d(14),
        endTime: now - d(7),
        status: 'approved',
        reward: "$300 USDC and a special 'Slogan Master' role.",
        numberOfWinners: 1,
        entries: createMockEntries(25)
    },
    {
        id: uid(),
        type: 'campaign',
        title: "AI Model Training Challenge",
        description: "Help train our next-gen AI model by completing data labeling tasks. Top contributors will share a prize pool.",
        image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: false,
        category: 'community',
        projectName: 'Monadata AI',
        startTime: now,
        endTime: now + d(10),
        status: 'approved',
        reward: "$5,000 USDC Prize Pool + Exclusive 'AI Trainer' Discord Role",
        numberOfWinners: 10,
        entries: createMockEntries(25)
    },
    {
        id: uid(),
        type: 'campaign',
        title: "3D Art Contest: 'Future Privacy'",
        description: "Create a 3D art piece that visualizes the concept of privacy in a digital future. The winning entry will be minted as a limited edition NFT.",
        image: "https://images.pexels.com/photos/2156/sky-earth-space-working.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: false,
        category: 'art',
        projectName: 'Sunscreen',
        startTime: now + d(5),
        endTime: now + d(25),
        status: 'approved',
        reward: "1 ETH + The winning art minted as an NFT (70% of royalties)",
        numberOfWinners: 1,
        entries: createMockEntries(25)
    },
    {
        id: uid(),
        type: 'campaign',
        title: "Design the Next Festival Poster",
        description: "Are you a graphic designer? Create a poster for a fictional 'Web3 Music Festival'. The winner gets to design a real event poster for an upcoming event!",
        image: "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: false,
        category: 'art',
        projectName: 'STAGE.fun',
        startTime: now + d(1),
        endTime: now + d(15),
        status: 'approved',
        reward: "Paid contract to design a real event poster + $500",
        numberOfWinners: 1,
        entries: createMockEntries(25)
    },
    {
        id: uid(),
        type: 'campaign',
        title: "Meow Finance Cat Meme Competition (Ended)",
        description: "It's simple. The funniest cat-related crypto meme wins. Let the meme-off begin!",
        image: "https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: false,
        category: 'community',
        projectName: 'Meow Finance',
        startTime: now - d(10),
        endTime: now - d(3),
        status: 'approved',
        reward: "0.5 ETH and the coveted 'Top Cat' role",
        numberOfWinners: 1,
        entries: createMockEntries(25)
    },
    {
        id: uid(),
        type: 'campaign',
        title: "Gorillionaire Tagline Contest",
        description: "We need a new tagline! Something strong, something memorable. Submit your best ideas. The community will vote for the winner.",
        image: "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: false,
        category: 'community',
        projectName: 'Gorillionaire',
        startTime: now + d(2),
        endTime: now + d(10),
        status: 'approved',
        reward: "$500 in tokens + your tagline featured on our website",
        numberOfWinners: 1,
        entries: createMockEntries(25)
    },
    {
        id: uid(),
        type: 'campaign',
        title: "Poply Community Growth Challenge",
        description: "Help us grow! Invite your friends to our Discord. The member with the most successful invites at the end of the month wins a big prize.",
        image: "https://images.pexels.com/photos/5940841/pexels-photo-5940841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: false,
        category: 'community',
        projectName: 'Poply',
        startTime: now,
        endTime: now + d(30),
        status: 'approved',
        reward: "$1,000 for the top referrer, plus milestone rewards for everyone.",
        numberOfWinners: 1,
        entries: createMockEntries(25)
    },
    {
        id: uid(),
        type: 'campaign',
        title: "Design a Virtual Meeting Space (Ended)",
        description: "Design a concept for a virtual meeting space or community hub within TownSquare. Submit your concept art or 3D model.",
        image: "https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: false,
        category: 'art',
        projectName: 'TownSquare',
        startTime: now - d(20),
        endTime: now - d(5),
        status: 'approved',
        reward: "Winning design integrated into the platform + $1,500",
        numberOfWinners: 1,
        entries: createMockEntries(25)
    },
    // ----------------------------
    { 
        id: uid(), 
        type: 'ama',
        title: "Past AMA: DeFi Security", 
        description: "We hosted an AMA with top security researchers to discuss best practices for keeping your assets safe in DeFi.", 
        image: "https://images.pexels.com/photos/176381/pexels-photo-176381.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", 
        pinned: false,
        category: 'defi',
        eventTime: now - d(15),
        status: 'approved',
        links: [
            { title: 'Listen to Recording', url: 'https://example.com/recording' }
        ]
    },
    // ---- NEW EVENTS ----
    // Events for the 14th
    {
      id: uid(),
      type: 'ama',
      title: "DeFi Security Audit AMA",
      description: "Join top security researchers as they discuss best practices for securing your DeFi investments.",
      image: "https://images.pexels.com/photos/5980862/pexels-photo-5980862.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      pinned: false,
      category: 'defi',
      eventTime: createDate(14, 18, 0), // 14th at 6:00 PM
      status: 'approved',
      links: [{ title: 'Join Discord Q&A', url: '#' }]
    },
    {
      id: uid(),
      type: 'ama',
      title: "Community Poker Night",
      description: "A casual community poker tournament. Play for bragging rights and some fun prizes!",
      image: "https://images.pexels.com/photos/3279693/pexels-photo-3279693.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      pinned: false,
      category: 'gaming',
      eventTime: createDate(14, 20, 0), // 14th at 8:00 PM
      status: 'approved',
      links: [{ title: 'Join Poker Table', url: '#' }]
    },
    {
      id: uid(),
      type: 'ama',
      title: "Gaming Tournament Qualifiers",
      description: "First round of qualifiers for the 'CyberWarriors' seasonal tournament. Tune in to watch the action.",
      image: "https://images.pexels.com/photos/7915440/pexels-photo-7915440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      pinned: false,
      category: 'gaming',
      projectName: 'CyberWarriors',
      eventTime: createDate(14, 15, 0), // 14th at 3:00 PM
      status: 'approved',
      links: [{ title: 'Watch on Twitch', url: '#' }]
    },
    // Events for the 15th
    {
      id: uid(),
      type: 'ama',
      title: "Layer 2 Scaling Solutions",
      description: "A deep dive into the latest Layer 2 technologies with a guest expert from Polygon.",
      image: "https://images.pexels.com/photos/8942366/pexels-photo-8942366.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      pinned: false,
      category: 'defi',
      eventTime: createDate(15, 17, 0), // 15th at 5:00 PM
      status: 'approved',
      links: [{ title: 'YouTube Livestream', url: '#' }]
    },
    {
      id: uid(),
      type: 'ama',
      title: "Metaverse Land Sale AMA",
      description: "The team behind 'Novaverse' will be answering questions about their upcoming virtual land sale.",
      image: "https://images.pexels.com/photos/8172776/pexels-photo-8172776.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      pinned: false,
      category: 'nft',
      eventTime: createDate(15, 19, 30), // 15th at 7:30 PM
      status: 'approved',
      links: [{ title: 'Join Twitter Space', url: '#' }]
    },
     {
      id: uid(),
      type: 'ama',
      title: "Meme Contest Review Livestream",
      description: "Join us live as we review the top submissions for the 'When you check your portfolio' meme contest.",
      image: "https://images.pexels.com/photos/6077326/pexels-photo-6077326.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      pinned: false,
      category: 'community',
      eventTime: createDate(15, 14, 0), // 15th at 2:00 PM
      status: 'approved',
      links: [{ title: 'Watch Live', url: '#' }]
    },
    // Events for the 16th
    {
      id: uid(),
      type: 'ama',
      title: "AMA with a Crypto VC",
      description: "Get insights into the world of venture capital in the crypto space with a partner from 'Web3 Ventures'.",
      image: "https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      pinned: false,
      category: 'community',
      eventTime: createDate(16, 16, 0), // 16th at 4:00 PM
      status: 'approved',
      links: [{ title: 'Join Q&A', url: '#' }]
    },
    {
      id: uid(),
      type: 'ama',
      title: "Music NFT Launch Party",
      description: "Celebrate the launch of a new music NFT platform with live DJ sets and artist interviews.",
      image: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      pinned: false,
      category: 'nft',
      eventTime: createDate(16, 21, 0), // 16th at 9:00 PM
      status: 'approved',
      links: [{ title: 'Enter Virtual Club', url: '#' }]
    },
    {
        id: uid(),
        type: 'ama',
        title: "Weekly Community Hangout",
        description: "A casual weekly hangout on Discord. Let's talk crypto, gaming, and whatever else is on your mind.",
        image: "https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pinned: false,
        category: 'community',
        eventTime: createDate(16, 19, 0),
        status: 'approved',
        links: [{ title: 'Join Voice Channel', url: '#' }]
    },
    {
      id: uid(),
      type: 'ama',
      title: "Project Phoenix Whitepaper Release",
      description: "The team behind Project Phoenix will walk through their newly released whitepaper and answer community questions.",
      image: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      pinned: false,
      category: 'defi',
      eventTime: createDate(16, 12, 0), // 16th at 12:00 PM
      status: 'approved',
      links: [{ title: 'Read Whitepaper', url: '#' }]
    },
  ];

  const projectData = [
    { name: "Accountable", desc: "YieldApp is the first yield marketplace backed by live, cryptographically verifiable data users can trust.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/68a730300920180531983ce9_x_cover_business%20(1).webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/68a7302c461b97699ee0f421_Profile%20Pic%20(7)%20(1).webp" },
    { name: "Amertis", desc: "Connecting users to deep liquidity across multiple sources, ensuring the best rates, minimal slippage, and an optimised DeFi experience.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67cb75a41f9084980878c243_amertis_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67cb75a41f9084980878c240_amertis_logo.webp" },
    { name: "Apriori", desc: "aPriori is an MEV infrastructure and liquid staking protocol, designed for the parallel execution era and natively built on Monad.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b911371d1e917a4b1ad43f_Apriori_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b91139ebe3a25cc1bbc74f_Apriori_logo.webp" },
    { name: "Atlantis", desc: "Modular V4 DEX offering cross-chain swaps, DeFAI, a launchpad, farming, staking, fiat on-ramp, & more.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67d3a0a71b288e2e961f005c_1500x500.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67d3a0a71b288e2e961f005f_400x400.webp" },
    { name: "Bean Exchange", desc: "Bean Exchange is a gamified decentralized spot & perpetual exchange natively built on Monad Network.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b9118e5481bdf7e82958ac_Bean%20Exchange_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b9118b1f770571ff12b289_Bean%20Exchange_logo.webp" },
    { name: "Breath of Estova", desc: "Breath of Estova is a play-to-earn 2D action-based MMORPG where classic nostalgia meets a vast open world.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/687816be44e9942c1c1ef114_estova%20background%201500x500%20(1).webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/687816c09a34ff481b1be028_estova%20logo%20_400x400.webp" },
    { name: "Buzzing Club", desc: "Buzzing Club is an app where users trade opinions on trending topics.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/687817535bd84bf1c05d423e_buzzing%201500x500%20(1).webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6878174f5c502efdbed88f8b_buzzing%20qbn4VqZ0_400x400.webp" },
    { name: "CULT", desc: "Cult is where culture meets crypto. A new reputation system rewards loyalty for holders, tokens, and creators alike.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/688e9f87183ff7b96a8a5684_cult%20banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/688e9f8173066eb8c97da18d_cult%20logo%20.webp" },
    { name: "Castora", desc: "Funfair price prediction markets on Monad.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b9127dea5cc3512a8b5a62_Castora_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b9127fa1ed529049cc5f52_Castora_logo.webp" },
    { name: "Celeris", desc: "Celeris is the first fully on-chain orderbook Perps++ DEX that is fully permissionless with ultra-low latency & parallelized liquidity.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6863135bff21aa78233f1aa5_20250624_015320.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6863135bff21aa78233f1aa0_IMG_20250624_015425_464.webp" },
    { name: "Crystal", desc: "Crystal is a fully on-chain CLOB exchange that brings CEX-grade performance to the EVM without compromising on security or composability.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b91336a1ed529049cd029d_Crystal_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b91338de4da514b3258311_Crystal_logo.webp" },
    { name: "Demask Finance", desc: "Demask Finance is an on-chain AMM protocol that enables trading between NFT collectibles and native tokens.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b913dac0e02b5b7bef3bef_Demask%20Finance_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b913d97f3041834a54624e_Demask%20Finance_logo.webp" },
    { name: "Dirol Protocol", desc: "Dirol is a native DeFi Hub on Monad with a full suite of DeFi features. You can do everything on Dirol.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67cb776ce2f730919914482f_Dirol%20Banner%20(1).webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67cb75a360ac4f826e2f7ec3_photo_2025-03-03_14-07-29.webp" },
    { name: "Drake", desc: "Drake's hybrid CLOB unlocks CEX speed, DEX transparency, and frictionless yields, resulting in what matters most: perps that feel right", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6847444675685e46bfbc9a8a_v2-banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6847444575685e46bfbc9a83_400x400-1-.webp" },
    { name: "Fortytwo", desc: "A decentralized AI network growing smarter with each node where every computer contributes to planetary-scale limitless intelligence.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b914e8fc64a6c6e43a887e_Fortytwo_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b914e98f00b5fa4ab55d6d_Fortytwo_logo.webp" },
    { name: "Gorillionaire", desc: "Gorillionaire transforms blockchain data chaos into clear signals. Compete on leaderboards while our intelligence guides your trades.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/68474cb48bed528dd7a3cec4_gorillionaire%20banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/68474cae0b197901e1e48b23_gorillionaire%20logo.webp" },
    { name: "Henry Labs", desc: "Henry Labs makes it possible for apps to enable in-app shopping with a simple SDK, using agents to execute purchases.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/687816e959d71c67e80d8968_henry%20background%201500x500%20(1).webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/687816eba60be7a1995ef6ee_henry%20logo%20.webp" },
    { name: "Hive", desc: "Hive is a native stablecoin protocol on Monad, unlocking real yield, liquidity, through native-chain collateral and active deployment.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/680607ee5d66251ea96a2f47_hive%20banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/680607f2d47e9c4f91bbf907_hive.webp" },
    { name: "Kizzy", desc: "Kizzy is a social media betting app. Bet on how your favorite influencers and celebrities will perform on Twitter and YouTube.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b915d286bf1f948b421241_Kizzy_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b915d16561ec94bfa425a1_Kizzy_logo.webp" },
    { name: "Kuru", desc: "Find, trade and launch your coins on a fully on-chain CLOB. Built for traders, powered by Monad.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b915ee1610ca8a55c3bd46_Kuru_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b915ece21ffe4d105246dd_Kuru_logo.webp" },
    { name: "LEVR.bet", desc: "Leverage Sports Betting with Fully Liquid Positions.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b915fa9fa4892d6236d66a_LEVR.bet_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b915f9779fac86351b4888_LEVR.bet_logo.webp" },
    { name: "Lootify", desc: "Lootify is a lootbox platform on Monad, offering NFTs, gaming assets, and tokenized trading cards as rewards.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67bebc5fc3129d45e63750cf_lootify%20b.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67bebc5c47f06f070fbb11bd_lootify.webp" },
    { name: "Monarch", desc: "Provably fair iGaming platform on Monad - every wager, outcome, and payout is secured on-chain.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6883e31a85ccb6f309a67734_1500500.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6883e31a85ccb6f309a67727_4-01.webp" },
    { name: "Mace", desc: "Mace is a DEX aggregator on Monad that optimizes trades by routing through AMMs, orderbooks & RFQ market makers for best execution.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b91d8ef9180e8745b830a4_mace%20banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b91d8d9fa4892d623b8b8a_mace%20logo.webp" },
    { name: "Madhouse", desc: "Madhouse is a DEX aggregator on Monad that finds the best swap rates by routing trades across all major liquidity sources.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/68474447f8592a42601ad214_Madhouse_Ecosystem_1500x500.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/68474447f8592a42601ad218_Madhouse_PFP_400x400.webp" },
    { name: "Magma", desc: "Magma is a Liquid Staking Protocol building the first Distributed Validator on Monad and developing MEV to reduce latency by up to 4x.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b916666b6cb4307d54557e_Magma_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b9166595f6c765132080f7_Magma_logo.webp" },
    { name: "Meow Finance", desc: "The most capital and time-efficient liquidity infrastructure built to unlock additional layers of liquidity.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6883e31d5763deb46e176909_MeowFi_Banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6883e31d5763deb46e176906_MeowFi-Logo-400x400-black-1-.webp" },
    { name: "MonadExplorer by BlockVision", desc: "MonadExplorer is a block explorer built by BlockVision. It helps users analyze transactions, contracts, and network activity on Monad.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b916ab89130464ea4215e4_MonadExplorer%20by%20BlockVision_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b916a989130464ea421461_MonadExplorer%20by%20BlockVision_logo.webp" },
    { name: "Monadata AI", desc: "Monadata is an AI and Data Platform on Monad. Interact, Train, and Earn!", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b916bcb126dbefee7211ec_Monadata%20AI_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b916ba84cbdc367d63b09c_Monadata%20AI_logo.webp" },
    { name: "Monorail", desc: "Monorail is the first aggregator to combine onchain orderbooks and AMMs to give you the best trade possible.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b91702be2243a8e820b2af_Monorail_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b9170173996311554e7bc6_Monorail_logo.webp" },
    { name: "Morpheus", desc: "Launch a token, trade, and market-make in one step with Morpheus - a Monad-based DEX using CMM and Wormhole NTT for cross-chain flow.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6863135baa23b039d89be31e_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6863135baa23b039d89be2e6_logo-full-k.webp" },
    { name: "Mozi", desc: "MOZI is a next-generation social trading platform built on Monad, it combines a Web Wallet with powerful social trading tools.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b91714f454824cadfc031c_Mozi_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b91713c0e02b5b7bf17fa6_Mozi_logo.webp" },
    { name: "Mu Digital", desc: "RWA protocol bringing Asia's Best Yields Onchain.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b91725c0e02b5b7bf189e3_Mu%20Digital_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b917246e9a2707acfc32e2_Mu%20Digital_logo.webp" },
    { name: "Multisynq", desc: "The first shared, real-time application layer of the internet. A decentralized network where every app is multiplayer by default.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/687816619e7ebd9c2ba23da0_multisynq%20banner%201500x500%20(1).webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6878165ed21cf891079ce3c7_multisynq%20logo%20kxXecY0r_400x400.webp" },
    { name: "NadSmith", desc: "AI Agent OS on Monad | Tokenizing Agents & Automating Markets - built exclusively on Monad.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b9175de882d110b44b62eb_NadSmith_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b9175d84cbdc367d64277c_NadSmith_logo.webp" },
    { name: "Narrative", desc: "Perpetual information markets", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/68965d4424485e6a8ec2d656_8.6.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/68965da65527ff3384f1c059_narrative%206R7oJYe6_400x400.webp" },
    { name: "Narwhal Finance", desc: "Narwhal Finance is an AI-driven decentralized perpetual trading platform exclusively on Monad. Backed by Jump Crypto and CMS Holdings.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b91765b126dbefee72cdc5_Narwhal%20Finance_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b9176689130464ea4285d6_Narwhal%20Finance_logo.webp" },
    { name: "NitroFinance", desc: "NitroFinance: An AMM on steroids—fusing DEX and Money Market into one pool to maximize efficiency and simplify liquidity management.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b9179789130464ea42be06_NitroFinance_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b917961e79a03f6da6f980_NitroFinance_logo.webp" },
    { name: "NodeLink", desc: "First ZK coprocessor protocol on Monad", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67d393430154822f32779a1f_Nodelink-Banner-1500x500.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67d39352e8d11634d1dd4b28_Nodelink-PFP-400x400.webp" },
    { name: "O.LAB", desc: "Next-gen Prediction Market for Everything.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67f01e1f85ea1a1ab8c36c6c_olab.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67f01e251bab371f4e1e652a_D2wLYRXX_400x400.webp" },
    { name: "OctoSwap", desc: "OctoSwap offers lightning-fast token swaps and capital-efficient liquidity pools with a user friendly interface.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67ce4cf1eb2c11cb1c3b90bc_octoswap.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67ce4ceb5a19b9c6f4206ffa_octoswap%20logo.webp" },
    { name: "Omnia", desc: "Omnia is a pet battle and adventure game, built by the Sappy Seals team.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6878162f2e58f4023f2fae19_omnia%20background%201500x500%20(1).webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6878162dca7c1699923aaaba_omnia_400x400.webp" },
    { name: "Opals", desc: "Opals: Kickstarter meets NFTs for projects. Buy cards → auto-launch when funded → cards claim tokens + rewards. Discover gems.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b917d1e882d110b44cba74_Opals_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b917d1048c532f61e10d6c_Opals_logo.webp" },
    { name: "Pecker", desc: "Pecker is a liquidity layer on Monad for stables and LSTs, solving fragmentation slippage and yield inefficiency with unified tokens", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/68966e7ce3a542ddd633928c_pecker%20banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/68966e755af8bc2db3ee374a_pecker%20logo%20.webp" },
    { name: "Perpl", desc: "A perpetual DEX and liquidity hub on Monad, offering deep liquidity, fast trading, and support for native projects.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6878163c2dfad1e468c0d11f_Perpl%201500x500%20(1).webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6878163e0a3904f124992455_Perpl_400x400.webp" },
    { name: "Plato", desc: "SocialFi for dining, making eating fun, engaging, and social.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b9192fc0e02b5b7bf2de8f_Plato_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/687ef16c4c7798264cddcd2c_Plato%20Logo%20-%20WhiteBackgd.webp" },
    { name: "Poply", desc: "Community-based NFT marketplace where anyone can generate custom NFT collections using an integrated AI engine.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67cb75a56fa2925b3b2e9a9e_poply-banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67cb75a56fa2925b3b2e9a9e_popy-logo.webp" },
    { name: "Proof-of-Skill", desc: "A protocol to verify real-world skills along with ID & work history, enabling faster, smarter skill-based hiring.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67cb75a516c2025d35bf2f11_group_48096052.png", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67cb7895e1046bc1bf640a67__0FqUZLR_400x400.webp" },
    { name: "Purps", desc: "A perpetual DEX and liquidity hub on Monad, offering deep liquidity, fast trading, and support for native projects.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/682acfc9a3a8f6e2335cda9b_photo_2025-05-08_23-05-50_720.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67e316aa60595f10c8613edb_Monda-Logo-400x400.webp" },
    { name: "RareBetSports", desc: "Building consumer sports applications powered by the RBS Oracle. Play RareLink and win up to 100x your crypto.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b9197348ee25af9be22afd_RareBetSports_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b91971779fac86351b4888_RareBetSports_logo.webp" },
    { name: "Rayvo", desc: "First web3 smart glasses that combine AI, decentralized data ownership, and wear-to-earn rewards.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6878157170c067c1a9fcaff1_rayvo%201500x500.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6878156edcbd1ae880b0885f_rayvo%20Td0jPvVW_400x400.webp" },
    { name: "Rumi", desc: "Rumi enables users to watch, earn, and help build the future of AI-powered entertainment.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6878156220a133701406a3ef_rumi%201500x500%20(1).webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/68781565fc16fe318bea11a7_rumi%20zPdVic8R_400x400.webp" },
    { name: "STAGE.fun", desc: "STAGE.fun is a crowdfunding platform for festivals and events.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6875106c949bec27002cd3d7_STAGE-1500x500.png", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6875106c949bec27002cd3da_STAGE-400x400.png" },
    { name: "Showdown", desc: "Powering competitive gaming's future on Monad. Automated tournaments & skill-based wagering for all gamers on their favorite gaming titles!", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b919f75d51b1bcd91ef730_Showdown_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b919f86e9a2707acfe0c32_Showdown_logo.webp" },
    { name: "Sunscreen", desc: "Sunscreen transforms advanced FHE research into real-world cryptography tools, bringing post-quantum privacy to web3.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6863135baa6db2d22d376c07_Frame-1.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6863135baa6db2d22d376c0a_Sunscreen-Logos-Social-Frame.webp" },
    { name: "Swyrl Finance", desc: "Swyrl is a Monad-native DEX with dual AMMs and liquid staking, aligning users and protocols via ve(3,3)-driven governance.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6883e31a5f263ff733767df3_swyrl_banner-2-.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6883e31a5f263ff733767dec_swyrl_logo.webp" },
    { name: "Tarobase", desc: "Build on-chain apps with Tarobase—from Venmo & Pump.fun clones to endless possibilities—without writing smart contracts.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b91af9e557b7fbf93081e7_Tarobase_banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b91af9e557b7fbf93081e7_Tarobase_logo.webp" },
    { name: "Tezza Poker", desc: "Play, win, mint. Tezza Poker lets you compete free, earn Points, and claim NFTs—pure skill, real rewards.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/682f7cac4788b984140dfb05_tezza%20banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/682f7caa4bd8615922bce6a0_tezza.webp" },
    { name: "Timelock", desc: "Timebound, liquidation free leverage.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/68781558a496d6d0155a2d82_timelock%201500x500%20(1).webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/68781555f2471af37cf9c74a_timelock%20goht1Ab-_400x400.webp" },
    { name: "TownSquare", desc: "Modular money market & yield layer for next-gen onchain assets & RWAs, with crosschain interoperability", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/685c77d9b431fd4907b839da_townsequare%20cover.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b91b27b9188e59b9aa8b6a_TowneSquare_logo.webp" },
    { name: "Trips", desc: "IP Protection for the new data economy.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/68781543f2feac98f9e7f657_trips%201500x500%20(1).webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6878153faf2f69162a3c4b96_trips_400x400.webp" },
    { name: "Valor Quest", desc: "The No.1 Mythic-themed AFK game on Telegram with NFTs, mining, and epic battles.", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6834a1e83865425985bf4d07_6834a1646afb796987d92ca0_Banner.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6834a1e5bc93ee52da7849c0_6834a1646afb796987d92c9d_Logo.webp" },
    { name: "Wonad", desc: "First Plant to Earn project on Monad. Offering a way to create real-world impact while earning rewards", banner: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6883e31ceeab028ff508564d_IMG_4396.webp", logo: "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/6883e31ceeab028ff508564a_logowonad.webp" },
  ];
  
  const projectNames = projectData.map(p => p.name);
  const descriptions = projectData.map(p => p.desc);
  const bannerImages = projectData.map(p => p.banner);
  const logoImages = projectData.map(p => p.logo);
  
  const teamMembers: TeamMember[] = [
      { name: 'alice', role: 'Co-Founder', discordUserId: '273462001309384704', discordUsername: 'alice.eth', socials: { twitter: '#', linkedin: '#' } },
      { name: 'bob', role: 'Lead Dev', discordUserId: '273462001309384705', discordUsername: 'bob.builder', socials: { twitter: '#', linkedin: '#' } },
      { name: 'Cynthia', role: 'Moderator', discordUserId: '273462001309384706', discordUsername: 'cynthiagamer', socials: { twitter: '#' } },
      { name: 'David', role: 'Community Team', discordUserId: '273462001309384707', discordUsername: 'david_defi', socials: { twitter: '#' } },
  ];

  const discordRolesPool: DiscordRole[] = [
    // FIX: Changed `perk` to `perks` and wrapped the object in an array to match the DiscordRole type.
    { serverId: '123', roleId: '456', name: 'OG Role', description: "Awarded to the earliest members of the project's community.", points: 1000, perks: [{ type: 'Airdrop', description: 'Highest tier airdrop.' }] },
    // FIX: Changed `perk` to `perks` and wrapped the object in an array to match the DiscordRole type.
    { serverId: '123', roleId: '457', name: 'Alpha Tester', description: "Participated in early-stage testing and provided valuable feedback.", points: 500, perks: [{ type: 'GTD', description: '1 Guaranteed Mint' }] },
    // FIX: Changed `perk` to `perks` and wrapped the object in an array to match the DiscordRole type.
    { serverId: '123', roleId: '458', name: 'Community Contributor', description: "Recognized for significant and consistent contributions to the community.", points: 750, perks: [{ type: 'Free Mint', description: '1 Free Mint' }] },
    // FIX: Changed `perk` to `perks` and wrapped the object in an array to match the DiscordRole type.
    { serverId: '123', roleId: '459', name: 'Early Supporter', description: "Joined and supported the project in its initial phases.", points: 400, perks: [{ type: 'FCFS', description: 'FCFS mint spot.' }] },
    // FIX: Changed `perk` to `perks` and wrapped the object in an array to match the DiscordRole type.
    { serverId: '123', roleId: '460', name: 'Event Winner', description: "Achieved victory in an official community event or competition.", points: 300, perks: [{ type: 'GTD', description: '1 Guaranteed Mint' }] },
  ];

  const getRandomSubset = <T,>(arr: T[], count: number): T[] => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(arr.length, count));
  };
  
  const allCategories: ProjectCategory[] = ['defi', 'nft', 'gaming', 'socialfi', 'dex', 'rwa', 'infrastructure', 'wallet', 'depin', 'ai', 'meme', 'launchpad'];
  const dropStatuses: DropStatus[] = ['upcoming', 'ongoing', 'completed'];
  const earlyStageProjectNames = new Set(['CULT', 'Opals', 'NodeLink', 'Monadata AI', 'Showdown']);
  const otherStages: Project['stage'][] = ['Private', 'Pre-Launch', 'Launched'];

  const mockTasks: Task[] = [
      { id: uid(), title: 'Join the Guild and Claim Role', description: 'Connect your wallet to our Guild.xyz page and claim the "Initiate" role.', type: 'community', platform: 'guild', points: 100, link: 'https://guild.xyz/', status: 'approved' },
      { id: uid(), title: 'Follow on X', description: 'Follow our official X account for the latest updates and announcements.', type: 'social', platform: 'x', points: 50, link: 'https://x.com/', status: 'approved' },
      { id: uid(), title: 'Join our Discord', description: 'Become a part of our community on Discord. Introduce yourself in the #general channel.', type: 'community', platform: 'discord', points: 50, link: 'https://discord.com/', status: 'approved' },
      { id: uid(), title: 'Make a Tweet about us', description: 'Post a tweet about our project, tagging our official account and using our hashtag.', type: 'social', platform: 'x', points: 150, link: 'https://x.com/', status: 'pending' },
      { id: uid(), title: 'Create an Explainer Video', description: 'Create a short video (1-3 minutes) explaining what our project does. Post it on YouTube or X.', type: 'creative', platform: 'youtube', points: 500, link: 'https://youtube.com/', status: 'draft' },
      { id: uid(), title: 'Participate in Testnet', description: 'Use our testnet and provide feedback in the dedicated Discord channel.', type: 'on-chain', platform: 'testnet', points: 300, link: '#', status: 'approved' },
      { id: uid(), title: 'Draw Fan Art', description: 'Create a piece of art inspired by our project and share it on X with our hashtag.', type: 'creative', platform: 'x', points: 400, link: 'https://x.com/', status: 'pending' },
      { id: uid(), title: 'Join the Waitlist', description: 'Sign up for early access to our upcoming launch.', type: 'community', platform: 'website', points: 75, link: '#', status: 'approved' },
      { id: uid(), title: 'Write a Thread on X', description: 'Write a detailed thread on X about our unique features and why you\'re excited.', type: 'social', platform: 'x', points: 350, link: 'https://x.com/', status: 'approved' }
  ];

  const projects: Project[] = projectNames.map((name, i) => {
    const raiseAmount = Math.random() > 0.3 ? `$${(Math.random() * 15 + 1).toFixed(1)}M` : 'N/A';
    let categories = getRandomSubset(allCategories, Math.floor(Math.random() * 2) + 1);
    
    // FIX: Corrected 'website' to 'websites' to match the Project['links'] type definition.
    const projectLinks: Project['links'] = {
        websites: [{ label: 'Website', url: '#' }],
        twitter: '#',
        discord: '#',
    };

    if (name === "Breath of Estova") {
// FIX: Property 'whitelistInfo' does not exist on type 'Project["links"]'. Adding it as a LinkItem to the 'websites' array instead.
        projectLinks.websites.push({ label: 'Whitelist Info', url: '#' });
    }

    const isNew = i < projectNames.length * 0.2;
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    
    const createdAt = isNew 
      ? now - Math.floor(Math.random() * thirtyDaysInMs)
      : now - thirtyDaysInMs - Math.floor(Math.random() * 300 * 24 * 60 * 60 * 1000);

    const hasTasks = Math.random() > 0.25;
    const tasksInfo = hasTasks ? {
        cost: Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0,
        timeMinutes: Math.floor(Math.random() * 300) + 1,
        categories: getRandomSubset(mockTaskCategories, Math.floor(Math.random() * 2) + 1),
        totalTasks: Math.floor(Math.random() * 8) + 1,
    } : null;

    const projectData: any = {
      id: uid(), // Use uid() to guarantee uniqueness initially
      name: name,
      logo: logoImages[i % logoImages.length],
      banner: bannerImages[i % bannerImages.length],
      description: descriptions[i % descriptions.length],
      longDescription: `${descriptions[i % descriptions.length]} This is an extended description providing more detail about the project's goals, technology, and roadmap. It outlines the problem the project is trying to solve and the unique solution it brings to the ecosystem.`,
      links: projectLinks,
      events: [],
      status: Math.random() > 0.5 ? 'ongoing' : 'beta',
      category: categories,
      token: Math.random() > 0.6 ? name.substring(0, 4).toUpperCase() : undefined,
      team: getRandomSubset(teamMembers, Math.floor(Math.random() * 3) + 1),
      raise: raiseAmount,
      stage: earlyStageProjectNames.has(name) ? 'Early' : otherStages[i % otherStages.length],
      ticker: Math.random() > 0.4 ? `$${name.substring(0,3).toUpperCase()}` : undefined,
      utility: Math.random() > 0.7 ? { 
        title: 'Genesis Drop', 
        description: 'Holders of our Genesis NFT collection will be eligible for a token airdrop at TGE and get exclusive access to future drops.', 
        image: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=400',
        link: { url: '#', label: 'View on Magic Eden' },
        outcome: ['Whitelist', 'Airdrop', 'Freemint'][Math.floor(Math.random() * 3)] as Utility['outcome']
      } : undefined,
      discordRoles: [],
      dropStatus: Math.random() > 0.3 ? dropStatuses[i % dropStatuses.length] : undefined,
      createdAt,
      followersX: Math.floor(Math.random() * 499000) + 1000,
      membersDiscord: Math.floor(Math.random() * 299000) + 1000,
      votes: {
        up: Math.floor(Math.random() * 500) + 1,
        down: Math.floor(Math.random() * 50),
        voters: [],
      },
      approvalStatus: 'approved',
      tokenHoldingSettings: {
        name: `${name} Token`,
        contractAddress: `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        link: 'https://birdeye.so/'
      },
      tokenHoldingTiers: [
        { minAmount: 20000, maxAmount: 200000, pointsPerDay: 1 },
        { minAmount: 200001, maxAmount: 2000000, pointsPerDay: 3 },
        { minAmount: 2000001, maxAmount: null, pointsPerDay: 6 },
      ],
      investors: raiseAmount !== 'N/A' ? getRandomSubset(mockInvestors, Math.floor(Math.random() * 4) + 1) : [],
      tasksInfo: tasksInfo,
      rewardType: mockRewardTypes[i % mockRewardTypes.length],
      isCrowned: false,
      isNew: isNew,
      isHot: Math.random() > 0.85,
      isPublished: true,
    };

    if (name === 'Accountable') {
        projectData.links.websites.push({ label: 'API Docs', url: '#' });
    }

    if (tasksInfo) {
        projectData.tasks = getRandomSubset(mockTasks, tasksInfo.totalTasks);
    }

    if (categories.includes('launchpad')) {
        projectData.idoDetails = {
            tokenPrice: `$${(Math.random() * 0.5 + 0.01).toFixed(3)}`,
            vestingSchedule: `${Math.floor(Math.random() * 11) + 5}% at TGE, ${Math.floor(Math.random() * 10) + 2}-month linear vesting`,
            totalSupply: `${(Math.floor(Math.random() * 900) + 100).toLocaleString()},000,000`
        };
    }
    
    if (name === 'Magma') {
        projectData.strategyWalkthrough = [
            "Buy the Magma Genesis NFT.",
            "Hold the NFT for daily point accumulation.",
            "Stake MON tokens to earn additional points.",
            "Achieve a specific role in the Magma Discord.",
            "Qualify for the upcoming airdrop."
        ];
    }
     // Add 5 NFT collections to 5 different projects
    if (name === 'FairSwap') { // A real project from the list
        projectData.nftCollections = [{
          id: 'nft_fair_1',
          name: 'Liquidity Gems',
          image: 'https://images.pexels.com/photos/204366/pexels-photo-204366.jpeg?auto=compress&cs=tinysrgb&w=400',
          link: '#',
          network: 'mainnet',
          supply: '5,000',
          mintPrice: '0.05 ETH',
          floorPrice: '0.1 ETH',
          perks: [
            {
                holdingRequirement: { count: 1 },
                perk: { type: 'Airdrop', description: 'Boosted LP farming rewards and future airdrop eligibility.' }
            },
            {
                holdingRequirement: { count: 1 },
                perk: { type: 'GTD', description: 'Guaranteed mint for the upcoming "Opals: Series 2" collection.', grantingProjectName: 'Opals' }
            }
          ],
          oneTimePoints: 1000,
          pointsPerDay: 10,
          status: 'published',
          isVisibleOnNftPage: true
        }];
    }
    if (name === 'CyberWarriors') { // A real project from the list
        projectData.id = 'proj_2';
        projectData.nftCollections = [{
          id: 'nft_cyber_1',
          name: 'Genesis Warriors',
          image: 'https://images.pexels.com/photos/8111059/pexels-photo-8111059.jpeg?auto=compress&cs=tinysrgb&w=400',
          link: '#',
          network: 'mainnet',
          supply: '10,000',
          mintPrice: 'Free Mint',
          floorPrice: '0.08 ETH',
          perks: [
            {
                holdingRequirement: { count: 1 },
                perk: { type: 'GTD', description: 'Access to exclusive beta tests for upcoming game modes.' }
            },
            {
                holdingRequirement: { count: 1 },
                perk: { type: 'FCFS', description: 'FCFS mint spot for the "Showdown Legends" NFT drop.', grantingProjectName: 'Showdown' }
            }
          ],
          oneTimePoints: 500,
          status: 'published',
          isVisibleOnNftPage: true
        }];
    }
     if (name === 'NodeLink') { // A real project from the list
        projectData.id = 'proj_4';
        projectData.nftCollections = [{
          id: 'nft_node_1',
          name: 'Node Keys',
          image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=400',
          link: '#',
          network: 'mainnet',
          supply: '1,000',
          mintPrice: '0.5 ETH',
          floorPrice: '1.2 ETH',
          perks: [
            {
                holdingRequirement: { count: 1 },
                perk: { type: 'Airdrop', description: 'Discounted service fees on the NodeLink network.' }
            },
            {
                holdingRequirement: { count: 1 },
                perk: { type: 'Free Mint', description: 'Free mint for a "Monadata AI Training Pass" NFT.', grantingProjectName: 'Monadata AI' }
            }
          ],
          pointsPerDay: 20,
          status: 'published',
          isVisibleOnNftPage: true
        }];
    }


    if (name === 'Opals') {
        projectData.id = 'proj_45'; // Ensure consistent ID for Opals
        projectData.stage = 'Launched'; // Mark as a past build
        projectData.isCrowned = true;
        projectData.isHot = true;
        projectData.votes = { up: 4, down: 2, voters: [ { userId: 'u_1', vote: 'up' }, { userId: 'u_2', vote: 'up' }, { userId: 'u_5', vote: 'up' }, { userId: 'u_4', vote: 'up' }, { userId: 'u_7', vote: 'down' }, { userId: 'u_3', vote: 'down' }, ] };
        projectData.discordRoles = [
            { serverId: '876543210', roleId: '001', name: 'Genesis Holder', description: "Holder of a Genesis Card NFT.", points: 500, perks: [{ type: 'Airdrop', description: 'Airdrop boost' }] },
        ];
         projectData.nftCollections = [{
          id: 'nft_opals_1',
          name: 'Genesis Cards',
          image: 'https://images.pexels.com/photos/1037992/pexels-photo-1037992.jpeg?auto=compress&cs=tinysrgb&w=400',
          link: '#',
          network: 'mainnet',
          supply: '2,500',
          mintPrice: '0.1 ETH',
          floorPrice: '0.25 ETH',
          perks: [
            {
                holdingRequirement: { count: 1 },
                perk: { type: 'Airdrop', description: 'Reduced platform fees on all Opals launches.' }
            },
            {
                holdingRequirement: { count: 5 },
                perk: { type: 'Airdrop', description: 'Airdrop of 1,000 $MEOW tokens.', grantingProjectName: 'Meow Finance' }
            }
          ],
          oneTimePoints: 2000,
          pointsPerDay: 50,
          status: 'published',
          isVisibleOnNftPage: true
        }];
    }
    
    if (name === 'Valor Quest') {
        projectData.id = 'proj_68'; // Consistent ID for Valor Quest
    }
    
    if (name === 'Lootify') {
        projectData.id = 'proj_24'; // Consistent ID for Lootify
    }

    if (name === 'CULT') {
        projectData.id = 'proj_7'; // Consistent ID for CULT
        projectData.isCrowned = true;
        projectData.isHot = true;
        projectData.links.websites.push(
            { label: 'Documentation', url: '#' },
            { label: 'Governance Forum', url: '#' }
        );
        projectData.strategyWalkthrough = [
            "Obtain an 'Initiate Pass' NFT.",
            "Hold the pass for a GTD mint spot on partner projects.",
            "Achieve the 'High Priest' role in Discord for airdrop eligibility.",
            "Participate in community logo redesign contests for USDC rewards."
        ];
        projectData.discordRoles = [
            { serverId: '987654321', roleId: '111', name: 'Cultist', description: "A dedicated and active member of the CULT community.", points: 100, perks: [{ type: 'FCFS', description: '1 FCFS Mint Spot' }] },
            { serverId: '987654321', roleId: '222', name: 'High Priest', description: "A senior community member with leadership responsibilities.", points: 1500, perks: [{ type: 'Airdrop', description: 'Eligible for $CULT token airdrop' }] },
            { serverId: '987654321', roleId: '333', name: 'Initiate', description: "A new member who has completed the introductory rites.", points: 250, perks: [{ type: 'Free Mint', description: 'Eligible for one free mint from partner collections' }] },
        ];
        projectData.team = [
            { name: 'alice', role: 'Co-Founder', discordUserId: '273462001309384704', discordUsername: 'alice.eth', socials: { twitter: 'https://twitter.com/alice_eth' } },
            { name: 'bob', role: 'Lead Dev', discordUserId: '273462001309384705', discordUsername: 'bob.builder', socials: { twitter: 'https://twitter.com/bob_builder' } },
            { name: 'Cynthia', role: 'Moderator', discordUserId: '273462001309384706', discordUsername: 'cynthiagamer', socials: { twitter: 'https://twitter.com/cynthiagamer' } },
            { name: 'David', role: 'Community Team', discordUserId: '273462001309384707', discordUsername: 'david_defi', socials: { twitter: 'https://twitter.com/david_defi' } },
            { name: 'Evelyn', role: 'UX/UI Designer', socials: { twitter: 'https://twitter.com/evelyn_designs' } },
            { name: 'Frank', role: 'Smart Contract Dev', socials: { twitter: 'https://twitter.com/frank_codes' } },
            { name: 'Grace', role: 'Marketing Lead', socials: { twitter: 'https://twitter.com/grace_markets' } },
            { name: 'Heidi', role: 'Partnerships', socials: { twitter: 'https://twitter.com/heidi_connects' } },
            { name: 'Ivan', role: 'Data Scientist', socials: { twitter: 'https://twitter.com/ivan_data' } }
        ];
         projectData.nftCollections = [
            {
                id: 'nft_cult_1',
                name: 'Initiate Pass',
                image: 'https://i.ibb.co/3W6q0yg/initiate-pass-cult.png',
                link: '#',
                network: 'mainnet' as const,
                supply: '10,000',
                mintPrice: '0.01 ETH',
                floorPrice: '0.03 ETH',
                perks: [
                    {
                        holdingRequirement: { count: 1 },
                        perk: { type: 'Free Mint', description: 'Eligible for one free mint from select partner collections.' }
                    },
                    {
                        holdingRequirement: { count: 1 },
                        perk: { type: 'GTD', description: 'Guaranteed mint for the "Gorillionaire Tycoons" collection.', grantingProjectName: 'Gorillionaire' }
                    }
                ],
                oneTimePoints: 1500,
                pointsPerDay: 25,
                status: 'published' as const,
                isVisibleOnNftPage: true
            },
            {
                id: 'nft_cult_2',
                name: 'Sacred Scroll',
                image: 'https://images.pexels.com/photos/159862/art-school-of-athens-raphael-italian-painter-159862.jpeg?auto=compress&cs=tinysrgb&w=400',
                link: '#',
                network: 'mainnet' as const,
                supply: '1,000',
                mintPrice: '0.1 ETH',
                floorPrice: '0.5 ETH',
                perks: [
                    {
                        holdingRequirement: { count: 1 },
                        perk: { type: 'GTD', description: 'Guaranteed access to CULT governance votes.' }
                    }
                ],
                oneTimePoints: 2500,
                status: 'published' as const,
                isVisibleOnNftPage: true
            }
        ];
        projectData.coins = [
            {
                id: uid(),
                type: 'meme' as const,
                network: 'mainnet' as const,
                name: `CULT Leader`,
                contractAddress: `0x111...`,
                link: '#',
                image: 'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=400',
                status: 'published' as const,
                supply: '1,000,000,000',
                marketPrice: '$0.00001234'
            },
            {
                id: uid(),
                type: 'ecosystem' as const,
                network: 'mainnet' as const,
                name: `CULT Governance`,
                contractAddress: `0x222...`,
                link: '#',
                image: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=400',
                status: 'published' as const,
                supply: '100,000,000',
                marketPrice: '$1.23'
            }
        ];
    } else {
        projectData.discordRoles = getRandomSubset(discordRolesPool, Math.floor(Math.random() * 2) + 1);
    }
    
    if (categories.includes('meme') || Math.random() > 0.8) {
        if (!projectData.coins) { // Don't override CULT's coins
            projectData.coins = [{
                id: uid(),
                type: 'meme' as const,
                network: 'mainnet' as const,
                name: `${name} Coin`,
                contractAddress: `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
                link: '#',
                image: projectData.logo,
                status: Math.random() > 0.2 ? 'published' : 'draft',
                supply: (Math.floor(Math.random() * 9000000000) + 1000000000).toLocaleString(),
                marketPrice: `$${(Math.random() * 0.0001).toFixed(8)}`
            }];
        }
    }

    if (categories.includes('nft') && Math.random() > 0.3) {
      projectData.nftVolume = Math.floor(Math.random() * 9900) + 100;
    }

    return projectData as Project;
  });
  
  // Add a pending project for the super admin dashboard
  projects.push({
      id: 'proj_pending_1',
      name: 'Pending Project Alpha',
      logo: 'https://picsum.photos/seed/ppa/200',
      banner: 'https://picsum.photos/seed/ppa_b/800/200',
      description: 'A revolutionary new DeFi protocol awaiting approval.',
      longDescription: 'This project aims to solve impermanent loss with a novel single-sided liquidity provision mechanism powered by AI.',
      // FIX: Corrected 'website' to 'websites' to match the Project['links'] type definition.
      links: { websites: [{ label: "Website", url: "#" }] },
      events: [],
      status: 'beta',
      category: ['defi', 'ai'],
      createdAt: now,
      votes: { up: 0, down: 0, voters: [] },
      approvalStatus: 'pending',
      isCrowned: false,
      isPublished: false,
  });
  
  const credoSettings: CredoSettings = {
    roleBasedPartnerProjectNames: ['CULT', 'Opals', 'Kizzy'],
    nftBasedPartnerProjectNames: [],
    tokenBasedPartnerProjectNames: ['Magma', 'Kuru', 'Monarch'],
    sliderProjectNames: ['CULT', 'Magma', 'Kuru', 'Lootify'],
    sliderNftNames: [],
  };

  const getDayOfWeek = (dayIndex: number) => { // 0 = Sunday, 1 = Monday
    const today = new Date();
    const currentDay = today.getDay();
    const distance = dayIndex - currentDay;
    const date = new Date(today);
    date.setDate(today.getDate() + distance);
    return date;
  };

  const weeklyDiscordEvents_unsorted: WeeklyDiscordEvent[] = [
      { id: uid(), name: 'Community Art Showcase', dateTime: getDayOfWeek(3).setHours(17, 0, 0, 0), reward: 'Featured on Twitter', serverName: 'Opals', type: 'creative', discordEventLink: '#' },
      { id: uid(), name: 'CULT Town Hall', dateTime: getDayOfWeek(3).setHours(21, 0, 0, 0), reward: 'Governance updates', serverName: 'CULT', type: 'community', discordEventLink: '#' },
      { id: uid(), name: 'WL Mint for "Initiate Pass"', dateTime: getDayOfWeek(4).setHours(16, 0, 0, 0), reward: 'Guaranteed Mint Spot', serverName: 'CULT', type: 'mint', discordEventLink: '#' },
      { id: uid(), name: 'Poker Night', dateTime: getDayOfWeek(4).setHours(20, 0, 0, 0), reward: '$500 USDC Prize Pool', serverName: 'Tezza Poker', partnerServerName: 'Gorillionaire', type: 'gaming', discordEventLink: '#' },
      { id: uid(), name: 'Live Dev Session', dateTime: getDayOfWeek(5).setHours(15, 0, 0, 0), reward: 'Learn to build on Monad', serverName: 'Monadata AI', type: 'community', discordEventLink: '#' },
      { id: uid(), name: 'Showdown Weekly Finals', dateTime: getDayOfWeek(6).setHours(19, 0, 0, 0), reward: 'Exclusive in-game items', serverName: 'Showdown', type: 'gaming', discordEventLink: '#' },
      { id: uid(), name: 'Chill & Chat', dateTime: getDayOfWeek(0).setHours(14, 0, 0, 0), reward: 'Relax before the week starts', serverName: 'TownSquare', type: 'community', discordEventLink: '#' },
      { id: uid(), name: 'Minting Now: Genesis Pass', dateTime: new Date().getTime(), reward: 'Exclusive early access', serverName: 'Opals', type: 'mint', discordEventLink: '#' },
      { id: uid(), name: 'Claim Role: Gorillionaire VIP', dateTime: getDayOfWeek(3).setHours(12, 0, 0, 0), reward: 'VIP Discord Role', serverName: 'Gorillionaire', type: 'community', discordEventLink: '#' },
  ];
  const weeklyDiscordEvents = weeklyDiscordEvents_unsorted.sort((a,b) => a.dateTime - b.dateTime);
  
  const siteContentSettings: SiteContentSettings = {
    campaigns: { title: "Where creativity gets rewarded.", subtitle: "Participate in community events and quests to earn recognition and prizes.", featuredProjectIds: ['proj_7', 'proj_58', 'proj_25', 'proj_24', 'proj_68'] },
    tasks: { title: "Task Hub", subtitle: "Complete tasks from ecosystem projects to earn rewards and climb the leaderboard.", featuredProjectIds: ['proj_31', 'proj_59', 'proj_50'] },
    earlyProjects: { title: "Alpha Floor", subtitle: "Get the scoop on promising projects in their early and pre-launch stages.", featuredProjectIds: ['proj_2', 'proj_32', 'proj_33', 'proj_40', 'proj_51', 'proj_52'] },
    ido: { title: "Project Launches", subtitle: "Discover the next wave of token generation events and initial offerings.", featuredProjectIds: ['proj_33', 'proj_50', 'proj_16', 'proj_22', 'proj_41', 'proj_19'] },
    meme: { title: "Meme Central", subtitle: "Explore the latest and greatest meme coins in the ecosystem.", featuredProjectIds: ['proj_29', 'proj_17', 'proj_71', 'proj_7', 'proj_51', 'proj_21'] },
    nft: { title: "NFT Showcase", subtitle: "A curated look at the most notable NFT collections and their utility.", featuredProjectIds: ['proj_50', 'proj_7', 'proj_24', 'proj_59', 'proj_31', 'proj_21'] },
    thisWeek: { title: "This Week's Highlights", subtitle: "A snapshot of key events, drops, and campaigns happening now.", featuredProjectIds: ['proj_7'] }
  };


  save('users', users);
  save('events', events);
  save('projects', projects);
  save('quests', quests);
  save('credoSettings', credoSettings);
  save('weeklyDiscordEvents', weeklyDiscordEvents);
  save('site_content_v1', siteContentSettings);
  save('seeded_v11', true);
}

// --- INITIALIZATION ---
if (!load('seeded_v11', false)) {
  seedData();
}

// --- DATA ACCESS FUNCTIONS ---

// USERS
export const getUsers = (): User[] => load('users', []);
export const getUserById = (id: string): User | undefined => {
    return getUsers().find(u => u.id === id);
}
export const getUserByWallet = (address: string): User | undefined => {
    const users = getUsers();
    return users.find(u => u.walletAddress?.toLowerCase() === address.toLowerCase());
};
export const createUserWithWallet = (address: string): User => {
    const users = getUsers();
    const newUser: User = { 
        id: uid(), 
        name: `User ${address.slice(0, 6)}`, 
        role: 'member',
        walletAddress: address
    };
    save('users', [...users, newUser]);
    return newUser;
};

// EVENTS
export const getEvents = (): Event[] => load('events', []);
export const getEventById = (id: string): Event | undefined => {
    const events = getEvents();
    return events.find(e => e.id === id);
}

// PROJECTS
export const getProjects = (options?: { includePending?: boolean }): Project[] => {
    const allProjects = load<Project[]>('projects', []);
    if (options?.includePending) {
        return allProjects;
    }
    return allProjects.filter(p => p.approvalStatus === 'approved');
};
export const getProjectById = (id: string): Project | undefined => {
    const allProjects = load<Project[]>('projects', []);
    return allProjects.find(p => p.id === id);
}

// QUESTS
export const getQuests = (): Quest[] => load('quests', []);

export const getQuestById = (id: string): Quest | undefined => {
    const quests = getQuests();
    return quests.find(q => q.id === id);
};

export const submitQuestEntry = (questId: string, userId: string, twitterLink: string): { success: boolean, message: string } => {
    const quests = getQuests();
    const quest = quests.find(q => q.id === questId);
    if (!quest) return { success: false, message: 'Quest not found.' };

    if (quest.status !== 'ongoing') return { success: false, message: 'This quest is no longer active.' };

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: 'User not found.' };
    
    const user = users[userIndex];
    if (!user.socials?.twitter) return { success: false, message: 'Please connect your Twitter account in your profile.' };

    const userSubmissions = (quest.entries || []).filter(e => e.userId === userId).length;
    if (userSubmissions >= (quest.maxSubmissionsPerUser || 1)) return { success: false, message: `You have reached the submission limit of ${quest.maxSubmissionsPerUser}.` };

    const twitterRegex = /https?:\/\/(x\.com|twitter\.com)\/(\w+)\/status\/\d+/;
    const match = twitterLink.match(twitterRegex);
    if (!match) return { success: false, message: 'Invalid Twitter link format.' };
    
    const usernameFromLink = match[2];
    if (user.socials.twitter.toLowerCase() !== usernameFromLink.toLowerCase()) {
        return { success: false, message: `Twitter handle in link (@${usernameFromLink}) does not match your connected account (@${user.socials.twitter}).` };
    }

    const allEntries = quests.flatMap(q => q.entries || []);
    if (allEntries.some(e => e.twitterLink === twitterLink)) return { success: false, message: 'This Twitter link has already been submitted.' };

    const newEntry: QuestEntry = {
        id: uid(),
        userId: user.id,
        twitterLink: twitterLink,
        username: user.name,
        votes: 0,
        voters: [],
    };

    quest.entries = quest.entries ? [newEntry, ...quest.entries] : [newEntry];
    save('quests', quests);
    return { success: true, message: 'Entry submitted successfully!' };
};

export const voteQuestEntry = (questId: string, entryId: string, userId: string): boolean => {
    const quests = getQuests();
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.status !== 'ongoing' || !quest.entries) return false;

    const entry = quest.entries.find(e => e.id === entryId);
    if (!entry) return false;

    if (entry.voters.includes(userId)) {
        // Unvote
        entry.voters = entry.voters.filter(voterId => voterId !== userId);
        entry.votes--;
    } else {
        // Vote
        entry.voters.push(userId);
        entry.votes++;
    }

    save('quests', quests);
    return true;
};

export const submitIdentityAnswer = (questId: string, userId: string, answer: string): { success: boolean, message: string } => {
    const quests = getQuests();
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.identityQuestion) {
        return { success: false, message: 'Quest or question not found.' };
    }

    if (quest.status !== 'ongoing') {
        return { success: false, message: 'This quest is no longer active.' };
    }
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return { success: false, message: 'User not found.' };
    }

    // Lazy initialize answers array
    if (!quest.identityQuestion.answers) {
        quest.identityQuestion.answers = [];
    }

    if (quest.identityQuestion.answers.some(a => a.userId === userId)) {
        return { success: false, message: 'You have already answered this question.' };
    }

    const newAnswer: QuestAnswer = {
        id: uid(),
        userId: userId,
        username: users[userIndex].name,
        answer: answer,
        timestamp: Date.now(),
    };
    
    // Award Tirth point
    users[userIndex].tirthPoints = (users[userIndex].tirthPoints || 0) + 1;

    quest.identityQuestion.answers.push(newAnswer);
    save('quests', quests);
    save('users', users);
    return { success: true, message: 'Your answer has been submitted!' };
};

export const submitMultipleChoiceAnswer = (questId: string, userId: string, answerIndex: number): { success: boolean, message: string } => {
    const quests = getQuests();
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.multipleChoiceQuestion) {
        return { success: false, message: 'Quest or multiple choice question not found.' };
    }

    if (quest.status !== 'ongoing') {
        return { success: false, message: 'This quest is no longer active.' };
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return { success: false, message: 'User not found.' };
    }
    
    if (!quest.multipleChoiceQuestion.answers) {
        quest.multipleChoiceQuestion.answers = [];
    }

    if (quest.multipleChoiceQuestion.answers.some(a => a.userId === userId)) {
        return { success: false, message: 'You have already answered this question.' };
    }

    const newAnswer: MultipleChoiceAnswer = {
        id: uid(),
        userId: userId,
        username: users[userIndex].name,
        answerIndex,
        timestamp: Date.now(),
    };
    
    // Award Tirth point
    users[userIndex].tirthPoints = (users[userIndex].tirthPoints || 0) + 1;

    quest.multipleChoiceQuestion.answers.push(newAnswer);
    save('quests', quests);
    save('users', users);
    return { success: true, message: 'Your answer has been submitted!' };
};


// VERIFICATION
export const isCultOwner = (address?: string): boolean => {
    if (!address) return false;
    return CULT_OWNER_ADDRESSES.some(ownerAddress => ownerAddress.toLowerCase() === address.toLowerCase());
};

// VOUCHING
export const vouchForUser = (voucherId: string, voucheeId: string): { success: boolean, message: string } => {
    const users = getUsers();
    const voucherIndex = users.findIndex(u => u.id === voucherId);
    if (voucherIndex === -1) {
        return { success: false, message: "Vouching user not found." };
    }

    const voucher = users[voucherIndex];
    if (!voucher.vouchedFor) {
        voucher.vouchedFor = [];
    }

    if (voucher.vouchedFor.includes(voucheeId)) {
        return { success: false, message: "You have already vouched for this user." };
    }

    voucher.vouchedFor.push(voucheeId);
    
    if (voucher.manualCredoPoints === undefined) {
        voucher.manualCredoPoints = 0;
    }
    voucher.manualCredoPoints += 1;

    users[voucherIndex] = voucher;
    save('users', users);
    
    return { success: true, message: "Vouched successfully! You earned 1 Credo point." };
};

// CAMPAIGN INTERACTIONS
export const enterCampaign = (campaignId: string, user: User, link: string): { success: boolean; newEntry: CampaignEntry | null } => {
    const events = getEvents();
    const users = getUsers();
    const campaign = events.find(e => e.id === campaignId && e.type === 'campaign') as CampaignEvent | undefined;
    if (!campaign || !campaign.entries) return { success: false, newEntry: null };
    
    if (campaign.entries.some(e => e.userId === user.id)) return { success: false, newEntry: null };

    const newEntry: CampaignEntry = {
        id: uid(),
        username: user.name,
        userId: user.id,
        link,
        votes: { up: 0, down: 0 },
        voters: [],
    };
    
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex].tirthPoints = (users[userIndex].tirthPoints || 0) + 1;
    }

    campaign.entries.push(newEntry);
    save('events', events);
    save('users', users);
    return { success: true, newEntry };
};

export const voteCampaignEntry = (campaignId: string, entryId: string, user: User, vote: 'up' | 'down'): boolean => {
    const events = getEvents();
    const users = getUsers();
    const campaign = events.find(e => e.id === campaignId && e.type === 'campaign') as CampaignEvent | undefined;
    if (!campaign || !campaign.entries) return false;

    const entry = campaign.entries.find(e => e.id === entryId);
    if (!entry) return false;

    const voterIndex = entry.voters.findIndex(v => v.userId === user.id);
    
    // Award point on first-time vote for this entry
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        const currentUser = users[userIndex];
        if (!currentUser.votedCampaignEntryIds) currentUser.votedCampaignEntryIds = [];
        if (!currentUser.votedCampaignEntryIds.includes(entryId)) {
            currentUser.tirthPoints = (currentUser.tirthPoints || 0) + 1;
            currentUser.votedCampaignEntryIds.push(entryId);
        }
    }

    if (voterIndex > -1) {
        const existingVote = entry.voters[voterIndex];
        if (existingVote.vote === vote) {
            entry.voters.splice(voterIndex, 1);
            if (vote === 'up') entry.votes.up--;
            else entry.votes.down--;
        } else { 
            if (existingVote.vote === 'up') entry.votes.up--;
            else entry.votes.down--;
            if (vote === 'up') entry.votes.up++;
            else entry.votes.down++;
            existingVote.vote = vote;
        }
    } else { 
        entry.voters.push({ userId: user.id, vote });
        if (vote === 'up') entry.votes.up++;
        else entry.votes.down++;
    }

    save('events', events);
    save('users', users);
    return true;
};


export const voteProject = (projectId: string, user: User, vote: 'up' | 'down'): void => {
    const projects = getProjects({ includePending: true });
    const users = getUsers();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        const currentUser = users[userIndex];
        if (!currentUser.votedProjectIds) currentUser.votedProjectIds = [];

        if (!currentUser.votedProjectIds.includes(projectId)) {
            currentUser.tirthPoints = (currentUser.tirthPoints || 0) + 1;
            currentUser.votedProjectIds.push(projectId);
        }
    }

    const voterIndex = project.votes.voters.findIndex(v => v.userId === user.id);

    if (voterIndex > -1) {
        const existingVote = project.votes.voters[voterIndex];
        if (existingVote.vote === vote) {
            project.votes.voters.splice(voterIndex, 1);
            if (vote === 'up') project.votes.up--; else project.votes.down--;
        } else { 
            existingVote.vote = vote;
            if (vote === 'up') {
                project.votes.up++;
                project.votes.down--;
            } else {
                project.votes.down++;
                project.votes.up--;
            }
        }
    } else { 
        project.votes.voters.push({ userId: user.id, vote });
        if (vote === 'up') project.votes.up++; else project.votes.down++;
    }

    save('projects', projects);
    save('users', users);
};

// --- ADMIN FUNCTIONS ---

export const updateUser = (updatedUser: User): boolean => {
    try {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === updatedUser.id);
        if (userIndex === -1) return false;
        users[userIndex] = updatedUser;
        save('users', users);
        return true;
    } catch (e) {
        console.error("Failed to update user", e);
        return false;
    }
}

export const addOrUpdateProject = (project: Project): boolean => {
    try {
        const projects = getProjects({ includePending: true });
        const projectIndex = projects.findIndex(p => p.id === project.id);
        if (projectIndex > -1) {
            projects[projectIndex] = project;
        } else {
            projects.unshift(project);
        }
        save('projects', projects);
        return true;
    } catch (e) {
        console.error("Failed to save project", e);
        return false;
    }
}

export const deleteItem = (key: 'projects' | 'events' | 'quests', id: string): boolean => {
     try {
        let items: any[] = load(key, []);
        const initialLength = items.length;
        items = items.filter(item => item.id !== id);
        if (items.length < initialLength) {
            save(key, items);
            return true;
        }
        return false;
    } catch (e) {
        console.error(`Failed to delete item from ${key}`, e);
        return false;
    }
}

export const addOrUpdateEvent = (event: Event): boolean => {
    try {
        const events = getEvents();
        const index = events.findIndex(e => e.id === event.id);
        if (index > -1) {
            events[index] = event;
        } else {
            events.unshift(event);
        }
        save('events', events);
        return true;
    } catch (e) {
        console.error("Failed to save event", e);
        return false;
    }
};

export const addOrUpdateQuest = (quest: Quest): boolean => {
    try {
        const quests = getQuests();
        const index = quests.findIndex(q => q.id === quest.id);

        const now = Date.now();
        if (now > quest.endTime) {
            quest.status = 'past';
        } else {
            quest.status = 'ongoing';
        }
        
        if (index > -1) {
            const existingQuest = quests[index];
            const updatedQuest = { ...existingQuest, ...quest };
            quests[index] = updatedQuest;
        } else {
            quest.entries = quest.entries || [];
            if (quest.identityQuestion) quest.identityQuestion.answers = quest.identityQuestion.answers || [];
            if (quest.multipleChoiceQuestion) quest.multipleChoiceQuestion.answers = quest.multipleChoiceQuestion.answers || [];
            quests.unshift(quest);
        }
        save('quests', quests);
        return true;
    } catch (e) {
        console.error("Failed to save quest", e);
        return false;
    }
};

// --- SUPER ADMIN FUNCTIONS ---

export const updateUserTirthPoints = (userId: string, pointDelta: number): boolean => {
    try {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) return false;

        const user = users[userIndex];
        user.tirthPoints = (user.tirthPoints || 0) + pointDelta;
        users[userIndex] = user;

        save('users', users);
        return true;
    } catch(e) {
        console.error("Failed to update tirth points", e);
        return false;
    }
};

export const selectCampaignWinners = (campaignId: string): { success: boolean; message: string } => {
    try {
        const events = getEvents();
        const users = getUsers();
        const campaignIndex = events.findIndex(e => e.id === campaignId && e.type === 'campaign');
        if (campaignIndex === -1) return { success: false, message: "Campaign not found." };

        const campaign = events[campaignIndex] as CampaignEvent;
        const numberOfWinners = campaign.numberOfWinners || 0;
        if (numberOfWinners === 0) return { success: false, message: "Number of winners not set for this campaign." };
        if ((campaign.winners || []).length > 0) return { success: false, message: "Winners have already been selected."};
        if (!campaign.entries || campaign.entries.length === 0) return { success: false, message: "No entries to select winners from." };

        campaign.entries.sort((a, b) => (b.votes.up - b.votes.down) - (a.votes.up - a.votes.down));

        const winners = campaign.entries.slice(0, numberOfWinners);
        const winnerUserIds = winners.map(w => w.userId);

        campaign.winners = winnerUserIds;
        campaign.entries.forEach(entry => {
            if (winnerUserIds.includes(entry.userId)) {
                entry.isWinner = true;
            }
        });

        users.forEach(user => {
            if (winnerUserIds.includes(user.id)) {
                user.tirthPoints = (user.tirthPoints || 0) + 5;
            }
        });

        events[campaignIndex] = campaign;
        save('events', events);
        save('users', users);

        return { success: true, message: `Selected ${winners.length} winners and awarded 5 Tirth points each!` };
    } catch (e) {
        console.error("Failed to select campaign winners", e);
        return { success: false, message: "An unexpected error occurred." };
    }
};


export const getCredoSettings = (): CredoSettings => load('credoSettings', { 
    roleBasedPartnerProjectNames: [], 
    nftBasedPartnerProjectNames: [], 
    tokenBasedPartnerProjectNames: [],
    sliderProjectNames: [], 
    sliderNftNames: [] 
});

export const updateCredoSettings = (settings: CredoSettings): boolean => {
    try {
        save('credoSettings', settings);
        return true;
    } catch (e) {
        console.error("Failed to save credo settings", e);
        return false;
    }
};

export const getWeeklyDiscordEvents = (): WeeklyDiscordEvent[] => load('weeklyDiscordEvents', []);

export const getSiteContentSettings = (): SiteContentSettings => {
    const fallback: SiteContentSettings = {
        campaigns: { title: "Where creativity gets rewarded.", subtitle: "Participate in community events and quests to earn recognition and prizes.", featuredProjectIds: [] },
        tasks: { title: "Task Hub", subtitle: "Complete tasks from ecosystem projects to earn rewards and climb the leaderboard.", featuredProjectIds: [] },
        earlyProjects: { title: "Alpha Floor", subtitle: "Get the scoop on promising projects in their early and pre-launch stages.", featuredProjectIds: [] },
        ido: { title: "Project Launches", subtitle: "Discover the next wave of token generation events and initial offerings.", featuredProjectIds: [] },
        meme: { title: "Meme Central", subtitle: "Explore the latest and greatest meme coins in the ecosystem.", featuredProjectIds: [] },
        nft: { title: "NFT Showcase", subtitle: "A curated look at the most notable NFT collections and their utility.", featuredProjectIds: [] },
        thisWeek: { title: "This Week's Highlights", subtitle: "A snapshot of key events, drops, and campaigns happening now.", featuredProjectIds: [] }
    };
    return load('site_content_v1', fallback);
};

export const updateSiteContentSettings = (settings: SiteContentSettings): boolean => {
    try {
        save('site_content_v1', settings);
        return true;
    } catch (e) {
        console.error("Failed to save site content settings", e);
        return false;
    }
};

export const updateUserPermissions = (userId: string, role: User['role'], associatedProjectIds: string[], permissions?: User['permissions']): boolean => {
    try {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) return false;
        users[userIndex].role = role;
        users[userIndex].associatedProjectIds = role === 'project_admin' ? associatedProjectIds : [];
        if (role === 'project_admin') {
            users[userIndex].permissions = permissions;
        } else {
            // Clear permissions if they are demoted to member
            delete users[userIndex].permissions;
        }
        save('users', users);
        return true;
    } catch (e) {
        console.error("Failed to update user permissions", e);
        return false;
    }
}

export const updateProjectStatus = (projectId: string, status: 'approved' | 'rejected'): boolean => {
    try {
        const projects = getProjects({ includePending: true });
        const projectIndex = projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) return false;
        projects[projectIndex].approvalStatus = status;
        save('projects', projects);
        return true;
    } catch (e) {
        console.error(`Failed to update project status for ${projectId}`, e);
        return false;
    }
}

export const addPointsToUser = (userId: string, points: { credo?: number }, tirthAdjustment?: { points: number, category: 'tasks' | 'wins' | 'rewards', reason: string }): boolean => {
    try {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) return false;
        
        const user = users[userIndex];
        
        if (points.credo) {
            user.manualCredoPoints = (user.manualCredoPoints || 0) + points.credo;
        }
        if (tirthAdjustment && tirthAdjustment.points !== 0) {
            if (!user.manualTirthAdjustments) {
                user.manualTirthAdjustments = [];
            }
            user.manualTirthAdjustments.push({
                points: tirthAdjustment.points,
                category: tirthAdjustment.category,
                reason: tirthAdjustment.reason,
                timestamp: Date.now()
            });
        }

        users[userIndex] = user;
        save('users', users);
        return true;
    } catch (e) {
        console.error("Failed to add points to user", e);
        return false;
    }
};

export const removePointsFromUser = (userId: string, points: { credo?: number }, tirthAdjustment?: { points: number, category: 'tasks' | 'wins' | 'rewards', reason: string }): boolean => {
    try {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) return false;
        
        const user = users[userIndex];
        
        if (points.credo) {
            user.manualCredoPoints = (user.manualCredoPoints || 0) - points.credo;
        }
        if (tirthAdjustment && tirthAdjustment.points !== 0) {
            if (!user.manualTirthAdjustments) {
                user.manualTirthAdjustments = [];
            }
            user.manualTirthAdjustments.push({
                points: -tirthAdjustment.points,
                category: tirthAdjustment.category,
                reason: tirthAdjustment.reason,
                timestamp: Date.now()
            });
        }

        users[userIndex] = user;
        save('users', users);
        return true;
    } catch (e) {
        console.error("Failed to remove points from user", e);
        return false;
    }
};