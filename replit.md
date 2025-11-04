# ProLoan - Professional Loan Platform

## Overview

ProLoan is a multi-language professional loan management platform designed for business clients. The application provides a comprehensive dashboard for managing loans, transfers, fees, and financial transactions with a focus on trust, clarity, and data-driven decision making. Built as a fintech application, it emphasizes professional design patterns inspired by industry leaders like Stripe and Wise.

**Key Features:**
- Multi-language support (French, English, Spanish)
- Professional loan management with interactive amortization calculator
- Transfer request processing with multi-step workflows and real-time status tracking
- External bank account management (add, view, delete IBAN accounts)
- KYC document upload for first-time loan requests
- Auto-applied interest rates based on loan product type
- Financial analytics and data visualization
- Real-time balance and borrowing capacity monitoring
- Responsive design with light/dark theme support

**Target Users:** Business professionals and enterprises seeking loan financing and financial management tools.

## Recent Changes (November 2025)

1. **Automatic Fee Payment Validation System** (Latest):
   - **Atomic Transaction Architecture**: All fee creation and payment operations wrapped in database transactions
   - **Auto-Payment on Code Usage**: Fees are automatically marked as paid when users successfully use validation codes
   - **Concurrency Protection**: Race condition guards prevent duplicate fee payments from simultaneous code validations
   - **Schema Enhancement**: Added `feeId` link in `transferValidationCodes` table for 1:1 fee-to-code relationship
   - **Transactional Helper**: `issueCodeWithNotificationAndFee()` atomically creates code + notification + fee together
   - **UI Simplification**: Removed manual "Marquer payé" button; fees now auto-validate via code consumption
   - **Production-Ready**: Architect-approved implementation with full data integrity guarantees

2. **Database Migration to PostgreSQL**:
   - Migrated from in-memory storage (`MemStorage`) to persistent PostgreSQL database (`DatabaseStorage`)
   - All data now persists across application restarts
   - Implemented using Drizzle ORM with Neon serverless PostgreSQL
   - Database initialization with comprehensive seed data for demo user
   
3. **Comprehensive Admin Management Features**:
   - **Loan Management**: Approve, reject, and delete loan requests with audit logging
   - **User Account Control**: Suspend accounts, block users, adjust borrowing capacity dynamically
   - **Transfer Validation**: Issue validation codes for multi-step transfer workflows
   - **Admin Notifications**: Send notifications to users with automatic fee generation
   - **External Transfer Control**: Block/unblock external transfers per user
   - All admin actions logged in audit trail with timestamps and admin identifiers

4. **Enhanced Fee Management System**:
   - Auto-updating fees section with real-time display after admin notifications
   - Visual indicators for unpaid fees (badges, alerts, color coding)
   - Fee payment tracking with isPaid status and paidAt timestamps
   - Admin ability to attach fees to notifications automatically
   - Automatic fee validation upon successful code usage (no manual payment required)

5. **Dashboard Enhancements**:
   - Streamlined amortization table (single instance in loans section)
   - Transfer status showing real validation code progress
   - Borrowing capacity now reflects user-specific maxLoanAmount settings
   - Auto-updating charts for available funds and upcoming repayments

6. **Smart Loan Application**: 
   - Added loan type selector with auto-applied interest rates matching Products page offers
   - Implemented conditional KYC document upload (required only for first-time users)
   - Interest rates: Personal (7.5%), Mortgage (3.2%), Auto (5.8%), Student (4.9%), Green (3.5%), Renovation (6.2%)

7. **Bank Account Management**: Created dedicated page (`/accounts`) for managing external bank accounts with IBAN/BIC validation and CRUD operations

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight React router)
- **Styling:** Tailwind CSS with shadcn/ui component library (New York style variant)
- **State Management:** Zustand for client-side state (themes, language preferences)
- **Data Fetching:** TanStack Query (React Query) for server state management
- **Forms:** React Hook Form with Zod validation via @hookform/resolvers
- **Build Tool:** Vite

**Design System:**
- Component library based on Radix UI primitives with extensive customization
- Custom design tokens defined in CSS variables (HSL color system)
- Typography system using Google Fonts (Inter/Work Sans for UI, JetBrains Mono for financial figures)
- Responsive breakpoint strategy (mobile-first, md, lg breakpoints)
- Consistent spacing primitives (Tailwind scale: 2, 4, 6, 8, 12, 16, 24)

**Internationalization (i18n):**
- Custom i18n implementation using Zustand for language state
- Translation keys stored in `client/src/lib/i18n.ts`
- Supported languages: French (default), English, Spanish
- Language selection persisted in localStorage

**Theming:**
- Light/dark mode toggle
- Theme state managed via Zustand with localStorage persistence
- CSS variable-based color system for seamless theme switching

