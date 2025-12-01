# ALTUS - Professional Loan Platform

## Overview

ALTUS is a multi-language professional loan management platform for business clients, offering a comprehensive dashboard for managing loans, transfers, fees, and financial transactions. It supports multiple languages (French, English, Spanish, Portuguese, Italian, German, Dutch) and includes features like an interactive amortization calculator, real-time transfer tracking, external bank account management, KYC document upload, and financial analytics. The platform aims to provide robust tools for loan financing and financial management, ensuring a secure environment for financial operations.

## User Preferences

Preferred communication style: Simple, everyday language. High standards for security, SEO, and code quality - all implementations must be production-ready.

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
- Dashboard sidebar with ALTUS brand SVG logo.
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