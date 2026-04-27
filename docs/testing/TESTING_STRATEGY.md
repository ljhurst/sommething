# Testing Strategy

## Overview

This document outlines the testing approach for the Sommething wine management application. Our strategy focuses on achieving meaningful coverage through targeted tests of high-leverage code, without over-testing or creating brittle tests.

## Test Coverage Summary

Current coverage: **108 passing tests** across multiple layers

## Testing Layers

### 1. Unit Tests

Unit tests focus on testing individual functions and modules in isolation.

#### Pure Functions (`tests/lib/`)

- `utils.test.ts` (32 tests) - Business logic for bottle/space calculations, formatting
- `analytics.test.ts` (12 tests) - Consumption analytics and statistics
- `types.test.ts` (6 tests) - Type guards and validation
- `supabase.test.ts` (3 tests) - Supabase client initialization

**Why these?** Pure functions are easy to test, stable, and form the core business logic.

#### React Hooks (`tests/hooks/`)

- `useBottles.test.ts` (11 tests) - CRUD operations for bottles, auth state handling
- `useConsumption.test.ts` (10 tests) - Consumption transactions, history fetching
- **Coverage:** Auth state changes, error handling, data mutations

**Why these?** Hooks contain critical data management logic and are well-suited for unit testing without UI concerns.

#### Context (`tests/contexts/`)

- `AuthContext.test.tsx` (12 tests) - Auth provider, session management, hooks

**Why this?** Auth is foundational to the entire app and has clear, testable states.

### 2. Component Tests

Limited to simple, stable UI components.

#### Basic Components (`tests/components/`)

- `BottleCircle.test.tsx` (5 tests) - Bottle visual representation
- `EmptySlot.test.tsx` (3 tests) - Empty slot rendering

**Why only these?** Most React components are better tested through integration or E2E tests. These two are simple, pure presentation components that benefit from unit tests.

**What we're NOT testing:**

- Complex form components (better suited for integration tests)
- Modal dialogs (UI interaction heavy)
- Layout components (visual, not logical)

### 3. Smoke Tests

Quick sanity checks to catch broken imports.

#### Module Imports (`tests/smoke/`)

- `imports.test.ts` (14 tests) - Verifies all major modules can be imported

**Why these?** Catches broken imports, missing dependencies, or circular dependencies quickly and cheaply.

## What We Don't Test (And Why)

### UI Components

Most React components are **not unit tested** because:

- They're better suited for integration or E2E tests
- UI tests are brittle and require frequent updates
- Visual behavior is better verified by humans or visual regression tools

### Integration Tests

We attempted to add MSW-based integration tests but found:

- Mocking Supabase auth is complex and error-prone
- Hook tests already provide good coverage of data flow
- The complexity doesn't justify the benefit

**Future approach:** Consider Playwright or Cypress for true end-to-end testing when needed.

### 100% Coverage

We deliberately avoid 100% coverage because:

- High coverage doesn't equal high value
- Over-testing creates maintenance burden
- Some code (error handlers, edge cases) is better tested manually

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Test Principles

1. **Test public APIs, not implementation** - Focus on what the code does, not how
2. **Few, targeted tests over many brittle tests** - Quality over quantity
3. **Add tests when you find bugs** - Let failures guide test additions
4. **Keep tests maintainable** - Tests are code too

## When to Add Tests

- **Always:** New hooks, utility functions, core business logic
- **Sometimes:** Complex UI interactions (consider E2E instead)
- **Rarely:** Simple presentational components
- **Never:** Implementation details, private functions covered by public tests

## Future Considerations

- **E2E Tests:** Use Playwright/Cypress for critical user flows:
  - Auth flow (sign up, sign in, sign out)
  - Add bottle flow (search wine, add bottle to slot)
  - Consume bottle flow (select bottle, rate, consume)

- **Visual Regression:** Consider tools like Percy or Chromatic for UI changes

- **Performance Testing:** Monitor app performance as it grows
