import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import {
  Bell,
  Search,
  ChevronDown,
  CircleCheck,
  CircleAlert,
  Info,
  Settings,
  LogOut,
  User,
  Shield,
  Zap,
} from 'lucide-react';

export default function TopBar() {
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'New Agent Created',
      message: 'invoice-processor is now live.',
      time: '2m ago',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Policy Conflict',
      message: 'Check financial write guardrails.',
      time: '1h ago',
    },
    {
      id: 3,
      type: 'info',
      title: 'System Update',
      message: 'Kernel v2.4 successfully deployed.',
      time: '4h ago',
    },
  ];

  if (!isLoaded)
    return (
      <header className="h-16 border-b border-border bg-surface sticky top-0 z-50 animate-pulse" />
    );

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-lg bg-surface sticky top-0 z-50">
      <div className="flex items-center gap-3 bg-background px-4 py-2 rounded-md border border-border w-96 group focus-within:border-accent-primary transition-colors">
        <Search size={16} className="text-text-tertiary group-focus-within:text-accent-primary" />
        <input
          type="text"
          placeholder="Search agents, logs, tokens..."
          className="bg-transparent border-none outline-none text-sm text-text-primary w-full placeholder:text-text-tertiary"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button
            className={`p-2 rounded-md transition-colors relative ${showNotifications ? 'bg-surface-hover text-accent-primary' : 'text-text-secondary hover:bg-surface-hover'}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent-primary border-2 border-surface rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute top-12 right-0 w-80 glass z-50 overflow-hidden fade-in shadow-2xl">
              <div className="p-4 border-b border-border flex justify-between items-center bg-background/50 backdrop-blur-sm">
                <h4 className="font-display font-semibold">Notifications</h4>
                <button className="text-xs font-bold text-accent-primary hover:underline transition-all">
                  Mark all read
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 border-b border-border flex gap-3 hover:bg-background transition-colors cursor-pointer last:border-none"
                  >
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                        n.type === 'success'
                          ? 'bg-success-bg text-success'
                          : n.type === 'warning'
                            ? 'bg-warning-bg text-warning'
                            : 'bg-accent-light text-accent-primary'
                      }`}
                    >
                      {n.type === 'success' && <CircleCheck size={16} />}
                      {n.type === 'warning' && <CircleAlert size={16} />}
                      {n.type === 'info' && <Info size={16} />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-text-primary">{n.title}</span>
                      <p className="text-xs text-text-secondary leading-normal">{n.message}</p>
                      <span className="text-[10px] text-text-tertiary mt-1 font-medium">
                        {n.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border bg-background/50">
                <Link
                  to="/notifications"
                  className="block w-full text-center text-xs font-bold text-accent-primary py-2 hover:bg-accent-light rounded-md transition-colors"
                  onClick={() => setShowNotifications(false)}
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-6 border-l border-border hover:opacity-80 transition-all duration-200"
          >
            <div className="relative">
              <img
                src={user?.imageUrl}
                alt={user?.fullName || 'User'}
                className="w-9 h-9 rounded-full border-2 border-border group-hover:border-accent-primary transition-colors object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-surface rounded-full shadow-sm"></div>
            </div>
            <div className="hidden sm:flex flex-col items-start gap-0">
              <span className="text-sm font-semibold text-text-primary leading-tight">
                {user?.firstName || 'Guest'}
              </span>
              <span className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">
                {(user?.publicMetadata?.role as string) || 'Developer'}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={`text-text-tertiary transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`}
            />
          </button>

          {showUserMenu && (
            <div className="absolute top-12 right-0 w-64 glass z-50 overflow-hidden zoom-in-95 shadow-2xl">
              {/* User Header */}
              <div className="p-4 bg-background/50 backdrop-blur-md border-b border-border flex items-center gap-3">
                <img
                  src={user?.imageUrl}
                  alt={user?.fullName || 'User'}
                  className="w-10 h-10 rounded-full border border-border object-cover"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-text-primary truncate">
                    {user?.fullName}
                  </span>
                  <span className="text-[11px] text-text-tertiary truncate">
                    {user?.primaryEmailAddress?.emailAddress}
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md transition-all group"
                >
                  <Settings
                    size={16}
                    className="text-text-tertiary group-hover:text-accent-primary transition-colors"
                  />
                  <span className="font-medium">Manage account</span>
                </Link>

                <Link
                  to="/settings?tab=security"
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md transition-all group"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Shield
                    size={16}
                    className="text-text-tertiary group-hover:text-accent-primary transition-colors"
                  />
                  <span className="font-medium">Privacy & Security</span>
                </Link>

                <div className="h-px bg-border my-2 mx-2"></div>

                <button
                  onClick={async () => {
                    await signOut();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-error hover:bg-error-bg rounded-md transition-all group"
                >
                  <LogOut
                    size={16}
                    className="text-error/70 group-hover:text-error transition-colors"
                  />
                  <span className="font-bold">Sign out</span>
                </button>
              </div>

              {/* Footer / Dev Mode */}
              <div className="px-4 py-3 bg-accent-light/30 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-accent-primary uppercase tracking-widest">
                    Development mode
                  </span>
                </div>
                <Zap size={12} className="text-accent-primary" />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
