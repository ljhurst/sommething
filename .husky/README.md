# Git Hooks with Husky

This project uses [Husky](https://typicode.github.io/husky/) to automatically run checks before commits.

## What Runs on Commit?

The pre-commit hook (`.husky/pre-commit`) runs:

1. **lint-staged** - Formats and lints only staged files
   - Runs `eslint --fix` on TypeScript files
   - Runs `prettier --write` on all staged files
2. **Type Check** - Runs `tsc --noEmit` on entire project
3. **Tests** - Runs full test suite with `vitest --run`

## Performance

- **lint-staged** is fast - only processes files you're committing
- Type checking typically takes 2-5 seconds
- Tests run in ~1-2 seconds

Total commit time: **~5-10 seconds**

## Skipping Hooks

If you need to skip hooks (not recommended), use:

```bash
git commit --no-verify
```

## Manual Validation

Run all checks manually:

```bash
npm run validate
```

This runs type-check, format-check, lint, and tests.

## Troubleshooting

If a commit fails:

1. Fix the reported issues
2. Stage your fixes: `git add .`
3. Try committing again

### Common Issues

- **ESLint errors**: Fix the issues or run `npm run lint:fix`
- **Type errors**: Fix TypeScript errors in reported files
- **Test failures**: Fix failing tests
- **Formatting**: Run `npm run format` to auto-fix

## Updating Hooks

Hooks are automatically set up when you run `npm install` (via the `prepare` script).

If you need to reinstall:

```bash
npm run prepare
```
