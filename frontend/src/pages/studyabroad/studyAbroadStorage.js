const TIMELINE_KEY = 'gp_studyabroad_timeline'
const MATERIALS_KEY = 'gp_studyabroad_materials'
const APPLICATIONS_KEY = 'gp_studyabroad_applications'
const EXPERIENCES_KEY = 'gp_studyabroad_experiences'

export const defaultApplicationItems = [
  {
    id: 'ucl-cs',
    country: 'UK',
    school: 'University College London',
    program: 'Computer Science MSc',
    degree: 'Master',
    intake: '2027 Fall',
    applicationRound: 'Round 1',
    deadline: '2026-10-15',
    status: 'preparing',
    priority: 'dream',
    note: 'Focus on PS, transcript, recommendation letters, and IELTS score.',
  },
  {
    id: 'manchester-ai',
    country: 'UK',
    school: 'University of Manchester',
    program: 'Advanced Computer Science MSc',
    degree: 'Master',
    intake: '2027 Fall',
    applicationRound: 'Rolling',
    deadline: '2026-11-30',
    status: 'planning',
    priority: 'match',
    note: 'Check course matching and scholarship deadline before submission.',
  },
  {
    id: 'monash-it',
    country: 'Australia',
    school: 'Monash University',
    program: 'Information Technology Master',
    degree: 'Master',
    intake: '2027 Spring',
    applicationRound: 'Main',
    deadline: '2026-09-20',
    status: 'planning',
    priority: 'safe',
    note: 'Prepare passport scan, transcript, CV, and financial documents.',
  },
]

export const defaultTimelineItems = [
  {
    id: 'language-test',
    applicationId: 'ucl-cs',
    applicationSchool: 'University College London',
    applicationProgram: 'Computer Science MSc',
    title: 'Book IELTS test slot',
    country: 'UK',
    school: 'University College London',
    phase: 'Language test',
    dueDate: '2026-06-20',
    status: 'doing',
    note: 'Confirm IELTS/TOEFL date and organize vocabulary and listening plan.',
  },
  {
    id: 'school-shortlist',
    applicationId: 'manchester-ai',
    applicationSchool: 'University of Manchester',
    applicationProgram: 'Advanced Computer Science MSc',
    title: 'Finalize school shortlist',
    country: 'UK',
    school: 'University of Manchester',
    phase: 'School selection',
    dueDate: '2026-07-15',
    status: 'todo',
    note: 'Split target schools into dream, match, and safe tiers.',
  },
  {
    id: 'documents',
    applicationId: 'ucl-cs',
    applicationSchool: 'University College London',
    applicationProgram: 'Computer Science MSc',
    title: 'Prepare PS, CV, and references',
    country: 'UK',
    school: 'University College London',
    phase: 'Documents',
    dueDate: '2026-08-30',
    status: 'todo',
    note: 'Finish personal statement draft and contact two referees.',
  },
  {
    id: 'application-submit',
    applicationId: 'ucl-cs',
    applicationSchool: 'University College London',
    applicationProgram: 'Computer Science MSc',
    title: 'Submit online application',
    country: 'UK',
    school: 'University College London',
    phase: 'Submission',
    dueDate: '2026-10-10',
    status: 'todo',
    note: 'Upload transcript, language score, PS, CV, and references.',
  },
]

