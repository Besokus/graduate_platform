# Deep Interview Context Snapshot: employment-direction

- Timestamp UTC: 20260508T155212Z
- Task statement: `$deep-interview review???????????????????????????????????`
- Desired outcome: clarify an execution-ready specification for developing employment-direction features after reviewing current project structure and development conventions.
- Stated solution: inspect/review the project and implement/develop ?????? related functionality.
- Probable intent hypothesis: turn currently placeholder/static employment pages into usable functionality consistent with the existing graduation-direction platform.
- Context type: brownfield existing repository.
- Prompt-safe initial-context summary status: not_needed.

## Known facts / evidence

[from-code][auto-confirmed]
- Repo root has `backend/` and `frontend/`, plus `README.md` and an SRS docx.
- Frontend: Vite + React, `react-router-dom`, ESLint flat config. Scripts: `dev`, `build`, `lint`, `preview`.
- Backend: Spring Boot Java 17, Maven, Spring Web/Data JPA/Security/Validation/Mail, JWT, MySQL/H2 dependencies.
- Existing backend modules: `auth`, `common`, `community`, `questionbank`, `user`, `admin`, `init`; no backend package or API dedicated to job/employment was found.
- Frontend employment route group exists in `frontend/src/App.jsx`: `/job`, `/job/fairs`, `/job/resume`, `/job/recommend`, `/job/applications`.
- Employment frontend files exist under `frontend/src/pages/job/`: `JobPage.jsx`, `CareerFairPage.jsx`, `ResumePage.jsx`, `JobRecommendPage.jsx`, `ApplicationTrackingPage.jsx`.
- Current employment subpages are mostly static placeholders with disabled buttons and ??????? notices.
- Shared frontend API wrapper is `frontend/src/lib/api.js`; it currently exports auth/community/practice/user/admin API groups, no job API group.
- README describes employment-direction features as recruiting fair info/subscription and online resume editor, while frontend also includes job recommendation and application tracking.

## Current development conventions observed

[from-code][auto-confirmed]
- Frontend components are JSX function components, route pages import `Navbar`, `Footer`, and `../../App.css`.
- Frontend styling appears centralized in `App.css` with reusable classes like `section`, `feature-card`, `grid-two`, `btn`, `tag`, `muted`.
- Backend follows controller/service/repository/entity/dto modular packages and returns `ApiResponse.ok(...)` from controllers.
- Backend uses constructor injection and package-by-feature organization.

## Constraints

- Deep-interview phase must not implement directly.
- No new dependencies unless explicitly requested.
- Existing behavior should be preserved; later implementation should be test/lint/build verified.
- Potential sensitive credentials exist in `backend/src/main/resources/application.yml`; avoid exposing or changing credentials unless explicitly in scope.

## Unknowns / open questions

- Whether ?????????? means all four frontend areas or a prioritized first slice.
- Whether functionality must be frontend-only prototype using local state/static data, or backend-backed persistent CRUD.
- Whether resume export/import, external recruitment platform sync, subscription push/email, recommendation algorithm, or admin management are in scope.
- Whether acceptance is demo/UI completeness, database persistence, API tests, or end-to-end user flow.
- Non-goals and decision boundaries are not yet explicit.

## Likely codebase touchpoints

- Frontend routes/pages: `frontend/src/App.jsx`, `frontend/src/components/Navbar.jsx`, `frontend/src/pages/job/*.jsx`, `frontend/src/lib/api.js`, `frontend/src/App.css`.
- Backend likely new package: `backend/src/main/java/com/graduateplatform/job/...` with controller/service/repository/entity/dto.
- Auth/user integration likely via JWT security and `User` entity/repository.
- Initialization may touch `backend/src/main/java/com/graduateplatform/init/DataInitializer.java` for seed/sample data.
