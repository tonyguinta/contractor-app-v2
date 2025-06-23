import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { PermitItem } from '../types/api'

const columnHelper = createColumnHelper<PermitItem>()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Not set'
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}

// Original columns (for rollback)
export const originalColumns = (
  onEdit: (permit: PermitItem) => void,
  onDelete: (permit: PermitItem) => void
): ColumnDef<PermitItem, any>[] => [
  columnHelper.accessor('description', {
    header: 'Description',
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
  }),
  columnHelper.accessor('cost', {
    header: 'Cost',
    cell: ({ getValue }) => <span className="text-right block">{formatCurrency(getValue())}</span>,
  }),
  columnHelper.accessor('issued_date', {
    header: 'Issued Date',
    cell: ({ getValue }) => <span>{formatDate(getValue())}</span>,
  }),
  columnHelper.accessor('expiration_date', {
    header: 'Expiration Date',
    cell: ({ getValue }) => <span>{formatDate(getValue())}</span>,
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
          title="Edit permit"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(row.original)}
          className="text-red-600 hover:text-red-800 p-1"
          title="Delete permit"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
  }),
]

// Simplified columns (mobile-friendly, click-to-edit)
export const simplifiedColumns = (): ColumnDef<PermitItem, any>[] => [
  columnHelper.accessor('description', {
    header: 'Permit',
    cell: ({ row }) => {
      const permit = row.original
      const hasValidDates = permit.issued_date || permit.expiration_date
      
      return (
        <div>
          <div className="font-medium text-gray-900">{permit.description}</div>
          <div className="text-sm text-gray-500">
            {hasValidDates ? (
              <>
                {permit.issued_date && `Issued: ${formatDate(permit.issued_date)}`}
                {permit.issued_date && permit.expiration_date && ' • '}
                {permit.expiration_date && `Expires: ${formatDate(permit.expiration_date)}`}
              </>
            ) : (
              'No dates set'
            )}
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor('cost', {
    header: 'Cost',
    cell: ({ row }) => {
      const permit = row.original
      return (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(permit.cost)}</div>
          <div className="text-sm text-gray-500">permit fee</div>
        </div>
      )
    },
  }),
  columnHelper.accessor('notes', {
    header: 'Notes',
    cell: ({ row }) => {
      const permit = row.original
      const notes = permit.notes
      
      return (
        <div className="text-right">
          {notes ? (
            <>
              <div className="font-medium text-gray-900">
                {notes.length > 20 ? `${notes.substring(0, 20)}...` : notes}
              </div>
              <div className="text-sm text-gray-500">
                {notes.length > 20 ? 'Click to read more' : 'Additional notes'}
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-sm">No notes</div>
          )}
        </div>
      )
    },
  }),
]