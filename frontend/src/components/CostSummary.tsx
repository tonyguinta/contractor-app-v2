interface CostSummaryProps {
  materialsCost: number
  laborCost: number
  permitsCost: number
  otherCost: number
}

export default function CostSummary({ 
  materialsCost, 
  laborCost, 
  permitsCost, 
  otherCost 
}: CostSummaryProps) {
  const totalCost = materialsCost + laborCost + permitsCost + otherCost

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Summary</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Materials:</span>
          <span className="text-sm font-medium text-right">{formatCurrency(materialsCost)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Labor:</span>
          <span className="text-sm font-medium text-right">{formatCurrency(laborCost)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Permits:</span>
          <span className="text-sm font-medium text-right">{formatCurrency(permitsCost)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Other Costs:</span>
          <span className="text-sm font-medium text-right">{formatCurrency(otherCost)}</span>
        </div>
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-base font-medium text-gray-900">Total Estimated Cost:</span>
            <span className="text-lg font-bold text-blue-600 text-right">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 