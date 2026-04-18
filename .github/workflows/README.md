# GitHub Actions Workflows

## CI Workflow (`ci.yml`)

Runs on all pull requests targeting `main`.

### Steps

1. **Type Check** - TypeScript compilation check (`npm run type-check`)
2. **Format Check** - Prettier formatting validation (`npm run format:check`)
3. **Lint** - ESLint code quality checks (`npm run lint`)
4. **Unit Tests** - Vitest test suite (`npm test -- --run`)
5. **Build** - Production build verification (`npm run build`)

### Requirements

- Node.js 20
- All checks must pass for PR to be mergeable

### Local Testing

Run all checks locally before pushing:

```bash
npm run validate
```

This runs the same checks as the CI pipeline:

- `npm run type-check` - Type checking
- `npm run format:check` - Format validation
- `npm run lint` - Linting
- `npm test` - Unit tests

### Individual Checks

```bash
# Type checking
npm run type-check

# Format checking
npm run format:check

# Format fixing
npm run format

# Linting
npm run lint

# Lint fixing
npm run lint:fix

# Unit tests
npm test

# Unit tests (watch mode)
npm run test:watch

# Build
npm run build
```

### Adding Status Badge

Add this badge to your README.md (replace `username` and `repository`):

```markdown
[![CI](https://github.com/username/repository/actions/workflows/ci.yml/badge.svg)](https://github.com/username/repository/actions/workflows/ci.yml)
```

### Troubleshooting

**CI fails but passes locally:**

- Ensure you've committed all changes
- Check for OS-specific issues (CI runs on Ubuntu)
- Verify dependencies are in `package.json`, not just installed locally

**Type check fails:**

- Run `npm run type-check` locally
- Fix TypeScript errors in your code

**Format check fails:**

- Run `npm run format` to auto-fix formatting
- Commit the formatted files

**Lint check fails:**

- Run `npm run lint` to see errors
- Run `npm run lint:fix` to auto-fix where possible
- Manually fix remaining issues

**Tests fail:**

- Run `npm test` locally to debug
- Ensure all test files are committed
- Check for environment-specific test issues
