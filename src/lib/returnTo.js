// "Take me back to where I was" after signing in.
//
// Two small notes are kept in sessionStorage (cleared when the tab closes):
//   1. the last page the visitor was on (not counting login/register
//      pages) plus how far down they had scrolled, and
//   2. a one-shot "please restore this scroll position" request that
//      ScrollToTop picks up right after the redirect.

const LAST_KEY = 'shaniz_last_page'
const RESTORE_KEY = 'shaniz_restore_scroll'
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']

export const isAuthPath = (pathname) => AUTH_PATHS.includes(pathname)
const isAdminPath = (url) => url === '/admin' || url.startsWith('/admin/')

const read = (key) => {
  try {
    return JSON.parse(sessionStorage.getItem(key) || 'null')
  } catch {
    return null
  }
}
const write = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private browsing etc. — not critical */
  }
}

export function rememberPage(location) {
  if (isAuthPath(location.pathname)) return
  write(LAST_KEY, { url: `${location.pathname}${location.search}${location.hash}`, y: 0 })
}

export function rememberScroll(y) {
  if (isAuthPath(window.location.pathname)) return
  const last = read(LAST_KEY)
  if (last) write(LAST_KEY, { ...last, y: Math.round(y) })
}

// Where should this person land after signing in / registering?
// Priority: the page a route guard sent them away from (router state),
// then the last page they browsed, then their role's home page.
export function resolveReturnTo(routerFrom, user) {
  const isStaff = ['admin', 'superadmin'].includes(user?.role)
  const fallback = { url: isStaff ? '/admin' : '/account', y: 0 }

  let target = null
  if (routerFrom?.pathname) {
    target = { url: `${routerFrom.pathname}${routerFrom.search || ''}${routerFrom.hash || ''}`, y: 0 }
    const last = read(LAST_KEY)
    if (last?.url === target.url) target.y = last.y || 0
  } else {
    target = read(LAST_KEY)
  }

  if (!target?.url || isAuthPath(target.url.split(/[?#]/)[0])) return fallback
  // A customer must never be sent to an admin URL (they'd just bounce back to login).
  if (isAdminPath(target.url) && !isStaff) return fallback
  return target
}

export function queueScrollRestore(url, y) {
  if (y > 0 && !url.includes('#')) write(RESTORE_KEY, { pathname: url.split(/[?#]/)[0], y })
}

// Returns the saved scroll position once, only if it belongs to this page.
export function takeScrollRestore(pathname) {
  const saved = read(RESTORE_KEY)
  if (!saved) return null
  try {
    sessionStorage.removeItem(RESTORE_KEY)
  } catch {
    /* ignore */
  }
  return saved.pathname === pathname ? saved.y : null
}
