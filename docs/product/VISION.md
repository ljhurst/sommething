# Sommething - Wine Fridge Tracker Vision

## The Problem

You have a small wine fridge with 24 bottles (4 wide, 6 tall). You want to:

- Know what's currently in your fridge at a glance
- Find the right bottle for any occasion (dinner party, casual evening, gift)
- Track what you've consumed over time
- Make informed decisions when buying new bottles

## The Solution

A beautiful, intuitive wine inventory tracker that feels like looking into your actual wine fridge. No complex cellar management software. No expensive subscriptions. Just a polished, delightful tool that makes wine collection management effortless.

## Core Philosophy

### "Polished Like Fine Wine"

Every interaction should feel refined and intentional. The UI should be elegant, modern, and a pleasure to use. This isn't just a database - it's a celebration of your wine collection.

### Visual Fidelity

The main interface is a grid that directly represents your physical wine fridge. When you look at your phone or computer, you're looking into your fridge. This 1:1 mapping makes the mental model instant and intuitive.

### Progressive Enhancement

- **Mobile**: Clean, color-coded circles showing bottles from the head-on view (the punt)
- **Desktop**: Rich 3D visualization with bottles laying horizontally, labels visible
- Same grid layout, progressively more detailed based on screen size

### Frictionless Data Entry

Standing at your fridge or in a wine shop? Tap an empty slot, fill in the basics, done. The app gets out of your way and lets you get back to enjoying wine.

## User Experience Goals

### Mobile Experience (Primary)

The app is designed mobile-first because that's where you'll use it most:

- **At the fridge**: Quickly check what you have, mark bottles as consumed
- **At the store**: Search your collection, see what types you're low on
- **At a friend's house**: Find the perfect bottle to bring

**Visual Design:**

- 4×6 grid of bottle slots (4 columns, 6 rows)
- Each filled slot shows a circular bottle view (looking at the punt/bottom)
- Color-coded by wine type:
  - Red wines: Deep burgundy/crimson
  - White wines: Pale gold/straw
  - Rosé: Soft pink
  - Sparkling: Champagne gold with subtle bubble effect
  - Empty slots: Subtle gray outline or wire rack visual
- Truncated winery name overlaid on bottle
- Slot number in corner for reference

**Interactions:**

- **Tap filled bottle**: Opens detail modal
  - Full information (winery, name, year, price, score, notes)
  - Swipe left/right to navigate adjacent bottles (carousel)
  - Quick actions: Mark as Consumed, Edit, Delete
- **Tap empty slot**: Opens "Add Bottle" form with slot pre-selected
- **Long press**: Quick action menu (consume, move, edit)
- **Top bar**: Search, filter chips (Red/White/All), capacity indicator (e.g., "20/24")

### Desktop Experience

Same grid concept with enhanced visuals:

- Full 3D rendering with React Three Fiber
- Bottles laying horizontally with visible labels
- Smooth animations and hover effects
- More space for analytics and insights
- Side-by-side views (grid + analytics dashboard)

### Progressive Web App

- Installable to home screen (feels like a native app)
- Works offline (add bottles even without internet)
- Fast loading with cached data
- Syncs when connection is restored

## Feature Roadmap

### Phase 1: MVP (Core Functionality) ✅ COMPLETE

- [x] Wine fridge grid view (responsive)
- [x] Add/edit/delete bottles
- [x] Mark bottles as consumed (moves to history)
- [x] Basic search and filtering
- [x] Mobile-optimized forms
- [x] Color-coded bottle visualization

### Phase 2: Enhanced Experience ✅ COMPLETE

- [x] Desktop 3D visualization with React Three Fiber
- [x] Smooth animations and transitions
- [x] PWA configuration (offline support, installable)
- [ ] Carousel navigation in detail view
- [ ] Long-press quick actions

### Phase 3: Analytics & Insights ✅ COMPLETE

- [x] Basic statistics dashboard
  - [x] Bottles by type (chart)
  - [x] Average price per bottle
  - [x] Total inventory value
  - [x] Consumption over time
  - [x] Favorite wineries
- [ ] Export data (CSV/JSON)
- [ ] Import existing collection

### Phase 4: Multi-User & Collaboration ✅ COMPLETE

- [x] Multi-user support with authentication (Supabase Auth)
- [x] Normalized database schema (wines, spaces, bottle instances)
- [x] Multiple spaces per user (fridges, cellars, racks)
- [x] Configurable grid sizes (not hardcoded to 24)
- [x] Space sharing and collaboration (owner/editor/viewer roles)
- [x] Wine data reuse (edit once, updates everywhere)

### Phase 5: Advanced Features (Future)

- [ ] Email invites for space collaboration
- [ ] Wine deduplication UI (merge duplicate entries)
- [ ] Camera scanning for wine labels (OCR)
- [ ] Smart recommendations based on occasion
- [ ] Food pairing suggestions
- [ ] Aging tracker (optimal drinking windows)
- [ ] Wine score integration (Wine Spectator, etc.)
- [ ] Export/import data (CSV/JSON)
- [ ] Move bottles between spaces
- [ ] Space switcher UI (for users with multiple spaces)

## Technical Principles

### Test-Driven Development

Write tests first, then implementation. This ensures:

- High code quality
- Confidence in refactoring
- Clear specifications
- Fewer bugs in production

### Small, Focused Functions

- Prefer pure functions whenever possible
- Avoid massive monolithic components
- Create new modules for grouped functionality
- Keep modules focused on single responsibilities

### Type Safety

- Use TypeScript throughout
- Prefer structured types over raw objects
- Create domain objects (Bottle, ConsumptionHistory)
- Use enums for constants (WineType, Rating)

### Zero Cost

Built entirely on free tiers:

- **Vercel**: Hosting and deployment
- **Supabase**: PostgreSQL database with 500MB storage
- **Next.js**: Open source framework
- Total monthly cost: $0

## Design Inspiration

Think:

- Apple's design language (clean, minimal, intentional)
- Wine tasting rooms (elegant, refined, warm)
- High-end wine apps (Vivino, Delectable) but simpler
- Physical wine fridges (the grid, the organization)

Avoid:

- Cluttered interfaces
- Too many options/settings
- Complex navigation
- Slow loading times
- Generic database UIs

## Success Metrics

The app is successful when:

1. You reach for your phone instead of opening the fridge
2. You confidently pick the right bottle for any occasion
3. You discover patterns in your wine preferences
4. Friends ask "what app is that?" when they see it
5. Adding a bottle takes < 30 seconds
6. You actually enjoy managing your collection

## Long-Term Vision

Start with a small wine fridge (24 bottles). Prove the concept. Make it delightful. Then expand:

- Support for larger collections
- Multiple storage locations (fridge, cellar, rack)
- Community features (share collections, recommendations)
- Sommelier AI assistant
- Wine shop integration (scan to add, price tracking)

But always maintain the core principle: **elegant simplicity**.

---

_"In wine, there's truth. In this app, there's clarity."_
