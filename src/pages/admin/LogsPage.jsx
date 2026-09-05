import React, { useEffect, useState } from 'react'
import { apiGet } from '../../api/client.js'

export default function LogsPage() {
  const [audit, setAudit] = useState([])
  const [activity, setActivity] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    apiGet('/api/admin/audit-log').then((r) => setAudit(r.audit_log)).catch((e) => setError(e.message))
    apiGet('/api/admin/activity-log').then((r) => setActivity(r.activity_log)).catch((e) => setError(e.message))
  }, [])

  return (
    <div>
      <h2 className="mb-6 text-3xl">Logs</h2>
      {error && <p className="mb-4 text-sm text-[#a35a3a]">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 font-serif text-xl">Audit log <span className="text-xs font-sans text-[#8a8672]">(30 days)</span></h3>
          <div className="max-h-[28rem] overflow-y-auto rounded-sm border border-gold/30 bg-ivory">
            <table className="w-full text-left text-xs">
              <tbody>
                {audit.map((r) => (
                  <tr key={r.id} className="border-b border-gold/15">
                    <td className="whitespace-nowrap p-2 text-[#8a8672]">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-2">{r.action}</td>
                    <td className="p-2 font-mono text-[#8a8672]">{r.target?.slice(0, 8)}</td>
                  </tr>
                ))}
                {audit.length === 0 && <tr><td className="p-3 text-center text-[#8a8672]">No entries.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-serif text-xl">Activity feed <span className="text-xs font-sans text-[#8a8672]">(15 days)</span></h3>
          <div className="max-h-[28rem] overflow-y-auto rounded-sm border border-gold/30 bg-ivory">
            <table className="w-full text-left text-xs">
              <tbody>
                {activity.map((r) => (
                  <tr key={r.id} className="border-b border-gold/15">
                    <td className="whitespace-nowrap p-2 text-[#8a8672]">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-2">{r.action}</td>
                  </tr>
                ))}
                {activity.length === 0 && <tr><td className="p-3 text-center text-[#8a8672]">No entries.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
