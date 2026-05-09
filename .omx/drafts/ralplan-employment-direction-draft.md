# RALPLAN Draft — 就业方向全量可用功能

Source spec: `.omx/specs/deep-interview-employment-direction.md`  
Mode: consensus deliberate (security/admin endpoint risk detected)

## Requirements Summary

Build a full-stack first version of the employment direction module: fairs/sessions, online resume saving, rule-based job recommendations, application tracking, in-app notifications, and a focused admin employment backend for fairs and job postings.

Grounding evidence:
- README identifies the platform as Spring Boot + Spring Security/JPA/MySQL + React/Router/Vite and lists employment features: fairs/subscription, resume editor, recommendations, tracking (`README.md:7-16`, `README.md:40-44`).
- Existing employment frontend routes and page imports already exist (`frontend/src/App.jsx:30-35`, `frontend/src/App.jsx:80-85`).
- Employment nav items already point to `/job/fairs`, `/job/resume`, `/job/recommend`, `/job/applications` (`frontend/src/components/Navbar.jsx:27-35`).
- Current employment subpages are disabled/static placeholders (`frontend/src/pages/job/CareerFairPage.jsx:17-35`, `frontend/src/pages/job/ResumePage.jsx:25-48`, `frontend/src/pages/job/JobRecommendPage.jsx:17-34`, `frontend/src/pages/job/ApplicationTrackingPage.jsx:19-35`).
- API client has shared request handling but no job API group yet (`frontend/src/lib/api.js:1-23`, `frontend/src/lib/api.js:147-185`).
- Backend uses modular controller/service/repository/entity patterns and `ApiResponse` (`backend/src/main/java/com/graduateplatform/common/dto/ApiResponse.java:17-27`, `backend/src/main/java/com/graduateplatform/user/controller/UserController.java:11-37`).
- Existing request DTO validation patterns are request-focused, e.g. post/user controllers validate request bodies rather than exposing persistence entities directly (`backend/src/main/java/com/graduateplatform/community/controller/PostController.java:43-49`, `backend/src/main/java/com/graduateplatform/user/controller/UserController.java:33-37`).
- Admin routes/components exist but only for dashboard/review/users/reports today (`backend/src/main/java/com/graduateplatform/admin/controller/AdminController.java:12-94`, `frontend/src/pages/admin/AdminPage.jsx:57-62`).
- Security currently permits all GET `/api/**` before the admin matcher, so new admin GET endpoints must not inherit accidental public access (`backend/src/main/java/com/graduateplatform/common/config/SecurityConfig.java:30-40`).

## RALPLAN-DR Summary

### Principles
1. **Preserve existing architecture**: add a `job` backend package and frontend job/admin pages rather than rewriting common/auth/community modules.
2. **Auth before feature breadth**: protect all employment write/admin operations and fix admin matcher ordering before adding admin job endpoints.
3. **Rule-based, no external services**: recommendations and notifications stay inside DB + application logic; no third-party recruitment API, no external email/SMS, no AI dependency.
4. **Thin first-version admin**: admin manages only fairs/sessions and job postings plus manual notification trigger, not user resumes/applications/notification CRUD.
5. **Testable full-stack slices**: each slice must have backend service/controller coverage plus frontend smoke/build evidence.

### Decision Drivers
1. The user requires all four employment subfeatures with persistence, not just demo UI.
2. Existing repo has no employment backend, so coherent domain modeling is more important than page-by-page patches.
3. Admin/security changes are necessary for a safe first version.

### Viable Options

#### Option A — Unified `job` domain module with focused controllers (favored)
- Approach: Add `com.graduateplatform.job` entities/services/repositories/controllers and `employmentApi`/`adminEmploymentApi` frontend groups.
- Pros: Clear boundary; maps directly to the four subfeatures; avoids bloating existing admin/user services.
- Cons: Larger initial backend surface; needs careful endpoint and DTO design.

