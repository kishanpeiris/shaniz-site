// Formats a plain calendar date (a DATE column's value — no time, no
// timezone meaning) for display.
//
// node-postgres parses DATE columns into JS Date objects, which then
// serialize over JSON as full ISO datetime strings like
// "2026-12-25T00:00:00.000Z" — not the plain "2026-12-25" you might
// expect. Passing that string straight to `new Date(...)` and then
// `.toLocaleDateString()` has a classic timezone pitfall: a UTC-midnight
// instant can roll back to the previous day once converted to a
// timezone behind UTC. Pulling out the Y/M/D and constructing the Date
// from local components sidesteps that entirely, and works whether the
// input is a bare "YYYY-MM-DD" or the fuller ISO string.
export function formatCalendarDate(raw) {
  const [y, m, d] = String(raw).slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString()
}
