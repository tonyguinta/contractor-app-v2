import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { LaborItem } from '../types/api'

const columnHelper = createColumnHelper<LaborItem>()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const calculateTotal = (workers: number, rate: number, hours: number) => {
  return workers * rate * hours
}

// Original columns (for rollback)
export const originalColumns = (
  onEdit: (labor: LaborItem) => void,
  onDelete: (labor: LaborItem) => void
): ColumnDef<LaborItem, any>[] => [
  columnHelper.accessor('role', {
    header: 'Role',
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
  }),
  columnHelper.accessor('number_of_workers', {
    header: 'Workers',
    cell: ({ getValue }) => <span className="text-right block">{getValue()}</span>,
  }),
  columnHelper.accessor('hourly_rate', {
    header: 'Hourly Rate',
    cell: ({ getValue }) => <span className="text-right block">{formatCurrency(getValue())}</span>,
  }),
  columnHelper.accessor('hours', {
    header: 'Hours',
    cell: ({ getValue }) => <span className="text-right block">{getValue()}</span>,
  }),
  columnHelper.display({
    id: 'total',
    header: 'Total',
    cell: ({ row }) => (
      <span className="font-medium text-right block">
        {formatCurrency(calculateTotal(row.original.number_of_workers, row.original.hourly_rate, row.original.hours))}
      </span>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(row.original)}
          className="text-gray-600 hover:text-gray-800 p-1"
          title="Edit labor"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(row.original)}
          className="text-red-600 hover:text-red-800 p-1"
          title="Delete labor"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
  }),
]

// Simplified columns (mobile-friendly, click-to-edit)
export const simplifiedColumns = (): ColumnDef<LaborItem, any>[] => [
  columnHelper.accessor('role', {
    header: 'Role',
    cell: ({ row }) => {
      const labor = row.original
      return (
        <div>
          <div className="font-medium text-gray-900">{labor.role}</div>
          <div className="text-sm text-gray-500">
            {labor.number_of_workers} worker{labor.number_of_workers !== 1 ? 's' : ''} × {labor.hours} hrs
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor('hourly_rate', {
    header: 'Rate',
    cell: ({ row }) => {
      const labor = row.original
      return (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(labor.hourly_rate)}</div>
          <div className="text-sm text-gray-500">per hour</div>
        </div>
      )
    },
  }),
  columnHelper.display({
    id: 'total',
    header: 'Total',
    cell: ({ row }) => {
      const labor = row.original
      const total = calculateTotal(labor.number_of_workers, labor.hourly_rate, labor.hours)
      return (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(total)}</div>
          <div className="text-sm text-gray-500">
            {labor.number_of_workers} × {formatCurrency(labor.hourly_rate)} × {labor.hours}
          </div>
        </div>
      )
    },
  }),
]