#### Option B — Extend `admin`, `user`, and existing pages opportunistically
- Approach: Put admin employment methods in existing `AdminController/AdminService`, user flows in `UserController/UserService`, and patch current pages directly.
- Pros: Fewer new top-level packages/files; matches current small-codebase simplicity.
- Cons: Admin/user services become broad; employment domain logic is split; harder to test and evolve.

#### Option C — Frontend-first plus minimal persistence
- Approach: Add local UI state and only a few backend endpoints.
- Pros: Fastest visible progress.
- Cons: Violates the deep-interview requirement for all four subfeatures to be backend-persisted.

Favored option: **Option A**, with a small integration seam into existing admin navigation and auth/security config.

## ADR

### Decision
Implement a first-version employment module as a cohesive backend package `com.graduateplatform.job` plus frontend API/page updates, with security matcher hardening for admin endpoints.

### Drivers
- Full-stack persistence is required for four employment subfeatures.
- Current employment UI is static and the backend has no job module.
- Admin-managed job/fair data is the source for recommendations and notifications.

### Alternatives considered
- Extend existing admin/user modules only: rejected because it diffuses employment logic across unrelated services.
- Frontend-only prototype: rejected because it fails persistence and admin-triggered notification requirements.
- External recruitment-platform integration: rejected by scope.

### Why chosen
A module boundary gives the implementation team a stable domain model and keeps admin/user/community modules from becoming employment-specific dumping grounds.

### Consequences
- More new files than a patch-only approach.
- Requires endpoint/security review.
- Creates a foundation for later exports/external integration without doing them now.

### Follow-ups
- Later: optional resume export, external job platform sync, email/WeChat push, richer recommendation algorithm.
- Separate security cleanup: audit current public GET admin endpoints beyond the employment scope.

## Proposed Domain Model

Backend package: `backend/src/main/java/com/graduateplatform/job/`.

Entities:
- `CareerFair`: v1 treats each record as one session-level recruitment event/宣讲会, with title, companyName, city, industry, targetRoles, location, startTime, endTime, applyDeadline, applyUrl, description, active, createdAt, updatedAt. Do not add a separate `CareerFairSession` table in v1 unless implementation discovers an unavoidable need.
- `JobPosting`: title, companyName, city, industry, roleType, salaryRange, educationRequirement, majorKeywords, skillTags, description, applyUrl, active, createdAt, updatedAt.
- `ResumeProfile`: exactly one v1 resume record per user, with templateType and JSON/text sections for base info, education, projects, internships, skills, selfEvaluation, updatedAt.
- `ApplicationRecord`: user, companyName, jobTitle, jobPosting(optional), status, appliedAt, nextStepAt, notes, createdAt, updatedAt.
- `JobSubscriptionPreference`: user, cities, industries, roleTypes, salaryRange, companyTypes, active, updatedAt.
- `EmploymentNotification`: user, title, content, relatedType, relatedId, readFlag, createdAt, readAt.

Repositories: one Spring Data `JpaRepository` per entity; add query methods for active fairs/jobs, user resume/application/preferences/notifications, rule matching by city/industry/role/skills.

Services:
- `CareerFairService`: public/user list/detail, subscription preference save, admin CRUD, notification trigger.
- `JobPostingService`: public/user list/detail, admin CRUD, rule-based recommendations.
- `ResumeService`: authenticated current-user online resume get/upsert.
- `ApplicationService`: authenticated current-user CRUD/status tracking.
- `EmploymentNotificationService`: current-user list/read and admin trigger helper that only creates station-internal notifications from fair/job publish or update actions, targeted by saved preferences. No arbitrary admin notification CRUD/broadcast in v1.

Controllers / fixed API namespace:
- User/public employment controller(s) use `/api/job/**` to match the existing frontend `/job/*` route language.
- Admin employment controller uses `/api/admin/employment/**` for fair/job CRUD and trigger notification.
- Do not introduce `/api/employment/**` in v1 unless all frontend and security contracts are revised together.

## Security Contract

`SecurityConfig` must be changed before new admin/private employment endpoints are considered safe. Current code permits all `GET /api/**` before `/api/admin/**` (`backend/src/main/java/com/graduateplatform/common/config/SecurityConfig.java:30-40`), so the new order must be explicit:

