# 🚗 Macro Rides — Zone Corridor Visualization Tool

A professional **zone boundary + dynamic route corridor visualization dashboard** for Macro Rides built with **H3**, **Leaflet**, and vanilla JavaScript. Simulates a driver's live route, draws a 350 m spatial corridor, and highlights eligible pickup points in real time.

---

## 📸 Preview

> Dark-themed, real-time simulation dashboard with H3 hexagonal indexing, interactive layer toggles, and live pickup eligibility updates.

---

## ✨ Features

| Feature | Detail |
|---|---|
| 🗺️ Dark Map Theme | OpenStreetMap tiles with CSS inversion for a premium dark look |
| 📍 Live Route Simulation | Step-by-step driver position playback with speed control (0.5× – 4×) |
| 🔷 H3 Spatial Indexing | Resolution-adjustable hexagonal grid (res 7–11) for corridor detection |
| 🟢 Pickup Eligibility | Real-time eligible/ineligible classification with haversine distance |
| 🌀 350 m Corridor Buffer | Adjustable buffer (100 m – 1000 m) via live slider |
| 🎛️ Layer Toggles | Show/hide Route, Corridor, H3 Grid, Pickups independently |
| 📊 Live Metrics | Route length, eligible count, total pickups, H3 cell count |
| 📱 Responsive | Collapsible sidebar, works on mobile and desktop |
| 💬 Rich Popups | Click any pickup marker for name, type, distance, eligibility status |

---

## 🗂️ Project Structure

```
macro-rides/
├── index.html          # Main HTML shell + layout
├── css/
│   └── style.css       # Full dark theme, all component styles
├── js/
│   ├── data.js         # Route coords + pickup point data (Kanpur)
│   ├── h3utils.js      # H3 spatial helpers (cells, distance, length)
│   ├── map.js          # Leaflet rendering (route, buffer, H3, markers)
│   ├── simulation.js   # Playback engine (start/pause/resume/stop)
│   ├── ui.js           # DOM controller (metrics, sliders, buttons)
│   └── app.js          # Orchestrator — wires all modules together
├── README.md
└── .gitignore
```

---

## 🏗️ Architecture

```
┌─────────────┐    settings/events    ┌─────────────┐
│   ui.js     │ ──────────────────►   │   app.js    │
│  (DOM/UX)   │ ◄──────────────────   │(Orchestrator│
└─────────────┘    metric updates      └──────┬──────┘
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        ▼                     ▼                     ▼
                 ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
                 │  h3utils.js │    │   map.js     │    │simulation.js │
                 │(Spatial math│    │(Leaflet layer│    │ (Playback    │
                 │ H3 indexing)│    │  rendering)  │    │  engine)     │
                 └─────────────┘    └──────────────┘    └──────────────┘
                        │
                 ┌─────────────┐
                 │   data.js   │
                 │(Route coords│
                 │  + pickups) │
                 └─────────────┘
```

### How It Works

1. **`data.js`** defines the 30-point driver route (Kanpur) and 20 pickup locations
2. **`h3utils.js`** converts route coords → H3 cells using `gridDisk()` per waypoint, computes haversine distance from each pickup to the route
3. **`map.js`** renders everything on Leaflet: route polyline, buffer, H3 hex polygons, pickup markers with popups
4. **`simulation.js`** fires step-by-step callbacks on a speed-controlled `setTimeout` loop
5. **`app.js`** listens to UI events, feeds them to the right module, and re-renders on each sim step
6. **`ui.js`** handles all DOM reads/writes — sliders, buttons, metrics, progress bar, status

---

## 🚀 Quick Start (Local)

### Option 1 — VS Code Live Server (Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/macro-rides-corridor.git
cd macro-rides-corridor

# 2. Open in VS Code
code .

# 3. Install Live Server extension (if not already)
#    Extensions → search "Live Server" → Install

# 4. Right-click index.html → "Open with Live Server"
#    Opens at http://127.0.0.1:5500/index.html
```

### Option 2 — Python HTTP Server

```bash
git clone https://github.com/YOUR_USERNAME/macro-rides-corridor.git
cd macro-rides-corridor

# Python 3
python -m http.server 8080

