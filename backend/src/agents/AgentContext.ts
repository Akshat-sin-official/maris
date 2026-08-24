export interface AgentTraceEntry {
  agent: string;
  action: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  output?: any;
}

export interface AgentContext {
  query: string;
  location?: { type: 'Point'; coordinates: [number, number] };
  language?: string;
  context?: any;
  trace: AgentTraceEntry[];
  accumulatedData: Record<string, any>;
}

export abstract class BaseAgent {
  abstract name: string;
  abstract run(context: AgentContext): Promise<void>;
}