| Matcher | Access | Order requirement |
|---|---|---|
| `/api/admin/**` | `hasRole("ADMIN")` | Before any broad `/api/**` or public GET matcher |
| `GET /api/job/fairs/**`, `GET /api/job/postings/**` | Public browse allowed | Before authenticated catch-all only if intentionally public |
| `/api/job/resume/**` | Authenticated | Before broad public GET |
| `/api/job/applications/**` | Authenticated | Before broad public GET |
| `/api/job/notifications/**` | Authenticated | Before broad public GET |
| `/api/job/preferences/**` | Authenticated | Before broad public GET |
| `/api/job/recommendations/**` | Authenticated, because it can use profile/preferences | Before broad public GET |

Avoid relying on broad `GET /api/**` for new private job APIs. Add tests that prove admin GETs are not public and private employment GETs reject unauthenticated requests.

## DTO / Response Contract

- JPA entities stay internal to services/repositories; controllers must not return entities directly.
- Request DTOs are required for admin fair/job create/update, resume upsert, preference save, application create/update, and notification trigger.
- Response shape may use small response DTOs or the repo's existing `Map<String,Object>` style, but must not expose lazy entity graphs or nested user entities.
- Ownership checks must use `Authentication.getPrincipal()` user IDs, as existing user controllers do (`backend/src/main/java/com/graduateplatform/user/controller/UserController.java:21-37`).

## Implementation Steps

1. **Security and API contract baseline**
   - Apply the security matcher table above first.
   - Fix the API namespace to `/api/job/**` for user/public employment APIs and `/api/admin/employment/**` for admin APIs.
   - Add endpoint contract comments/docs to the plan or README API section after implementation.

2. **Backend domain and persistence**
   - Add job entities/repositories/DTOs under `backend/src/main/java/com/graduateplatform/job/`.
   - Use existing Lombok/JPA timestamp conventions seen in `User` and `Post` (`backend/src/main/java/com/graduateplatform/common/entity/User.java:64-78`, `backend/src/main/java/com/graduateplatform/community/entity/Post.java:85-94`).
   - Use validation annotations on create/update DTOs, matching existing controller validation patterns (`backend/src/main/java/com/graduateplatform/community/controller/PostController.java:43-49`).

3. **Backend services and controllers**
   - Implement admin CRUD for fairs and jobs.
   - Implement user list/detail/subscription, resume upsert, recommendation, application CRUD/status changes, notification list/read.
   - Implement manual notification trigger from admin fair/job endpoints to users whose saved preferences match; do not add arbitrary broadcast, edit, delete, or list-all notification CRUD for admin.
   - Return `ApiResponse.ok/fail` consistently (`backend/src/main/java/com/graduateplatform/common/dto/ApiResponse.java:17-27`).

4. **Seed data for demo and tests**
   - Extend `DataInitializer` to seed a small set of job fairs/job postings and optionally a job-target test user; existing initializer already seeds categories/users/banks (`backend/src/main/java/com/graduateplatform/init/DataInitializer.java:31-35`, `backend/src/main/java/com/graduateplatform/init/DataInitializer.java:40-47`, `backend/src/main/java/com/graduateplatform/init/DataInitializer.java:61-74`).
   - Use stable unique existence checks such as email/title/company/startTime instead of only global table counts, because `initUsers()` currently skips all user seeding once any user exists (`backend/src/main/java/com/graduateplatform/init/DataInitializer.java:56-58`).

5. **Frontend API client**
   - Add `employmentApi` and `adminEmploymentApi` to `frontend/src/lib/api.js`, reusing the shared `request` helper and token header pattern (`frontend/src/lib/api.js:1-23`).
   - Include search params for filtering fairs/jobs/recommendations and methods for resume/application/notification/admin CRUD.

