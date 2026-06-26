export function Field({ label, value }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input defaultValue={value} />
    </label>
  )
}

export function AccountField({ label, value }) {
  return (
    <label className="account-field">
      <span>{label}</span>
      <input defaultValue={value} />
    </label>
  )
}
