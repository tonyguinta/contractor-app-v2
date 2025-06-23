import React, { useState, useEffect } from 'react';
import { useCostCalculation } from '../context/CostCalculationContext';

const ConflictResolutionDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { getConflicts, resolveConflict } = useCostCalculation();
  const conflicts = getConflicts();

  // Open dialog when conflicts appear
  useEffect(() => {
    if (conflicts.size > 0) {
      setIsOpen(true);
    }
  }, [conflicts.size]);

  const onClose = () => setIsOpen(false);

  if (!isOpen || conflicts.size === 0) return null;

  const handleResolveConflict = (key: string, useLocalValue: boolean) => {
    resolveConflict(key, useLocalValue);
    
    // Close dialog if no more conflicts
    if (conflicts.size === 1) {
      onClose();
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getCostTypeLabel = (costType: string): string => {
    const labels: Record<string, string> = {
      materials: 'Materials',
      labor: 'Labor',
      permits: 'Permits',
      other: 'Other Costs'
    };
    return labels[costType] || costType;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Resolve Cost Conflicts
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {Array.from(conflicts.entries()).map(([key, conflict]) => (
            <div key={key} className="border border-gray-200 rounded-lg p-4">
              <div className="mb-3">
                <h4 className="font-medium text-gray-900">
                  {getCostTypeLabel(conflict.costType)} Cost Conflict
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  The server has a different value than your recent changes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Your Value</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {formatCurrency(conflict.localValue)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(conflict.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Server Value</div>
                  <div className="text-lg font-semibold text-red-600">
                    {formatCurrency(conflict.serverValue)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Latest from server
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleResolveConflict(key, true)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Keep My Value
                </button>
                <button
                  onClick={() => handleResolveConflict(key, false)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Use Server Value
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionDialog;