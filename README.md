# Interactive Gantt Chart Demo

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)](https://tailwindcss.com/)

A modern, interactive Gantt chart application built with Next.js 15, React 19, and TypeScript. This demo showcases advanced project timeline management with drag & drop functionality, period editing, and real-time updates.

## ✨ Features

- **🎯 Interactive Timeline**: Drag & drop to select date ranges with full-day precision
- **📝 Period Management**: Add and edit project periods with modal forms
- **🏷️ Smart Tagging**: 5 preset tags with color coding (Development, Design, Testing, Review, Release)
- **📅 Date Handling**: Intuitive calendar interface with auto-closing popovers
- **🔄 Real-time Updates**: Live period highlighting during form interactions
- **📊 20 Sample Tasks**: Comprehensive dataset for testing layout and functionality
- **♿ Accessibility**: Full keyboard navigation and screen reader support
- **📱 Responsive Design**: Fixed header with optimized scrolling behavior
- **🎨 Modern UI**: shadcn/ui components with Tailwind CSS styling

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (required - enforced via preinstall script)
- Node.js 18+ (for Bun compatibility)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd next-gantt-playground

# Install dependencies (uses Bun automatically)
bun install

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the interactive Gantt chart demo.

### Available Scripts

```bash
# Development
bun dev          # Start development server with Turbopack
bun build        # Build for production
bun start        # Start production server

# Code Quality
bun format       # Format code with Biome
bun lint         # Run linting
bun lint:fix     # Fix linting issues automatically
bun check        # Run format and lint together
```

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19 with TypeScript strict mode
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State Management**: Zustand with typed stores
- **Form Handling**: React Hook Form + Zod validation
- **Date Library**: date-fns for calculations and formatting
- **Icons**: Lucide React
- **Notifications**: Sonner for toast messages
- **Code Quality**: Biome (linting/formatting) + Lefthook (git hooks)

### Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Main Gantt chart page
├── components/
│   ├── gantt/             # Gantt chart components
│   │   ├── GanttChart.tsx # Main chart container
│   │   ├── Timeline.tsx   # Date header timeline
│   │   ├── TaskList.tsx   # Task list with periods
│   │   ├── TaskRow.tsx    # Individual task row
│   │   ├── DateRange.tsx  # Period visualization
│   │   ├── AddPeriodModal.tsx   # New period form
│   │   └── EditPeriodModal.tsx  # Edit period form
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── stores/            # Zustand state management
│   ├── types/             # TypeScript definitions
│   ├── data/              # Demo data (20 sample tasks)
│   └── utils.ts           # Utility functions
└── docs/                  # Technical documentation
```

## 🎮 Usage

### Basic Operations

1. **View Timeline**: Navigate through 2 months of project timeline starting 1 week before today
2. **Add Periods**: Drag across dates to select a range, then fill out the modal form
3. **Edit Periods**: Click on any existing period to open the edit modal
4. **Scroll Navigation**: Use mouse wheel with Shift key for horizontal scrolling
5. **Form Interaction**: Watch real-time period highlighting as you change dates

### Keyboard Accessibility

- `Tab` / `Shift+Tab`: Navigate between interactive elements
- `Enter` / `Space`: Activate buttons and select dates
- `Escape`: Close modals and popovers
- Arrow keys: Navigate within calendar components

## 🔧 Development

### Code Quality Standards

- TypeScript strict mode enabled
- No `any` types allowed
- Biome for consistent formatting and linting
- Comprehensive error handling
- Accessibility-first approach

### Key Implementation Details

- **Layout Control**: Flexbox-based layout with fixed header and scrollable content
- **Scroll Synchronization**: Timeline and content area scroll in perfect sync
- **Form Validation**: Real-time validation with clear error messages
- **State Management**: Centralized Zustand store with typed actions
- **Performance**: Optimized rendering for 20+ tasks without virtualization

## 📚 Documentation

- [Layout Control Logic](./docs/layout-control-logic.md) - Detailed explanation of the responsive layout system
- [CLAUDE.md](./CLAUDE.md) - AI development guidelines and project specifications

## 🤝 Contributing

1. Follow the existing code style (Biome will enforce this)
2. Use conventional commit messages with prefixes (feat, fix, refactor, etc.)
3. Ensure all TypeScript diagnostics are resolved
4. Test accessibility features with keyboard navigation
5. Run `bun check` before committing

## 📄 License

This project is for demonstration purposes. See individual package licenses for dependencies.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand State Management](https://zustand-demo.pmnd.rs/)

---

**Demo Badge**: ⚡ This is an interactive demonstration showcasing modern React development practices and UI/UX patterns for project management applications.
