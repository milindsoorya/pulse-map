# 🗺️ Pulse Map: The "Live World" Engine - Roadmap

> **Vision:** A live "what’s the world into right now?" engine, organised by place.
> **Philosophy:** **Maximum Insight, Minimum UI.** The interface should feel like a living organism, not a dashboard.

---

## 🧭 Phase 1: The Foundation (Current Status) - ✅ Mostly Complete
*Building the core map infrastructure and basic pulse mechanics.*

*   **Core Tech**: Next.js 15, Mapbox GL JS, Turso (LibSQL), Tailwind v4.
*   **3D Map**: Interactive globe with "fly-to" mechanics.
*   **Pulse System**: Real-time visual pulses (Movies & Topics).
*   **Basic Data**: TMDB integration for movies.
*   **Guest Access**: Frictionless usage without login.

---

## 🎨 Phase 2: The "Invisible UI" (Aesthetics & Clutter Reduction)
*Making the interface disappear until needed.*

### 1. The "Clean Lens" Approach
*   **Goal**: The map is the hero. Controls should be subtle, floating, and contextual.
*   **Deliverables**:
    *   **Floating "Question" Bar**: Instead of heavy sidebars, a single floating element asking *"What are you looking for?"*
    *   **Smart Opacity**: UI elements fade to 20% opacity when not interacting, letting the map shine.
    *   **Cinematic Transitions**: Smooth camera movements (fly-to) instead of abrupt page loads.

### 2. Visual Clarity & "Soft Filters"
*   **Goal**: Prevent map clutter while keeping it alive.
*   **Deliverables**:
    *   **Time Decay**: Older pulses physically shrink and dim. Only "fresh" pulses glow.
    *   **Dynamic Clustering**: At high zoom, show individual pulses. At low zoom, show glowing "Heat Zones" to avoid dot-overload.
    *   **Hidden Complexity**: Advanced filters (Genre, Age) are hidden behind a single "Tuning" icon.

---

## 📖 Phase 3: Stories & Insights (The "Why")
*Turning dots on a map into immersive, bite-sized stories.*

### 1. Immersive Topic Cards
*   **Goal**: When clicking a pulse, don't open a spreadsheet. Open a *moment*.
*   **Deliverables**:
    *   **Glassmorphism Overlays**: Story cards float over the map with background blur, maintaining context.
    *   **Visual Data**: Use mini-charts (sparklines) and icons instead of text blocks.
    *   **"Origin Story" Animation**: A quick line animation tracing the path from the first pulse to the current location.

### 2. Visual Story Mode
*   **Goal**: A "Lean Back" experience. Watch the trend unfold.
*   **Deliverables**:
    *   **Auto-Pilot**: Press "Play" on a topic to watch the map automatically fly to key locations in chronological order.
    *   **Cinematic Captions**: Minimal text overlays at the bottom (like subtitles) explaining the trend.

---

## 👤 Phase 4: Identity & Social (The "Me")
*Subtle personalization that feels magical, not administrative.*

### 1. "Me" View
*   **Goal**: Show the user's place in the world without a complex profile page.
*   **Deliverables**:
    *   **My Heatmap**: Toggle to see *only* your pulses glowing on the dark map.
    *   **Taste Doppelgängers**: "You are 80% Tokyo" (Simple text overlay).

---

## 📈 Phase 5: Growth & Ecosystem (Long Term)
*Tools for creators and global scale.*

### 1. Creator/Studio Tools
*   **Goal**: Answer *"Is my thing spreading?"*
*   **Deliverables**:
    *   **URL-to-Topic**: Paste a YouTube/Tweet link -> Create a tracked topic.
    *   **Shareable "Live Maps"**: Embeddable map widgets for blogs/news sites.

### 2. The "Global Vibe"
*   **Goal**: Answer *"What is the vibe of the world today?"*
*   **Deliverables**:
    *   **Ambient Background**: Subtle color shifts in the map atmosphere based on global sentiment (e.g., slightly warmer for "Happy", cooler for "Serious").

---

## 🛠️ Technical Refactors for "Feel"
*   **Performance**: Aggressive code splitting to ensure 60fps map interactions.
*   **Real-time**: WebSockets for that "living, breathing" pulse effect.
*   **Geo-Spatial Indexing**: Optimize for speed so "Near Me" feels instant.
