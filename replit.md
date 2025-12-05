# Solventis Group - Professional Loan Platform

## Overview

Solventis Group is a multi-language professional loan management platform for business clients, offering a comprehensive dashboard for managing loans, transfers, fees, and financial transactions. It supports multiple languages (French, English, Spanish, Portuguese, Italian, German, Dutch) and includes features like an interactive amortization calculator, real-time transfer tracking, external bank account management, KYC document upload, and financial analytics. The platform aims to provide robust tools for loan financing and financial management, ensuring a secure environment for financial operations.

## User Preferences

Preferred communication style: Simple, everyday language. High standards for security, SEO, and code quality - all implementations must be production-ready.

## Recent Changes (December 5, 2025)

- **Complete Rebranding to Solventis Group:** Finished the migration from "Altus Finances Group" to "Solventis Group":
  - Server configuration files (server/index.ts, server/routes.ts, server/chat-socket.ts)
  - Cookie domains and CORS origins updated to solventisgroup.org
  - Contract generator HTML templates and stamps updated
  - CSS variables renamed from altus-* to solventus-* (theme.css)
  - Tailwind utility classes updated across all frontend components
  - Premium UI components (ButtonPremium, TopbarPremium, InfoBarPremium)
  - Authentication page (Auth.tsx) styling updated
  - Manifest files and SEO metadata updated
  - All documentation updated

## Recent Changes (December 4, 2025)

- **Brand Renaming:** Renamed "Altus Finances Group" to "Solventis Group" across all visible text (535 replacements):
  - i18n translations (Hero section, testimonials, FAQ, terms, etc.)
  - Contact and Settings pages
  - Email templates
  - 2FA authentication messages
  - Contract generator
  - Video subtitles (all 7 languages)
- **French Translation Quality Improvement:** Complete rewrite of French translations for improved quality and natural language (Batches 19-28).

## Recent Changes (December 3, 2025)

- **Mobile Responsiveness Overhaul:** Comprehensive mobile-first improvements to all dashboard modals and dialogs:
  - Enhanced base Dialog component with proper viewport margins (`w-[calc(100vw-1rem)]`), max-height scrolling, and responsive padding
  - Improved Slider component with larger touch targets (`h-6 w-6`), `touch-pan-y` support for better mobile scrolling, and `touch-manipulation` cursor
  - Fixed LoanRequestModal layout to prevent content overflow on narrow screens with proper flex constraints
  - Applied consistent responsive patterns across 10+ modal components including NewLoanDialog, NewTransferDialog, WelcomeMessage, TransactionHistoryDialog, CardTermsDialog, LoanDetailsDialog, BankCardOffer, and BankAccounts page modal
  - All modals now use `box-border` and overflow handling to prevent horizontal cutoff issues

## Recent Changes (December 2, 2025)

- **Tier-Based Borrowing Capacity:** Enhanced the TIER system to include borrowing capacity limits based on user tier:
  - Bronze: 500,000€ max, 1 active loan
  - Silver: 750,000€ max, 2 active loans
  - Gold: 1,000,000€ max, 3 active loans
  - Business/Professional accounts: Always 2,000,000€ regardless of tier
  - Formula: Available = Max capacity of TIER - Total of non-terminal loans
  - Terminal statuses (that free capacity): rejected, cancelled, completed, closed, repaid, defaulted, written_off
- **Loan Visibility Fix:** Fixed bug where loans disappeared after admin approval. Loans now remain visible in "pending" tab until funds are released and available for transfer. Only then do they move to "active" status.
- **Loan Filtering Logic:** Updated IndividualLoans.tsx, ActiveLoans.tsx, and AppSidebar.tsx to use consistent filtering:
  - Active loans: Only shows loans with status 'active' (funds released)
  - Pending loans: Shows all loans except terminal statuses (active, rejected, cancelled, completed, closed, repaid, defaulted, written_off)

## Recent Changes (December 1, 2025)

- **Transfer Menu Redesign:** Removed "Transfert en attente" status - now displays only "Transfert en cours" (in-progress, funds available) and "Transfert Terminé" (completed, 100% transfer).
- **Dashboard Borrowed Amount:** Immediately displays borrowed amount when user submits a loan request (includes "pending" loans, not just "active").
- **Admin Pages Real-Time Updates:** Added auto-refresh polling (refetchInterval: 2000) to AdminLoans, AdminTransfers, and AdminReports pages with refetchIntervalInBackground: true for continuous updates even when tab is not focused.
- **PDF Filename Translation:** Fully translated amortization schedule filenames based on user language (tableau-amortissement-FR, amortization-schedule-EN, tabla-amortizacion-ES, etc.).

