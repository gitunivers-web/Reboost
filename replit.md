# ALTUS - Professional Loan Platform

## Overview

ALTUS is a multi-language professional loan management platform designed for business clients. It provides a comprehensive dashboard for managing loans, transfers, fees, and financial transactions. The platform aims to foster trust, clarity, and data-driven decision-making with features like multi-language support (French, English, Spanish, Portuguese, Italian, German, Dutch), an interactive amortization calculator, real-time transfer tracking, external bank account management, KYC document upload, and financial analytics. Its primary purpose is to equip business professionals and enterprises with robust tools for loan financing and financial management, offering a robust and secure environment for financial operations.

## Recent Changes (November 29, 2025)

- **Transfer Progress Animation Velocity (Production-Ready):** Implemented configurable progress bar animation speed for production deployment:
  - Set progress bar animation speed to **0.5% per second** (constant velocity regardless of random backend percentage jumps)
  - Configuration stored in environment variable `VITE_TRANSFER_PROGRESS_SPEED` (default: 0.5)
  - Formula: `duration = (progressDelta / speed) * 1000` milliseconds
  - Allows easy adjustments in production without recompilation
  - Affects all transfer progress animations: initial progression, post-code-validation animations, and return-to-transfer continuations
  - Example: 20% delta at 0.5% per second = 40 seconds animation duration

- **Transfer Progress Page Cleanup & Corrections:** Fixed TypeScript errors and ensured full multilinguality across transfer flow:
  - Corrected type assertion for `transfer.transferNetwork` in progress display to eliminate LSP error
  - Unified translation system between transfer form and progress page using `getTranslatedNetworkInfo()` helper
  - Progress page now displays network information (name, description, processing time, fees) in all 7 languages
  - Created standalone `ProgressMock.tsx` page with professional progress visualization (circular + linear progress bars, animated steps, security info)
  - All UI labels fully translated: transferType, network, processingTime, networkFees, noFees, sepaZone

- **Multilingual Transfer Network Types:** Extended transfer network type display to support all 7 languages:
  - All transfer network names and descriptions now dynamically translate based on user's language preference
  - Supported networks: SEPA, SWIFT, ACH, WIRE, FASTER_PAYMENTS, INTERAC, LOCAL
  - Added translation keys to i18n.ts for all 7 languages (French, English, Spanish, Portuguese, Italian, German, Dutch)
  - Helper function `getTranslatedNetworkInfo()` in TransferFlow.tsx maps network types to translation keys with English fallbacks
  - UI labels (transferType, network, processingTime, networkFees, noFees, sepaZone) also translated in all languages
  - AdminDashboard remains 100% French as specified

- **Transfer Network Type Integration:** Integrated the transfer-types.ts system into TransferFlow to automatically detect and display transfer network types:
  - Detects SEPA vs SWIFT based on recipient bank country (from IBAN)
  - Displays network type, processing time, and network fees in transfer form before submission
  - Shows transfer network information in the progress view during transfer execution
  - New database columns: `transfer_network` (text), `network_fees` (numeric), `processing_time` (text)
  - Source country defaults to 'LU' (Luxembourg) for all transfer network detection
  - SEPA transfers show "SEPA Credit Transfer" with "Zone SEPA" badge, 1-2 business days, no fees
  - SWIFT transfers show "Virement International SWIFT" with 3-5 business days, variable fees

## Recent Changes (November 28, 2025)

- **Transfer Progress Animation Bug Fix:** Fixed critical issue where transfer progress would get stuck at 0% when users returned to an in-progress transfer after validating a code. The fix adds a tracking mechanism (`lastAnimatedToTargetSequenceRef`) that:
  - Prevents infinite animation loops during query polling
  - Correctly continues animation from backend progress to target percentage when returning to a transfer
  - Handles all edge cases: new transfers, post-validation animations, and returning to existing transfers

## Recent Changes (November 27, 2025)

- **KYC Status Labels:** All KYC status labels now display in English only:
  - "Verified" (au lieu de "Validé")
  - "Pending" (au lieu de "En attente")
  - "Rejected" (au lieu de "Rejeté")
  - "Not submitted" (au lieu de "Non soumis")
  - Applied to Dashboard and AdminUsers pages for both Individual and Professional user types
  
- **Dashboard Button Text:** Changed "Détails" button to "Details" in the upcoming payments section

- **Suspended User Experience:** Implemented dedicated SuspendedUser page (`client/src/pages/SuspendedUser.tsx`) that displays:
  - Clear "Account Suspended" message
  - Suspension reason (if provided)
  - Suspension end date (in French locale format: fr-FR)
  - Sign out button for logout
  - Replaces dashboard display for suspended users, preventing confusing flash of content
  - Integrated in ProtectedLayout.tsx with early return check: `if (user?.status === 'suspended') return <SuspendedUser />`

- **Date Formatting:** Maintained French locale (fr-FR) for all date displays throughout the platform

## User Preferences

Preferred communication style: Simple, everyday language. High standards for security, SEO, and code quality - all implementations must be production-ready.

## Configuration & Environment Variables

### Transfer Progress Animation Speed
- **Variable:** `VITE_TRANSFER_PROGRESS_SPEED`
- **Type:** Float (percentage per second)
- **Default:** `0.5` (0.5% per second)
- **Location:** Client-side environment variable (frontend only)
- **Usage:** Controls the animation velocity of the transfer progress bar
- **Production Setting:** `VITE_TRANSFER_PROGRESS_SPEED=0.5` (slow, professional progression)
- **Example values:**
  - `0.3` = Very slow (20% delta = 66 seconds)
  - `0.5` = Standard slow (20% delta = 40 seconds) **← Current production**
  - `1.0` = Normal (20% delta = 20 seconds)

