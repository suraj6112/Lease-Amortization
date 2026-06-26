function ImpactRow({ label, value, muted }) {
  return (
    <div className="impact-row">
      <span>{label}</span>
      <strong className={muted ? 'muted' : ''}>{value}</strong>
    </div>
  )
}

export default ImpactRow
