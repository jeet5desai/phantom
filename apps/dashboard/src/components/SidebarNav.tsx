'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  ShieldCheck,
  Activity,
  Lock,
  Plug,
  Settings,
  Shield,
  BookOpen,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Agents', href: '/agents', icon: Bot },
  { name: 'Vault', href: '/vault', icon: Lock },
  { name: 'Audit Logs', href: '/audit-logs', icon: Activity },
  { name: 'Permissions', href: '/permissions', icon: ShieldCheck },
  { name: 'Integrations', href: '/integrations', icon: Plug },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Resources', href: '/resources', icon: BookOpen },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 flex-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group
              ${
                isActive
                  ? 'bg-accent-light text-accent-primary font-bold shadow-sm border border-accent-primary/10'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }
            `}
          >
            <Icon
              size={20}
              className={`transition-colors ${isActive ? 'text-accent-primary' : 'text-text-tertiary group-hover:text-text-secondary'}`}
            />
            <span className="text-sm tracking-tight">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