6. **Frontend user employment pages**
   - Replace disabled/static states in all `frontend/src/pages/job/*.jsx` pages with data loading, forms, stateful actions, errors, and empty states.
   - Use `useAuth` token pattern like admin/user pages (`frontend/src/pages/admin/AdminPage.jsx:9-19`, `frontend/src/context/AuthContext.jsx:107-119`).
   - Preserve current route paths (`frontend/src/App.jsx:80-85`) and visual classes (`track-grid`, `feature-card`, `btn`, etc.).

7. **Frontend admin employment pages/routes**
   - Add `frontend/src/pages/admin/EmploymentManagementPage.jsx` or split pages if implementation size demands it.
   - Add route `/admin/employment` in `App.jsx` near existing admin routes (`frontend/src/App.jsx:93-97`).
   - Add entry in `AdminPage.jsx` quick actions/management cards, following existing link-card patterns (`frontend/src/pages/admin/AdminPage.jsx:57-62`, `frontend/src/pages/admin/AdminPage.jsx:70-103`).

8. **Frontend navigation/notifications**
   - Add a user-facing notification entry or compact notification panel accessible from employment pages or Navbar.
   - Avoid broad nav redesign; Navbar already exposes target-specific employment menu for job users (`frontend/src/components/Navbar.jsx:95-114`).

9. **Backend tests**
   - Add Spring Boot tests for services/controllers around: security matcher behavior, admin CRUD authorization, recommendation matching, resume upsert ownership, application ownership, notification trigger/read.
   - Use existing `spring-boot-starter-test` dependency (`backend/pom.xml:84-88`); no new dependencies.

10. **Frontend verification**
   - Ensure lint/build pass using existing scripts (`frontend/package.json:7-10`) and ESLint rule constraints (`frontend/eslint.config.js:7-27`).
   - Manual smoke: dev job user can browse/use flows; admin can manage fairs/jobs and trigger notifications.

11. **Documentation/update notes**
   - Update README feature/API sections to include employment endpoints after implementation, matching existing API overview format (`README.md:159-180`).
   - Record non-goals so future agents do not add external integrations/export/AI prematurely.

## Acceptance Criteria

Backend:
- `mvn test` from `backend/` passes.
- `mvn spring-boot:run` can start with generated tables under existing JPA update setup (`README.md:182-186`).
- Admin endpoints under `/api/admin/employment/**` require `ROLE_ADMIN`; unauthenticated and normal users receive unauthorized/forbidden responses.
- Authenticated job user can upsert resume and retrieve persisted values.
- Authenticated user can CRUD only their own application records.
- Recommendation endpoint returns active job postings matching at least one of major/city/industry/role/skill criteria and does not call external services.
- Admin can CRUD fairs/job postings and manually trigger matched in-app notifications from fair/job publish/update actions only.
- Notification records are persisted, listable by target user, and markable read.

Frontend:
- `npm run lint` and `npm run build` pass from `frontend/`.
- `/job/fairs`, `/job/resume`, `/job/recommend`, `/job/applications` no longer depend on disabled placeholder-only controls.
- `/admin/employment` is accessible to admin users and redirects non-admin users consistently with existing admin pages.
- User-visible errors/loading/empty states exist for each employment page.
- No Word/PDF export UI or external push wording remains in first-version flows.

## Risks and Mitigations

- **Security matcher regression**: existing `GET /api/**` permit-all can shadow admin GET endpoints. Mitigation: reorder/admin-first tests before exposing new admin GET routes.
- **Scope explosion**: all four slices plus admin/notifications is broad. Mitigation: implement vertical backend domain first, then page-by-page UI integration; no external integrations/export/AI.
- **Recommendation ambiguity**: rule scoring may be subjective. Mitigation: use deterministic score = matches on city/industry/role/major/skill tags; document order.
- **Resume JSON vs normalized schema**: over-normalization slows delivery. Mitigation: store first-version resume sections as text/JSON-like string fields or simple columns; normalize later only if needed.
- **Dev user token**: `dev-token` may not work against backend protected APIs. Mitigation: smoke with real seeded users/admin; keep dev bar as frontend convenience only.

## Pre-mortem

