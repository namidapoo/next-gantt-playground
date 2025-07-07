# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
# Start development server with Turbopack
bun dev

# Build for production
bun build

# Start production server
bun start
```

### Package Management

```bash
# Add a dependency
bun i <package>

# Add a dev dependency
bun i -D <package>
```

### Code Quality

```bash
# Format code with Biome
bun format

# Run linting
bun lint

# Fix linting issues automatically
bun lint:fix

# Run format and lint together
bun check
```

## Architecture Overview

This is a Next.js 15 gantt chart application using App Router with React 19. The project emphasizes type safety with TypeScript strict mode and uses modern tooling.

### Key Technical Decisions

1. **Package Manager**: Bun is enforced via preinstall script - do not use npm/yarn/pnpm
2. **Code Quality**: Biome replaces ESLint/Prettier, with automatic formatting on pre-commit via Lefthook
3. **Styling**: Tailwind CSS v4 with shadcn/ui components (New York style)
4. **Type Safety**: TypeScript strict mode enabled, `any` types prohibited
5. **Path Aliases**: Use `@/*` for imports from project root

### Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/ui/` - shadcn/ui components
- `lib/utils.ts` - Utility functions including `cn()` for className merging

### Gantt Chart Requirements

The application implements a gantt chart with these specifications:

1. **Timeline**: X-axis shows 2 months starting from 1 week before today
2. **Tasks**: Y-axis displays task items vertically
3. **Interactions**:
   - Drag & drop to select date ranges (full-day units)
   - Modal for adding notes with pre-filled start/end dates
   - Items can be added but not deleted or reordered
4. **Tags**: Preset tags with fixed 1:1 color mapping

### Planned Technologies (Not Yet Implemented)

- **State Management**: Zustand
- **Data Fetching**: SWR
- **Date Handling**: Day.js or date-fns
- **Testing**: Vitest + Testing Library
- **Drag & Drop**: react-dnd or native implementation

### Development Guidelines

1. **Commits**: Always use prefixes (feat, fix, refactor, etc.) in commit messages
2. **VS Code Integration**: Check diagnostics with `mcp__ide__getDiagnostics` before completing tasks
3. **Accessibility**: Screen reader support is mandatory for all interactive elements
4. **Performance**: Consider virtualization for rendering optimization with large datasets
