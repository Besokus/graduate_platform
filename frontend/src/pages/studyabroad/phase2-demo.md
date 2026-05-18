# Study Abroad Phase 2 Demo

This note records the phase 2 backend and frontend demo flow for the study abroad module.

## Covered Features

- Application project CRUD
- Timeline items linked to application projects
- Material checklist items linked to application projects
- Experience library create/search/delete
- Ownership checks for private study abroad data

## Frontend Pages

- `/studyabroad/applications`
- `/studyabroad/timeline`
- `/studyabroad/materials`
- `/studyabroad/experience`

## Backend APIs

Application projects:

- `GET /api/studyabroad/applications`
- `POST /api/studyabroad/applications`
- `PUT /api/studyabroad/applications/{id}`
- `DELETE /api/studyabroad/applications/{id}`

Timeline:

- `GET /api/studyabroad/timeline`
- `POST /api/studyabroad/timeline`
- `PUT /api/studyabroad/timeline/{id}`
- `DELETE /api/studyabroad/timeline/{id}`

Materials:

- `GET /api/studyabroad/materials`
- `POST /api/studyabroad/materials`
- `PUT /api/studyabroad/materials/{id}`
- `DELETE /api/studyabroad/materials/{id}`

Experiences:

- `GET /api/studyabroad/experiences?country=UK&topic=Writing&keyword=PS`
- `POST /api/studyabroad/experiences`
- `DELETE /api/studyabroad/experiences/{id}`

## Suggested Demo Flow

1. Sign in with a normal user.
2. Open `/studyabroad/applications` and create one target school project.
3. Open `/studyabroad/timeline` and create a timeline item linked to that project.
4. Open `/studyabroad/materials` and create a material item linked to that project.
5. Open `/studyabroad/experience`, publish an experience, and filter it by country/topic/keyword.
6. Mention that integration tests cover ownership checks, so one user cannot modify another user's study abroad records.

## Verification Command

Run the focused backend integration test:

```powershell
cd "D:\Compile software\JAVA\JAVAcode\graduate_platformLiuxue\backend"
$env:JAVA_HOME='C:\Users\11584\.jdks\corretto-17.0.18'
$env:MAVEN_HOME='D:\CompileSoftware2\Maven\apache-maven-3.9.15'
$env:Path="$env:JAVA_HOME\bin;$env:MAVEN_HOME\bin;$env:Path"
mvn -Dtest=StudyAbroadModuleIntegrationTest test
```

Frontend checks:

```powershell
cd "D:\Compile software\JAVA\JAVAcode\graduate_platformLiuxue\frontend"
npx eslint src/pages/studyabroad src/lib/api.js src/App.jsx
npm run build
```
