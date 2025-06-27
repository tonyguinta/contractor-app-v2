# Technical Debt & Architecture Concerns

This document tracks known technical debt, architecture concerns, and improvement opportunities for BuildCraftPro.

## High Priority Issues

### Database Architecture
- **Single-file models/schemas approach** - `models.py` and `schemas.py` will become unwieldy as the app grows. Consider splitting by domain when we hit ~15+ models.

### Frontend Performance & UX
- **Race condition risk in cost calculations** - Real-time cost calculations with debounced API calls could create race conditions or stale data if users edit quickly across multiple subprojects. Current pattern looks solid but needs monitoring.
- **No offline capabilities** - Contractors often work in areas with poor connectivity. Consider service worker implementation for critical features.
- **CSS class bloat potential** - BuildCraftPro design system is well-defined but could lead to CSS maintenance issues as features expand.

## Medium Priority Issues

### UX Improvements
- **Currency Formatting** - Format all dollar amounts with consistent decimal places (e.g., $1,234.00) across forms, displays, and reports using `Intl.NumberFormat`
- **Date Validation** - Prevent project end date from being set before start date with real-time validation and helpful error messages
- **Material Library Management** - User-maintained material_entries with full CRUD capabilities (moved to FEATURE_PLANNING.md)
- **Navigation Enhancement** - Back-arrow/Dashboard links for easier navigation (moved to FEATURE_PLANNING.md)
- **Inline Client Creation** - Create clients within Project modal (moved to FEATURE_PLANNING.md)

### Code Quality
- **API error handling standardization** - Ensure consistent error response formats across all endpoints
- **Frontend loading state patterns** - Standardize loading spinner usage and error boundaries
- **Type safety gaps** - Review for any `any` types or missing TypeScript interfaces

## Low Priority / Future Considerations

### Performance Monitoring
- **Cost calculation performance tracking** - Monitor real-world performance of cascading calculations (items → subprojects → projects)
- **Database query optimization** - Profile common queries as data volume grows
- **Bundle size optimization** - Monitor frontend bundle size as component library expands

### Security Hardening
- **JWT token refresh strategy** - Currently using simple localStorage, consider refresh token pattern for production
- **Input sanitization review** - Ensure all user inputs are properly validated and sanitized
- **CORS configuration review** - Verify production CORS settings are appropriately restrictive

### Architecture Refactoring Triggers
- **Models split**: When `models.py` exceeds 15 models or 500 lines
- **API versioning**: When breaking changes are needed for mobile app support
- **Microservices consideration**: If team grows beyond 5 developers or performance bottlenecks emerge

## Resolved Issues

### ✅ Completed Features (Moved to FEATURE_PLANNING.md)
- **Enhanced Login UX** - Persistent error messages with registration suggestions
- **Form Privacy Enhancement** - Browser auto-complete disabled on business forms
- **Phone Number Formatting** - Auto-format phone numbers on registration page
- **Cost Breakdown Field Removal** - Removed obsolete project-level cost fields

### ✅ Completed Technical Improvements
- **Sales Tax Implementation** - Complete 6-phase implementation with company/project settings
- **Database Precision** - Fixed tax rate precision from NUMERIC(5,4) to NUMERIC(6,6)
- **Login Error UX** - Replace fast-disappearing toasts with persistent error display

---

**Note**: This document should be reviewed monthly and updated as issues are discovered or resolved. Reference from CLAUDE.md ensures future development partners are aware of these concerns.