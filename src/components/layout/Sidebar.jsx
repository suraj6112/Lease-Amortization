import { NavLink } from 'react-router-dom'
import { navigation } from '../../data/mockData'
import Brand from './Brand'

function Sidebar({ isOpen, onNavigate }) {
  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      <Brand />

      <nav className="nav-list" aria-label="Primary navigation">
        {navigation.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              key={item.id}
              onClick={onNavigate}
              to={item.path}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
