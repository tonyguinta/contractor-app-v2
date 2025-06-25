interface CostSummaryProps {
  materialsCost: number
  laborCost: number
  permitsCost: number
  otherCost: number
  salesTaxRate?: number
  salesTaxAmount?: number
  totalWithTax?: number
  onTaxRateChange?: (rate: number) => void
  showTaxEditor?: boolean
}

export default function CostSummary({ 
  materialsCost, 
  laborCost, 
  permitsCost, 
  otherCost,
  salesTaxRate = 0,
  salesTaxAmount = 0,
  totalWithTax,
  onTaxRateChange,
  showTaxEditor = false
}: CostSummaryProps) {
  const subtotal = materialsCost + laborCost + permitsCost + otherCost
  const calculatedTaxAmount = subtotal * salesTaxRate
  const calculatedTotal = subtotal + calculatedTaxAmount

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
            <span className="text-base font-medium text-gray-900">Subtotal:</span>
            <span className="text-base font-medium text-right">{formatCurrency(subtotal)}</span>
          </div>
        </div>
        
        {/* Sales Tax Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sales Tax</span>
              {showTaxEditor && onTaxRateChange && (
                <input
                  type="number"
                  value={(salesTaxRate * 100).toFixed(2)}
                  onChange={(e) => onTaxRateChange(parseFloat(e.target.value) / 100 || 0)}
                  className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded text-center"
                  step="0.01"
                  min="0"
                  max="50"
                  placeholder="0.00"
                />
              )}
              {!showTaxEditor && (
                <span className="text-xs text-gray-500">
                  ({(salesTaxRate * 100).toFixed(2)}%)
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-right">
              {formatCurrency(salesTaxAmount || calculatedTaxAmount)}
            </span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total with Tax:</span>
            <span className="text-xl font-bold text-blue-600 text-right">
              {formatCurrency(totalWithTax || calculatedTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 