1. **Admin data leaks publicly** because `GET /api/**` remains before `/api/admin/**`. Prevent with explicit security tests and matcher reorder.
2. **Implementation stalls on too many UI forms**. Prevent by defining minimal field sets per entity and reusing common form patterns/classes.
3. **Notifications mismatch expectations** because “push” is interpreted as external delivery. Prevent by naming it “站内通知” in UI and tests; no external mail/SMS.

## Expanded Test Plan

### Unit / service
- Recommendation scoring/filter tests.
- Notification trigger recipient selection tests.
- Resume/application ownership tests.
- DTO validation tests for required fields and invalid statuses.

### Integration / controller
- Admin employment CRUD with admin token succeeds; user/no token fails.
- User resume/application/notification flows persist and return expected `ApiResponse` shape.
- Fair/job list filters return seeded data.

### E2E / manual smoke
- Seed admin logs in, creates a fair/job, triggers notification.
- Job user logs in, saves preference/resume, views recommendation, adds application record, sees notification.

### Observability/debuggability
- Service methods should throw `BusinessException` with user-readable Chinese messages on not found/unauthorized ownership/status errors.
- Manual smoke should inspect browser network and backend logs for failed calls.

## Available-Agent-Types Roster

- `explore`: quick file/symbol lookup and impact mapping.
- `executor`: implementation/refactoring work.
- `debugger`: root-cause failed test/build/runtime issues.
- `test-engineer`: test design and adding backend/frontend verification coverage.
- `verifier`: final evidence, claim validation, acceptance checklist.
- `code-reviewer`: comprehensive code review before final delivery.
- `designer`: UI layout/interaction refinement if employment pages become awkward.
- `writer`: README/API/update notes.

## Follow-up Staffing Guidance

### `$ralph` sequential path
Recommended for controlled delivery:
1. Ralph owner: maintain acceptance checklist and sequence vertical slices.
2. Use `executor` for backend domain/security first (medium/high reasoning).
3. Use `executor` for frontend integration second (medium reasoning).
4. Use `test-engineer` after backend API shape stabilizes.
5. Use `verifier` before completion.

### `$team` parallel path
Recommended because backend, frontend, tests, and docs are separable after API contract freeze:
- Lane 1 backend executor: `backend/src/main/java/com/graduateplatform/job/**`, `SecurityConfig`, `DataInitializer`.
- Lane 2 frontend executor: `frontend/src/lib/api.js`, `frontend/src/pages/job/**`, admin employment pages/routes.
- Lane 3 test-engineer: backend tests and verification scripts; starts after Lane 1 endpoint contract draft.
- Lane 4 writer/verifier: README/API notes and final acceptance evidence.

Suggested reasoning: backend/security lane high, frontend lane medium, test lane medium-high, verifier high.

## Goal-Mode Follow-up Suggestions

- `$ultragoal` is a good durable implementation tracker if the user wants sequential goal completion records.
- `$performance-goal` is not primary; no performance target is central here.
- `$autoresearch-goal` is not primary; this is implementation delivery, not research.

## `$team` Launch Hints

```text
$team .omx/plans/prd-employment-direction.md .omx/plans/test-spec-employment-direction.md
```

If using shell OMX runtime:

```text
omx team --task "Implement employment-direction first version from .omx/plans/prd-employment-direction.md and .omx/plans/test-spec-employment-direction.md"
```

Team verification path:
1. Team proves backend tests + frontend lint/build + smoke checklist.
2. Ralph/verifier then validates acceptance criteria end-to-end and checks no non-goals slipped in.

## Draft Changelog

- Initial plan generated from deep-interview spec.
- Security matcher risk promoted plan to deliberate mode.
- Critic review approved after two polish fixes: corrected timestamp citation and normalized Chinese wording around `站内通知`.
- Architect review applied: explicit security matcher table, fixed `/api/job` + `/api/admin/employment` namespaces, internal-only entities/request DTO contract, session-level `CareerFair`, narrowed notification trigger scope, stable-key seed guidance.
