# Build Tools and Package Management

## Core Principle

**Fix errors properly. Never silence, ignore, or work around them.**

## Guidelines

### 1. Research First, Don't Assume

- **DO NOT** rely on memory of package versions or configurations
- **DO** search the web for current best practices and latest stable versions
- **DO** check official documentation for breaking changes and migration guides
- **DO** verify compatibility between packages using their official docs

### 2. Use Modern Standards

- **DO** use the latest stable versions of build tools unless there's a documented reason not to
- **DO** follow the official migration guides when upgrading major versions
- **DO NOT** downgrade to older versions just because you're familiar with them
- **DO** embrace new configuration formats (e.g., ESLint flat config, not legacy .eslintrc)

### 3. Fix Root Causes

- **DO NOT** use `--force`, `--legacy-peer-deps`, or similar flags as the first solution
- **DO NOT** silence warnings with comments or config unless absolutely necessary
- **DO** understand what the error is telling you and fix the underlying issue
- **DO** resolve peer dependency conflicts by finding compatible versions

### 4. Package Version Management

When dealing with version conflicts:

1. Check the official compatibility matrix or documentation
2. Find versions that naturally work together
3. Use `npm install package@latest` to get current stable versions
4. Only use specific version constraints when required by dependencies

### 5. Search Strategy

When encountering build tool errors:

1. Search: `[tool name] [error message] [current year]`
2. Check official GitHub issues and discussions
3. Review changelog and migration guides
4. Verify solution on Stack Overflow (check date - prefer recent answers)
5. Test the modern approach before falling back to workarounds

## Examples

### ❌ Bad Approach

```bash
# Getting an ESLint v9 error
npm install eslint@8 --save-dev  # Downgrading to remembered version
```

### ✅ Good Approach

```bash
# Getting an ESLint v9 error
# 1. Search: "eslint v9 configuration 2026"
# 2. Find: ESLint v9 uses flat config (eslint.config.js)
# 3. Create proper flat config following official migration guide
# 4. Keep ESLint at latest stable version
```

### ❌ Bad Approach

```bash
# Peer dependency warning
npm install --legacy-peer-deps  # Ignoring the issue
```

### ✅ Good Approach

```bash
# Peer dependency warning
# 1. Understand what packages are conflicting
# 2. Check if one package has a newer version that's compatible
# 3. Update to compatible versions
# 4. Only use --legacy-peer-deps if genuinely required by the ecosystem
```

### ❌ Bad Approach

```typescript
// TypeScript error about types
// @ts-ignore  // Silencing the error
const result = riskyOperation();
```

### ✅ Good Approach

```typescript
// TypeScript error about types
// 1. Install correct @types package
// 2. Or properly type the operation
// 3. Fix the actual type issue
const result: ExpectedType = riskyOperation();
```

## When to Break These Rules

Only deviate from these principles when:

- You've thoroughly researched and documented why the modern approach doesn't work
- There's a known, unresolved bug in the latest version affecting your use case
- The project explicitly requires older versions for compatibility reasons
- You've found consensus in the community that the workaround is currently necessary

In these cases, document the reasoning in code comments or project documentation.

## Summary

**The goal is a clean, modern, maintainable build setup that works without hacks.**

If you're adding flags, ignoring warnings, or downgrading packages, you're probably solving the wrong problem. Take the time to understand and fix it properly.
