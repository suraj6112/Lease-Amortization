import { CheckCircle2 } from 'lucide-react'

function StatusStep({ label, active }) {
  return (
    <div className={`status-step ${active ? 'active' : ''}`}>
      <CheckCircle2 size={17} />
      <span>{label}</span>
    </div>
  )
}

export default StatusStep
