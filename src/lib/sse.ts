import { EventEmitter } from 'events';

class SSEManager extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }
}

const globalForSSE = globalThis as unknown as { sseManager?: SSEManager };

export const sseManager = globalForSSE.sseManager || new SSEManager();
if (process.env.NODE_ENV !== 'production') globalForSSE.sseManager = sseManager;