export const defaultMaterialItems = [
  {
    id: 'passport',
    applicationId: null,
    applicationSchool: null,
    applicationProgram: null,
    title: 'Passport scan',
    country: 'General',
    stage: 'Identity',
    category: 'Basic document',
    deadline: '2026-06-01',
    completed: true,
    note: 'Check that the passport remains valid through the application and enrollment period.',
  },
  {
    id: 'transcript',
    applicationId: 'ucl-cs',
    applicationSchool: 'University College London',
    applicationProgram: 'Computer Science MSc',
    title: 'Chinese and English transcript',
    country: 'General',
    stage: 'Academic',
    category: 'Transcript',
    deadline: '2026-07-01',
    completed: false,
    note: 'Needs official stamp from school or academic affairs office.',
  },
  {
    id: 'ps',
    applicationId: 'ucl-cs',
    applicationSchool: 'University College London',
    applicationProgram: 'Computer Science MSc',
    title: 'Personal Statement draft',
    country: 'UK',
    stage: 'Documents',
    category: 'Writing',
    deadline: '2026-08-10',
    completed: false,
    note: 'Highlight course fit, project experience, and career plan.',
  },
  {
    id: 'visa-fund',
    applicationId: 'manchester-ai',
    applicationSchool: 'University of Manchester',
    applicationProgram: 'Advanced Computer Science MSc',
    title: 'Visa financial proof',
    country: 'UK',
    stage: 'Visa',
    category: 'Visa',
    deadline: '2026-11-20',
    completed: false,
    note: 'Update after CAS and visa requirement confirmation.',
  },
]

export const defaultExperienceItems = [
  {
    id: 'uk-ps',
    title: 'How I shaped a UK taught master PS',
    country: 'UK',
    topic: 'Writing',
    authorName: 'Senior Student A',
    readTime: '6 min',
    summary: 'Start from course fit, then connect projects and career goals instead of turning the PS into a resume.',
    content: 'A strong PS should explain why this exact program fits your background. I first listed target modules, then matched each module with one project or internship experience.',
    tags: ['PS', 'course fit', 'documents'],
  },
  {
    id: 'us-shortlist',
    title: 'Splitting US CS programs into dream, match, and safe tiers',
    country: 'US',
    topic: 'School Selection',
    authorName: 'CS Applicant B',
    readTime: '8 min',
    summary: 'Use GPA, language score, research, internship, and admission preference to reduce blind applications.',
    content: 'I built a spreadsheet with five columns: admission difficulty, course fit, tuition, location, and career outcome. The final list had two dream, four match, and two safe options.',
    tags: ['school list', 'CS', 'positioning'],
  },
  {
    id: 'au-visa',
    title: 'Australian student visa material checklist',
    country: 'Australia',
    topic: 'Visa',
    authorName: 'Southern Hemisphere Observer',
    readTime: '5 min',
    summary: 'Prepare passport, COE, financial proof, and medical examination early to avoid deadline pressure.',
    content: 'The most useful thing was checking document validity before receiving the offer. Passport and financial proof both need enough buffer time.',
    tags: ['visa', 'COE', 'financial proof'],
  },
  {
    id: 'sg-language',
    title: 'Language score planning for Singapore applications',
    country: 'Singapore',
    topic: 'Language Test',
    authorName: 'NUS Application Log',
    readTime: '4 min',
    summary: 'Schedule language tests backward from application deadlines and reserve time for retake and score delivery.',
    content: 'I treated the language score as a timeline item, not a side task. A second test slot was booked before the first score came out.',
    tags: ['IELTS', 'TOEFL', 'timeline'],
  },
]

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getTimelineItems() {
  return readJson(TIMELINE_KEY, defaultTimelineItems)
}

export function saveTimelineItems(items) {
  writeJson(TIMELINE_KEY, items)
}

export function getApplicationItems() {
  return readJson(APPLICATIONS_KEY, defaultApplicationItems)
}

export function saveApplicationItems(items) {
  writeJson(APPLICATIONS_KEY, items)
}

export function getMaterialItems() {
  return readJson(MATERIALS_KEY, defaultMaterialItems)
}

export function saveMaterialItems(items) {
  writeJson(MATERIALS_KEY, items)
}

export function getExperienceItems() {
  return readJson(EXPERIENCES_KEY, defaultExperienceItems)
}

export function saveExperienceItems(items) {
  writeJson(EXPERIENCES_KEY, items)
}

export function resetStudyAbroadStorage() {
  localStorage.removeItem(EXPERIENCES_KEY)
  localStorage.removeItem(APPLICATIONS_KEY)
  localStorage.removeItem(TIMELINE_KEY)
  localStorage.removeItem(MATERIALS_KEY)
}
