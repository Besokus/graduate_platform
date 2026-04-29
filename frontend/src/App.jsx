import { Routes, Route } from 'react-router-dom'
import DevBar from './components/DevBar.jsx'

// 通用功能页面
import HomePage from './pages/HomePage.jsx'
import CommunityPage from './pages/CommunityPage.jsx'
import CommunityDetailPage from './pages/CommunityDetailPage.jsx'
import PracticePage from './pages/PracticePage.jsx'
import PracticeDetailPage from './pages/PracticeDetailPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

// 考研方向专属页面
import KaoyanPage from './pages/kaoyan/KaoyanPage.jsx'
import ScoreQueryPage from './pages/kaoyan/ScoreQueryPage.jsx'
import StudyPlanPage from './pages/kaoyan/StudyPlanPage.jsx'
import MaterialsPage from './pages/kaoyan/MaterialsPage.jsx'
import StudyRoomPage from './pages/kaoyan/StudyRoomPage.jsx'
import ConsultPage from './pages/kaoyan/ConsultPage.jsx'

// 考公考编方向专属页面
import KaogongPage from './pages/kaogong/KaogongPage.jsx'
import JobMatchingPage from './pages/kaogong/JobMatchingPage.jsx'
import ScoreLinePage from './pages/kaogong/ScoreLinePage.jsx'
import ExamCalendarPage from './pages/kaogong/ExamCalendarPage.jsx'
import MockInterviewPage from './pages/kaogong/MockInterviewPage.jsx'

// 就业方向专属页面
import JobPage from './pages/job/JobPage.jsx'
import CareerFairPage from './pages/job/CareerFairPage.jsx'
import ResumePage from './pages/job/ResumePage.jsx'
import JobRecommendPage from './pages/job/JobRecommendPage.jsx'
import ApplicationTrackingPage from './pages/job/ApplicationTrackingPage.jsx'

// 留学方向专属页面
import StudyAbroadPage from './pages/studyabroad/StudyAbroadPage.jsx'
import TimelinePage from './pages/studyabroad/TimelinePage.jsx'
import SAMaterialsPage from './pages/studyabroad/SAMaterialsPage.jsx'
import ExperiencePage from './pages/studyabroad/ExperiencePage.jsx'

// 管理员页面
import AdminPage from './pages/admin/AdminPage.jsx'
import ReviewPage from './pages/admin/ReviewPage.jsx'
import UserManagementPage from './pages/admin/UserManagementPage.jsx'

export default function App() {
  return (
    <>
    <DevBar />
    <Routes>
      {/* 通用功能 */}
      <Route path="/" element={<HomePage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/community/:id" element={<CommunityDetailPage />} />
      <Route path="/practice" element={<PracticePage />} />
      <Route path="/practice/:id" element={<PracticeDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* 考研方向专属 */}
      <Route path="/kaoyan" element={<KaoyanPage />} />
      <Route path="/kaoyan/scores" element={<ScoreQueryPage />} />
      <Route path="/kaoyan/plan" element={<StudyPlanPage />} />
      <Route path="/kaoyan/materials" element={<MaterialsPage />} />
      <Route path="/kaoyan/studyroom" element={<StudyRoomPage />} />
      <Route path="/kaoyan/consult" element={<ConsultPage />} />

      {/* 考公考编方向专属 */}
      <Route path="/kaogong" element={<KaogongPage />} />
      <Route path="/kaogong/matching" element={<JobMatchingPage />} />
      <Route path="/kaogong/scores" element={<ScoreLinePage />} />
      <Route path="/kaogong/calendar" element={<ExamCalendarPage />} />
      <Route path="/kaogong/interview" element={<MockInterviewPage />} />

      {/* 就业方向专属 */}
      <Route path="/job" element={<JobPage />} />
      <Route path="/job/fairs" element={<CareerFairPage />} />
      <Route path="/job/resume" element={<ResumePage />} />
      <Route path="/job/recommend" element={<JobRecommendPage />} />
      <Route path="/job/applications" element={<ApplicationTrackingPage />} />

      {/* 留学方向专属 */}
      <Route path="/studyabroad" element={<StudyAbroadPage />} />
      <Route path="/studyabroad/timeline" element={<TimelinePage />} />
      <Route path="/studyabroad/materials" element={<SAMaterialsPage />} />
      <Route path="/studyabroad/experience" element={<ExperiencePage />} />

      {/* 管理员后台 */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/review" element={<ReviewPage />} />
      <Route path="/admin/users" element={<UserManagementPage />} />
    </Routes>
    </>
  )
}
