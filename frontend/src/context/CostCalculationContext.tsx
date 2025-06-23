import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { costUpdateQueue } from '../api/costUpdateQueue';

interface CostValue {
  optimistic: number;    // Immediate UI value
  confirmed: number;     // Server-confirmed value
  timestamp: number;     // When optimistic value was set
  isPending: boolean;    // Whether update is in progress
}

interface CostState {
  costs: Map<string, CostValue>;
  conflicts: Map<string, ConflictData>;
}

interface ConflictData {
  localValue: number;
  serverValue: number;
  timestamp: number;
  costType: string;
  subprojectId: string;
}

interface CostCalculationContextType {
  // Get current cost value (optimistic if pending, confirmed otherwise)
  getCost: (subprojectId: string, costType: string) => number;
  
  // Update cost optimistically and queue server update
  updateCost: (subprojectId: string, costType: string, value: number, items: any[]) => Promise<void>;
  
  // Check if cost update is pending
  isPending: (subprojectId: string, costType: string) => boolean;
  
  // Get all pending updates
  getPendingUpdates: () => string[];
  
  // Conflict resolution
  resolveConflict: (key: string, useLocalValue: boolean) => void;
  getConflicts: () => Map<string, ConflictData>;
  
  // Set confirmed cost from server (used when fetching fresh data)
  setConfirmedCost: (subprojectId: string, costType: string, value: number) => void;
  
  // Calculate total for a subproject
  getSubprojectTotal: (subprojectId: string) => number;
}

const CostCalculationContext = createContext<CostCalculationContextType | undefined>(undefined);

export const useCostCalculation = () => {
  const context = useContext(CostCalculationContext);
  if (!context) {
    throw new Error('useCostCalculation must be used within a CostCalculationProvider');
  }
  return context;
};

interface CostCalculationProviderProps {
  children: React.ReactNode;
}

