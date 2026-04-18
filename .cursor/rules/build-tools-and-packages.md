# Build Tools and Package Management

## Philosophy

When encountering errors with build tools and packages, always fix them properly using modern best practices. Never silence, ignore, or work around them with quick fixes.

## Key Principles

1. **Don't Silence Errors** - Warnings and errors from build tools exist for a reason
2. **Don't Downgrade Without Research** - Avoid downgrading to versions you remember
3. **Search for Modern Standards** - Use web search to find current best practices and latest stable versions
4. **Follow Official Documentation** - Prioritize official docs over Stack Overflow when available

## Examples

### Good Approaches

- Researching the latest ESLint configuration format when upgrading
- Finding the current recommended way to configure TypeScript with ESLint
- Checking npm/GitHub for the latest stable version of a package
- Reading migration guides when major versions change

### Bad Approaches

- Adding `// @ts-ignore` or `eslint-disable` comments
- Downgrading packages without understanding why
- Using deprecated configuration formats
- Silencing warnings with empty catch blocks

## When to Search

- Encountering peer dependency conflicts
- Build tool configuration errors
- Version compatibility issues
- Deprecation warnings
- Migration between major versions

## Resolution Process

1. **Understand the Error** - Read the full error message carefully
2. **Search Current Docs** - Check official documentation first
3. **Find Latest Standards** - Look for current best practices (include year in search)
4. **Test the Solution** - Verify the fix resolves the issue properly
5. **Document if Needed** - Add comments explaining non-obvious solutions
