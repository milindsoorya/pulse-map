# 🚀 Pulse Map Roadmap

## 🎯 Phase 1: The Pulse Engine (MVP) - ✅ Completed
*   **3D Map Visualization**: Interactive globe using Mapbox GL JS.
*   **Pulse System**: Real-time visual pulses representing user activity.
*   **Movie Integration**: Search TMDB, view details, and "heart" movies to generate pulses.
*   **Basic Geolocation**: IP-based or manual location for pulses.
*   **Guest Mode**: Frictionless experience without mandatory login.

## 🎯 Phase 2: Topics & Simplification - ✅ Completed
*   **Universal Objects**: Expanded beyond movies to include generic "Topics".
*   **Tech Stack Simplification**: Removed Prisma in favor of direct LibSQL (Turso) client for better edge compatibility and simplicity.
*   **UI Enhancements**:
    *   **Side Panel**: "Trending" and "Nearby" lists.
    *   **Filters**: Toggle visibility of Movies vs. Topics.
    *   **Interactivity**: Click on pulses/sidebar items to fly to location and view details.
    *   **Toast Notifications**: Better feedback for user actions.

## 🎯 Phase 3: Social & Time (Upcoming)
*   **Time Decay**: Pulses should visually fade or shrink over time to represent "freshness".
*   **Reaction Types**: Expand beyond "Heart" to include 🔥 (Hot), 😭 (Sad), 🤣 (Funny), 😡 (Angry).
*   **Live Updates**: WebSocket or polling implementation for real-time updates without refresh.
*   **Shareable Pulses**: Generate links to specific pulses or map views.

## 🎯 Phase 4: Personalization & Culture Graph (Future)
*   **User Profiles**: Optional login to save history and preferences.
*   **Topic Subscriptions**: Follow specific tags or categories (e.g., #Marvel, #Tech).
*   **City Leaderboards**: "What's trending in Tokyo right now?"
*   **Heatmaps**: Aggregate view of high-activity regions.

## 🎯 Phase 5: The Multi-Object Universe (Long Term)
*   **Rich Media**: Integration with Spotify (Music), News APIs, etc.
*   **Viral Stories**: Link related pulses together to show the spread of a trend.
*   **Mobile App**: Native React Native application.
