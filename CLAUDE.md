# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CIPHER is a dark/hacking-themed interactive web project built with React 19 and Vite. It features a dark/neon visual style with 3D graphics, animations, and interactive visualizations. The project is designed as an interactive deck with 15 pages showcasing various visual effects.

## Development Commands

```bash
# Start development server (opens at http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Core Structure
- **src/App.jsx**: Main router with 15 page routes (/p/1 through /p/15) and home carousel
- **src/main.jsx**: React 19 entry point with strict mode and router setup
- **src/components/**: Reusable UI components
- **src/pages/**: Individual page implementations (Page01.jsx through Page15.jsx)

### Key Components
- **ArcCarousel**: 3D arc-style carousel for homepage navigation with neon effects and drag/scroll interaction
- **LiveBackground**: Parallax background system with drift animation and mouse tracking
- **BackButton**: Navigation component with neon styling

### Visual System
- **Theme**: Dark hacker aesthetic with neon green accent (#00ff9d)
- **CSS Variables**: Centralized in index.css (--bg, --text, --accent, --mx/--my for parallax)
- **Animation**: Framer Motion, GSAP, React Spring for complex animations
- **3D Graphics**: React Three Fiber with Drei helpers and post-processing

### Page Structure Pattern
Each page follows this structure:
- Import BackButton component
- Wrap content in full-height container
- Use BackButton for navigation
- Implement specific interactive visualization

### Build Configuration
- **Vite plugins**: GLSL shaders, SVG React components, image optimization
- **Asset handling**: GLB/GLTF 3D models, HDR environment maps
- **Development**: Auto-open on port 5173

### State Management
- **Zustand**: Lightweight state management for complex interactions
- **React Router**: Client-side routing for page navigation

### Special Features
- **PCAP Processing**: Page01 includes network packet visualization with real PCAP file parsing
- **Interactive Canvas**: Custom 2D canvas implementations for data visualization
- **Motion Preferences**: Respects prefers-reduced-motion for accessibility

### File Organization
- Components are co-located with their specific functionality
- Pages are numbered sequentially (Page01-Page15)
- Public assets in /public/images/ and /public/pcaps/
- All styling centralized in index.css with CSS custom properties