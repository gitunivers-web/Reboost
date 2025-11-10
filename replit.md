# ALTUS - Professional Loan Platform

## Overview

ALTUS is a multi-language professional loan management platform designed for business clients. It provides a comprehensive dashboard for managing loans, transfers, fees, and financial transactions. The platform emphasizes trust, clarity, and data-driven decision-making, offering features such as multi-language support (French, English, Spanish, Portuguese, Italian, German, Dutch), an interactive amortization calculator, real-time transfer tracking, external bank account management, KYC document upload, and financial analytics. Its purpose is to serve business professionals and enterprises with robust loan financing and financial management tools. The platform also includes a "How It Works" section detailing the loan application process from registration to fund disbursement, with a timeline of approximately 2-3 weeks for personal loans up to €75,000.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:** React 18 with TypeScript, Wouter for routing, Tailwind CSS with shadcn/ui for styling, Zustand for client-side state, TanStack Query for server state, React Hook Form with Zod for forms, and Vite for building.
**Design System:** Utilizes Radix UI primitives, custom HSL color system design tokens, Google Fonts, and a responsive mobile-first approach.
**Internationalization (i18n):** Custom implementation with Zustand, supporting 7 languages (FR, EN, ES, PT, IT, DE, NL). Includes type-safe translation keys, `useTranslations` hook, and IP-based automatic language detection with comprehensive country-to-language mapping.
**Theming:** Supports light/dark mode via Zustand with localStorage persistence and CSS variables.
**Component Architecture:** Follows an Atomic design approach.
**Loan Product Catalog:** Centralized data in `client/src/lib/loan-catalog.ts` for individual and business loan products, ensuring consistent presentation and i18n integration across the platform.
**Partners Section:** Displays authentic bank partner logos with a professional grayscale filter and color reveal on hover, supporting both light and dark themes.

### Backend Architecture

**Technology Stack:** Node.js with Express.js, TypeScript, Drizzle ORM, PostgreSQL (via Neon serverless driver), and Connect-pg-simple for session management.
**API Design:** RESTful API endpoints with response formatting and request logging.
**Data Layer:** Schema-first design using Drizzle ORM, type-safe operations, Zod schemas, and drizzle-kit for migrations.
**Storage Strategy:** PostgreSQL database (`DatabaseStorage`) with Neon serverless, adhering to an `IStorage` interface.
**Database Schema:** Key tables include `users`, `loans`, `transfers`, `fees`, `transactions`, `adminSettings`, `auditLogs`, `transferValidationCodes`, `transferEvents`, `adminMessages`, `externalAccounts`, and `userOtps`.
**Key Architectural Decisions:** Monorepo structure, end-to-end type safety, Vite middleware for HMR, and separate client/server builds.

### UI/UX Decisions

- Virtual bank card fixed in the bottom-right of the dashboard.
- Welcome modal displayed once after the first login.
- Fully responsive design across all pages.
- Clear feedback and loading states for user actions.
- Password strength indicators during resets.
- Profile photo upload with dual cache-busting for immediate display.

### Technical Implementations

- **Authentication:** Comprehensive forgot/reset password with email notifications and rate limiting. Email verification includes automatic login post-verification. Streamlined login flow differentiates between users with and without 2FA. TOTP-based Two-Factor Authentication (2FA) using Google Authenticator is optional and user-configurable. Single session enforcement and CSRF protection are implemented. Cross-domain session cookies are configured for production and development environments.
- **Session Management & Error Handling:** Global 401/403 interceptor redirects to login with contextual messages. `SessionMonitor` component ensures periodic session validation and inactivity detection. Automatic CSRF token cleanup and session clearing occur on authentication failures. Intelligent retry logic distinguishes network errors from authentication errors.
- **Security Features:** Includes IDOR protection, Zod validation, XSS protection, strong password requirements, UUID usernames, generic error messages, and file upload validation with magic byte verification. Comprehensive rate limiting on sensitive endpoints and encrypted 2FA secrets are also in place.
- **Loan Disbursement Workflow:** Multi-step approval process (Request -> Admin Approval -> Contract Signing -> Manual Admin Fund Disbursement) ensuring explicit admin action for disbursement and logging all actions.
- **KYC Document Upload:** Real file upload functionality via FormData with appropriate loading states and error handling.
- **Profile Photo Upload:** Utilizes Cloudinary for cloud-based image storage, including automatic transformations, secure HTTPS URLs, and cleanup of old photos.
- **Notification System:** Database-backed persistent notifications replace temporary toast messages. Features include RESTful API endpoints with CSRF and IDOR protection, user ownership enforcement at the SQL level, `NotificationBell` component with polling, unread count badges, sound alerts, and a 2FA suggestion notification system. It supports multilingual notifications with metadata interpolation for dynamic content in French, English, and Spanish. A comprehensive set of 18 distinct notification types covers all critical user events and persists across sessions.

## External Dependencies

**Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`).
**UI Component Libraries:** Radix UI, shadcn/ui, Recharts, Lucide React.
**Styling & Design:** Tailwind CSS, `class-variance-authority`, `tailwind-merge`, `clsx`.
**Form Management:** React Hook Form, Zod, `@hookform/resolvers`.
**Authentication:** SendGrid for transactional email verification.
**Two-Factor Authentication:** Speakeasy and qrcode libraries for TOTP generation and verification.
**Cloud Storage:** Cloudinary for persistent profile photo storage and delivery.