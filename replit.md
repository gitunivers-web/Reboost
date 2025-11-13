# ALTUS - Professional Loan Platform

## Overview

ALTUS is a multi-language professional loan management platform designed for business clients. It provides a comprehensive dashboard for managing loans, transfers, fees, and financial transactions. The platform emphasizes trust, clarity, and data-driven decision-making, offering features such as multi-language support (French, English, Spanish, Portuguese, Italian, German, Dutch), an interactive amortization calculator, real-time transfer tracking, external bank account management, KYC document upload, and financial analytics. Its purpose is to serve business professionals and enterprises with robust loan financing and financial management tools. The platform also includes a "How It Works" section detailing the loan application process from registration to fund disbursement, with a timeline of approximately 2-3 weeks for personal loans up to €75,000.

## Recent Changes

### Transfer Automatic Progression System (November 2025)
**Automatic visual progression with pause checkpoints:** Implemented a sophisticated transfer progression system that simulates real-time fund transfer with strategic pause points requiring validation codes.

**Key Changes:**
- **API Endpoint:** Modified `/api/transfers/:id` to retrieve validation codes from associated loan with `pausePercent` values assigned to each code.
- **Automatic Progression:** Transfers now visually progress automatically (0.5% increment every 200ms) from 10% to 100%.
- **Pause Mechanism:** Progression automatically stops at predefined random percentages (e.g., 12%, 34%, 55%, 78%, 92%) corresponding to validation codes.
- **Code Validation:** At each pause, users must enter the correct validation code to unlock progression to the next checkpoint.
- **State Management:** Implemented `lastValidatedSequence` tracking mechanism to prevent re-blocking after code validation while waiting for backend data refresh.
- **Frontend Component:** Completely rewrote `TransferFlow.tsx` with:
  - `useEffect` hook managing automatic progression interval
  - Smart pause detection based on `pausePercent` from validation codes
  - Local state synchronization with backend transfer data
  - Progressive unlocking as codes are validated in sequence
- **User Experience:** Clear visual feedback showing "Transfert en pause. Veuillez entrer le code..." at each checkpoint with smooth progression animation.

### Contract Notification System (November 2025)
**Multi-channel notification system for contract signatures:** Implemented a comprehensive notification system to ensure users are immediately aware when their loan contract is ready for signature.

**Key Changes:**
- **ContractNotificationManager Component:** Created an intelligent banner management system (`client/src/components/ContractNotificationManager.tsx`) that:
  - Automatically detects loans with `status='approved'`, `contractUrl` present, and no `signedContractUrl`
  - Creates persistent, non-dismissible warning banners at the top of the dashboard
  - Automatically removes banners when contracts are signed (cleanup logic prevents stale notifications)
  - Uses currency formatting for professional display of loan amounts
- **KYC Restriction Removal:** Removed KYC verification requirement from loan approval process in `server/routes.ts` - KYC documents are now sent to admins via email for manual review
- **Integration:** Integrated into `App.tsx` for seamless operation across all dashboard pages
- **No Emoji Policy:** Adheres to project guidelines by using text-only notifications ("ACTION REQUISE:" instead of emoji icons)
- **Automatic Cleanup:** Prevents notification pollution by tracking loan IDs and removing banners once contracts are signed

**Notification Channels:**
1. **Persistent Banner:** Top-of-screen warning with direct link to loans page
2. **Bell Notifications:** Backend creates database notifications via `notifyLoanContractGenerated`
3. **Email Notifications:** Automated emails sent through SendGrid when contracts are ready
4. **Badge Indicators:** Visual badges on loan cards (pre-existing feature)

### Loan Workflow Enhancement (November 2025)
**Implementation of 3-stage contract lifecycle:** The loan application workflow has been refined with a dual-state model separating loan lifecycle (`status`) from contract review steps (`contractStatus`). This provides clearer tracking and proper separation of concerns.

