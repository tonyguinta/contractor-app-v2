import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { OtherCostItem } from '../types/api'

const columnHelper = createColumnHelper<OtherCostItem>()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Original columns (for rollback)
export const originalColumns = (
  onEdit: (otherCost: OtherCostItem) => void,
  onDelete: (otherCost: OtherCostItem) => void
): ColumnDef<OtherCostItem, any>[] => [
  columnHelper.accessor('description', {
    header: 'Description',
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
  }),
  columnHelper.accessor('cost', {
    header: 'Cost',
    cell: ({ getValue }) => <span className="text-right block">{formatCurrency(getValue())}</span>,
  }),
  columnHelper.accessor('notes', {
    header: 'Notes',
    cell: ({ getValue }) => {
      const notes = getValue()
      return notes ? (
        <span className="text-gray-600 truncate block max-w-xs" title={notes}>
          {notes}
        </span>
      ) : (
        <span className="text-gray-400">No notes</span>
      )
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(row.original)}
          className="text-gray-600 hover:text-gray-800 p-1"
          title="Edit other cost"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(row.original)}
          className="text-red-600 hover:text-red-800 p-1"
          title="Delete other cost"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
  }),
]

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