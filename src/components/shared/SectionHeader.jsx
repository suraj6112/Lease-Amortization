function SectionHeader({ title, detail, icon: Icon }) {
  return (
    <div className="section-header">
      <div className="section-icon">
        <Icon size={18} />
      </div>
      <div>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>
    </div>
  )
}

export default SectionHeader
