import { query } from '../db/pool.js';
import { verifyAuditChain } from './audit.service.js';

export class DashboardService {
  /**
   * Get aggregate statistics for the dashboard.
   */
  async getStats(orgId: string) {
    // 1. Active Agents
    const agentsCount = await query(
      'SELECT COUNT(*) FROM agents WHERE org_id = $1 AND revoked_at IS NULL',
      [orgId],
    );

    // 2. Total Tokens Issued
    const tokensCount = await query(
      'SELECT COUNT(*) FROM tokens t JOIN agents a ON t.agent_id = a.id WHERE a.org_id = $1',
      [orgId],
    );

    // 3. Blocked Escalations (Audit logs with 'denied' result)
    const blockedCount = await query(
      "SELECT COUNT(*) FROM audit_log WHERE org_id = $1 AND result = 'denied'",
      [orgId],
    );

    // 4. Audit Chain Integrity
    const integrityCheck = await verifyAuditChain(orgId);

    // 0. Org Name
    const orgRes = await query('SELECT name FROM organizations WHERE id = $1', [orgId]);
    const orgName = orgRes.rows[0]?.name || 'Organization';

    return {
      orgName,
      activeAgents: parseInt(agentsCount.rows[0].count),
      totalTokens: parseInt(tokensCount.rows[0].count),
      blockedEscalations: parseInt(blockedCount.rows[0].count),
      auditIntegrity: integrityCheck.valid ? 100 : 0,
      recentActivity: await this.getRecentActivity(orgId),
    };
  }

  /**
   * Get a combined stream of recent events.
   */
  private async getRecentActivity(orgId: string) {
    const res = await query(
      `SELECT 
        al.id, 
        al.action, 
        al.result, 
        al.resource, 
        al.created_at,
        a.name as agent_name
       FROM audit_log al
       JOIN agents a ON al.agent_id = a.id
       WHERE al.org_id = $1
       ORDER BY al.created_at DESC
       LIMIT 5`,
      [orgId],
    );

    return res.rows.map((row) => ({
      id: row.id,
      type: row.result === 'allowed' ? 'success' : row.result === 'denied' ? 'error' : 'info',
      action: row.action,
      agent: row.agent_name,
      meta: `${row.resource || 'Identity check'} • ${this.formatTime(row.created_at)}`,
      timestamp: row.created_at,
    }));
  }

  private formatTime(date: Date) {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  }
}

export const dashboardService = new DashboardService();
