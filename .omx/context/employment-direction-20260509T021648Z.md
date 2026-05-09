# Ralph Context Snapshot: employment direction

- Created UTC: 20260509T021648Z
- Task statement: `$ralph .omx/plans/prd-employment-direction.md`
- Desired outcome: implement the first-version employment direction module described in `.omx/plans/prd-employment-direction.md` and verify against `.omx/plans/test-spec-employment-direction.md`.

## Known facts / evidence
- Backend is Spring Boot 3.2.5 / Java 17 with Spring Security, JPA, Lombok, MySQL/H2 dependencies.
- Existing auth principal is a `Long` user id from `JwtAuthFilter`; roles are `ROLE_` + upper-case user role.
- Current `SecurityConfig` permits broad `GET /api/**` before admin rules; PRD requires admin/private employment matchers before public GETs.
- Existing `ApiResponse`, `BusinessException`, controller/service/repository patterns are available.
- Frontend is React/Vite with route pages already present for `/job/fairs`, `/job/resume`, `/job/recommend`, `/job/applications`, but they are static disabled placeholders.
- `omx explore` is not available on PATH, so direct repository inspection is the fallback.

## Constraints
- No new dependencies unless explicitly requested.
- Keep JPA entities internal; controllers should return DTO/maps.
- No external recruitment API, email/SMS/WeChat push, AI recommendation, Word/PDF export.
- Preserve existing route paths and visual classes.
- Run backend tests plus frontend lint/build before completion when possible.

## Unknowns / risks
- The repo currently has no backend tests; test setup may need H2 test properties to avoid connecting to the configured MySQL datasource.
- Scope is broad; implementation should favor cohesive minimal v1 fields and deterministic rule matching.

## Likely codebase touchpoints
- Backend: `common/config/SecurityConfig.java`, `init/DataInitializer.java`, new `job/**` package, backend tests under `src/test`.
- Frontend: `src/lib/api.js`, `src/App.jsx`, `src/pages/job/*.jsx`, `src/pages/admin/AdminPage.jsx`, new admin employment page.
- Docs: `README.md` API/feature sections.
