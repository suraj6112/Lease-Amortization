import { FileCheck2 } from 'lucide-react'

function Brand({ className = '' }) {
  return (
    <div className={`brand ${className}`}>
      <div className="brand-mark">
        <FileCheck2 size={22} />
      </div>
      <div>
        <strong>LeaseFlow AI</strong>
        <span>Amortization Ops</span>
      </div>
    </div>
  )
}

export default Brand
