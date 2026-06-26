import Sidebar from './Sidebar'
import Topbar from './Topbar'

function AppLayout({
  children,
  pageTitle,
  sidebarOpen,
  onNavigate,
  onMenuOpen,
  onSidebarClose,
  onSignOut,
}) {
  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onNavigate={onNavigate} />

      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Close sidebar"
          onClick={onSidebarClose}
        />
      )}

      <main className="main-area">
        <Topbar pageTitle={pageTitle} onMenuOpen={onMenuOpen} onSignOut={onSignOut} />
        <section className="content">{children}</section>
      </main>
    </div>
  )
}

export default AppLayout
