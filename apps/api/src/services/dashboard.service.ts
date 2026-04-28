import prisma from '../db/prisma.js';
import { verifyAuditChain } from './audit.service.js';

export class DashboardService {
  /**
   * Get aggregate statistics for the dashboard.
   */
  async getStats(orgId: string) {
    // 1. Active Agents
    const activeAgentsCount = await prisma.agent.count({
      where: {
        orgId,
        revokedAt: null,
      },
    });

    // 2. Total Tokens Issued
    const totalTokensCount = await prisma.token.count({
      where: {
        agent: {
          orgId,
        },
      },
    });

    // 3. Blocked Escalations (Audit logs with 'denied' result)
    const blockedCount = await prisma.auditLog.count({
      where: {
        orgId,
        result: 'denied',
      },
    });

    // 4. Audit Chain Integrity
    const integrityCheck = await verifyAuditChain(orgId);

    // 0. Org Name
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true },
    });
    const orgName = org?.name || 'Organization';

    return {
      orgName,
      activeAgents: activeAgentsCount,
      totalTokens: totalTokensCount,
      blockedEscalations: blockedCount,
      auditIntegrity: integrityCheck.valid ? 100 : 0,
      recentActivity: await this.getRecentActivity(orgId),
    };
  }

  /**
   * Get a combined stream of recent events.
   */
  private async getRecentActivity(orgId: string) {
    const logs = await prisma.auditLog.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // We need agent names, but audit_log doesn't have a direct relation in schema yet
    // because it was created with BIGSERIAL and raw SQL.
    // Let's fetch agent names for these logs.
    const agentIds = [...new Set(logs.map((l) => l.agentId))];
    const agents = await prisma.agent.findMany({
      where: { id: { in: agentIds } },
      select: { id: true, name: true },
    });
    const agentMap = Object.fromEntries(agents.map((a) => [a.id, a.name]));

    return logs.map((row) => ({
      id: row.id.toString(),
      type: row.result === 'allowed' ? 'success' : row.result === 'denied' ? 'error' : 'info',
      action: row.action,
      agent: agentMap[row.agentId] || 'Unknown Agent',
      meta: `${row.resource || 'Identity check'} • ${this.formatTime(row.createdAt)}`,
      timestamp: row.createdAt,
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
