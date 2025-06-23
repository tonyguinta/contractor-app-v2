import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import { OtherCostItem } from '../types/api'

const columnHelper = createColumnHelper<OtherCostItem>()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Simplified columns (mobile-friendly, click-to-edit)
export const simplifiedColumns = (): ColumnDef<OtherCostItem, any>[] => [
  columnHelper.accessor('description', {
    header: 'Description',
    cell: ({ row }) => {
      const otherCost = row.original
      const notes = otherCost.notes
      
      return (
        <div>
          <div className="font-medium text-gray-900">{otherCost.description}</div>
          <div className="text-sm text-gray-500">
            {notes ? (
              notes.length > 30 ? `${notes.substring(0, 30)}...` : notes
            ) : (
              'No additional notes'
            )}
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor('cost', {
    header: 'Cost',
    cell: ({ row }) => {
      const otherCost = row.original
      return (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(otherCost.cost)}</div>
          <div className="text-sm text-gray-500">total cost</div>
        </div>
      )
    },
  }),
]