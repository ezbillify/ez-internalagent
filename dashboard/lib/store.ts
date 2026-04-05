// dashboard/lib/store.ts
// A simple in-memory store for agent logs and metrics
// In a production app, this would be handled by a database (e.g. Supabase)

export interface LogEntry {
  time: string;
  type: "info" | "ok" | "err" | "running";
  text: string;
  agentId?: string;
}

export interface AgentMetrics {
  testsRun: number;
  bugsFiled: number;
  leadsToday: number;
  uptime: string;
  performance: number[]; // Sparkline data
}

class DashboardStore {
  private logs: LogEntry[] = [
    { time: new Date().toLocaleTimeString(), type: "info", text: "System initialized." }
  ];
  private globalMetrics: AgentMetrics = {
    testsRun: 0,
    bugsFiled: 0,
    leadsToday: 0,
    uptime: "99%",
    performance: [30, 45, 32, 50, 40, 60, 55]
  };

  private agentStats: Record<string, { metrics: any, logs: LogEntry[] }> = {
    qa: { metrics: { successRate: 94, totalTests: 0, avgTime: "1.2s" }, logs: [] },
    research: { metrics: { scans: 0, insights: 0, accuracy: 98 }, logs: [] },
    leads: { metrics: { totalLeads: 0, conversion: 12, quality: 85 }, logs: [] }
  };

  private listeners: Set<(data: any) => void> = new Set();

  addLog(type: LogEntry["type"], text: string, agentId?: string) {
    const entry = { time: new Date().toLocaleTimeString(), type, text, agentId };
    this.logs.unshift(entry);
    if (this.logs.length > 200) this.logs.pop();

    if (agentId && this.agentStats[agentId]) {
      this.agentStats[agentId].logs.unshift(entry);
      if (this.agentStats[agentId].logs.length > 100) this.agentStats[agentId].logs.pop();
    }

    this.notify();
  }

  updateGlobalMetrics(updater: (prev: AgentMetrics) => AgentMetrics) {
    this.globalMetrics = updater(this.globalMetrics);
    this.notify();
  }

  updateMetrics(updater: (prev: AgentMetrics) => AgentMetrics) {
    this.updateGlobalMetrics(updater);
  }

  updateAgentMetrics(agentId: string, updater: (prev: any) => any) {
    if (this.agentStats[agentId]) {
      this.agentStats[agentId].metrics = updater(this.agentStats[agentId].metrics);
      this.notify();
    }
  }

  getLogs() { return this.logs; }
  getMetrics() { return this.globalMetrics; }

  getData() {
    return {
      logs: this.logs,
      metrics: this.globalMetrics,
      agents: this.agentStats
    };
  }

  subscribe(callback: (data: any) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    const data = this.getData();
    this.listeners.forEach(cb => cb(data));
  }
}

export const dashboardStore = new DashboardStore();