# Visit http://localhost:8080
```

### Option 3 — Node.js serve

```bash
npm install -g serve
serve .
# Visit http://localhost:3000
```

> ⚠️ **Do not open `index.html` directly** (file:// protocol blocks some CDN scripts). Always use a local server.

---

## 🌐 Deployment

### A) GitHub Pages (Free — Recommended)

```bash
# 1. Push your code to GitHub
git init
git add .
git commit -m "feat: initial Macro Rides corridor dashboard"
git remote add origin https://github.com/YOUR_USERNAME/macro-rides-corridor.git
git push -u origin main

# 2. Go to GitHub → Settings → Pages
#    Source: "Deploy from a branch" → Branch: main → / (root)
#    Save → wait ~60 seconds

# 3. Your live URL:
#    https://YOUR_USERNAME.github.io/macro-rides-corridor/
```

### B) Netlify (Instant Drag-and-Drop)

1. Go to [netlify.com](https://netlify.com) → Sign up / Log in
2. Click **"Add new site" → "Deploy manually"**
3. **Drag the entire `macro-rides` folder** into the upload box
4. Done — live URL in ~10 seconds (e.g. `https://random-name.netlify.app`)

To connect with Git for auto-deploys:
```bash
# In Netlify dashboard → "Import from Git" → connect GitHub repo
# Every git push auto-deploys
```

### C) Vercel

```bash
npm install -g vercel
cd macro-rides-corridor
vercel
# Follow prompts → live URL instantly
```

---

## 📦 Git Repository Setup (Step by Step)

### First time setup

```bash
# 1. Create a new repo on GitHub (github.com → New repository)
#    Name: macro-rides-corridor
#    Visibility: Public
#    Do NOT initialize with README (we'll push ours)

# 2. In your project folder:
git init
git add .
git commit -m "feat: Macro Rides Route Corridor Dashboard v1.0"

# 3. Link to GitHub
git remote add origin https://github.com/YOUR_USERNAME/macro-rides-corridor.git
git branch -M main
git push -u origin main
```

### Daily workflow

```bash
git add .
git commit -m "fix: improve H3 cell accuracy at resolution 9"
git push
```

---

## ⚙️ Configuration

All settings are in `js/data.js`:

```js
// Change the driver route
const ROUTE_COORDS = [
  [lat, lng],   // waypoint 1
  [lat, lng],   // waypoint 2
  // ...
];

// Add/remove pickup points
const PICKUP_POINTS = [
  { id: 1, name: "Stop Name", lat: 26.45, lng: 80.33, type: "Bus Stand" },
  // ...
];

// Change defaults
const DEFAULT_SETTINGS = {
  bufferRadius: 350,   // metres — change to adjust default corridor
  h3Resolution: 9,     // 7 (coarse) to 11 (fine)
  simSpeed:     1      // playback speed multiplier
};
```

---

## 🔬 H3 Resolution Guide

| Resolution | Avg Cell Width | Best For |
|---|---|---|
| 7 | ~5.16 km | City-wide overview |
| 8 | ~1.95 km | Neighbourhood level |
| **9** | **~737 m** | **Route corridors ✓** |
| 10 | ~279 m | Street-level precision |
| 11 | ~105 m | High-precision only |

Resolution 9 is the sweet spot for a 350 m corridor — each cell is ~737 m wide so 1–2 k-rings cover the buffer perfectly.

---

## 📚 Dependencies (all via CDN — no npm needed)

| Library | Version | Purpose |
|---|---|---|
| [Leaflet](https://leafletjs.com) | 1.9.4 | Map rendering |
| [H3-js](https://github.com/uber/h3-js) | 4.1.0 | Spatial indexing |
| [Inter](https://fonts.google.com/specimen/Inter) | — | UI typography |
| [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | — | Metric numbers |

---

## 📧 Submission Checklist

- [x] Source code on GitHub
- [x] Deployment link (GitHub Pages / Netlify)
- [x] README with architecture explanation
- [x] H3 spatial indexing implemented
- [x] Leaflet map visualization
- [x] 350 m route corridor
- [x] Eligible pickup highlighting
- [x] Real-time simulation
- [x] Zone boundary display
- [x] Functional and visually intuitive UI

---

## 👤 Author

Built for the **Macro Rides Technical Evaluation Assignment** (June 2026).

Submit to: **careers@macrorides.com**
