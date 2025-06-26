interface CostSummaryProps {
  materialsCost: number
  laborCost: number
  permitsCost: number
  otherCost: number
  salesTaxRate?: string // Decimal as string from API
  salesTaxAmount?: string // Decimal as string from API
  isTaxExempt?: boolean
  totalWithTax?: string // Decimal as string from API
}

export default function CostSummary({ 
  materialsCost, 
  laborCost, 
  permitsCost, 
  otherCost,
  salesTaxRate,
  salesTaxAmount,
  isTaxExempt,
  totalWithTax
}: CostSummaryProps) {
  const totalCost = materialsCost + laborCost + permitsCost + otherCost

  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numericAmount)
  }

  const formatTaxRate = (rate: string) => {
    const percentage = parseFloat(rate) * 100
    // Round to 2 decimal places to avoid floating point precision issues
    const rounded = Math.round(percentage * 100) / 100
    return `${rounded}%`
  }

  const getTaxDisplay = () => {
    if (isTaxExempt) {
      return 'Tax Exempt'
    }
    if (salesTaxRate && salesTaxAmount) {
      return `${formatTaxRate(salesTaxRate)}: ${formatCurrency(salesTaxAmount)}`
    }
    return formatCurrency(0)
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
          {/* Show tax breakdown only if tax data is provided */}
          {salesTaxRate || salesTaxAmount || isTaxExempt ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">Subtotal:</span>
                <span className="text-sm font-medium text-right">{formatCurrency(totalCost)}</span>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">Tax:</span>
                <span className={`text-sm font-medium text-right ${isTaxExempt ? 'text-amber-600' : ''}`}>
                  {getTaxDisplay()}
                </span>
              </div>
              
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-900">Total with Tax:</span>
                  <span className="text-lg font-bold text-blue-600 text-right">
                    {totalWithTax ? formatCurrency(totalWithTax) : formatCurrency(totalCost)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Show subtotal only when no tax data */
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-gray-900">Subtotal:</span>
              <span className="text-lg font-bold text-blue-600 text-right">
                {formatCurrency(totalCost)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 