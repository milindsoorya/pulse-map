# 🌍 Pulse Map

> **A real-time, global pulse of movies, music, memes, topics, and events—visualized on an interactive world map.**

## 🧭 Vision
> **A live "what’s the world into right now?" engine, organised by place.**

We are building a tool that answers the questions people already have:
*   *"What should I watch/listen to right now?"*
*   *"What's blowing up in my city?"*
*   *"Is this thing I love actually spreading?"*

No clutter, just the pulse of the planet.

## 🚀 Roadmap
See [ROADMAP.md](./ROADMAP.md) for the detailed project vision and future plans.

### Current Features (Phase 1 & 2)
*   **3D Map + Pulse Visualization**: Interactive globe with real-time pulses.
*   **Movie Integration**: Search and "heart" movies to create pulses.
*   **Topic Pulses**: Support for general topics and discussions.
*   **Filters**: Toggle between Movies and Topics.
*   **Sidebar**: Trending and Nearby pulses with click-to-fly functionality.
*   **Guest Mode**: No login required for core experience.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Map**: Mapbox GL JS
- **Database**: Turso (LibSQL)
- **Styling**: Tailwind CSS v4
- **State Management**: React Query

## 🏃‍♂️ Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Set up environment variables:
    Create a `.env.local` file with:
    ```
    NEXT_PUBLIC_MAPBOX_TOKEN=your_token
    TURSO_DATABASE_URL=your_url
    TURSO_AUTH_TOKEN=your_token
    TMDB_API_KEY=your_key
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000)
