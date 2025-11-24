# ALTUS - Professional Loan Platform

## Overview

ALTUS is a multi-language professional loan management platform designed for business clients. It provides a comprehensive dashboard for managing loans, transfers, fees, and financial transactions. The platform aims to foster trust, clarity, and data-driven decision-making with features like multi-language support (French, English, Spanish, Portuguese, Italian, German, Dutch), an interactive amortization calculator, real-time transfer tracking, external bank account management, KYC document upload, and financial analytics. Its primary purpose is to equip business professionals and enterprises with robust tools for loan financing and financial management, offering a robust and secure environment for financial operations.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- Layout and scrolling issues resolved for a single scroll context.

### Technical Implementations

- **Authentication:** Comprehensive forgot/reset password with email notifications and rate limiting. Email verification includes automatic login. TOTP-based Two-Factor Authentication (2FA) is optional. Single session enforcement and CSRF protection are implemented.
- **Session Management & Error Handling:** Global 401/403 interceptor redirects to login. `SessionMonitor` ensures periodic session validation. Intelligent retry logic.
- **Security Features:** IDOR protection, Zod validation, XSS protection, strong password requirements, UUID usernames, generic error messages, file upload validation with magic byte verification. Comprehensive rate limiting on sensitive endpoints. Encrypted 2FA secrets. SSL configuration hardened for production. Transfer validation now strictly requires security code input, removing any bypass paths.
- **Loan Disbursement Workflow:** Multi-step approval process (Request -> Admin Approval -> Contract Signing -> Manual Admin Fund Disbursement).
- **KYC Document Upload:** Local file system storage in `uploads/kyc_documents/` with file validation, sanitization, and cryptographic UUID identifiers. Documents are attached to admin notification emails via SendGrid.
- **Profile Photo Upload:** Cloudinary cloud-based image storage.
- **Signed Contracts:** Local file system storage in `uploads/signed-contracts/` with PDF validation and secure file handling.
- **Notification System:** Database-backed persistent notifications with RESTful API, user ownership enforcement, `NotificationBell` component with polling, unread count badges, sound alerts, and a 2FA suggestion system. Supports multilingual notifications and covers 18 distinct critical user events.
- **Loan Workflow Enhancement:** Implemented a 3-stage contract lifecycle with `status` and `contractStatus` fields for clear tracking.
- **Transfer Code System:** Dynamic code numbering in admin emails and single source of truth for pause percentages stored in the database.

## External Dependencies

**Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`).
**UI Component Libraries:** Radix UI, shadcn/ui, Recharts, Lucide React.
**Styling & Design:** Tailwind CSS, `class-variance-authority`, `tailwind-merge`, `clsx`.
**Form Management:** React Hook Form, Zod, `@hookform/resolvers`.
**Authentication:** SendGrid for transactional email verification.
**Two-Factor Authentication:** Speakeasy and qrcode libraries for TOTP generation and verification.
**Cloud Storage:** Cloudinary for profile photo storage only.
**File Validation:** Sharp for image sanitization, PDF-lib for PDF sanitization, file-type for magic byte verification.