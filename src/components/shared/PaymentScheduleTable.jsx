import { paymentSchedule } from '../../data/mockData'
import { formatCurrency } from '../../utils/formatCurrency'

function PaymentScheduleTable() {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>Monthly Payment</th>
            <th>Rule</th>
            <th>Frequency</th>
            <th>Notes</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {paymentSchedule.map((period) => (
            <tr key={`${period.startMonth}-${period.endMonth}`}>
              <td>Month {period.startMonth}</td>
              <td>Month {period.endMonth}</td>
              <td>{formatCurrency(period.payment)}</td>
              <td>{period.rule}</td>
              <td>{period.frequency} months</td>
              <td>{period.notes}</td>
              <td>{period.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PaymentScheduleTable