export const CostCalculationProvider: React.FC<CostCalculationProviderProps> = ({ children }) => {
  const [state, setState] = useState<CostState>({
    costs: new Map(),
    conflicts: new Map()
  });

  const getCostKey = (subprojectId: string, costType: string): string => {
    return `${subprojectId}-${costType}`;
  };

  const getCost = useCallback((subprojectId: string, costType: string): number => {
    const key = getCostKey(subprojectId, costType);
    const costValue = state.costs.get(key);
    
    if (!costValue) return 0;
    
    // Return optimistic value if pending and recent (< 5 seconds old)
    if (costValue.isPending && Date.now() - costValue.timestamp < 5000) {
      return costValue.optimistic;
    }
    
    return costValue.confirmed;
  }, [state.costs]);

  const setConfirmedCost = useCallback((subprojectId: string, costType: string, value: number) => {
    const key = getCostKey(subprojectId, costType);
    
    setState(prev => {
      const newCosts = new Map(prev.costs);
      const existing = newCosts.get(key);
      
      if (existing) {
        // Check for conflicts
        if (existing.isPending && existing.optimistic !== value) {
          const conflictData: ConflictData = {
            localValue: existing.optimistic,
            serverValue: value,
            timestamp: existing.timestamp,
            costType,
            subprojectId
          };
          
          const newConflicts = new Map(prev.conflicts);
          newConflicts.set(key, conflictData);
          
          return {
            costs: newCosts,
            conflicts: newConflicts
          };
        }
        
        // No conflict, update confirmed value
        newCosts.set(key, {
          ...existing,
          confirmed: value,
          isPending: false
        });
      } else {
        // New cost value
        newCosts.set(key, {
          optimistic: value,
          confirmed: value,
          timestamp: Date.now(),
          isPending: false
        });
      }
      
      return {
        ...prev,
        costs: newCosts
      };
    });
  }, []);

  const updateCost = useCallback(async (
    subprojectId: string,
    costType: string,
    value: number,
    items: any[]
  ): Promise<void> => {
    const key = getCostKey(subprojectId, costType);
    
    // Update optimistic value immediately
    setState(prev => {
      const newCosts = new Map(prev.costs);
      const existing = newCosts.get(key);
      
      newCosts.set(key, {
        optimistic: value,
        confirmed: existing?.confirmed || 0,
        timestamp: Date.now(),
        isPending: true
      });
      
      return {
        ...prev,
        costs: newCosts
      };
    });

    try {
      // Queue the server update
      await costUpdateQueue.updateCost(subprojectId, costType as any, items);
      
      // Update confirmed value on success
      setState(prev => {
        const newCosts = new Map(prev.costs);
        const existing = newCosts.get(key);
        
        if (existing) {
          newCosts.set(key, {
            ...existing,
            confirmed: value,
            isPending: false
          });
        }
        
        return {
          ...prev,
          costs: newCosts
        };
      });
      
    } catch (error: any) {
      // Handle different error types
      if (error.message === 'SUPERSEDED') {
        // Update was superseded by a newer one, just clear pending state
        setState(prev => {
          const newCosts = new Map(prev.costs);
          const existing = newCosts.get(key);
          
          if (existing) {
            newCosts.set(key, {
              ...existing,
              isPending: false
            });
          }
          
          return {
            ...prev,
            costs: newCosts
          };
        });
      } else if (error.message === 'REQUEST_CANCELLED') {
        // Request was cancelled, keep optimistic value but clear pending
        setState(prev => {
          const newCosts = new Map(prev.costs);
          const existing = newCosts.get(key);
          
          if (existing) {
            newCosts.set(key, {
              ...existing,
              isPending: false
            });
          }
          
          return {
            ...prev,
            costs: newCosts
          };
        });
      } else {
        // Real error occurred, revert to confirmed value
        setState(prev => {
          const newCosts = new Map(prev.costs);
          const existing = newCosts.get(key);
          
          if (existing) {
            newCosts.set(key, {
              ...existing,
              optimistic: existing.confirmed,
              isPending: false
            });
          }
          
          return {
            ...prev,
            costs: newCosts
          };
        });
        
        throw error; // Re-throw for component error handling
      }
    }
  }, []);

  const isPending = useCallback((subprojectId: string, costType: string): boolean => {
    const key = getCostKey(subprojectId, costType);
    return state.costs.get(key)?.isPending || false;
  }, [state.costs]);

  const getPendingUpdates = useCallback((): string[] => {
    return Array.from(state.costs.entries())
      .filter(([_, value]) => value.isPending)
      .map(([key, _]) => key);
  }, [state.costs]);

  const resolveConflict = useCallback((key: string, useLocalValue: boolean) => {
    setState(prev => {
      const conflict = prev.conflicts.get(key);
      if (!conflict) return prev;
      
      const newCosts = new Map(prev.costs);
      const existing = newCosts.get(key);
      
      if (existing) {
        const valueToUse = useLocalValue ? conflict.localValue : conflict.serverValue;
        newCosts.set(key, {
          ...existing,
          optimistic: valueToUse,
          confirmed: valueToUse,
          isPending: false
        });
      }
      
      const newConflicts = new Map(prev.conflicts);
      newConflicts.delete(key);
      
      return {
        costs: newCosts,
        conflicts: newConflicts
      };
    });
  }, []);

  const getConflicts = useCallback(() => {
    return state.conflicts;
  }, [state.conflicts]);

  const getSubprojectTotal = useCallback((subprojectId: string): number => {
    const materials = getCost(subprojectId, 'materials');
    const labor = getCost(subprojectId, 'labor');
    const permits = getCost(subprojectId, 'permits');
    const other = getCost(subprojectId, 'other');
    
    return materials + labor + permits + other;
  }, [getCost]);

  // Cleanup pending updates on unmount
  useEffect(() => {
    return () => {
      // Cancel all pending updates when component unmounts
      const pendingKeys = getPendingUpdates();
      pendingKeys.forEach(key => {
        const [subprojectId] = key.split('-');
        costUpdateQueue.cancelUpdatesForSubproject(subprojectId);
      });
    };
  }, [getPendingUpdates]);

  const value: CostCalculationContextType = {
    getCost,
    updateCost,
    isPending,
    getPendingUpdates,
    resolveConflict,
    getConflicts,
    setConfirmedCost,
    getSubprojectTotal
  };

  return (
    <CostCalculationContext.Provider value={value}>
      {children}
    </CostCalculationContext.Provider>
  );
};