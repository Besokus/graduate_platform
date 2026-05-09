# Deep Interview Context Snapshot: 就业方向功能

- Task statement: 开发项目中的“就业方向”对应功能。
- Desired outcome: 将当前就业方向页面从静态占位/禁用按钮推进到可用功能；具体范围需澄清。
- Stated solution: 先 review 整个项目结构、开发规范，再进行开发。
- Probable intent hypothesis: 用户希望补齐就业方向模块，使其与项目中考研/考公/留学方向及社区/题库/用户系统保持一致，并可运行、可验证。
- Context type: Brownfield existing codebase.

## Known facts / evidence

- Root contains ackend/ Spring Boot 3.2.5 + JPA + Security + JWT and rontend/ React 19 + Vite 8.
- Frontend routes for employment direction already exist in rontend/src/App.jsx: /job, /job/fairs, /job/resume, /job/recommend, /job/applications.
- Employment pages exist under rontend/src/pages/job/:
  - JobPage.jsx
  - CareerFairPage.jsx
  - ResumePage.jsx
  - JobRecommendPage.jsx
  - ApplicationTrackingPage.jsx
- Current employment subpages appear to be mostly static placeholders with disabled buttons and “功能开发中” notices.
- Existing frontend API wrapper is rontend/src/lib/api.js; no jobApi namespace currently found in inspected output.
- Existing backend packages include uth, user, community, questionbank, dmin, common, init; no dedicated job package found in inspected output.
- Community category initialization includes a job category in ackend/src/main/java/com/graduateplatform/init/DataInitializer.java.
- Build/test commands discovered:
  - frontend: 
pm run lint, 
pm run build, 
pm run dev
  - backend: Maven project with Spring Boot; likely mvn test / mvn spring-boot:run from ackend/.
- Repository text appears mojibake/encoding-corrupted in multiple files when read from PowerShell; implementation must preserve or repair visible Chinese carefully.
- Potential syntax risks spotted in job pages from raw output: malformed JSX closing tags may already exist (for example <h2>.../h2> patterns), requiring validation before implementation.

## Constraints

- No new dependencies unless explicitly requested.
- Prefer existing patterns: Spring layered packages, JPA repositories/services/controllers/DTOs, React pages + lib/api.js wrapper.
- Keep diffs small, reversible, and testable.
- Deep-interview mode must clarify before implementation and not implement directly.

## Unknowns / open questions

- Which employment subfeature(s) should be first-pass scope: career fairs, resume editor, job recommendation, application tracking, or all four?
- Should the first pass include backend persistence/API, or only frontend mock/local state?
- What data source should job/recruitment information use: seed data, admin-created records, external APIs, or user-entered data?
- What role-specific permissions are expected: public browsing, logged-in-only preferences/applications/resumes, admin management?
- What is the acceptance bar for “开发完成”: demo-quality UI, CRUD with database, integration with user profile, recommendation algorithm, export resume, etc.?

## Decision-boundary unknowns

- May OMX choose the first-pass MVP subset if the full module is too large?
- May OMX create new backend job package/entities/endpoints and database tables?
- May OMX repair mojibake/invalid JSX while implementing, or should text remain as-is except touched functionality?
- May OMX add seed data and use local demo data instead of external recruitment sources?

## Likely codebase touchpoints

- rontend/src/App.jsx
- rontend/src/lib/api.js
- rontend/src/pages/job/*.jsx
- rontend/src/App.css
- ackend/src/main/java/com/graduateplatform/init/DataInitializer.java
- Possible new backend package: ackend/src/main/java/com/graduateplatform/job/ with controller/service/repository/entity/dto.
- Backend config/security may need permit/auth rules depending endpoint access.
