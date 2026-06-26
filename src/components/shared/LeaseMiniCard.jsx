import StatusBadge from './StatusBadge'

function LeaseMiniCard({ lease }) {
  return (
    <article className="lease-mini-card">
      <div>
        <strong>{lease.name}</strong>
        <span>{lease.uploaded}</span>
      </div>
      <StatusBadge status={lease.status} />
      <p>{lease.review}</p>
    </article>
  )
}

export default LeaseMiniCard
