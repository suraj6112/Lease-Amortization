import { leases } from '../../data/mockData'
import { formatCurrency } from '../../utils/formatCurrency'
import StatusBadge from './StatusBadge'

function LeaseTable({ compact = false }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Lease</th>
            <th>Status</th>
            {!compact && <th>Owner</th>}
            <th className="align-right">Payment</th>
            <th className="align-right">Liability</th>
          </tr>
        </thead>
        <tbody>
          {leases.map((lease) => (
            <tr key={lease.id}>
              <td>
                <strong>{lease.name}</strong>
                <span>{lease.location}</span>
              </td>
              <td>
                <StatusBadge status={lease.status} />
              </td>
              {!compact && <td>{lease.owner}</td>}
              <td className="align-right">{formatCurrency(lease.monthlyPayment)}</td>
              <td className="align-right">{formatCurrency(lease.liability)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default LeaseTable
