# ALTUS - Professional Loan Platform

## Overview

ALTUS is a multi-language professional loan management platform for business clients, offering a comprehensive dashboard for managing loans, transfers, fees, and financial transactions. It emphasizes trust, clarity, and data-driven decision-making, incorporating professional design patterns. Key features include multi-language support (French, English, Spanish), an interactive amortization calculator, real-time transfer tracking, external bank account management, KYC document upload, and financial analytics. The platform aims to serve business professionals and enterprises seeking robust loan financing and financial management tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:** React 18 with TypeScript, Wouter for routing, Tailwind CSS with shadcn/ui for styling, Zustand for client-side state, TanStack Query for server state, React Hook Form with Zod for forms, and Vite for building.
**Design System:** Radix UI primitives, custom design tokens (HSL color system), Google Fonts, and a responsive mobile-first design.
**Internationalization (i18n):** Custom implementation with Zustand, supporting French (default), English, and Spanish.
**Theming:** Light/dark mode toggle via Zustand with localStorage persistence and CSS variables.
**Component Architecture:** Atomic design approach for UI, feature, and page components.

### Backend Architecture

**Technology Stack:** Node.js with Express.js, TypeScript, Drizzle ORM, PostgreSQL (via Neon serverless driver), and Connect-pg-simple for session management.
**API Design:** RESTful API endpoints (`/api`) with response formatting and request logging.
**Data Layer:** Schema-first design with Drizzle ORM, type-safe operations, Zod schemas, and drizzle-kit for migrations.
**Storage Strategy:** PostgreSQL database (`DatabaseStorage`) with Neon serverless, using an `IStorage` interface.
**Database Schema:** Key tables include `users`, `loans`, `transfers`, `fees`, `transactions`, `adminSettings`, `auditLogs`, `transferValidationCodes`, `transferEvents`, `adminMessages`, `externalAccounts`, and `userOtps`.
**Key Architectural Decisions:** Monorepo for client/server, end-to-end type safety, Vite middleware for HMR, and separate client/server builds.

### UI/UX Decisions
- Virtual bank card fixed in bottom-right of dashboard.
- Welcome modal appears once after first login.
- Responsive design across all pages.
- Clear feedback and loading states for actions like file uploads and 2FA setup.
- Password strength indicators during reset.
- Profile photo upload with dual cache-busting mechanism (server `updatedAt` + client `photoCacheBuster`) for immediate display after upload.

### Technical Implementations
- **Authentication:**
    - Complete forgot/reset password functionality with email notifications, rate limiting, and 12-character password validation.
    - Email verification with automatic login: After clicking verification link, users are automatically logged in and redirected to dashboard (no manual login required).
    - **Streamlined Login Flow (Updated Nov 2025):**
        - Users WITHOUT 2FA enabled: Direct login access to dashboard (no OTP required)
        - Users WITH 2FA enabled: Must enter 6-digit TOTP code from Google Authenticator
        - OTP email codes removed for standard login (only used for password reset and special cases)
    - TOTP-based Two-Factor Authentication (2FA) using Google Authenticator, including setup, verification, and disable flows.
        - Optional feature enabled via user settings (Security section)
        - Setup flow: Generate QR code → Scan with authenticator app → Verify code → Enable 2FA
        - Once enabled, 2FA code required at every login
    - Single session enforcement preventing multiple simultaneous logins per user.
    - CSRF protection on mutating routes, with preloading tokens for signup.
    - Cross-domain session cookies with flexible configuration:
        - COOKIE_DOMAIN environment variable support (defaults to .altusfinancegroup.com in production)
        - Automatic mode detection via IS_PRODUCTION constant
        - Production: domain=COOKIE_DOMAIN, sameSite='none', secure=true, httpOnly=true
        - Development: no domain (localhost), sameSite='lax', secure=false, httpOnly=true
    - Request debugging middleware with secure logging (session presence flags only, no sensitive data)
    - Comprehensive startup logging for production troubleshooting (config, CORS, cookies)
- **Session Management & Error Handling:**
    - Global 401/403 interceptor in `queryClient.ts` redirecting to login with contextual messages stored in sessionStorage.
    - `SessionMonitor` component for periodic session validation (60s intervals) and inactivity detection (30min timeout).
    - Automatic CSRF token cleanup and session clearing on authentication failures.
    - Intelligent retry logic distinguishing network errors (exponential backoff, max 3 retries) from authentication errors (no retry).
    - Enhanced 404 page ensuring authentication errors never display as "page not found".
    - All authentication routes (`/auth`, `/login`, `/signup`) properly configured to prevent routing errors.
