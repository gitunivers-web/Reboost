# ALTUS - Professional Loan Platform

## Overview

ALTUS is a multi-language professional loan management platform designed for business clients. It provides a comprehensive dashboard for managing loans, transfers, fees, and financial transactions. The platform aims to foster trust, clarity, and data-driven decision-making with features like multi-language support (French, English, Spanish, Portuguese, Italian, German, Dutch), an interactive amortization calculator, real-time transfer tracking, external bank account management, KYC document upload, and financial analytics. Its primary purpose is to equip business professionals and enterprises with robust tools for loan financing and financial management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 20, 2025)

### Transfer Code System - Critical Fixes
- ✅ **FIXED:** Code numbering in admin emails corrected from "1/5...6/5" to dynamic "1/6...6/6" format
  - Email template now derives denominator from `vars.codes.length` for any code count
  - File modified: `server/emailTemplates.ts`
- ✅ **FIXED:** Eliminated duplicate email sending during transfer initiation
  - Codes now sent ONLY once when admin confirms contract (at fund availability)
  - Removed duplicate `sendTransferCodesAdminEmail` call from transfer initiation route
  - File modified: `server/routes.ts`
- ✅ **FIXED:** Transfer initialization state corrected
  - Transfers now start at 0% progress WITHOUT being paused
  - `isPaused=false` and `pausePercent=null` explicitly set at transfer creation
  - Pause occurs ONLY when validation code with pausePercent is encountered
  - File modified: `server/routes.ts`
- ✅ **FIXED:** Code retrieval logic improved
  - `getLoanTransferCodes` now correctly filters codes for active transfer
  - Falls back to pre-generated codes if no active transfer exists
  - Prevents mixing codes from different transfers
  - File modified: `server/storage.ts`
- 🎯 **VERIFIED:** Single source of truth for pause percentages
  - Percentages generated randomly once at contract confirmation
  - Stored in database with validation codes
  - Reused across all surfaces (admin email, transfer progress, user validation)
  - No regeneration or inconsistency possible

### CRITICAL SECURITY FIX - Transfer Validation Bypass Removed
- 🔴 **CRITICAL:** Identified and removed a major security vulnerability in the transfer workflow
- ❌ Removed fake "verification" step that auto-completed transfers after 45 seconds WITHOUT validating security codes
- ✅ Transfers now start in paused state (0% progress) immediately after initiation
- ✅ Progress is strictly blocked until each security code is validated by admin
- ✅ Removed automatic progression logic - transfers ONLY advance after code validation
- ✅ Verified with architect: no bypass path remains, security codes are now mandatory
- 📝 Modified file: `client/src/pages/TransferFlow.tsx`
  - Removed 'verification' step from state machine
  - Changed initial progress from 10% to 0%
  - Set isPausedForCode to true by default
  - Added critical security check: progression only if `justValidated === true`
  - Deleted 74 lines of fake verification UI and logic

## Recent Changes (November 16, 2025)

### Footer Reorganization & Cleanup
- ✅ Removed redundant "Resources" section from footer (all links duplicated in "Company" section)
- ✅ Cleaned up "Legal" section - removed duplicate links (CGU/Terms, Cookies/Privacy pointed to same pages)
- ✅ Streamlined footer from 5 sections to 4 sections (Brand, Solutions, Company, Legal)
- ✅ Verified all 7 footer pages have complete premium content:
  - Terms.tsx - 6 legal sections ✅
  - Privacy.tsx - 7 privacy sections ✅
  - Products.tsx - Complete product catalog with individual & business loans ✅
  - About.tsx - Company mission, values, stats ✅
  - Resources.tsx - Comprehensive FAQ ✅
  - HowItWorks.tsx - 4-step process, documents, security ✅
  - Contact.tsx - Contact form + company info ✅

### Code Cleanup & Verification
- ✅ Removed obsolete backup file `client/src/lib/i18n.ts.backup` (17,453 lines)
- ✅ Fixed missing `notExists` import in `server/storage.ts`
- ✅ Verified PDF contract header is professionally structured (ALTUS branding, company details, contract reference)
- ✅ Verified transfer creation logic correctly filters loans (status='approved', fundsAvailabilityStatus='available', excludes loans with existing transfers)
- ✅ Verified transfer amount is non-modifiable and pre-filled from approved loan amount
- ✅ Verified single active loan rule prevents multiple concurrent loan requests

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

### Technical Implementations

- **Authentication:** Comprehensive forgot/reset password with email notifications and rate limiting. Email verification includes automatic login. TOTP-based Two-Factor Authentication (2FA) is optional. Single session enforcement and CSRF protection are implemented.
- **Session Management & Error Handling:** Global 401/403 interceptor redirects to login. `SessionMonitor` ensures periodic session validation. Intelligent retry logic.
- **Security Features:** IDOR protection, Zod validation, XSS protection, strong password requirements, UUID usernames, generic error messages, file upload validation with magic byte verification. Comprehensive rate limiting on sensitive endpoints. Encrypted 2FA secrets. SSL configuration hardened for production.
- **Loan Disbursement Workflow:** Multi-step approval process (Request -> Admin Approval -> Contract Signing -> Manual Admin Fund Disbursement).
- **KYC Document Upload:** Local file system storage in `uploads/kyc_documents/` with file validation, sanitization (via Sharp for images, PDF-lib for PDFs), and cryptographic UUID identifiers. Documents are attached to admin notification emails via SendGrid.
- **Profile Photo Upload:** Cloudinary cloud-based image storage with `type:'authenticated'`, automatic transformations, and secure HTTPS URLs. **Note:** Cloudinary is used ONLY for profile photos in the Dashboard.
- **Signed Contracts:** Local file system storage in `uploads/signed-contracts/` with PDF validation and secure file handling.
- **Notification System:** Database-backed persistent notifications with RESTful API, user ownership enforcement, `NotificationBell` component with polling, unread count badges, sound alerts, and a 2FA suggestion system. Supports multilingual notifications and covers 18 distinct critical user events.
- **Loan Workflow Enhancement:** Implemented a 3-stage contract lifecycle with `status` and `contractStatus` fields for clear tracking.

## External Dependencies

**Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`).
**UI Component Libraries:** Radix UI, shadcn/ui, Recharts, Lucide React.
**Styling & Design:** Tailwind CSS, `class-variance-authority`, `tailwind-merge`, `clsx`.
**Form Management:** React Hook Form, Zod, `@hookform/resolvers`.
**Authentication:** SendGrid for transactional email verification.
**Two-Factor Authentication:** Speakeasy and qrcode libraries for TOTP generation and verification.
**Cloud Storage:** Cloudinary for profile photo storage only. KYC documents and signed contracts use local file system storage.
**File Validation:** Sharp for image sanitization, PDF-lib for PDF sanitization, file-type for magic byte verification.