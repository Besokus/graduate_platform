# Deep Interview Context Snapshot: employment-pages-chinese

- Created UTC: 20260509T053401Z
- Task statement: Because the project audience is Chinese university students, change the frontend pages for the employment/work direction into Chinese.
- Desired outcome: Employment-related frontend user-facing pages should use Chinese copy suitable for Chinese university students.
- Stated solution: Localize/translate employment direction pages.
- Probable intent hypothesis: Improve usability and fit with the product's Chinese student audience; remove English UI copy from the employment module.
- Known facts/evidence:
  - rontend/src/pages/job/JobPage.jsx contains English employment feature-panel copy.
  - rontend/src/pages/job/CareerFairPage.jsx contains English career fair, preference, filter, state, and action labels.
  - rontend/src/pages/job/JobRecommendPage.jsx contains English recommendation and notification labels.
  - rontend/src/pages/job/ResumePage.jsx contains English resume templates, fields, placeholders, and state messages.
  - rontend/src/pages/job/ApplicationTrackingPage.jsx contains English application tracking labels and raw status values.
  - rontend/src/pages/admin/EmploymentManagementPage.jsx contains English admin employment management copy.
- Constraints:
  - Do not change API contracts or backend enum values unless explicitly authorized.
  - Likely no new dependencies are needed.
  - Preserve existing layout and functionality unless user expands scope.
- Unknowns/open questions:
  - Whether scope includes only student-facing job pages or also the admin employment management page.
  - Whether enum/status display values should be translated visually while preserving API values internally.
  - Desired tone: formal platform wording vs student-friendly wording.
- Decision-boundary unknowns:
  - Whether the agent may choose Chinese wording autonomously.
  - Whether to adjust sample placeholders to China-local examples.
- Likely codebase touchpoints:
  - rontend/src/pages/job/*.jsx
  - Possibly rontend/src/pages/admin/EmploymentManagementPage.jsx
- Prompt-safe initial-context summary status: not_needed