- **Security Features:**
    - IDOR protection, Zod validation, XSS protection, strong password requirements, UUID usernames, generic error messages.
    - File upload validation with magic byte verification.
    - Comprehensive rate limiting on sensitive endpoints.
    - User status verification in authentication middleware.
    - Encrypted 2FA secrets.
- **Loan Disbursement Workflow:** Multi-step approval: Request -> Admin Approval -> Contract Signing -> Manual Admin Fund Disbursement (`active` status). Requires explicit admin action for disbursement, logs all actions, and validates loan status.
- **KYC Document Upload:** Real file upload via FormData to `/api/kyc/upload` with loading states, error handling, and input clearing.
- **Profile Photo Upload (Cloudinary Integration - November 2025):**
    - Cloud-based image storage using Cloudinary for persistent profile photos in production
    - Memory-based upload (no local disk storage) via multer.memoryStorage()
    - Automatic image transformations: 500x500 face-centered crop, quality optimization, auto-format
    - Secure HTTPS URLs stored in PostgreSQL database
    - Automatic cleanup of old photos from Cloudinary when users update their profile picture
    - Cross-domain compatible: works with frontend on Vercel and backend on Render
    - Environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
    - Images organized in `user_profiles/` folder with unique public IDs
- **Notification System (November 2025 - Extended):**
    - Database-backed persistent notifications replacing temporary toast messages.
    - PostgreSQL table (`notifications`) with fields: userId, type, title, message, severity, isRead, metadata, createdAt, readAt.
    - RESTful API endpoints with full CSRF protection and defense-in-depth IDOR protection.
    - Storage methods enforce user ownership at SQL level: all read/update/delete operations include `WHERE userId = ?` clause.
    - NotificationBell component with real-time polling (5s intervals for admin loan requests, 30s for user notifications), unread count badge, and dropdown menu.
    - Sound alerts for new notifications (plays only when unread count increases).
    - 2FA suggestion notification system:
        - Appears once in notification bell for users without 2FA enabled.
        - Uses `hasNotificationByType` to check all notifications (read/unread) preventing duplicates.
        - Auto-removes via `deleteAllNotificationsByType` when user enables 2FA.
    - Real-time loan request notifications for admins with 5s polling and audio alerts.
    - **Multilingual Notification System with Metadata Interpolation (November 2025):**
        - Complete internationalization support for all notifications across French (default), English, and Spanish.
        - Backend stores generic English messages + structured metadata (amounts, reasons, loan types, recipients, sequences, etc.).
        - Frontend `interpolateMessage()` function replaces placeholders ({amount}, {reason}, {loanType}, etc.) with actual metadata values.
        - Translation keys in `i18n.ts` include placeholders for dynamic content in all 3 languages.
        - Notifications dynamically adapt to user's selected language with contextual data properly displayed.
        - Fallback mechanism: Uses backend title/message (generic English) if translation key not found.
        - Example FR: "Votre demande de prêt {loanType} de {amount} € a été soumise..."
        - Example EN: "Your {loanType} loan request for £{amount} has been successfully submitted..."
        - Example ES: "Su solicitud de préstamo {loanType} por {amount} € ha sido enviada..."
    - **Comprehensive notification coverage (November 2025):**
        - Notification helper utilities (`notification-helper.ts`) generate notifications for ALL critical events:
        - **Loan lifecycle**: Request submitted, under review, approved, contract generated, contract signed, rejected, funds disbursed
        - **Transfer lifecycle**: Transfer initiated, transfer completed, transfer approved, transfer suspended, validation code issued
        - **KYC events**: KYC approved, KYC rejected
        - **Admin actions**: Admin messages sent, fees added, account status changes
        - **18 distinct notification types** covering every important user action
    - Notifications persist across page refreshes and logout/login cycles.
    - Notifications remain visible even after being marked as read.
    - Security: SQL-level user ownership validation prevents cross-user access even if route checks are bypassed.

## External Dependencies

**Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`).
**UI Component Libraries:** Radix UI, shadcn/ui, Recharts, Lucide React.
**Styling & Design:** Tailwind CSS, `class-variance-authority`, `tailwind-merge`, `clsx`.
**Form Management:** React Hook Form, Zod, `@hookform/resolvers`.
**Development Tools:** Replit Plugins, TypeScript, ESBuild.
**Authentication:** SendGrid for transactional email verification.
**Two-Factor Authentication:** Speakeasy and qrcode libraries for TOTP.
**Cloud Storage:** Cloudinary for persistent profile photo storage and delivery.