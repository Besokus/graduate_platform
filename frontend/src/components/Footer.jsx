import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer">
      <div>毕业去向导航与交流平台 © 2026</div>
      <div className="footer-links">
        <Link to="/community">社区</Link>
        <Link to="/practice">题库</Link>
        <Link to="/kaoyan">考研</Link>
        <Link to="/kaogong">考公</Link>
        <Link to="/job">就业</Link>
        <Link to="/studyabroad">留学</Link>
      </div>
    </footer>
  )
}

export default Footer
