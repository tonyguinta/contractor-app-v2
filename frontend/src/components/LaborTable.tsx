import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table'
import { LaborItem, LaborItemCreate, LaborItemUpdate } from '../types/api'
import { api } from '../api/client'
import { Plus, Trash2, Check, X, Edit } from 'lucide-react'

interface LaborTableProps {
  subprojectId: number
  onCostChange?: (totalCost: number) => void
}

interface LaborFormData {
  role: string
  number_of_workers: number
  hourly_rate: number
  hours: number
}

const columnHelper = createColumnHelper<LaborItem>()

export default function LaborTable({ subprojectId, onCostChange }: LaborTableProps) {
  const [laborItems, setLaborItems] = useState<LaborItem[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)

  const { control, handleSubmit, reset, watch, setValue } = useForm<LaborFormData>({
    defaultValues: {
      role: '',
      number_of_workers: 1,
      hourly_rate: 0,
      hours: 0,
    }
  })

  // Watch for changes to calculate total
  const watchedValues = watch()
  const calculatedTotal = (watchedValues.number_of_workers || 0) * (watchedValues.hourly_rate || 0) * (watchedValues.hours || 0)

  const fetchLaborItems = async () => {
    try {
      const response = await api.get(`/subprojects/${subprojectId}/labor`)
      setLaborItems(response.data)
      
      // Calculate total cost for parent component
      const totalCost = response.data.reduce((sum: number, item: LaborItem) => 
        sum + (item.number_of_workers * item.hourly_rate * item.hours), 0
      )
      onCostChange?.(totalCost)
    } catch (error) {
      console.error('Failed to fetch labor items:', error)
    }
  }

  useEffect(() => {
    fetchLaborItems()
  }, [subprojectId])

  const handleCreate = async (data: LaborFormData) => {
    setLoading(true)
    try {
      const createData: LaborItemCreate = {
        ...data,
        subproject_id: subprojectId,
      }
      await api.post(`/subprojects/${subprojectId}/labor`, createData)
      await fetchLaborItems()
      reset()
      setIsAdding(false)
    } catch (error) {
      console.error('Failed to create labor item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id: number, data: LaborFormData) => {
    setLoading(true)
    try {
      const updateData: LaborItemUpdate = data
      await api.put(`/labor/${id}`, updateData)
      await fetchLaborItems()
      setEditingId(null)
      reset()
    } catch (error) {
      console.error('Failed to update labor item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this labor item?')) return
    
    setLoading(true)
    try {
      await api.delete(`/labor/${id}`)
      await fetchLaborItems()
    } catch (error) {
      console.error('Failed to delete labor item:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (item: LaborItem) => {
    setEditingId(item.id)
    setValue('role', item.role)
    setValue('number_of_workers', item.number_of_workers)
    setValue('hourly_rate', item.hourly_rate)
    setValue('hours', item.hours)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsAdding(false)
    reset()
  }

  const columns = [
    columnHelper.accessor('role', {
      header: 'Role',
      cell: ({ row, getValue }) => {
        const isEditing = editingId === row.original.id
        if (isEditing) {
          return (
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="e.g., Carpenter, Electrician"
                />
              )}
            />
          )
        }
        return <span>{getValue()}</span>
      },
    }),
    columnHelper.accessor('number_of_workers', {
      header: () => <div className="text-right">Workers</div>,
      cell: ({ row, getValue }) => {
        const isEditing = editingId === row.original.id
        if (isEditing) {
          return (
            <Controller
              name="number_of_workers"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  min="1"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              )}
            />
          )
        }
        return <div className="text-right">{getValue()}</div>
      },
    }),
    columnHelper.accessor('hourly_rate', {
      header: () => <div className="text-right">Hourly Rate</div>,
      cell: ({ row, getValue }) => {
        const isEditing = editingId === row.original.id
        if (isEditing) {
          return (
            <Controller
              name="hourly_rate"
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
    columnHelper.accessor('hours', {
      header: () => <div className="text-right">Hours</div>,
      cell: ({ row, getValue }) => {
        const isEditing = editingId === row.original.id
        if (isEditing) {
          return (
            <Controller
              name="hours"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  step="0.25"
                  min="0"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              )}
            />
          )
        }
        return <div className="text-right">{getValue()}</div>
      },
    }),
    columnHelper.display({
      id: 'total_cost',
      header: () => <div className="text-right">Total Cost</div>,
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id
        if (isEditing) {
          return <div className="text-right font-medium">${calculatedTotal.toFixed(2)}</div>
        }
        const total = row.original.number_of_workers * row.original.hourly_rate * row.original.hours
        return <div className="text-right font-medium">${total.toFixed(2)}</div>
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
    data: laborItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Labor</h3>
        <button
          onClick={() => setIsAdding(true)}
          disabled={isAdding || editingId !== null}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Labor
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
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="e.g., Carpenter, Electrician"
                      />
                    )}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Controller
                    name="number_of_workers"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="1"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    )}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Controller
                    name="hourly_rate"
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
                    name="hours"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        step="0.25"
                        min="0"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    )}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                  ${calculatedTotal.toFixed(2)}
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

      {laborItems.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500">
          No labor items yet. Click "Add Labor" to get started.
        </div>
      )}
    </div>
  )
} 