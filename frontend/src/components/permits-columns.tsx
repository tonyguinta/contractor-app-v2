import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
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