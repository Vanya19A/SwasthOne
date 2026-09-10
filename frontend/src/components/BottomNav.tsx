import {
  Activity,
  ClipboardList,
  Home,
  Users,
} from 'lucide-react'

function BottomNav() {
  return (
    <nav className="bottom-nav">
      <button className="bottom-nav-item active" type="button">
        <Home size={20} />
        <span>Home</span>
      </button>

      <button className="bottom-nav-item" type="button">
        <Users size={20} />
        <span>Patients</span>
      </button>

      <button className="bottom-nav-item" type="button">
        <Activity size={20} />
        <span>Screen</span>
      </button>

      <button className="bottom-nav-item" type="button">
        <ClipboardList size={20} />
        <span>Referrals</span>
      </button>
    </nav>
  )
}

export default BottomNav