## System Architecture

### Frontend Architecture

**Technology Stack:** React 18 (TypeScript), Wouter, Tailwind CSS (with shadcn/ui), Zustand, TanStack Query, React Hook Form (with Zod), Vite.
**Design System:** Radix UI primitives, custom HSL color system, Google Fonts, responsive mobile-first approach.
**Internationalization (i18n):** Custom Zustand-based solution for 7 languages, type-safe translation keys, IP-based language detection.
**Theming:** Light/dark mode support via Zustand with localStorage persistence.

### Backend Architecture

**Technology Stack:** Node.js (Express.js, TypeScript), Drizzle ORM, PostgreSQL (Neon serverless driver), Connect-pg-simple.
**API Design:** RESTful API with response formatting and request logging.
**Data Layer:** Schema-first design using Drizzle ORM, type-safe operations, Zod schemas, drizzle-kit for migrations.
**Storage Strategy:** PostgreSQL (`DatabaseStorage`) with Neon serverless, adhering to an `IStorage` interface.
**Database Schema:** Includes tables for `users`, `loans`, `transfers`, `fees`, `transactions`, `adminSettings`, `auditLogs`, `transferValidationCodes`, `transferEvents`, `adminMessages`, `externalAccounts`, `userOtps`, and `kycDocuments`.

### UI/UX Decisions

- Virtual bank card fixed in the bottom-right of the dashboard.
- Welcome modal after first login.
- Fully responsive design.
- Clear feedback and loading states.
- Password strength indicators.
- Profile photo upload with cache-busting.
- Homepage hero carousel with premium banking images and animations.
- Professional PDF contract redesign.
- Automatic visual transfer progression with pause checkpoints for validation codes.
- Multi-channel notification system (banners, bell, email).
- Admin messages with real-time WebSocket chat.
- Dashboard sidebar with Solventis Group brand SVG logo.
- Optimized navigation flow: Discover → Learn → Understand → Apply.
- Real-time chat with file attachments (images, PDFs), and unread badges.
- Favicon and PWA implementation.

### Technical Implementations

- **Authentication:** Forgot/reset password (email, rate limiting), email verification (auto-login), optional TOTP 2FA, single session enforcement, CSRF protection.
- **Session Management & Error Handling:** Global 401/403 interceptor, `SessionMonitor` for periodic validation, intelligent retry logic.
- **Security Features:** IDOR protection, Zod validation, XSS protection, strong passwords, UUID usernames, generic error messages, file upload validation (magic byte), comprehensive rate limiting, encrypted 2FA secrets, hardened SSL, transfer validation requiring security codes, CSP, Helmet.js, CORS whitelist.
- **Loan Disbursement Workflow:** Multi-step approval (Request -> Admin Approval -> Contract Signing -> Manual Fund Disbursement).
- **KYC Document Upload:** Local file system storage (`uploads/kyc_documents/`) with validation, sanitization, cryptographic UUIDs, attached to admin notification emails.
- **Signed Contracts:** Local file system storage (`uploads/signed-contracts/`) with PDF validation.
- **Chat File Storage:** Supabase Storage integration using presigned URLs for secure, time-limited uploads/downloads.
- **Notification System:** Database-backed persistent notifications with RESTful API, user ownership, `NotificationBell` component (polling, unread badges, sound alerts), 2FA suggestion, multilingual support for 18 critical events.
- **Loan Workflow Enhancement:** 3-stage contract lifecycle with `status` and `contractStatus` fields.
- **Transfer Code System:** Dynamic code numbering in admin emails, single source of truth for pause percentages in DB.
- **SPA Routing:** `vercel.json` configured for Vercel.
- **Toast Management:** Auto-dismissing toasts (3s success, 5s error).
- **Production Code Quality:** No `console.log`, `console.error` for error handling, TypeScript strict mode, comprehensive error handling.

## External Dependencies

**Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`).
**UI Component Libraries:** Radix UI, shadcn/ui, Recharts, Lucide React.
**Styling & Design:** Tailwind CSS, `class-variance-authority`, `tailwind-merge`, `clsx`.
**Form Management:** React Hook Form, Zod, `@hookform/resolvers`.
**Email Service:** Brevo (formerly Sendinblue).
**Two-Factor Authentication:** Speakeasy, `qrcode`.
**Cloud Storage:** Cloudinary (profile photos), Supabase Storage (chat files).
**File Validation:** Sharp, PDF-lib, `file-type`.
**Chat File Management:** `@supabase/supabase-js`, React-PDF, `pdfjs-dist`.