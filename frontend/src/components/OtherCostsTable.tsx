import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table'
import { OtherCostItem, OtherCostItemCreate, OtherCostItemUpdate } from '../types/api'
import { api } from '../api/client'
import { Plus, Trash2, Check, X, Edit } from 'lucide-react'

interface OtherCostsTableProps {
  subprojectId: number
  onCostChange?: (totalCost: number) => void
}

interface OtherCostFormData {
  description: string
  cost: number
  notes: string
}

const columnHelper = createColumnHelper<OtherCostItem>()

export default function OtherCostsTable({ subprojectId, onCostChange }: OtherCostsTableProps) {
  const [otherCostItems, setOtherCostItems] = useState<OtherCostItem[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)

  const { control, handleSubmit, reset, setValue } = useForm<OtherCostFormData>({
    defaultValues: {
      description: '',
      cost: 0,
      notes: '',
    }
  })

  const fetchOtherCostItems = async () => {
    try {
      const response = await api.get(`/subprojects/${subprojectId}/other-costs`)
      setOtherCostItems(response.data)
      
      // Calculate total cost for parent component
      const totalCost = response.data.reduce((sum: number, item: OtherCostItem) => sum + item.cost, 0)
      onCostChange?.(totalCost)
    } catch (error) {
      console.error('Failed to fetch other cost items:', error)
    }
  }

  useEffect(() => {
    fetchOtherCostItems()
  }, [subprojectId])

  const handleCreate = async (data: OtherCostFormData) => {
    setLoading(true)
    try {
      const createData: OtherCostItemCreate = {
        ...data,
        subproject_id: subprojectId,
        notes: data.notes || null,
      }
      await api.post(`/subprojects/${subprojectId}/other-costs`, createData)
      await fetchOtherCostItems()
      reset()
      setIsAdding(false)
    } catch (error) {
      console.error('Failed to create other cost item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id: number, data: OtherCostFormData) => {
    setLoading(true)
    try {
      const updateData: OtherCostItemUpdate = {
        ...data,
        notes: data.notes || null,
      }
      await api.put(`/other-costs/${id}`, updateData)
      await fetchOtherCostItems()
      setEditingId(null)
      reset()
    } catch (error) {
      console.error('Failed to update other cost item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this cost item?')) return
    
    setLoading(true)
    try {
      await api.delete(`/other-costs/${id}`)
      await fetchOtherCostItems()
    } catch (error) {
      console.error('Failed to delete other cost item:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (item: OtherCostItem) => {
    setEditingId(item.id)
    setValue('description', item.description)
    setValue('cost', item.cost)
    setValue('notes', item.notes || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsAdding(false)
    reset()
  }

  const columns = [
    columnHelper.accessor('description', {
      header: 'Description',
      cell: ({ row, getValue }) => {
        const isEditing = editingId === row.original.id
        if (isEditing) {
          return (
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="e.g., Equipment Rental, Delivery Fee"
                />
              )}
            />
          )
        }
        return <span>{getValue()}</span>
      },
    }),
    columnHelper.accessor('cost', {
      header: () => <div className="text-right">Cost</div>,
      cell: ({ row, getValue }) => {
        const isEditing = editingId === row.original.id
        if (isEditing) {
          return (
            <Controller
              name="cost"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              )}
            />
          )
        }
        return <div className="text-right">${getValue().toFixed(2)}</div>
      },
    }),
    columnHelper.accessor('notes', {
      header: 'Notes',
      cell: ({ row, getValue }) => {
        const isEditing = editingId === row.original.id
        if (isEditing) {
          return (
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Optional notes"
                />
              )}
            />
          )
        }
        return <span>{getValue() || ''}</span>
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id
        if (isEditing) {
          return (
            <div className="flex gap-1">
              <button
                onClick={handleSubmit((data) => handleUpdate(row.original.id, data))}
                disabled={loading}
                className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={cancelEdit}
                disabled={loading}
                className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        }
        return (
          <div className="flex gap-1">
            <button
              onClick={() => startEdit(row.original)}
              className="p-1 text-blue-600 hover:text-blue-800"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: otherCostItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Other Costs</h3>
        <button
          onClick={() => setIsAdding(true)}
          disabled={isAdding || editingId !== null}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Cost
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isAdding && (
              <tr className="bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="e.g., Equipment Rental, Delivery Fee"
                      />
                    )}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Controller
                    name="cost"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    )}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Optional notes"
                      />
                    )}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-1">
                    <button
                      onClick={handleSubmit(handleCreate)}
                      disabled={loading}
                      className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={loading}
                      className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className={editingId === row.original.id ? 'bg-blue-50' : ''}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {otherCostItems.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500">
          No other costs yet. Click "Add Cost" to get started.
        </div>
      )}
    </div>
  )
} 