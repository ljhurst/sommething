# Sommething 🍷

[![CI](https://github.com/ljhurst/sommething/actions/workflows/ci.yml/badge.svg)](https://github.com/ljhurst/sommething/actions/workflows/ci.yml)

A beautiful, intuitive wine fridge inventory tracker for your 24-bottle wine fridge (4 wide × 6 tall). Know what's in your collection, find the perfect bottle for any occasion, and track your wine journey over time.

## Overview

Sommething is a Progressive Web App that helps you manage your wine collection with elegance and ease. The interface mimics looking into your actual wine fridge - a visual 4×6 grid where each slot represents a physical bottle position.

**Mobile**: Color-coded bottle circles (head-on view)  
**Desktop**: Rich 3D visualization with horizontal bottles  
**Always**: Fast, intuitive, and delightful to use

## Features

- **Visual Wine Fridge Grid**: 24-slot grid (4×6) representing your physical fridge
- **Quick Add**: Tap empty slot → add bottle directly to that position
- **Smart Search**: Filter by type, winery, price, or score
- **Consumption Tracking**: Mark bottles as consumed, add tasting notes
- **Analytics Dashboard**: Insights into your collection and drinking patterns
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

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── WineFridgeGrid.tsx # Main grid container
│   ├── BottleSlot.tsx     # Individual bottle slot
│   ├── BottleCircle.tsx   # Mobile bottle view
│   └── Bottle3D.tsx       # Desktop 3D bottle
├── lib/                    # Utilities and helpers
│   ├── supabase.ts        # Database client
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Helper functions
└── hooks/                  # Custom React hooks
    ├── useBottles.ts      # Bottle data management
    └── useConsumption.ts  # Consumption tracking

tests/                      # Test files (mirrors src/)
```

## Testing Philosophy

We follow Test-Driven Development (TDD):

1. Write tests first
2. Implement minimal code to pass tests
3. Refactor while keeping tests green

Focus on testing public APIs and user-facing functionality. Keep tests simple and focused.

## Design Principles

- **Mobile-first**: Optimize for phone, enhance for desktop
- **Visual fidelity**: The grid represents your actual fridge
- **Fast input**: Minimize taps and typing
- **Progressive enhancement**: 2D circles on mobile, 3D on desktop
- **Test-driven**: Quality and maintainability through tests
- **Small, focused functions**: Avoid monolithic code

## Documentation

All documentation is organized in the [`docs/`](docs/) folder:

### Setup & Getting Started

- **[Quick Start Guide](docs/setup/QUICKSTART.md)** - Get running in 5 minutes
- **[Setup Guide](docs/setup/SETUP.md)** - Detailed setup, troubleshooting, and deployment
- **[Local Testing Guide](docs/setup/LOCAL_TESTING_GUIDE.md)** - Testing locally

### Product & Vision

- **[Vision](docs/product/VISION.md)** - Product philosophy, UX goals, and roadmap
- **[Project Summary](docs/product/PROJECT_SUMMARY.md)** - Complete project overview

### Development

- **[Implementation Status](docs/development/IMPLEMENTATION_STATUS.md)** - What's built and tested
- **[Migration Notes](docs/development/MIGRATION_24_BOTTLES.md)** - Migration history

## Contributing

This is a personal project, but suggestions and feedback are welcome! Open an issue to discuss potential changes.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

Built with love for wine enthusiasts who appreciate both fine wine and fine software.

---

_"What's in my wine fridge? Now I know."_
