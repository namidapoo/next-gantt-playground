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

This is a Next.js 15 interactive Gantt chart demo application using App Router with React 19. The project emphasizes type safety with TypeScript strict mode and uses modern tooling to create a comprehensive project management timeline interface.

### Key Technical Decisions

1. **Package Manager**: Bun is enforced via preinstall script - do not use npm/yarn/pnpm
2. **Code Quality**: Biome replaces ESLint/Prettier, with automatic formatting on pre-commit via Lefthook
3. **Styling**: Tailwind CSS v4 with shadcn/ui components (New York style)
4. **Type Safety**: TypeScript strict mode enabled, `any` types prohibited
5. **Path Aliases**: Use `@/*` for imports from project root

### Project Structure

- `app/` - Next.js App Router pages and layouts (root page displays Gantt chart)
- `components/gantt/` - Gantt chart specific components
- `components/ui/` - shadcn/ui components
- `lib/stores/` - Zustand state management
- `lib/types/` - TypeScript type definitions
- `lib/data/` - Initial demo data (20 sample tasks)
- `docs/` - Technical documentation

### Implemented Features

The application implements a fully interactive Gantt chart with these specifications:

1. **Timeline**: X-axis shows 2 months starting from 1 week before today
2. **Tasks**: Y-axis displays 20 sample task items with vertical scrolling
3. **Layout**: Fixed header with scrollable content area, responsive design
4. **Period Management**:
   - Drag & drop to select date ranges (full-day units)
   - Add new periods with modal form including notes and tags
   - Edit existing periods by clicking on them
   - Real-time period highlighting during form interaction
   - Auto-closing calendar popovers after date selection
5. **Tags**: 5 preset tags with fixed color mapping (Development, Design, Testing, Review, Release)
6. **Form Validation**: React Hook Form + Zod with date range validation
7. **Accessibility**: Proper ARIA labels, keyboard navigation, screen reader support
8. **Scroll Synchronization**: Timeline and content horizontal scroll sync
9. **Error Handling**: Form field warnings resolved, proper TypeScript typing

### Implemented Technologies

- **State Management**: Zustand with typed stores
- **Date Handling**: date-fns for formatting and calculations
- **Form Management**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui with custom styling
- **Icons**: Lucide React icon library
- **Notifications**: Sonner for toast messages
- **Drag & Drop**: Native HTML5 drag implementation

### Development Guidelines

1. **Commits**: Always use prefixes (feat, fix, refactor, etc.) in commit messages
2. **VS Code Integration**: Check diagnostics with `mcp__ide__getDiagnostics` before completing tasks
3. **Accessibility**: Screen reader support is mandatory for all interactive elements
4. **Performance**: Consider virtualization for rendering optimization with large datasets
