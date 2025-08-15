import { Link, useLocation } from 'react-router-dom'

export default function BackButton() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  return (
    <div className="topbar">
      {!isHome && (
        <Link to="/" className="back-btn" aria-label="뒤로 가기 (홈)">
          ← Back
        </Link>
      )}
      <div style={{opacity:.9, fontWeight:700, letterSpacing:'.16em', textTransform:'lowercase'}}>
        cipher deck
      </div>
    </div>
  )
}
