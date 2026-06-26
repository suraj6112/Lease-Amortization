import { journalEntries } from '../../data/mockData'
import { formatCurrency } from '../../utils/formatCurrency'

function JournalEntryTable({ totals }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th>Description</th>
            <th className="align-right">Debit</th>
            <th className="align-right">Credit</th>
          </tr>
        </thead>
        <tbody>
          {journalEntries.map((entry) => (
            <tr key={entry.account}>
              <td>
                <strong>{entry.account}</strong>
              </td>
              <td>{entry.description}</td>
              <td className="align-right">{entry.debit ? formatCurrency(entry.debit) : '-'}</td>
              <td className="align-right">{entry.credit ? formatCurrency(entry.credit) : '-'}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td colSpan="2">Total</td>
            <td className="align-right">{formatCurrency(totals.debit)}</td>
            <td className="align-right">{formatCurrency(totals.credit)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default JournalEntryTable
