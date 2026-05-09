const TIMELINE_KEY = 'gp_studyabroad_timeline'
const MATERIALS_KEY = 'gp_studyabroad_materials'

export const defaultTimelineItems = [
  {
    id: 'language-test',
    title: '语言考试报名与备考',
    country: '英国',
    school: '目标院校待定',
    phase: '语言考试',
    dueDate: '2026-06-20',
    status: 'doing',
    note: '确认 IELTS/TOEFL 考位，整理单词和听力计划。',
  },
  {
    id: 'school-shortlist',
    title: '确定选校清单',
    country: '英国',
    school: 'UCL / Manchester',
    phase: '选校定位',
    dueDate: '2026-07-15',
    status: 'todo',
    note: '按专业排名、费用、地区和申请难度分为冲刺/匹配/保底。',
  },
  {
    id: 'documents',
    title: '准备 PS、CV 与推荐信',
    country: '英国',
    school: 'UCL',
    phase: '文书材料',
    dueDate: '2026-08-30',
    status: 'todo',
    note: '完成个人陈述初稿，联系两位推荐老师。',
  },
  {
    id: 'application-submit',
    title: '网申提交与材料核对',
    country: '英国',
    school: 'UCL',
    phase: '网申提交',
    dueDate: '2026-10-10',
    status: 'todo',
    note: '上传成绩单、语言成绩、文书和推荐信。',
  },
]

export const defaultMaterialItems = [
  {
    id: 'passport',
    title: '护照扫描件',
    country: '通用',
    stage: '身份材料',
    category: '基础材料',
    deadline: '2026-06-01',
    completed: true,
    note: '确保护照有效期覆盖申请和入学阶段。',
  },
  {
    id: 'transcript',
    title: '中英文成绩单',
    country: '通用',
    stage: '学术材料',
    category: '成绩证明',
    deadline: '2026-07-01',
    completed: false,
    note: '需要学院或教务处盖章版本。',
  },
  {
    id: 'ps',
    title: 'Personal Statement 初稿',
    country: '英国',
    stage: '文书材料',
    category: '文书模板',
    deadline: '2026-08-10',
    completed: false,
    note: '突出课程匹配、项目经历和职业规划。',
  },
  {
    id: 'visa-fund',
    title: '签证资金证明',
    country: '英国',
    stage: '签证准备',
    category: '签证',
    deadline: '2026-11-20',
    completed: false,
    note: '后续根据 CAS 和签证要求更新。',
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

export function getMaterialItems() {
  return readJson(MATERIALS_KEY, defaultMaterialItems)
}

export function saveMaterialItems(items) {
  writeJson(MATERIALS_KEY, items)
}

export function resetStudyAbroadStorage() {
  localStorage.removeItem(TIMELINE_KEY)
  localStorage.removeItem(MATERIALS_KEY)
}
