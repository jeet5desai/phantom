

import { Link } from 'react-router-dom';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  ShieldCheck,
  Activity,
  Lock,
  Key,
  Plug,
  Settings,
  Shield,
  BookOpen,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Agents', href: '/agents', icon: Bot },
  { name: 'Vault', href: '/vault', icon: Lock },
  { name: 'API Keys', href: '/api-keys', icon: Key },
  { name: 'Audit Logs', href: '/audit-logs', icon: Activity },
  { name: 'Permissions', href: '/permissions', icon: ShieldCheck },
  { name: 'Integrations', href: '/integrations', icon: Plug },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Resources', href: '/resources', icon: BookOpen },
];

export default function SidebarNav() {
  const location = useLocation();

  return (
    <nav className="flex flex-col gap-1 flex-1">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;

        return (
          <Link key={item.name}
            to={item.href}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-md group
              ${
                isActive
                  ? 'bg-accent-light text-accent-primary font-bold border border-accent-primary/10'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }
            `}
          >
            <Icon
              size={20}
              className={`${isActive ? 'text-accent-primary' : 'text-text-tertiary group-hover:text-text-secondary'}`}
            />
            <span className="text-sm tracking-tight">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
