import { createContext } from 'react'

// Exposes Layout's `triggerTransition` so any page-level component (not just
// plain <a data-nav-link> anchors) can drive the site-wide blur-out → navigate
// → blur-in transition. Consumers pair it with react-router's useNavigate():
//
//   const triggerTransition = useContext(NavContext)
//   const navigate = useNavigate()
//   triggerTransition(() => navigate('/somewhere'))
//
// Null default means "no transition orchestration available" — callers should
// fall back to a direct navigate() in that case.
export const NavContext = createContext(null)
