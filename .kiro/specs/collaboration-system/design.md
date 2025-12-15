# Collaboration System Design Document

## Overview

The Collaboration System enables partnerships between multiple projects within the ecosystem, allowing users to discover active and past collaborations, participate in collaboration-specific tasks, and earn rewards through a point-based system. The system consists of two main pages: a Collaboration Page displaying all collaborations and Individual Collaboration Pages for specific partnerships.

## Architecture

The system follows the existing application architecture with React components, TypeScript interfaces, and Supabase backend integration. The collaboration system integrates with the existing user authentication, project management, and task completion systems.

### Component Hierarchy
```
CollaborationPage
├── Header (existing)
├── CollaborationHero
├── RunningCollaborationsSection
│   └── CollaborationCard[]
├── PastCollaborationsSection
│   └── CollaborationCard[]
└── PaginationControls (existing)

IndividualCollaborationPage
├── Header (existing)
├── CollaborationDetailHero
├── TasksSection
│   └── TaskTable (similar to existing TasksTable)
├── RewardCardsSection
│   └── RewardCard[]
└── ProgressSection
```

## Components and Interfaces

### Core Data Models

```typescript
export interface Collaboration {
  id: string;
  title: string;
  description: string;
  participating_projects: string[]; // Project IDs
  status: 'running' | 'past';
  start_date: string;
  end_date?: string;
  banner_image?: string;
  total_participants: number;
  total_hint_points_distributed: number;
  created_at: string;
  updated_at: string;
}

export interface CollaborationTask {
  id: string;
  collaboration_id: string;
  title: string;
  description: string;
  task_type: 'twitter_follow' | 'twitter_like' | 'twitter_retweet' | 'discord_join' | 'custom';
  hint_points_reward: number;
  verification_data?: {
    twitter_username?: string;
    discord_server_id?: string;
    custom_url?: string;
  };
  is_active: boolean;
  created_at: string;
}

export interface RewardCard {
  id: string;
  collaboration_id: string;
  title: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  hint_points_cost: number;
  reward_type: 'whitelist_fcfs' | 'whitelist_guaranteed' | 'hint_points' | 'money' | 'code';
  reward_data: {
    amount?: number;
    code?: string;
    whitelist_spots?: number;
  };
  total_available: number;
  claimed_count: number;
  is_active: boolean;
}

export interface UserCollaborationProgress {
  id: string;
  user_id: string;
  collaboration_id: string;
  completed_tasks: string[]; // Task IDs
  earned_hint_points: number;
  opened_reward_cards: string[]; // RewardCard IDs
  last_activity: string;
}
```

### Component Interfaces

```typescript
interface CollaborationCardProps {
  collaboration: Collaboration;
  projects: Project[];
  onClick?: () => void;
}

interface CollaborationHeroProps {
  collaborations: Collaboration[];
  projects: Project[];
}

interface TaskTableProps {
  tasks: CollaborationTask[];
  userProgress: UserCollaborationProgress;
  onTaskComplete: (taskId: string) => void;
}

interface RewardCardProps {
  card: RewardCard;
  userHintPoints: number;
  onOpen: (cardId: string) => void;
  isDisabled: boolean;
}
```

## Data Models

### Database Schema Extensions

