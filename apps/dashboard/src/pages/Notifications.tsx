import {
  CheckCircle2,
  AlertCircle,
  Info,
  ShieldAlert,
  Search,
  MoreVertical,
  Check,
  Trash2,
} from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'New Agent Created',
    message: "A new agent 'github-bot' was created by John Doe and granted Repository Read access.",
    time: '2m ago',
    type: 'info',
    isRead: false,
  },
  {
    id: 2,
    title: 'Permission Alert',
    message:
      "Agent 'customer-support' is attempting to access sensitive data in 'Customer DB' without a valid session token.",
    time: '15m ago',
    type: 'warning',
    isRead: false,
  },
  {
    id: 3,
    title: 'Secret Expiring',
    message:
      "Your 'Stripe Production Key' is set to expire in 3 days. Please rotate it to avoid service interruption.",
    time: '2h ago',
    type: 'error',
    isRead: true,
  },
  {
    id: 4,
    title: 'Policy Update',
    message:
      "Global policy 'Production Access' has been updated to require Multi-Factor Authentication.",
    time: '1d ago',
    type: 'info',
    isRead: true,
  },
  {
    id: 5,
    title: 'Weekly Security Report',
    message:
      'Your weekly security audit is ready. 2,402 actions were verified with a 100% compliance rate.',
    time: '2d ago',
    type: 'success',
    isRead: true,
  },
];

export default function Notifications() {
  return (
    <div className="flex flex-col gap-lg fade-in">
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-display font-bold">Notifications</h1>
          <p className="text-text-secondary text-lg">
            Stay updated with agent activity, security alerts, and system status.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline flex items-center gap-2 text-sm font-bold">
            <Check size={16} />
            Mark all as read
          </button>
          <button className="btn-outline flex items-center gap-2 text-sm font-bold text-error border-error/20 hover:bg-error-bg">
            <Trash2 size={16} />
            Clear all
          </button>
        </div>
      </div>

      <div className="glass flex justify-between items-center px-lg py-4">
        <div className="flex items-center gap-3 flex-1">
          <Search size={18} className="text-text-tertiary" />
          <input
            type="text"
            placeholder="Search notifications..."
            className="bg-transparent border-none outline-none text-text-primary w-full text-sm placeholder:text-text-tertiary"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex bg-background border border-border rounded-md p-1">
            <button className="px-4 py-1.5 rounded-sm text-xs font-bold bg-surface text-text-primary">
              All
            </button>
            <button className="px-4 py-1.5 rounded-sm text-xs font-bold text-text-tertiary hover:text-text-secondary transition-colors">
              Unread
            </button>
            <button className="px-4 py-1.5 rounded-sm text-xs font-bold text-text-tertiary hover:text-text-secondary transition-colors">
              Archived
            </button>
          </div>
        </div>
      </div>

      <div className="glass flex flex-col divide-y divide-border overflow-hidden">
        {NOTIFICATIONS.map((notif) => (
          <div
            key={notif.id}
            className={`flex gap-6 p-lg hover:bg-background transition-all group relative cursor-pointer ${!notif.isRead ? 'bg-accent-light/30' : ''}`}
          >
            {!notif.isRead && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-primary"></div>
            )}

            <div
              className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center ${
                notif.type === 'info'
                  ? 'bg-accent-light text-accent-primary'
                  : notif.type === 'warning'
                    ? 'bg-warning-bg text-warning'
                    : notif.type === 'error'
                      ? 'bg-error-bg text-error'
                      : 'bg-success-bg text-success'
              }`}
            >
              {notif.type === 'info' && <Info size={24} />}
              {notif.type === 'warning' && <ShieldAlert size={24} />}
              {notif.type === 'error' && <AlertCircle size={24} />}
              {notif.type === 'success' && <CheckCircle2 size={24} />}
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <div className="flex justify-between items-start">
                <h3
                  className={`font-display font-bold text-lg ${!notif.isRead ? 'text-text-primary' : 'text-text-secondary'}`}
                >
                  {notif.title}
                </h3>
                <span className="text-xs font-medium text-text-tertiary">{notif.time}</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
                {notif.message}
              </p>
              {!notif.isRead && (
                <div className="flex gap-4 mt-3">
                  <button className="text-[11px] font-bold text-accent-primary hover:underline uppercase tracking-wider">
                    Mark as read
                  </button>
                  <button className="text-[11px] font-bold text-text-tertiary hover:text-text-primary hover:underline uppercase tracking-wider">
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            <button className="p-2 text-text-tertiary hover:bg-surface-hover rounded-md transition-colors opacity-0 group-hover:opacity-100">
              <MoreVertical size={20} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <button className="text-sm font-bold text-text-tertiary hover:text-accent-primary transition-colors">
          View older notifications
        </button>
      </div>
    </div>
  );
}
