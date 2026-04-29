import { useLocation } from 'react-router-dom';
import SidebarNav from '@/components/SidebarNav';
import TopBar from '@/components/TopBar';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useAuth();
  const location = useLocation();

  const isAuthPage =
    location.pathname.startsWith('/sign-in') ||
    location.pathname.startsWith('/sign-up') ||
    location.pathname.startsWith('/sso-callback');

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r border-border bg-surface flex flex-col fixed inset-y-0 z-50">
        <div className="p-lg flex items-center gap-3">
          <ShieldCheck className="text-accent-primary" size={32} />
          <span className="text-xl font-display font-bold tracking-tight">AgentKey</span>
        </div>

        <div className="flex-1 px-4 py-2">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex-1 ml-64 flex flex-col">
        <TopBar />
        <main className="p-lg">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