```sql
-- Collaborations table
CREATE TABLE collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  participating_projects TEXT[] NOT NULL,
  status VARCHAR(20) DEFAULT 'running',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  banner_image TEXT,
  total_participants INTEGER DEFAULT 0,
  total_hint_points_distributed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaboration tasks table
CREATE TABLE collaboration_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_id UUID REFERENCES collaborations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(50) NOT NULL,
  hint_points_reward INTEGER NOT NULL,
  verification_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reward cards table
CREATE TABLE reward_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_id UUID REFERENCES collaborations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  rarity VARCHAR(20) NOT NULL,
  hint_points_cost INTEGER NOT NULL,
  reward_type VARCHAR(50) NOT NULL,
  reward_data JSONB NOT NULL,
  total_available INTEGER NOT NULL,
  claimed_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User collaboration progress table
CREATE TABLE user_collaboration_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  collaboration_id UUID REFERENCES collaborations(id) ON DELETE CASCADE,
  completed_tasks TEXT[] DEFAULT '{}',
  earned_hint_points INTEGER DEFAULT 0,
  opened_reward_cards TEXT[] DEFAULT '{}',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, collaboration_id)
);

-- User hint points table (global balance)
CREATE TABLE user_hint_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  available_points INTEGER DEFAULT 0,
  spent_points INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Properties 1.2 and 1.3 (displaying collaboration details) can be combined into a single property about collaboration information display
- Properties 2.2, 3.3, 5.1, 5.2, and 5.3 (displaying various information) can be consolidated into properties about information completeness
- Properties 2.4 and 2.5 (verification) can be combined into a single verification property
- Properties 3.4 and 3.5 (reward card specifics) can be combined with 3.3 into a comprehensive reward card property

### Core Properties

**Property 1: Collaboration information completeness**
*For any* collaboration, when displayed, the system should include all required information: participating projects, description, status, and relevant dates
**Validates: Requirements 1.2, 1.3**

**Property 2: Navigation consistency**
*For any* running collaboration, clicking on it should navigate to the individual collaboration page
**Validates: Requirements 1.4**

**Property 3: Task information completeness**
*For any* task, when displayed, the system should show task type, description, hint points reward, and completion status
**Validates: Requirements 2.2**

**Property 4: Task completion rewards**
*For any* completed task, the system should award the specified hint points and update the task status accordingly
**Validates: Requirements 2.3**

**Property 5: Task verification consistency**
*For any* social media or Discord task, the system should verify completion through appropriate methods before awarding points
**Validates: Requirements 2.4, 2.5**

**Property 6: Reward card access control**
*For any* user and reward card, the system should allow opening the card if and only if the user has sufficient hint points
**Validates: Requirements 3.1**

**Property 7: Reward card transaction integrity**
*For any* reward card opening, the system should deduct the exact required hint points and provide the specified reward
**Validates: Requirements 3.2**

**Property 8: Reward card information completeness**
*For any* reward card, when displayed, the system should show rarity, hint point cost, potential rewards, and specific details (FCFS/guaranteed for whitelist, uniqueness for codes)
**Validates: Requirements 3.3, 3.4, 3.5**

**Property 9: Progress tracking completeness**
*For any* user's collaboration progress, the display should include all completed tasks, earned hint points, opened reward cards, and accurate completion percentages
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

**Property 10: Administrative operations integrity**
*For any* administrative operation (creating collaborations, adding tasks, configuring rewards, managing status), the system should persist all specified parameters correctly
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

**Property 11: Analytics accuracy**
*For any* collaboration, the analytics should accurately reflect participation and completion rates based on actual user data
**Validates: Requirements 6.5**

## Error Handling

### User Input Validation
- Validate collaboration creation parameters (title, description, participating projects)
- Validate task configuration (type, points, verification data)
- Validate reward card setup (rarity, cost, reward data)
- Sanitize user inputs to prevent XSS and injection attacks

### Task Verification Errors
- Handle API failures for social media verification gracefully
- Provide fallback verification methods when external services are unavailable
- Implement retry mechanisms for transient verification failures
- Log verification attempts for audit purposes

### Point Transaction Errors
- Implement atomic transactions for hint point operations
- Handle insufficient balance scenarios gracefully
- Prevent double-spending through proper locking mechanisms
- Maintain transaction logs for debugging and auditing

### External Service Integration
- Handle Twitter API rate limits and authentication errors
- Manage Discord API failures and permission issues
- Implement circuit breakers for external service calls
- Provide meaningful error messages to users

## Testing Strategy

### Dual Testing Approach

The collaboration system requires both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Testing Requirements:**
- Unit tests verify specific examples, edge cases, and error conditions
- Integration points between collaboration components and existing systems
- Specific user workflows like task completion and reward card opening
- Error handling scenarios and edge cases

**Property-Based Testing Requirements:**
- Property tests verify universal properties across all inputs using **fast-check** library
- Each property-based test runs a minimum of 100 iterations
- Tests generate random collaborations, tasks, users, and reward cards
- Each property-based test is tagged with format: **Feature: collaboration-system, Property {number}: {property_text}**
- Each correctness property is implemented by a single property-based test

**Testing Framework:**
- Use **fast-check** for property-based testing in TypeScript/JavaScript
- Configure property tests to run 100+ iterations for thorough coverage
- Generate realistic test data that respects business constraints
- Test both success and failure scenarios for comprehensive coverage

### Test Data Generation Strategy

**Smart Generators:**
- Generate collaborations with realistic project combinations
- Create tasks with appropriate point rewards and verification requirements
- Generate reward cards with balanced rarity and cost distributions
- Create user progress data that reflects realistic usage patterns
- Ensure generated data respects database constraints and business rules

**Edge Case Coverage:**
- Test with minimum and maximum hint point values
- Verify behavior with empty collaboration lists
- Test reward card availability edge cases (last card, insufficient stock)
- Validate task completion with various verification states
- Test concurrent user operations on shared resources