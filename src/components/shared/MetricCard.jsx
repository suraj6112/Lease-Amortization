function MetricCard({ label, value, detail, trend, icon: Icon }) {
  return (
    <article className="metric-card">
      <div className="metric-icon">
        <Icon size={20} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
      <small>{trend}</small>
    </article>
  )
}

export default MetricCard
