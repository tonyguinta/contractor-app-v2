import { subprojectsApi } from './client';

interface PendingUpdate {
  controller: AbortController;
  timestamp: number;
  data: any;
}

interface QueuedUpdate {
  subprojectId: string;
  costType: 'materials' | 'labor' | 'permits' | 'other';
  data: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class CostUpdateQueue {
  private pendingUpdates = new Map<string, PendingUpdate>();
  private updateQueue = new Map<string, QueuedUpdate[]>();
  private debounceTimeout = new Map<string, number>();
  private readonly DEBOUNCE_DELAY = 300;

  private getUpdateKey(subprojectId: string, costType: string): string {
    return `${subprojectId}-${costType}`;
  }

  async updateCost(
    subprojectId: string,
    costType: 'materials' | 'labor' | 'permits' | 'other',
    data: any
  ): Promise<any> {
    const key = this.getUpdateKey(subprojectId, costType);

    return new Promise((resolve, reject) => {
      // Cancel any existing timeout for this key
      const existingTimeout = this.debounceTimeout.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Add to queue
      const queuedUpdates = this.updateQueue.get(key) || [];
      queuedUpdates.push({ subprojectId, costType, data, resolve, reject });
      this.updateQueue.set(key, queuedUpdates);

      // Set new debounced timeout
      const timeout = setTimeout(() => {
        this.processBatchedUpdate(key);
      }, this.DEBOUNCE_DELAY);

      this.debounceTimeout.set(key, timeout);
    });
  }

  private async processBatchedUpdate(key: string): Promise<void> {
    const queuedUpdates = this.updateQueue.get(key);
    if (!queuedUpdates || queuedUpdates.length === 0) return;

    // Take the most recent update (discard older ones)
    const mostRecentUpdate = queuedUpdates[queuedUpdates.length - 1];
    const { subprojectId, costType, data, resolve, reject } = mostRecentUpdate;

    // Reject older updates with a specific error
    for (let i = 0; i < queuedUpdates.length - 1; i++) {
      queuedUpdates[i].reject(new Error('SUPERSEDED'));
    }

    // Clear the queue
    this.updateQueue.delete(key);
    this.debounceTimeout.delete(key);

    // Cancel any existing request for this key
    const existing = this.pendingUpdates.get(key);
    if (existing) {
      existing.controller.abort();
    }

    // Create new request with abort controller
    const controller = new AbortController();
    this.pendingUpdates.set(key, {
      controller,
      timestamp: Date.now(),
      data
    });

    try {
      let result;
      
      // If data is empty, this is just a local cost update - skip server sync
      if (!data || data.length === 0) {
        result = { message: 'Local cost update only' };
      } else {
        // For now, use individual item updates since bulk endpoints don't exist yet
        // TODO: Replace with bulk endpoints when backend supports them
        switch (costType) {
          case 'materials': {
            // Use existing individual material update endpoints
            const materialPromises = data.map((item: any) => 
              item.id ? subprojectsApi.updateMaterial(item.id, item) : subprojectsApi.createMaterial(parseInt(subprojectId), item)
            );
            result = await Promise.all(materialPromises);
            break;
          }
          case 'labor': {
            const laborPromises = data.map((item: any) => 
              item.id ? subprojectsApi.updateLabor(item.id, item) : subprojectsApi.createLabor(parseInt(subprojectId), item)
            );
            result = await Promise.all(laborPromises);
            break;
          }
          case 'permits': {
            const permitPromises = data.map((item: any) => 
              item.id ? subprojectsApi.updatePermit(item.id, item) : subprojectsApi.createPermit(parseInt(subprojectId), item)
            );
            result = await Promise.all(permitPromises);
            break;
          }
          case 'other': {
            const otherPromises = data.map((item: any) => 
              item.id ? subprojectsApi.updateOtherCost(item.id, item) : subprojectsApi.createOtherCost(parseInt(subprojectId), item)
            );
            result = await Promise.all(otherPromises);
            break;
          }
          default:
            throw new Error(`Unknown cost type: ${costType}`);
        }
      }

      this.pendingUpdates.delete(key);
      resolve(result);
    } catch (error: any) {
      this.pendingUpdates.delete(key);
      
      if (error.name === 'AbortError') {
        reject(new Error('REQUEST_CANCELLED'));
      } else {
        reject(error);
      }
    }
  }

  // Cancel all pending updates for a subproject (useful for cleanup)
  cancelUpdatesForSubproject(subprojectId: string): void {
    const keysToCancel = Array.from(this.pendingUpdates.keys())
      .filter(key => key.startsWith(`${subprojectId}-`));

    keysToCancel.forEach(key => {
      const pending = this.pendingUpdates.get(key);
      if (pending) {
        pending.controller.abort();
        this.pendingUpdates.delete(key);
      }

      const timeout = this.debounceTimeout.get(key);
      if (timeout) {
        clearTimeout(timeout);
        this.debounceTimeout.delete(key);
      }

      this.updateQueue.delete(key);
    });
  }

  // Get status of pending updates
  getPendingUpdates(): string[] {
    return Array.from(this.pendingUpdates.keys());
  }

  // Check if a specific update is pending
  isUpdatePending(subprojectId: string, costType: string): boolean {
    const key = this.getUpdateKey(subprojectId, costType);
    return this.pendingUpdates.has(key) || this.updateQueue.has(key);
  }
}

// Export singleton instance
export const costUpdateQueue = new CostUpdateQueue();