**Component Architecture:**
- Atomic design approach with reusable UI components in `client/src/components/ui/`
- Feature-specific components in `client/src/components/`
- Page-level components in `client/src/pages/`
- Example components for development/testing in `client/src/components/examples/`

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript (ES modules)
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL (via Neon serverless driver)
- **Session Management:** Connect-pg-simple for PostgreSQL-backed sessions

**API Design:**
- RESTful API endpoints prefixed with `/api`
- Demo mode using hardcoded user ID (`demo-user-001`)
- Response formatting with comprehensive data transformation
- Request logging middleware for debugging

**Data Layer:**
- Schema-first design with Drizzle ORM
- Type-safe database operations using generated TypeScript types
- Zod schemas for runtime validation (via drizzle-zod)
- Migration support via drizzle-kit

**Storage Strategy:**
- **Production Implementation**: PostgreSQL database via `DatabaseStorage` class (server/storage.ts)
- **Database Connection**: Neon serverless PostgreSQL accessed through `server/db.ts`
- **Legacy Reference**: In-memory storage implementation (`MemStorage`) preserved as commented code for reference
- **Interface Abstraction**: `IStorage` interface ensures consistent API across storage implementations
- **Automatic Seeding**: Demo data automatically initialized on first database connection
- **Migration Management**: Database schema updates via `npm run db:push` using Drizzle Kit

**Database Schema:**
```
users (id, username, password, email, fullName, accountType, role, status, kycStatus, maxLoanAmount, suspendedUntil, suspensionReason, externalTransfersBlocked, transferBlockReason, createdAt, updatedAt)
loans (id, userId, loanType, amount, interestRate, duration, status, approvedAt, approvedBy, rejectedAt, rejectionReason, nextPaymentDate, totalRepaid, deletedAt, deletedBy, deletionReason, createdAt)
transfers (id, userId, amount, recipient, status, currentStep, validationMethod, createdAt, updatedAt)
fees (id, userId, feeType, reason, amount, relatedMessageId, isPaid, paidAt, createdAt)
transactions (id, userId, type, amount, description, createdAt)
adminSettings (id, settingKey, settingValue, description, updatedBy, updatedAt)
auditLogs (id, adminId, action, targetType, targetId, details, createdAt)
transferValidationCodes (id, transferId, sequence, code, expiresAt, usedAt, createdAt)
transferEvents (id, transferId, eventType, eventData, createdAt)
adminMessages (id, userId, subject, content, isRead, readAt, createdAt)
externalAccounts (id, userId, accountType, accountName, iban, bic, createdAt)
```

**Key Architectural Decisions:**

1. **Monorepo Structure:** Client and server code coexist with shared TypeScript types in `/shared` directory
2. **Type Safety:** End-to-end type safety from database schema to frontend components
3. **Development Mode:** Vite middleware mode for seamless HMR during development
4. **Production Build:** Separate client (Vite) and server (esbuild) builds with static file serving

### External Dependencies

**Database:**
- **Neon Serverless PostgreSQL:** Cloud-native PostgreSQL database
- Connection via `@neondatabase/serverless` driver
- Configuration through `DATABASE_URL` environment variable

**UI Component Libraries:**
- **Radix UI:** Headless component primitives for accessibility (@radix-ui/* packages)
- **shadcn/ui:** Pre-built component patterns following New York style variant
- **Recharts:** Chart library for financial data visualization (AreaChart, BarChart)
- **Lucide React:** Icon library for consistent iconography

**Styling & Design:**
- **Tailwind CSS:** Utility-first CSS framework
- **class-variance-authority:** Type-safe component variants
- **tailwind-merge & clsx:** Utility for merging Tailwind classes

**Data Visualization:**
- **Recharts:** Used for Available Funds Chart (area chart) and Upcoming Repayments Chart (bar chart)
- Custom chart configuration with theme-aware colors

**Form Management:**
- **React Hook Form:** Performance-optimized form library
- **Zod:** Schema validation library
- **@hookform/resolvers:** Zod resolver integration

**Development Tools:**
- **Replit Plugins:** Runtime error modal, cartographer (code exploration), dev banner
- **TypeScript:** Strict mode enabled with path aliases
- **ESBuild:** Fast server bundling for production

**Asset Management:**
- Generated hero images stored in `attached_assets/generated_images/`
- Google Fonts for typography (Architects Daughter, DM Sans, Fira Code, Geist Mono)

**Configuration Files:**
- `drizzle.config.ts`: Database schema and migration configuration
- `vite.config.ts`: Frontend build and dev server configuration
- `tailwind.config.ts`: Design system tokens and theme configuration
- `tsconfig.json`: TypeScript compiler options with path aliases
- `components.json`: shadcn/ui configuration

**Environment Variables Required:**
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment mode (development/production)