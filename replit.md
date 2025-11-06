# ALTUS - Professional Loan Platform

## Recent Changes

### November 6, 2025 - Critical Security & UX Improvements
- **Bank Card Positioning:** Virtual bank card now positioned fixed in bottom-right corner of dashboard (matches design reference, hidden on mobile)
- **CSRF Token Fix:** Eliminated intermittent "Failed to fetch" errors during signup by preloading CSRF tokens when Auth page loads
- **Single Session Enforcement:** Implemented critical security feature preventing multiple simultaneous logins in same browser:
  - Added `activeSessionId` field to users table
  - Login saves current session ID to database
  - Logout clears session ID from database
  - `requireAuth` middleware validates session ID matches, destroying invalid sessions
  - Users see clear message: "Votre compte est connecté sur un autre appareil. Veuillez vous reconnecter."

### November 6, 2025 - KYC Document Upload Fix
- **Fixed:** Documents KYC uploaded by users now appear correctly in admin dashboard
- **Issue:** The `NewLoanDialog` component was not actually sending files to the server; it only displayed a success message locally
- **Solution:** Implemented real file upload via FormData to `/api/kyc/upload` endpoint
- **Improvements:**
  - Added loading states during file upload with visual spinner
  - Precise tracking of successfully uploaded files (fixes bug where partial failures were misreported)
  - Proper error handling with informative toast messages
  - Input field cleared after upload for better UX
  - Submit button disabled during upload to prevent double submission

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
users (id, username, password, email, fullName, accountType, role, status, kycStatus, maxLoanAmount, hasSeenWelcomeMessage, suspendedUntil, suspensionReason, externalTransfersBlocked, transferBlockReason, activeSessionId, createdAt, updatedAt)
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

## Production Deployment

### Cross-Domain Configuration (Vercel + Render)
- **Frontend:** Deployed on Vercel at `https://altusfinancegroup.com`
- **Backend:** Deployed on Render at `https://api.altusfinancegroup.com`
- **CORS:** Configured to allow frontend domain with credentials
- **Cookies:** Cross-domain session cookies with `sameSite: 'none'` and `domain: '.altusfinancegroup.com'`
- **CSRF Protection:** Applied to all mutating routes (POST/PUT/PATCH/DELETE)

### Production Logging
Comprehensive logging system for debugging production issues:
- **CORS Debugging:** Logs all incoming requests with origin, method, and headers
- **Error Tracking:** Detailed error messages with stack traces
- **Configuration Display:** Shows critical settings at startup (allowed origins, cookie config)
- **See:** `DEBUGGING_405_ERROR.md` for troubleshooting guide

## Documentation

### Security Documentation
- **SECURITY_AUDIT.md**: Initial security audit identifying IDOR vulnerabilities, code exposure, and validation gaps
- **DEEP_SECURITY_AUDIT.md**: Comprehensive security analysis covering all API routes with detailed vulnerability assessments and remediation status
- **Security implementations completed:**
  - IDOR protection with resource ownership verification
  - Zod validation on all admin routes
  - XSS protection with input sanitization
  - Strong password requirements (12+ characters)
  - UUID usernames for anonymity
  - Generic error messages to prevent information disclosure
  - File upload validation with magic byte verification
  - Comprehensive rate limiting on sensitive endpoints
  - Email verification token expiration (48 hours)
  - User status verification in authentication middleware (suspended/blocked/inactive)

### Admin Documentation
- **ADMIN_FEATURES.md**: Complete reference of all administrative functionalities including:
  - User management (CRUD, suspension, blocking, borrowing capacity)
  - Loan management (approval, rejection, deletion)
  - Transfer management (status updates, validation codes)
  - System settings management
  - Communication tools (messages, notifications with fees)
  - Statistics and audit logs
  - Detailed validation schemas and security measures
- **ADMIN_SETUP.md**: Guide for creating admin accounts in production:
  - Automated script (`scripts/create-admin.ts`) for interactive admin creation
  - Manual SQL method for direct database access
  - Security requirements (12+ character passwords, bcrypt hashing)
  - Troubleshooting and support information

### Business Workflows

#### Loan Disbursement Workflow
The loan disbursement process follows a strict multi-step approval workflow to ensure proper administrative control:

1. **Loan Request (status: 'pending')**: User submits a loan application
2. **Admin Review & Approval (status: 'approved')**: Admin reviews and approves the loan, generating the contract
3. **Contract Signing (status: 'signed')**: User uploads signed contract, which triggers:
   - Status change to 'signed'
   - Admin notification message
   - **No automatic fund disbursement**
4. **Manual Fund Disbursement (status: 'active')**: Admin manually reviews signed contract and triggers fund disbursement via the admin panel, which:
   - Changes loan status to 'active'
   - Creates a credit transaction for the loan amount
   - Sends success notification to user
   - Logs the action in audit trail
5. **Fund Access**: Only loans with 'active' status allow transfers

**Key Security Controls:**
- Fund disbursement requires explicit admin action (POST /api/admin/loans/:id/disburse)
- Route protected with requireAdmin, CSRF token, and rate limiting
- Validates loan is in 'signed' status and has signed contract before disbursement
- Transfer creation verifies at least one 'active' loan exists
- All actions logged in audit trail

**Implementation Files:**
- Backend route: `server/routes.ts` (lines 947-960 for contract upload, 1800-1852 for disbursement)
- Admin interface: `client/src/pages/AdminLoans.tsx`
- Status display: `client/src/components/LoanDetailsDialog.tsx`, `client/src/pages/IndividualLoans.tsx`