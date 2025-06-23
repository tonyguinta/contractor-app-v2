import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { MaterialItem } from '../types/api'

const columnHelper = createColumnHelper<MaterialItem>()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const calculateTotal = (quantity: number, unitCost: number) => {
  return quantity * unitCost
}

// Original columns (for rollback)
export const originalColumns = (
  onEdit: (material: MaterialItem) => void,
  onDelete: (material: MaterialItem) => void
): ColumnDef<MaterialItem, any>[] => [
  columnHelper.accessor('description', {
    header: 'Description',
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
  }),
  columnHelper.accessor('unit', {
    header: 'Unit',
    cell: ({ getValue }) => <span>{getValue()}</span>,
  }),
  columnHelper.accessor('quantity', {
    header: 'Quantity',
    cell: ({ getValue }) => <span className="text-right block">{getValue()}</span>,
  }),
  columnHelper.accessor('unit_cost', {
    header: 'Unit Cost',
    cell: ({ getValue }) => <span className="text-right block">{formatCurrency(getValue())}</span>,
  }),
  columnHelper.display({
    id: 'total',
    header: 'Total',
    cell: ({ row }) => (
      <span className="font-medium text-right block">
        {formatCurrency(calculateTotal(row.original.quantity, row.original.unit_cost))}
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
          title="Edit material"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(row.original)}
          className="text-red-600 hover:text-red-800 p-1"
          title="Delete material"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
  }),
]

// Simplified columns (mobile-friendly, click-to-edit)
export const simplifiedColumns = (): ColumnDef<MaterialItem, any>[] => [
  columnHelper.accessor('description', {
    header: 'Description',
    cell: ({ row }) => {
      const material = row.original
      return (
        <div>
          <div className="font-medium text-gray-900">{material.description}</div>
          <div className="text-sm text-gray-500">
            {material.quantity} {material.unit}
            {material.category && (
              <>
                <span className="mx-1">•</span>
                {material.category}
              </>
            )}
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor('quantity', {
    header: 'Qty',
    cell: ({ row }) => {
      const material = row.original
      return (
        <div className="text-right">
          <div className="font-medium">{material.quantity}</div>
          <div className="text-sm text-gray-500">{material.unit}</div>
        </div>
      )
    },
  }),
  columnHelper.display({
    id: 'total',
    header: 'Total',
    cell: ({ row }) => {
      const material = row.original
      const total = calculateTotal(material.quantity, material.unit_cost)
      return (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(total)}</div>
          <div className="text-sm text-gray-500">
            {formatCurrency(material.unit_cost)} each
          </div>
        </div>
      )
    },
  }),
]