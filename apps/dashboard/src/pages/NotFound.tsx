

import { Link } from 'react-router-dom';
import { Bot, ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-6 fade-in">
      <div className="flex flex-col items-center text-center gap-8 max-w-lg">
        <div className="relative">
          <div className="w-32 h-32 bg-accent-light rounded-full flex items-center justify-center animate-pulse">
            <Bot size={64} className="text-accent-primary" />
          </div>
          <div className="absolute -top-2 -right-2 bg-error text-white px-3 py-1 rounded-full text-xs font-bold ">
            404
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-5xl font-display font-bold">Lost in the sandbox?</h1>
          <p className="text-text-secondary text-lg">
            The page you&apos;re looking for doesn&apos;t exist or has been relocated to a different
            sector.
          </p>
        </div>

        <div className="flex flex-col w-full gap-4">
          <div className="relative group">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent-primary transition-colors"
            />
            <input
              type="text"
              placeholder="Search for agents, logs, or pages..."
              className="w-full pl-12 pr-4 py-4 bg-surface border border-border rounded-xl outline-none focus:border-accent-primary transition-all "
            />
          </div>

          <div className="flex gap-3">
            <Link
              to="/"
              className="flex-1 btn-primary py-4 flex items-center justify-center gap-2 "
            >
              <Home size={18} />
              <span>Back to Dashboard</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex-1 btn-outline py-4 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              <span>Go Back</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-text-tertiary font-medium">
          If you believe this is a system error, please contact our{' '}
          <Link to="/resources" className="text-accent-primary hover:underline">
            security team
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
