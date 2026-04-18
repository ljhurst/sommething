# Documentation Structure Rule

## When Writing or Editing Markdown Files

Before creating or editing ANY `.md` file, follow these rules:

### 1. Check if Content Already Exists

**NEVER duplicate content.** Search existing docs first:

- `README.md` - Project overview
- `docs/setup/` - Setup and installation guides
- `docs/product/` - Product vision and summaries
- `.github/workflows/README.md` - CI/CD documentation
- `supabase/README.md` - Database documentation

**If content exists elsewhere:** Link to it, don't copy it.

### 2. Determine the Correct Location

Use this decision tree:

```
Is it about CI/CD, GitHub Actions, or developer workflows?
  → .github/workflows/README.md

Is it about database schema, migrations, or Supabase setup?
  → supabase/README.md

Is it a 5-minute quick start for new users?
  → docs/setup/QUICKSTART.md

Is it comprehensive setup with troubleshooting?
  → docs/setup/SETUP.md

Is it about testing the app locally?
  → docs/setup/LOCAL_TESTING_GUIDE.md

Is it product vision, philosophy, or roadmap?
  → docs/product/VISION.md

Is it a complete project overview with features and metrics?
  → docs/product/PROJECT_SUMMARY.md

Is it historical (one-time migration, old implementation notes)?
  → docs/development/archive/[filename].md

Is it a new setup topic?
  → Create in docs/setup/

Is it a new product topic?
  → Create in docs/product/

Is it the main project overview for GitHub visitors?
  → README.md (root)
```

### 3. Documentation File Purposes

#### Root Level

- **`README.md`**
  - Purpose: Project overview for GitHub visitors
  - Keep: Short (< 200 lines), scannable, up-to-date
  - Include: Overview, features, tech stack, quick start, links to detailed docs
  - Exclude: Detailed setup steps, troubleshooting, comprehensive guides

#### CI/CD

- **`.github/workflows/README.md`**
  - Purpose: How to use CI/CD, run checks locally, troubleshoot failures
  - Target: Contributors and developers
  - Location: Lives with workflow files for context

#### Database

- **`supabase/README.md`**
  - Purpose: Database schema, setup instructions, SQL migrations
  - Target: Anyone setting up the database
  - Location: Lives with migration files

#### Setup Guides (`docs/setup/`)

- **`QUICKSTART.md`** - 5-minute "just make it work" guide (< 100 lines)
- **`SETUP.md`** - Comprehensive setup with all details and troubleshooting
- **`LOCAL_TESTING_GUIDE.md`** - How to test the app locally

#### Product Docs (`docs/product/`)

- **`VISION.md`** - Product philosophy, UX goals, design principles, roadmap
- **`PROJECT_SUMMARY.md`** - Complete overview with features, tech, metrics

#### Development (`docs/development/`)

- **`archive/`** - Historical docs (migrations, snapshots, old notes)
  - Use for: One-time events, outdated but valuable info
  - Don't delete history, archive it

#### Navigation

- **`docs/README.md`**
  - Purpose: Navigation hub for all documentation
  - Update when: Adding or removing any doc in `docs/`

### 4. Writing Guidelines

**Single Responsibility:**

- Each doc covers ONE topic
- If you find yourself writing "Part 1" and "Part 2", split into separate docs

**Link, Don't Duplicate:**

```markdown
❌ BAD: Copy/paste setup instructions into multiple docs
✅ GOOD: See [Setup Guide](docs/setup/SETUP.md) for installation.
```

**Keep README Light:**

```markdown
❌ BAD: Add 50 lines of detailed troubleshooting to README
✅ GOOD: Add link to troubleshooting section in SETUP.md
```

**Context-Appropriate Location:**

```markdown
❌ BAD: CI documentation in docs/development/
✅ GOOD: CI documentation in .github/workflows/ (near workflow files)
```

**Archive, Don't Delete:**

```markdown
❌ BAD: Delete migration guide after everyone has migrated
✅ GOOD: Move to docs/development/archive/ for historical reference
```

### 5. Before Creating a New Doc

Ask yourself:

1. **Does this belong in an existing doc?** → Add a section instead
2. **Is this temporary?** → Consider if it needs a permanent doc
3. **Is this historical?** → Goes in `archive/`
4. **Will this need maintenance?** → Minimize by linking to authoritative sources
5. **Where will users look for this?** → Place it there

### 6. After Creating/Editing a Doc

1. **Update `docs/README.md`** if you added/removed a doc in `docs/`
2. **Update root `README.md`** only if it's a major new doc category
3. **Check for broken links** - run search for old filename if you renamed
4. **Format the file** - run `npm run format`

### 7. Red Flags (Don't Do This)

🚫 **Creating a doc that duplicates README.md**
🚫 **Putting CI docs anywhere except `.github/workflows/`**
🚫 **Putting DB docs anywhere except `supabase/`**
🚫 **Creating `SETUP_V2.md` instead of updating `SETUP.md`**
🚫 **Adding detailed content to README that belongs in `docs/`**
🚫 **Deleting historical docs instead of archiving them**
🚫 **Creating a new doc without checking if topic is already covered**

### 8. Quick Reference: Where Does It Go?

| Topic             | Location                            |
| ----------------- | ----------------------------------- |
| Project overview  | `README.md`                         |
| 5-min setup       | `docs/setup/QUICKSTART.md`          |
| Detailed setup    | `docs/setup/SETUP.md`               |
| Testing guide     | `docs/setup/LOCAL_TESTING_GUIDE.md` |
| Product vision    | `docs/product/VISION.md`            |
| Project summary   | `docs/product/PROJECT_SUMMARY.md`   |
| CI/CD docs        | `.github/workflows/README.md`       |
| Database setup    | `supabase/README.md`                |
| Historical docs   | `docs/development/archive/`         |
| New setup topic   | `docs/setup/[new-file].md`          |
| New product topic | `docs/product/[new-file].md`        |

## Enforcement

When writing markdown:

1. AI should suggest the correct location based on content
2. AI should warn if content appears to duplicate existing docs
3. AI should remind to update navigation docs when adding/removing files
4. AI should suggest archiving instead of deleting historical docs

## Example Decision Process

**Scenario:** "I want to document how to add a new API endpoint"

```
1. Is this covered already? → Check docs/development/ (no)
2. Is it setup-related? → No
3. Is it product vision? → No
4. Is it CI-related? → No
5. Is it a development guide? → Yes
6. Does a dev guide exist? → No
7. Decision: Create docs/development/API_GUIDE.md
8. Update docs/README.md to link to it
```

**Scenario:** "I want to document the database schema"

```
1. Is this covered already? → Check supabase/README.md (yes!)
2. Decision: Edit supabase/README.md, don't create new file
```

**Scenario:** "I want to add troubleshooting for CI failures"

```
1. Is this CI-related? → Yes
2. Where do CI docs live? → .github/workflows/README.md
3. Decision: Add section to .github/workflows/README.md
```

## Summary

- **One topic = One location** (single source of truth)
- **Context matters** (put docs near what they describe)
- **Link, don't duplicate** (DRY principle for docs)
- **README is lightweight** (overview + links)
- **Archive, don't delete** (preserve history)
- **Check first, write second** (avoid duplication)
