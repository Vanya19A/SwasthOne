import {
  Activity,
  ClipboardList,
  FileHeart,
  Home,
  LogOut,
  Settings,
  Users,
} from 'lucide-react'

interface SidebarProps {
  activeItem?: string
}

function Sidebar({ activeItem = 'Dashboard' }: SidebarProps) {
  const menuItems = [
    { label: 'Dashboard', icon: Home },
    { label: 'Patients', icon: Users },
    { label: 'Screening', icon: Activity },
    { label: 'Referrals', icon: ClipboardList },
    { label: 'Health Records', icon: FileHeart },
  ]

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Activity size={22} />
        </div>

        <div>
          <div className="brand-name">SwasthOne</div>
          <div className="brand-tagline">Healthcare, closer to you</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <button
              key={item.label}
              className={`nav-item ${
                activeItem === item.label ? 'active' : ''
              }`}
              type="button"
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-bottom">
        <button className="nav-item" type="button">
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <button className="nav-item logout" type="button">
          <LogOut size={19} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar