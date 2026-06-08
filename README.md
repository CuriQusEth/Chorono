# CHORONO

A mind-bending, mobile-first time manipulation puzzle-platformer. You play as a Chrono Weaver, altering the fabric of time to solve complex puzzles and navigate fractured timelines.

## Core Gameplay Mechanics
- **Time Rewind:** Revert the flow of time within localized dimensional bubbles to manipulate objects and enemies.
- **Time Slow:** Decelerate temporal physics, granting enhanced reaction windows.
- **Timeline Synchronization:** Achieve master-level completion scores by employing minimal rewinds and hyper-optimized pathing.
- **On-chain Integration:**
  - Secure performance logging via Sign-In with Ethereum (SIWE).
  - Frictionless "Say GM" transacting on the Base Network directly from the game interface.
  - Hybrid architectural leaderboards combining off-chain velocity with on-chain verification.

## Technology Stack
- **Engine:** React 19, TypeScript, Canvas API, Framer Motion
- **Styling:** Tailwind CSS (Cinzel & Cormorant Garamond typography)
- **Web3 Ecosystem:** Wagmi, Viem, Base Network
- **Agent Infrastructure:** ERC-8004 capabilities synchronized via Model Context Protocol (MCP) and explicit JSON routing.

## Deployment & Hosting Environment
- This application relies on a Node.js Express backend serving a Vite SSR/SPA payload. 
- Fully configured for Vercel/Cloud Run via structured reverse proxies (`vercel.json`) linking to the `/api/` endpoints.
- Agent routing is permanently exposed via `.well-known/agent-card.json`.

## AI Agent Integration (ERC-8004 & A2A)
Chorono features a specialized ecosystem agent designed to monitor timeline fractures, execute decentralized operations on Base, and track warp-racing telemetry. It operates completely autonomously.

## License
MIT
