import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
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