## System Architecture

### Frontend Architecture

**Technology Stack:** React 18 with TypeScript, Wouter for routing, Tailwind CSS with shadcn/ui, Zustand for client-side state, TanStack Query for server state, React Hook Form with Zod, and Vite.
**Design System:** Radix UI primitives, custom HSL color system design tokens, Google Fonts, and a responsive mobile-first approach.
**Internationalization (i18n):** Custom Zustand-based implementation supporting 7 languages, with type-safe translation keys and IP-based automatic language detection.
**Theming:** Light/dark mode support via Zustand with localStorage persistence and CSS variables.
**Component Architecture:** Atomic design approach.

### Backend Architecture

**Technology Stack:** Node.js with Express.js, TypeScript, Drizzle ORM, PostgreSQL (via Neon serverless driver), and Connect-pg-simple for session management.
**API Design:** RESTful API endpoints with response formatting and request logging.
**Data Layer:** Schema-first design using Drizzle ORM, type-safe operations, Zod schemas, and drizzle-kit for migrations.
**Storage Strategy:** PostgreSQL database (`DatabaseStorage`) with Neon serverless, adhering to an `IStorage` interface.
**Database Schema:** Key tables include `users`, `loans`, `transfers`, `fees`, `transactions`, `adminSettings`, `auditLogs`, `transferValidationCodes`, `transferEvents`, `adminMessages`, `externalAccounts`, `userOtps`, and `kycDocuments`.

### UI/UX Decisions

- Virtual bank card fixed in the bottom-right of the dashboard.
- Welcome modal displayed once after the first login.
- Fully responsive design across all pages.
- Clear feedback and loading states for user actions.
- Password strength indicators during resets.
- Profile photo upload with dual cache-busting for immediate display.
- Homepage hero carousel with full-screen design, premium banking images, advanced animations, automatic rotation, and interactive controls.
- Professional PDF contract redesign with premium styling, structured information, and specific legal clauses.
- Automatic visual transfer progression with pause checkpoints requiring validation codes.
- Multi-channel notification system for contract signatures, including persistent banners, bell notifications, and email notifications.
- Admin messages with cross-domain WebSocket authentication and real-time native chat system.
- Dashboard sidebar with official ALTUS brand SVG logo.
- Optimized navigation flow: Discover → Learn → Understand → Apply, redirecting to login for application.
- Real-time chat with file attachments, inline image display, PDF previews, and persistent unread badges.
- Favicon and PWA implementation for enhanced branding and mobile experience.

### Technical Implementations

- **Authentication:** Comprehensive forgot/reset password with email notifications and rate limiting. Email verification includes automatic login. TOTP-based Two-Factor Authentication (2FA) is optional. Single session enforcement and CSRF protection are implemented.
- **Session Management & Error Handling:** Global 401/403 interceptor redirects to login. `SessionMonitor` ensures periodic session validation. Intelligent retry logic.
- **Security Features:** IDOR protection, Zod validation, XSS protection, strong password requirements, UUID usernames, generic error messages, file upload validation with magic byte verification. Comprehensive rate limiting on sensitive endpoints. Encrypted 2FA secrets. SSL configuration hardened for production. Transfer validation now strictly requires security code input, removing any bypass paths. CSP policy for production API backend. Helmet.js security headers. CORS whitelist.
- **Loan Disbursement Workflow:** Multi-step approval process (Request -> Admin Approval -> Contract Signing -> Manual Admin Fund Disbursement).
- **KYC Document Upload:** Local file system storage in `uploads/kyc_documents/` with file validation, sanitization, and cryptographic UUID identifiers. Documents are attached to admin notification emails.
- **Signed Contracts:** Local file system storage in `uploads/signed-contracts/` with PDF validation and secure file handling.
- **Chat File Storage (Nov 2025):** Supabase Storage integration with presigned URLs for secure, time-limited file uploads and downloads. PDFs preview inline with `<embed>`, images display inline, other files available for download. Upload URLs valid 5 min, preview URLs valid 1 hour. Backend generates URLs only - files uploaded directly to Supabase from browser.
- **Notification System:** Database-backed persistent notifications with RESTful API, user ownership enforcement, `NotificationBell` component with polling, unread count badges, sound alerts, and a 2FA suggestion system. Supports multilingual notifications and covers 18 distinct critical user events.
- **Loan Workflow Enhancement:** Implemented a 3-stage contract lifecycle with `status` and `contractStatus` fields for clear tracking.
- **Transfer Code System:** Dynamic code numbering in admin emails and single source of truth for pause percentages stored in the database.
- **SPA Routing:** `vercel.json` configured for proper single-page application routing on Vercel.
- **Toast Management:** Toasts auto-dismiss with appropriate timings (3s for success, 5s for error).
- **Production Code Quality:** No console.log in production code, console.error only in error handling, TypeScript strict mode, comprehensive error handling.

## External Dependencies

**Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`).
**UI Component Libraries:** Radix UI, shadcn/ui, Recharts, Lucide React.
**Styling & Design:** Tailwind CSS, `class-variance-authority`, `tailwind-merge`, `clsx`.
**Form Management:** React Hook Form, Zod, `@hookform/resolvers`.
**Email Service:** Brevo (formerly Sendinblue) for transactional emails (verification, password reset, notifications, OTP).
**Two-Factor Authentication:** Speakeasy and qrcode libraries for TOTP generation and verification.
**Cloud Storage:** Cloudinary for profile photo storage only. Supabase Storage for chat file uploads with presigned URLs.
**File Validation:** Sharp for image sanitization, PDF-lib for PDF sanitization, file-type for magic byte verification.
**Chat File Management:** `@supabase/supabase-js` for presigned URL generation, React-PDF and pdfjs-dist for PDF preview support.