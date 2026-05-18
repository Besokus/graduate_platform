const TIMELINE_KEY = 'gp_studyabroad_timeline'
const MATERIALS_KEY = 'gp_studyabroad_materials'
const APPLICATIONS_KEY = 'gp_studyabroad_applications'

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

export function resetStudyAbroadStorage() {
  localStorage.removeItem(APPLICATIONS_KEY)
  localStorage.removeItem(TIMELINE_KEY)
  localStorage.removeItem(MATERIALS_KEY)
}
