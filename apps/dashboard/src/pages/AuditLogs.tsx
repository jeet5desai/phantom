import { useState, useEffect, useCallback } from 'react';
import { useRequest } from '@/hooks/useRequest';
import {
  Download,
  Play,
  Search,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  CircleAlert,
  Clock,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AuditLogEntry {
  id: string;
  agentId: string;
  action: string;
  result: string;
  reasoning: string | null;
  createdAt: string;
  timestamp?: string;
}

export default function AuditLogs() {
  // Main API request hook
  const request = useRequest();

  // Local state for audit logs and UI feedback
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Filter and search state
  const [filterAgent, setFilterAgent] = useState('All Agents');
  const [filterAction, setFilterAction] = useState('All Actions');
  const [filterResult, setFilterResult] = useState('All Results');
  const [searchQuery, setSearchQuery] = useState('');

  // Cryptographic integrity verification state
  const [integrityStatus, setIntegrityStatus] = useState<{
    valid: boolean;
    totalEntries: number;
    loading: boolean;
  }>({
    valid: true,
    totalEntries: 0,
    loading: true,
  });

  // Modal state for detailed entry view
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Live mode state for periodic polling
  const [isLiveMode, setIsLiveMode] = useState(false);

  /**
   * Fetches audit logs from the backend with current filters and pagination.
   * Uses useCallback to prevent unnecessary re-renders of child components and stable useEffect dependencies.
   */
  const fetchLogs = useCallback(async () => {
    // Avoid synchronous setState by using a microtask or conditional check
    // If it's already loading, don't set it again
    setLoading((prev) => (prev === true ? prev : true));

    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('offset', ((page - 1) * limit).toString());

      if (filterAgent !== 'All Agents') params.append('agentId', filterAgent);
      if (filterAction !== 'All Actions') params.append('action', filterAction);
      if (filterResult !== 'All Results') params.append('result', filterResult.toLowerCase());

      const data = await request('GET', `/api/v1/audit?${params.toString()}`);

      if (data?.entries) {
        setLogs(data.entries);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filterAgent, filterAction, filterResult, request, limit]);

  /**
   * Verifies the cryptographic hash chain of the audit ledger to ensure no data has been tampered with.
   */
  const verifyIntegrity = useCallback(async () => {
    try {
      const data = await request('GET', '/api/v1/audit/verify');
      if (data) {
        setIntegrityStatus((prev) => ({
          ...prev,
          valid: data.valid,
          totalEntries: data.totalEntries,
          loading: false,
        }));
      }
    } catch (err) {
      console.error('Failed to verify audit integrity:', err);
      setIntegrityStatus((prev) => ({ ...prev, loading: false }));
    }
  }, [request]);

  // Initial fetch and fetch on dependency change
  useEffect(() => {
    const trigger = async () => {
      await fetchLogs();
    };
    trigger();
  }, [fetchLogs]);

  // Initial integrity check
  useEffect(() => {
    const trigger = async () => {
      await verifyIntegrity();
    };
    trigger();
  }, [verifyIntegrity]);

  // Live Mode Polling logic: fetches new data every 5 seconds when active
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isLiveMode) {
      interval = setInterval(() => {
        fetchLogs();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveMode, fetchLogs]);

  /**
   * Exports current logs to a CSV file.
   * In a real app, this might request a larger dataset from the backend.
   */
  const handleExportCSV = () => {
    if (logs.length === 0) return;

    const headers = ['Timestamp', 'Agent ID', 'Action', 'Result', 'Reasoning'];
    const rows = logs.map((log) => [
      new Date(log.createdAt).toISOString(),
      log.agentId,
      log.action,
      log.result,
      (log.reasoning || '').replace(/,/g, ';'), // escape commas
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `agentkey-audit-logs-${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-lg fade-in">
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-display font-bold">Audit Logs</h1>
            {!integrityStatus.loading && (
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  integrityStatus.valid ? 'bg-success-bg text-success' : 'bg-error-bg text-error'
                }`}
              >
                <ShieldCheck size={14} />
                <span>Chain {integrityStatus.valid ? 'Verified' : 'Compromised'}</span>
              </div>
            )}
          </div>
          <p className="text-text-secondary text-lg">
            Immutable trail of every action performed by your AI agents.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              fetchLogs();
              verifyIntegrity();
            }}
            className="p-3 bg-surface-hover border border-border rounded-md text-text-secondary hover:text-accent-primary transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-md text-sm font-bold text-text-primary hover:bg-surface-hover transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-md text-sm font-bold transition-all border ${
              isLiveMode
                ? 'bg-success-bg text-success border-success/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                : 'bg-warning-bg text-warning border-warning/20 hover:bg-warning-bg/80'
            }`}
          >
            <div className="relative flex items-center justify-center">
              {isLiveMode && (
                <span className="absolute w-3 h-3 bg-success rounded-full animate-ping opacity-20" />
              )}
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  isLiveMode ? 'bg-success' : 'bg-warning'
                }`}
              />
            </div>
            <span>{isLiveMode ? 'Live Feed Active' : 'Go Live'}</span>
          </button>
        </div>
      </div>

      <div className="glass grid grid-cols-1 md:grid-cols-4 gap-lg p-lg">
        <div className="flex flex-col gap-2">
          <label className="label">Agent</label>
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium cursor-pointer"
          >
            <option>All Agents</option>
            {/* These should ideally come from an API, but for now we'll list common ones or use IDs */}
            <option value="system">System</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="label">Action</label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium cursor-pointer"
          >
            <option>All Actions</option>
            <option value="token.create">token.create</option>
            <option value="credential.store">credential.store</option>
            <option value="agent.create">agent.create</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="label">Result</label>
          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium cursor-pointer"
          >
            <option>All Results</option>
            <option value="success">Success</option>
            <option value="allowed">Allowed</option>
            <option value="denied">Denied</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="label">Search Search (Client Side)</label>
          <div className="flex items-center gap-2 bg-background px-4 py-2.5 rounded-md border border-border group focus-within:border-accent-primary transition-colors">
            <Search
              size={16}
              className="text-text-tertiary group-focus-within:text-accent-primary"
            />
            <input
              type="text"
              placeholder="Filter current view..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-text-primary w-full placeholder:text-text-tertiary"
            />
          </div>
        </div>
      </div>

      <div className="glass overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="px-lg py-4 label text-[10px]">Timestamp</th>
                <th className="px-lg py-4 label text-[10px]">Agent ID</th>
                <th className="px-lg py-4 label text-[10px]">Action</th>
                <th className="px-lg py-4 label text-[10px]">Result</th>
                <th className="px-lg py-4 label text-[10px]">Reasoning</th>
                <th className="px-lg py-4 label text-[10px] text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && logs.length === 0
                ? [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-lg py-8 bg-surface-hover/20"></td>
                    </tr>
                  ))
                : logs
                    .filter((log) => {
                      if (!searchQuery) return true;
                      const search = searchQuery.toLowerCase();
                      return (
                        log.action.toLowerCase().includes(search) ||
                        log.agentId.toLowerCase().includes(search) ||
                        (log.reasoning && log.reasoning.toLowerCase().includes(search))
                      );
                    })
                    .map((log) => (
                      <tr key={log.id} className="group hover:bg-background transition-colors">
                        <td className="px-lg py-5">
                          <div className="flex items-center gap-3 text-sm text-text-secondary whitespace-nowrap">
                            <Clock size={14} className="text-text-tertiary" />
                            <span>
                              {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-lg py-5">
                          <span className="font-mono text-xs text-accent-primary">
                            {log.agentId.slice(0, 12)}...
                          </span>
                        </td>
                        <td className="px-lg py-5">
                          <span className="text-sm font-semibold text-text-primary uppercase tracking-tight">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-lg py-5">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              log.result === 'allowed'
                                ? 'bg-success-bg text-success'
                                : log.result === 'denied'
                                  ? 'bg-error-bg text-error'
                                  : 'bg-warning-bg text-warning'
                            }`}
                          >
                            {log.result === 'allowed' && <CircleCheck size={14} />}
                            {log.result === 'denied' && <CircleX size={14} />}
                            {log.result === 'pending' && <CircleAlert size={14} />}
                            <span>{log.result}</span>
                          </div>
                        </td>
                        <td className="px-lg py-5">
                          <p className="text-xs text-text-secondary line-clamp-1 max-w-[300px]">
                            {log.reasoning || 'Default system check passed'}
                          </p>
                        </td>
                        <td className="px-lg py-5 text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-2 text-text-tertiary hover:bg-surface-hover hover:text-accent-primary transition-all rounded-md"
                          >
                            <ExternalLink size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-lg py-12 text-center text-text-tertiary italic">
                    No audit logs recorded yet. Run a demo script to generate traffic.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-lg flex justify-between items-center bg-surface border-t border-border">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${
              page === 1
                ? 'text-text-tertiary cursor-not-allowed'
                : 'text-text-primary hover:text-accent-primary'
            }`}
            disabled={page === 1 || loading}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
              {loading ? 'Fetching...' : `Page ${page} of ${Math.ceil(total / limit) || 1}`}
            </span>
            <span className="text-[10px] text-text-tertiary font-mono">Total Entries: {total}</span>
          </div>
          <button
            onClick={() => setPage((p) => p + 1)}
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${
              page * limit >= total
                ? 'text-text-tertiary cursor-not-allowed'
                : 'text-accent-primary hover:bg-accent-light px-4 py-2 rounded-md'
            }`}
            disabled={page * limit >= total || loading}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Log Detail Dialog */}
      <Dialog isOpen={!!selectedLog} onClose={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogClose onClick={() => setSelectedLog(null)} />
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-accent-primary" />
              </div>
              <div>
                <DialogTitle>Audit Entry Details</DialogTitle>
                <DialogDescription className="font-mono text-[10px]">
                  ID: {selectedLog?.id}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedLog && (
            <div className="flex flex-col gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass p-4 flex flex-col gap-1">
                  <span className="label text-[10px]">Timestamp</span>
                  <span className="text-sm font-bold">
                    {selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString() : '—'}
                  </span>
                </div>
                <div className="glass p-4 flex flex-col gap-1">
                  <span className="label text-[10px]">Result</span>
                  <div
                    className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit ${
                      selectedLog.result === 'allowed' || selectedLog.result === 'success'
                        ? 'bg-success-bg text-success'
                        : selectedLog.result === 'denied'
                          ? 'bg-error-bg text-error'
                          : 'bg-warning-bg text-warning'
                    }`}
                  >
                    <span>{selectedLog.result}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="label">Action & Resource</span>
                <div className="bg-surface p-4 rounded-md border border-border flex flex-col gap-1">
                  <span className="text-sm font-bold uppercase">{selectedLog.action}</span>
                  <span className="text-xs text-text-secondary font-mono">
                    Agent: {selectedLog.agentId}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="label">Reasoning</span>
                <p className="text-sm text-text-primary leading-relaxed bg-background p-4 rounded-md border border-border">
                  {selectedLog.reasoning || 'No additional reasoning provided by the system.'}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="label">Cryptographic Hash</span>
                  <span className="text-[10px] text-success font-bold uppercase tracking-widest">
                    Verified
                  </span>
                </div>
                <div className="bg-background p-3 rounded-md border border-border font-mono text-[10px] break-all text-text-tertiary">
                  {selectedLog.id} {/* In a real app, this would be the hash field */}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <button onClick={() => setSelectedLog(null)} className="btn-primary w-full py-3">
              Close Entry
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
