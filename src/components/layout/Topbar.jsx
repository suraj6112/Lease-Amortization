import { LogOut, Menu } from 'lucide-react'

function Topbar({ pageTitle, onMenuOpen, onSignOut }) {
  return (
    <header className="topbar">
      <button
        className="icon-button mobile-menu"
        type="button"
        aria-label="Open navigation"
        onClick={onMenuOpen}
      >
        <Menu size={20} />
      </button>
      <div>
        <span className="eyebrow">Lease automation workspace</span>
        <h1>{pageTitle}</h1>
      </div>
      <div className="topbar-actions">
        <button className="icon-button" type="button" aria-label="Sign out" title="Sign out" onClick={onSignOut}>
          <LogOut size={19} />
        </button>
      </div>
    </header>
  )
}

export default Topbar
