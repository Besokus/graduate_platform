import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

const features = [
  {
    title: 'Career fairs and application links',
    desc: 'Browse campus fairs, online application links, deadlines, and save station-notification preferences by city, industry, role, salary, and company type.',
    to: '/job/fairs',
  },
  {
    title: 'Online resume',
    desc: 'Maintain one persisted structured resume with template type, education, projects, internships, skills, and self-evaluation.',
    to: '/job/resume',
  },
  {
    title: 'Rule-based job recommendations',
    desc: 'View deterministic matches based on city, industry, role, major, and resume skills using local platform data.',
    to: '/job/recommend',
  },
  {
    title: 'Application tracking',
    desc: 'Record off-platform applications, maintain statuses, next steps, and notes for your own job-search workflow.',
    to: '/job/applications',
  },
]

const sharedFeatures = [
  { title: 'Community', desc: 'Post, comment, like, and collect discussions with other students.', to: '/community' },
  { title: 'Practice bank', desc: 'Practice by chapter, random mode, or mock mode with score records.', to: '/practice' },
]

export default function JobPage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">Employment direction</p>
            <h2>Employment feature panel</h2>
            <p className="muted">Career fairs, online resume, rule-based recommendations, station notifications, and application status tracking.</p>
          </div>
          <div className="track-grid">
            {features.map((item) => (
              <article className="track-card" key={item.to}>
                <div className="track-head">
                  <h3>{item.title}</h3>
                  <span className="tag subtle">Employment</span>
                </div>
                <p className="muted">{item.desc}</p>
                <Link className="btn primary small" to={item.to}>Open feature</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>Shared feature entry points</h2>
            <p className="muted">These features remain available to registered users across all directions.</p>
          </div>
          <div className="grid-two">
            {sharedFeatures.map((item) => (
              <div className="feature-card soft" key={item.to}>
                <div className="card-title">{item.title}</div>
                <p className="muted">{item.desc}</p>
                <Link className="btn outline small" to={item.to}>Go</Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
