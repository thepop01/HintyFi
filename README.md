<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# HintyFi

HintyFi is a web3-enabled event and community hub that aggregates campaigns, quests, projects, NFTs, and collaborative opportunities for the crypto ecosystem. It connects creators with community members through interactive missions, points systems, leaderboards, and wallet integration.

## Stack
- **Language(s):** TypeScript
- **Framework / runtime:** React 19 + Vite + React Router 7
- **Notable libraries:** wagmi + RainbowKit (wallet integration), Supabase (backend/auth), Framer Motion (animations), React Query, Lucide (icons)

## How it's organized

```
App.tsx                     Root component with provider setup (wallet, auth, toast)
src/
  Router.tsx               Route definitions for 20+ pages, lazy loading, redirects
  config/                  RainbowKit wallet configuration
  context/                 AuthContext, WalletContext for state
  services/                dataService for fetching projects
  pages/                   Routing destinations (AuthCallback only)
  types.ts                 Large type definitions (60KB) for all domains
components/
  admin/                   Super admin UI (user mgmt, project mgmt, NFT collections)
  auth/                    ProtectedRoute, login flows
  common/                  Shared UI (ErrorBoundary, Loader, ScrollToTop)
  layout/                  Layout wrapper with navigation
  project/                 Project-specific components
  quest/                   Quest UI components
  ecosystem/               Ecosystem/discovery components
  events/                  Event display components
  collab/                  Collaboration UI
  profile/                 User profile components
pages/
  CampaignPage.tsx         Campaign discovery and browsing
  EcosystemPage.tsx        Ecosystem/project showcase (40KB)
  TasksPage.tsx            Task listing and filtering
  NFTPage.tsx, MemePage.tsx     Special collections
  PointsPage.tsx, ProjectLeaderboardPage.tsx     Gamification
  admin/                   Super admin dashboards
vite.config.ts             Vite bundler config
vitest.config.ts           Unit test setup
```

**How it fits together:** The app boots with wallet connection (wagmi + RainbowKit), auth check via Supabase, then Router maps 50+ routes to lazy-loaded pages. Public routes (ecosystem, campaigns, tasks) load first; protected routes (admin, profile) require auth. Data flows from Supabase backend through React Query and context providers to page components, which render feature-specific UI from the components hierarchy.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 🧰 Developer Tips

If the app shows a blank white screen, follow these steps:
1. Open the browser console to check for errors.
2. Run `localStorage.clear()` once manually in the console.
3. Restart the development server with `npm run dev` to clear the Vite cache.
4. If issues persist, delete the `.vite` folder in your project directory.
