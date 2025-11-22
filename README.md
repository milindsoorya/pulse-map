# CinePulse 🌍❤️

**CinePulse** is a real-time cultural map that visualizes movie reactions across the globe. Users can "pulse" (heart) movies, and these reactions are displayed instantly on an interactive 3D globe.

![CinePulse Demo](https://via.placeholder.com/800x400?text=CinePulse+Map+Preview)

## 🚀 Features

- **Interactive 3D Map**: Built with Mapbox GL, featuring smooth zoom and pan interactions.
- **Real-time Pulses**: "Heart" a movie to add your location to the global map.
- **Local Discovery**: Zoom into any region to see a side panel of movies trending in that specific area.
- **Guest Mode**: No login required. Anyone can explore and contribute immediately.
- **Cloud Database**: Powered by **Turso** (LibSQL) for fast, edge-ready data storage.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [Turso](https://turso.tech/) (SQLite/LibSQL)
- **Map**: [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- A [Mapbox](https://mapbox.com) account (for the public token).
- A [Turso](https://turso.tech) database (optional for local dev, required for production).

### Installation

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/yourusername/cinepulse.git
    cd cinepulse
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_MAPBOX_TOKEN="pk.your_mapbox_token_here"
    
    # Optional: For Cloud DB (defaults to local file if missing)
    TURSO_DATABASE_URL="libsql://your-db.turso.io"
    TURSO_AUTH_TOKEN="your-turso-token"
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## 🗺️ Roadmap

### Phase 1: MVP (Completed ✅)
- [x] Basic Map Interface
- [x] Movie Search & "Hearting"
- [x] Guest User System
- [x] SQLite/Turso Integration
- [x] Zoom-to-Reveal Side Panel

### Phase 2: Enhanced Interaction (Coming Soon)
- [ ] **User Accounts**: Optional login to track your personal history.
- [ ] **Filters**: Filter map by Genre (e.g., "Where are people watching Horror movies?").
- [ ] **Time Travel**: See what was trending last month or last year.

### Phase 3: Mobile & Social
- [ ] **PWA Support**: Installable on mobile devices.
- [ ] **Friend Activity**: See what your friends are watching on the map.
- [ ] **City Leaderboards**: "Top Movies in Tokyo vs. New York".

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

MIT License.
