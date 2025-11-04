# ALTUS - Professional Loan Platform

## Overview

ALTUS is a multi-language professional loan management platform designed for business clients. It offers a comprehensive dashboard for managing loans, transfers, fees, and financial transactions, emphasizing trust, clarity, and data-driven decision-making. As a fintech application, it incorporates professional design patterns inspired by industry leaders, providing features like multi-language support (French, English, Spanish), an interactive amortization calculator, real-time status tracking for transfers, external bank account management, KYC document upload, and financial analytics. The platform aims to serve business professionals and enterprises seeking robust loan financing and financial management tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:** React 18 with TypeScript, Wouter for routing, Tailwind CSS with shadcn/ui for styling, Zustand for client-side state, TanStack Query for server state, React Hook Form with Zod for forms, and Vite for building.

**Design System:** Utilizes Radix UI primitives, custom design tokens with HSL color system, Google Fonts for typography (Inter/Work Sans, JetBrains Mono), and a responsive mobile-first design.

**Internationalization (i18n):** Custom implementation with Zustand for language state, supporting French (default), English, and Spanish, with language selection persisted in localStorage.

**Theming:** Light/dark mode toggle managed via Zustand with localStorage persistence and CSS variable-based color system.

**Component Architecture:** Follows an atomic design approach, separating reusable UI components, feature-specific components, and page-level components.

### Backend Architecture

**Technology Stack:** Node.js with Express.js, TypeScript, Drizzle ORM, PostgreSQL (via Neon serverless driver), and Connect-pg-simple for session management.

**API Design:** RESTful API endpoints, prefixed with `/api`, with response formatting and request logging.

**Data Layer:** Schema-first design with Drizzle ORM, type-safe operations, Zod schemas for validation, and migration support via drizzle-kit.

**Storage Strategy:** Employs a PostgreSQL database (`DatabaseStorage`) with Neon serverless for persistence. An `IStorage` interface ensures consistent API, and demo data is automatically seeded.

**Database Schema:**
```
users (id, username, password, email, fullName, accountType, role, status, kycStatus, maxLoanAmount, hasSeenWelcomeMessage, suspendedUntil, suspensionReason, externalTransfersBlocked, transferBlockReason, createdAt, updatedAt)
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

**Key Architectural Decisions:** A monorepo structure for client and server code, end-to-end type safety, Vite middleware for development HMR, and separate client/server builds for production.

## External Dependencies

**Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`).

**UI Component Libraries:** Radix UI for headless components, shadcn/ui for pre-built components, Recharts for data visualization, and Lucide React for icons.

**Styling & Design:** Tailwind CSS, `class-variance-authority`, `tailwind-merge`, and `clsx`.

**Form Management:** React Hook Form, Zod, and `@hookform/resolvers`.

**Development Tools:** Replit Plugins (runtime error modal, cartographer, dev banner), TypeScript, and ESBuild.

**Authentication:** SendGrid for transactional email verification.