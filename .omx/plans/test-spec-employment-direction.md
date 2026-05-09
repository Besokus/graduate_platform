# Test Specification — 就业方向全量可用功能

- Source PRD: `.omx/plans/prd-employment-direction.md`
- Source requirements: `.omx/specs/deep-interview-employment-direction.md`
- Generated UTC: 20260508T164002Z
- Consensus status: Critic APPROVE

## Verification Goals

Prove that the first-version employment module is full-stack, persistent, secure, and constrained to the agreed non-goals:

- Four user flows work with backend persistence: fairs/subscriptions, online resume, rule recommendations, application tracking.
- Admin employment backend manages only fairs and job postings and can manually trigger matched station-internal notifications.
- No third-party recruitment API, external email/SMS/WeChat push, complex AI recommendation, or resume file export is required or introduced.

## Required Commands

### Backend

```bash
cd backend
mvn test
```

If runtime smoke is needed:

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

## Backend Test Matrix

| Area | Test | Expected Evidence |
|---|---|---|
| Security matcher order | Unauthenticated `GET /api/admin/employment/fairs` | 401/403, never public |
| Security matcher order | Normal user `GET/POST/PUT/DELETE /api/admin/employment/**` | 403 |
| Public browsing | `GET /api/job/fairs`, `GET /api/job/postings` | Public list returns active records |
| Private personal GETs | Unauthenticated `GET /api/job/resume`, applications, notifications, preferences, recommendations | 401/403 |
| Admin fair CRUD | Admin create/update/delete/list fair/session-level event | Data persists and returns `ApiResponse.success=true` |
| Admin job CRUD | Admin create/update/delete/list job posting | Data persists and powers recommendations |
| Resume ownership | User upserts and retrieves own resume | Persisted values round trip; other user cannot access |
| Application ownership | User CRUDs own application record | Status/date/note changes persist; other user cannot access |
| Preferences | User saves city/industry/role/salary/company preferences | Values persist and are used for notifications/recommendations |
| Recommendation rules | Seed jobs with matching/nonmatching city/industry/role/skills | Matching jobs appear first; no external service call |
| Notification trigger | Admin triggers from fair/job publish/update | Notifications created only for matched users |
| Notification read | User lists and marks notification read | `readFlag/readAt` updates only for current user |
| DTO validation | Missing required fields / invalid status | `BusinessException` or validation error with readable message |
| Seed idempotency | Run initializer twice | No duplicate fair/job/job-user seed records |

## Frontend Test Matrix

| Route/Page | Test | Expected Evidence |
|---|---|---|
| `/job` | Dashboard links still point to four employment routes | Uses existing route paths from `App.jsx` |
| `/job/fairs` | Loads fair list, saves preferences/subscription | No disabled-only placeholder; loading/error/empty states present |
| `/job/resume` | User edits and saves online resume | Refresh/reload retrieves persisted resume; no Word/PDF export UI |
| `/job/recommend` | User refreshes/sees rule-based recommendations | Results come from maintained job postings; no AI/external wording |
| `/job/applications` | User adds/updates/deletes application record | Status transitions persist and render |
| Notifications UI | User sees station-internal notifications and marks read | No email/SMS/WeChat promise in UI |
| `/admin` | Admin dashboard links to employment management | Non-admin redirected like existing admin pages |
| `/admin/employment` | Admin manages fairs and postings | CRUD forms/tables, loading/error/empty states |
| `/admin/employment` | Admin manually triggers notification for fair/job | Matched user receives station-internal notification |

## Manual E2E Smoke Scenario

1. Start backend and frontend.
2. Log in as admin.
3. Open `/admin/employment`.
4. Create a fair/session and job posting with city/industry/role/skill tags.
5. Trigger station-internal notification for the created fair/job.
6. Log in as a job-target user.
7. Open `/job/fairs`; verify fair appears and save matching preferences.
8. Open `/job/resume`; create or update resume and refresh to confirm persistence.
9. Open `/job/recommend`; verify matching job appears.
10. Open `/job/applications`; create an application record, change status, refresh to confirm persistence.
11. Open notifications UI; verify admin-triggered notification is visible and can be marked read.

## Non-goal Regression Checks

- Search diff for new dependency additions in `backend/pom.xml` or `frontend/package.json`; none unless separately approved.
- Search UI and backend for Word/PDF export endpoints/buttons; none in first version.
- Search for third-party recruitment API clients or outbound HTTP integration; none.
- Search for external email/SMS/WeChat push calls in employment implementation; none.
- Recommendation logic is deterministic/rule-based and has no AI/model dependency.

## Observability / Debuggability

- Backend failures for ownership, missing records, invalid statuses, or unauthorized actions should use readable Chinese errors through existing exception/API response patterns.
- Browser network panel should show `ApiResponse`-compatible payloads for all employment API calls.
- Backend logs should be sufficient to identify failed admin trigger or persistence errors during manual smoke.

## Exit Criteria

- Backend tests pass.
- Frontend lint/build pass.
- Manual smoke scenario passes.
- Security matrix passes for admin/private endpoints.
- Non-goal regression checks find no out-of-scope implementation.
