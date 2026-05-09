# Execution-Ready Spec: ????????

- Slug: `employment-direction`
- Generated UTC: 20260508T161231Z
- Profile: standard
- Context type: brownfield
- Initial request: review ???????????????????????????????????
- Context snapshot: `.omx/context/employment-direction-20260508T155212Z.md`
- Final ambiguity: 19% / threshold 20%
- Residual risk: low-to-medium; implementation scale remains broad but boundaries are explicit enough for planning.

## Clarity breakdown

| Dimension | Score |
|---|---:|
| Intent | 78% |
| Outcome | 88% |
| Scope | 90% |
| Constraints | 86% |
| Success Criteria | 82% |
| Brownfield Context | 88% |

## Intent

Turn the currently placeholder/static ?????? pages into a usable full-stack employment module consistent with the existing graduation-direction platform.

## Desired Outcome

A first version where employment users can use all four employment subfeatures with backend persistence, and admins can maintain the data needed to drive recruitment information, job recommendations, and station-internal notification workflows.

## In Scope

1. **???/????????**
   - Backend-persisted fair/session records.
   - User-facing list/detail/filter/subscription flow.
   - No third-party recruitment-platform integration.

2. **????**
   - User can create/edit/save resume content online.
   - Data persists in backend.
   - No Word/PDF/file export in first version.

3. **????**
   - Backend-persisted job posting pool maintained by admin.
   - Recommendation uses rule matching, such as major, city, industry, role type, skills/tags.
   - No complex AI recommendation algorithm.

4. **????**
   - User can create/update/delete/list application records.
   - Track company, job, status, dates, notes as needed for the user flow.
   - Admin does not need to manage user application records in first version.

5. **???? / ??**
   - Backend stores notification records.
   - Frontend user can view notifications.
   - Admin can manually trigger notifications from the employment admin backend after publishing/updating recruitment fairs or job postings.
   - No external email/SMS/WeChat push in first version.

6. **???????**
   - Manage recruitment fair/session records.
   - Manage job posting records.
   - Trigger station-internal notifications.
   - Does not manage resumes, application records, or notification records as a full admin CRUD in first version unless needed for trigger/audit display.

## Out of Scope / Non-goals

- Real third-party recruitment platform API integration.
- Complex AI recommendation algorithm.
- Word/PDF/file resume export.
- External email/SMS/WeChat push for first version.
- Admin management of user resumes, user application records, and full notification-record CRUD in first version.
- New dependencies unless later explicitly justified and approved.

## Decision Boundaries

OMX / implementation may decide without further confirmation:

- Exact package/component names, as long as they follow existing repo conventions.
- Database entity field details needed for the stated workflows.
- REST endpoint naming under a consistent `/api/...` scheme.
- Frontend form/table layout using existing reusable CSS classes and page patterns.
- Seed/sample data shape for local verification.
- Rule-matching implementation details for recommendations, as long as no AI/external service is introduced.

Ask before changing:

- Adding new dependencies.
- Connecting real external recruitment platforms.
- Adding external email/SMS/WeChat push.
- Implementing file export.
- Expanding admin scope to manage user resumes/application records beyond the agreed first version.

## Constraints

- Existing architecture: React/Vite frontend, Spring Boot Java 17 backend.
- Existing backend pattern: controller/service/repository/entity/dto, `ApiResponse` wrapper, JWT security.
- Existing frontend pattern: route pages under `frontend/src/pages/...`, shared `Navbar`/`Footer`, CSS in `App.css`, APIs in `frontend/src/lib/api.js`.
- Current employment frontend pages are static placeholders with disabled controls.
- No backend employment module exists yet.
- Avoid exposing/changing credentials in `application.yml`; treat credential cleanup as separate security work unless requested.

## Testable acceptance criteria

- Frontend build/lint pass after implementation.
- Backend compile/tests pass after implementation.
- Employment routes no longer show only disabled placeholder states for core flows.
- A normal authenticated user can:
  - Browse recruitment fairs/sessions and job postings.
  - Save/update an online resume.
  - Receive rule-based job recommendations from maintained job postings.
  - Create/update/list application-tracking records.
  - View station-internal notifications.
- An admin can:
  - Create/update/delete/list recruitment fair/session records.
  - Create/update/delete/list job posting records.
  - Manually trigger station-internal notifications for relevant employment data.
- No third-party recruitment API, external push channel, complex AI algorithm, or resume file export is required for acceptance.

## Pressure-pass findings

The first non-goal answer only excluded complex AI recommendation. A contrarian pressure pass exposed hidden scope risk: real platform integrations, push channels, export, and admin scope could balloon the project. The clarified boundary now excludes third-party recruitment integration, external push, and resume export while keeping station-internal notification and a focused admin backend.

## Brownfield evidence vs inference

### Evidence

- `frontend/src/App.jsx` already declares employment routes: `/job`, `/job/fairs`, `/job/resume`, `/job/recommend`, `/job/applications`.
- `frontend/src/pages/job/*.jsx` exists and currently implements mostly static/placeholder UI.
- `frontend/src/lib/api.js` has no employment API group.
- Backend packages include auth/common/community/questionbank/user/admin/init but no employment/job package.
- README lists employment direction features: recruitment fair information/subscription and online resume editor; frontend additionally includes recommendation and application tracking.

### Inference

- A new backend employment package is likely needed.
- Existing admin patterns should be extended rather than replaced.
- Existing frontend CSS/components should be reused for a small, consistent diff.

## Transcript summary

| Round | Target | Answer | Effect |
|---:|---|---|---|
| 1 | Scope | A??????????????????? | ??????????/??????????????? |
| 2 | Non-goals | C????? AI ???? | ???????? |
| 3 | Decision boundaries | ???????????????????????????????? | ??????/?????????????? |
| 4 | Success criteria | B+D????? + ??????? | ??????/???????????????????????? |
| 5 | Admin scope | B??????/??? + ???? | ???????????????????????/??/??????? |