**Key Changes:**
- **Database Schema:** Added `contractStatus` field to `loans` table with values: `none`, `awaiting_user_signature`, `awaiting_admin_review`, `completed`. Default loan status changed from `'pending'` to `'pending_review'`.
- **Workflow Stages:**
  1. **User Submission:** Creates loan with `status='pending_review'` → Admin receives notification
  2. **Admin Approval:** Sets `status='approved'` and `contractStatus='awaiting_user_signature'` → Generates contract → User receives notification
  3. **Contract Signature:** Sets `contractStatus='awaiting_admin_review'` → User uploads signed contract → Admin receives notification
  4. **Fund Disbursement:** Admin manually disburses funds → Sets `status='active'` and `contractStatus='completed'`
- **Frontend Updates:** Modified AdminLoans, IndividualLoans, and LoanDetailsDialog components to display new contract statuses. Removed deprecated `'signed'` status in favor of `contractStatus` field.
- **Notifications:** Added admin notification system for signed contract receipt via `notifyAdminsSignedContractReceived`.

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
**Database Schema:** Key tables include `users`, `loans`, `transfers`, `fees`, `transactions`, `adminSettings`, `auditLogs`, `transferValidationCodes`, `transferEvents`, `adminMessages`, `externalAccounts`, `userOtps`, and `kycDocuments`. **Security enhancements (Nov 2025):** Added `cloudinaryPublicId` to `kycDocuments` and `signedContractCloudinaryPublicId` to `loans` for secure Cloudinary authenticated storage tracking.
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
- **Security Features:** Includes IDOR protection, Zod validation, XSS protection, strong password requirements, UUID usernames, generic error messages, and file upload validation with magic byte verification. Comprehensive rate limiting on sensitive endpoints (100 req/15min general, 10 req/15min auth, 20 req/15min uploads) and encrypted 2FA secrets are also in place. **CRITICAL SECURITY (Nov 2025):** All file uploads (KYC, signed contracts, profile photos) use Cloudinary with `type:'authenticated'` and cryptographic UUIDs. Public file exposure via `express.static` has been eliminated. SSL configuration hardened for production (`ssl: true`, no `rejectUnauthorized: false`). Debug logging disabled in production environments.
- **Loan Disbursement Workflow:** Multi-step approval process (Request -> Admin Approval -> Contract Signing -> Manual Admin Fund Disbursement) ensuring explicit admin action for disbursement and logging all actions.
- **KYC Document Upload:** Cloudinary-based authenticated file storage with cryptographic UUID identifiers (`cloudinaryPublicId`). Automatic cleanup of local temporary files after successful upload. Real file validation via FormData with magic byte verification and appropriate loading states.
- **Profile Photo Upload:** Cloudinary cloud-based image storage with `type:'authenticated'`, automatic transformations, secure HTTPS URLs, cleanup of old photos, and cryptographic UUID identifiers.
- **Signed Contracts:** Fully migrated to Cloudinary authenticated storage (`signedContractCloudinaryPublicId`). No local file storage. PDF validation and automatic cleanup of temporary files.
- **Notification System:** Database-backed persistent notifications replace temporary toast messages. Features include RESTful API endpoints with CSRF and IDOR protection, user ownership enforcement at the SQL level, `NotificationBell` component with polling, unread count badges, sound alerts, and a 2FA suggestion notification system. It supports multilingual notifications with metadata interpolation for dynamic content in French, English, and Spanish. A comprehensive set of 18 distinct notification types covers all critical user events and persists across sessions.

## External Dependencies

**Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`).
**UI Component Libraries:** Radix UI, shadcn/ui, Recharts, Lucide React.
**Styling & Design:** Tailwind CSS, `class-variance-authority`, `tailwind-merge`, `clsx`.
**Form Management:** React Hook Form, Zod, `@hookform/resolvers`.
**Authentication:** SendGrid for transactional email verification.
**Two-Factor Authentication:** Speakeasy and qrcode libraries for TOTP generation and verification.
**Cloud Storage:** Cloudinary for authenticated file storage and delivery. **All** sensitive files (KYC documents, signed contracts, profile photos) use `type:'authenticated'` with cryptographic UUID identifiers. No public file access - requires signed URLs for download (recommended implementation pending).