## Description

This PR implements the requested User Account Recovery Tools to address Issue #1575.

Changes include:
- **Database Schema**: Added `password_hash`, `is_locked`, `failed_login_attempts`, and `locked_until` to `users` table via migration. Added `deleted_at` to `portfolios` table for soft-deletion.
- **Admin Endpoints**: Implemented `/api/admin/users/:id/reset-password`, `/api/admin/users/:id/unlock`, `/api/admin/portfolios/:username` (soft delete), and `/api/admin/portfolios/:username/recover`.
- **Public Endpoints**: Implemented `/api/auth/forgot-password` and `/api/auth/reset-password` endpoints utilizing a secure token system stored in the new `password_reset_tokens` table.
- **Audit Logging**: Added `adminAuditMiddleware` tracking to all admin account recovery operations.
- **Admin UI**: Extended `UserManager.jsx` with Reset Password and Unlock Account features. Extended `PortfolioManager.jsx` with Move to Trash and Recover from Trash functions.

Fixes #1575

## Type of change

- [x] New feature (non-breaking change which adds functionality)
- [x] Database migration required

## How Has This Been Tested?

- Verified password reset token generation manually
- Verified portfolio soft-deletion removes portfolio from public views but keeps it available for admin recovery
- Verified `adminAuditMiddleware` successfully logs all recovery-related REST requests

## Checklist:

- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my own code
- [x] I have commented my code, particularly in hard-to-understand areas
- [x] My changes generate no new warnings
- [x] Any dependent changes have been merged and published in downstream modules
