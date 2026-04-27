# Sommething 🍷

[![CI](https://github.com/ljhurst/sommething/actions/workflows/ci.yml/badge.svg)](https://github.com/ljhurst/sommething/actions/workflows/ci.yml)
[![Vercel Deployment](https://img.shields.io/github/deployments/ljhurst/sommething/production?label=vercel&logo=vercel)](https://vercel.com/ljhursts-projects/sommething)

**Live App**: [https://sommething.vercel.app/](https://sommething.vercel.app/)

A beautiful, intuitive wine fridge inventory tracker for your 24-bottle wine fridge (4 wide × 6 tall). Know what's in your collection, find the perfect bottle for any occasion, and track your wine journey over time.

## Overview

Sommething is a Progressive Web App that helps you manage your wine collection with elegance and ease. The interface mimics looking into your actual wine fridge - a visual 4×6 grid where each slot represents a physical bottle position.

**Mobile**: Color-coded bottle circles (head-on view)  
**Desktop**: Rich 3D visualization with horizontal bottles  
**Always**: Fast, intuitive, and delightful to use

## Features

- **Visual Wine Fridge Grid**: Configurable grid representing your physical fridge (default 4×6 = 24 slots)
- **Multi-User Authentication**: Secure user accounts with Supabase Auth
- **Space Collaboration**: Share your fridge with household members (owner/editor/viewer roles)
- **Wine Database**: Normalized schema - edit wine details once, updates everywhere
- **Wine Reuse**: Search existing wines when adding bottles to prevent duplicates
- **Quick Add**: Tap empty slot → add bottle directly to that position
- **Smart Search**: Filter by type, winery, price, or score
- **Consumption Tracking**: Mark bottles as consumed, add tasting notes and ratings
- **Analytics Dashboard**: Insights into your collection and drinking patterns (current + all-time)
- **Multiple Spaces**: Support for multiple fridges, cellars, or racks per user
- **Offline Support**: PWA works without internet, syncs when connected
- **Zero Cost**: Built on free tiers (Vercel + Supabase)

## Tech Stack

- **Next.js 16.2** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Three Fiber** - 3D visualization (desktop)
- **Framer Motion** - Smooth animations
- **Supabase** - PostgreSQL database + REST API
- **Vitest** - Fast unit testing
- **React Testing Library** - Component testing

## Getting Started

### Quick Start (5 minutes)

```bash
# 1. Install
npm install

# 2. Set up Supabase (see docs/setup/QUICKSTART.md)
# 3. Create .env.local with your Supabase credentials

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your wine fridge.

For detailed instructions, see the [Setup Guide](docs/setup/SETUP.md).

## Development

```bash
# Run dev server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Format code
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check

# Run all checks (type-check + format + lint + test)
npm run validate

# Build for production
npm run build

# Start production server
npm start
```

### Pre-Commit Hooks

This project uses Husky to run checks before every commit:

- Format and lint staged files (auto-fixes issues)
- Type check entire project
- Run all tests

Hooks run automatically on `git commit`. See [.husky/README.md](.husky/README.md) for details.

See [CI/CD Documentation](.github/workflows/README.md) for all available commands and checks.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main wine fridge view
│   └── analytics/         # Analytics dashboard
├── components/             # React components
│   ├── WineFridgeGrid.tsx # Main grid container
│   ├── BottleSlot.tsx     # Individual bottle slot
│   ├── BottleCircle.tsx   # Mobile bottle view (2D)
│   ├── Bottle3D.tsx       # Desktop 3D bottle
│   ├── WineFridge3D.tsx   # 3D fridge view
│   ├── AddBottleModal.tsx # Add wine + bottle form
│   ├── BottleDetailModal.tsx # Bottle details + consume
│   └── AuthModal.tsx      # Authentication
├── lib/                    # Utilities and helpers
│   ├── supabase.ts        # Database client
│   ├── types.ts           # TypeScript types (normalized schema)
│   ├── utils.ts           # Helper functions
│   └── analytics.ts       # Analytics calculations
└── hooks/                  # Custom React hooks
    ├── useBottles.ts      # Bottle instance management (space-specific)
    ├── useWines.ts        # Wine vintage CRUD operations
    ├── useSpaces.ts       # Space management + collaboration
    └── useConsumption.ts  # Consumption tracking

tests/                      # Test files (mirrors src/)
supabase/migrations/        # Database migrations
```

## Testing

125 unit tests covering utilities, components, hooks, and analytics. Run with `npm test`.

See [Local Testing Guide](docs/setup/LOCAL_TESTING_GUIDE.md) for details.

## Design Principles

- **Mobile-first** - Optimize for phone, enhance for desktop
- **Visual fidelity** - Grid represents your actual fridge
- **Progressive enhancement** - 2D on mobile, 3D on desktop

See [Vision](docs/product/VISION.md) for full product philosophy.

## Documentation

📚 **[Browse all documentation →](docs/)**

Quick links:

- [5-Minute Quick Start](docs/setup/QUICKSTART.md)
- [Full Setup Guide](docs/setup/SETUP.md)
- [Product Vision](docs/product/VISION.md)
- [CI/CD Guide](.github/workflows/README.md)

## Contributing

This is a personal project, but suggestions and feedback are welcome! Open an issue to discuss potential changes.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

Built with love for wine enthusiasts who appreciate both fine wine and fine software.

---

_"What's in my wine fridge? Now I know."_
