import { useState, useEffect, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from '@tanstack/react-table'
import { useForm } from 'react-hook-form'
import { Plus, Edit, Trash2, Check, X } from 'lucide-react'
import { subprojectsApi } from '../api/client'
import {
  MaterialItem,
  MaterialItemCreate,
  MaterialItemUpdate,
  MaterialEntry,
  SubprojectWithItems,
  ApiError
} from '../types/api'
import toast from 'react-hot-toast'
import ConfirmDeleteModal from './ConfirmDeleteModal'

interface MaterialsTableProps {
  subproject: SubprojectWithItems
  onUpdate: () => void
  onCostChange?: (totalCost: number) => void
}

interface EditingRow {
  id: number | 'new'
  data: Partial<MaterialItem>
}

const MaterialsTable = ({ subproject, onUpdate, onCostChange }: MaterialsTableProps) => {
  const [materials, setMaterials] = useState<MaterialItem[]>(subproject.material_items)
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null)
  const [materialSuggestions, setMaterialSuggestions] = useState<MaterialEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [descriptionInputElement, setDescriptionInputElement] = useState<HTMLInputElement | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [materialToDelete, setMaterialToDelete] = useState<MaterialItem | undefined>()
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<MaterialItemCreate>()

  useEffect(() => {
    setMaterials(subproject.material_items)
  }, [subproject.material_items])

  // Calculate and report total cost whenever materials change
  useEffect(() => {
    const totalCost = materials.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0)
    onCostChange?.(totalCost)
  }, [materials, onCostChange])

  // Focus description input when starting to edit a new material
  useEffect(() => {
    if (editingRow?.id === 'new' && descriptionInputElement) {
      descriptionInputElement.focus()
    }
  }, [editingRow, descriptionInputElement])

  // Debounced material search
  useEffect(() => {
    const searchMaterials = async () => {
      if (searchQuery.length < 2) {
        setMaterialSuggestions([])
        return
      }

      try {
        const response = await subprojectsApi.searchMaterials(searchQuery)
        setMaterialSuggestions(response.data)
      } catch (error) {
        console.error('Failed to search materials:', error)
      }
    }

    const timeoutId = setTimeout(searchMaterials, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleAddNew = () => {
    setEditingRow({
      id: 'new',
      data: {
        description: '',
        unit: 'each',
        quantity: 1,
        unit_cost: 0,
        category: ''
      }
    })
    reset({
      description: '',
      unit: 'each',
      quantity: 1,
      unit_cost: 0,
      category: '',
      subproject_id: subproject.id
    })
    
    // Focus the description input after the component re-renders
    setTimeout(() => {
      descriptionInputElement?.focus()
    }, 0)
  }

  const handleEdit = (material: MaterialItem) => {
    setEditingRow({
      id: material.id,
      data: material
    })
    reset({
      description: material.description,
      unit: material.unit,
      quantity: material.quantity,
      unit_cost: material.unit_cost,
      category: material.category || '',
      subproject_id: subproject.id
    })
  }

  const handleCancel = () => {
    setEditingRow(null)
    reset()
    setSearchQuery('')
    setMaterialSuggestions([])
  }

  const handleSave = async (data: MaterialItemCreate) => {
    try {
      setLoading(true)
      
      if (editingRow?.id === 'new') {
        // Create new material
        const response = await subprojectsApi.createMaterial(subproject.id, data)
        setMaterials([...materials, response.data])
        toast.success('Material added successfully')
      } else if (editingRow?.id) {
        // Update existing material
        const updateData: MaterialItemUpdate = {
          description: data.description,
          unit: data.unit,
          quantity: data.quantity,
          unit_cost: data.unit_cost,
          category: data.category
        }
        const response = await subprojectsApi.updateMaterial(editingRow.id as number, updateData)
        setMaterials(materials.map(m => m.id === editingRow.id ? response.data : m))
        toast.success('Material updated successfully')
      }
      
      handleCancel()
      onUpdate()
    } catch (error: any) {
      const apiError = error.response?.data as ApiError
      const message = apiError?.detail || 'Failed to save material'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (material: MaterialItem) => {
    setMaterialToDelete(material)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!materialToDelete) return

    try {
      setDeleteLoading(true)
      await subprojectsApi.deleteMaterial(materialToDelete.id)
      setMaterials(materials.filter(m => m.id !== materialToDelete.id))
      toast.success('Material deleted successfully')
      onUpdate()
      setIsDeleteModalOpen(false)
      setMaterialToDelete(undefined)
    } catch (error: any) {
      console.error('Delete material error:', error)
      
      let message = 'Failed to delete material'
      if (error.response?.data) {
        const errorData = error.response.data
        if (typeof errorData.detail === 'string') {
          message = errorData.detail
        } else if (errorData.message) {
          message = errorData.message
        }
      }
      toast.error(message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setMaterialToDelete(undefined)
  }

  const handleMaterialSelect = (material: MaterialEntry) => {
    setValue('description', material.description)
    setValue('unit', material.unit)
    setValue('unit_cost', material.unit_price || 0)
    setValue('category', material.category || '')
    setSearchQuery(material.description)
    setMaterialSuggestions([])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateTotal = (quantity: number, unitCost: number) => {
    return quantity * unitCost
  }

  const columnHelper = createColumnHelper<MaterialItem>()

  const columns = useMemo<ColumnDef<MaterialItem, any>[]>(() => [
    columnHelper.accessor('description', {
      header: 'Description',
      cell: ({ row, getValue }) => {
        const isEditing = (editingRow?.id === 'new' && row.original.id === -1) || 
                         (editingRow?.id === row.original.id)
        if (isEditing) {
          return (
            <div className="relative">
              <input
                {...register('description', { 
                  required: 'Description is required',
                  onChange: (e) => {
                    const value = e.target.value
                    setValue('description', value)
                    setSearchQuery(value)
                  }
                })}
                                 ref={(e) => {
                   register('description').ref(e)
                   setDescriptionInputElement(e)
                 }}
                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter material description..."
              />
              {materialSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {materialSuggestions.map((material) => (
                    <button
                      key={material.id}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
                      onClick={() => handleMaterialSelect(material)}
                    >
                      <div className="font-medium">{material.description}</div>
                      <div className="text-sm text-gray-500">
                        {material.unit} • {material.category} • {formatCurrency(material.unit_price || 0)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {errors.description && (
                <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>
          )
        }
        return <span className="font-medium">{getValue()}</span>
      },
    }),
    columnHelper.accessor('unit', {
      header: 'Unit',
      cell: ({ row, getValue }) => {
        const isEditing = (editingRow?.id === 'new' && row.original.id === -1) || 
                         (editingRow?.id === row.original.id)
        if (isEditing) {
          return (
            <select
              {...register('unit', { required: 'Unit is required' })}
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="each">Each</option>
              <option value="lf">Linear Feet</option>
              <option value="sf">Square Feet</option>
              <option value="cf">Cubic Feet</option>
              <option value="bag">Bag</option>
              <option value="box">Box</option>
              <option value="roll">Roll</option>
              <option value="sheet">Sheet</option>
              <option value="gallon">Gallon</option>
              <option value="pound">Pound</option>
            </select>
          )
        }
        return <span>{getValue()}</span>
      },
    }),
    columnHelper.accessor('quantity', {
      header: 'Quantity',
      cell: ({ row, getValue }) => {
        const isEditing = (editingRow?.id === 'new' && row.original.id === -1) || 
                         (editingRow?.id === row.original.id)
        if (isEditing) {
          return (
            <input
              {...register('quantity', { 
                required: 'Quantity is required',
                min: { value: 0.01, message: 'Quantity must be greater than 0' }
              })}
              type="number"
              step="0.01"
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-right"
            />
          )
        }
        return <span className="text-right block">{getValue()}</span>
      },
    }),
    columnHelper.accessor('unit_cost', {
      header: 'Unit Cost',
      cell: ({ row, getValue }) => {
        const isEditing = (editingRow?.id === 'new' && row.original.id === -1) || 
                         (editingRow?.id === row.original.id)
        if (isEditing) {
          return (
            <input
              {...register('unit_cost', { 
                required: 'Unit cost is required',
                min: { value: 0, message: 'Unit cost must be 0 or greater' }
              })}
              type="number"
              step="0.01"
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-right"
            />
          )
        }
        return <span className="text-right block">{formatCurrency(getValue())}</span>
      },
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: ({ row, getValue }) => {
        const isEditing = (editingRow?.id === 'new' && row.original.id === -1) || 
                         (editingRow?.id === row.original.id)
        if (isEditing) {
          return (
            <input
              {...register('category')}
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Optional"
            />
          )
        }
        return <span className="text-gray-600">{getValue() || '-'}</span>
      },
    }),
    columnHelper.display({
      id: 'total',
      header: 'Total',
      cell: ({ row }) => {
        const isEditing = (editingRow?.id === 'new' && row.original.id === -1) || 
                         (editingRow?.id === row.original.id)
        if (isEditing) {
          const quantity = watch('quantity') || 0
          const unitCost = watch('unit_cost') || 0
          return <span className="font-medium text-right block">{formatCurrency(calculateTotal(quantity, unitCost))}</span>
        }
        return (
          <span className="font-medium text-right block">
            {formatCurrency(calculateTotal(row.original.quantity, row.original.unit_cost))}
          </span>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const isEditing = (editingRow?.id === 'new' && row.original.id === -1) || 
                         (editingRow?.id === row.original.id)
        
        if (isEditing) {
          return (
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleSubmit(handleSave)}
                disabled={loading}
                className="text-green-600 hover:text-green-800 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        }

        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(row.original)}
              className="text-gray-600 hover:text-gray-800"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteClick(row.original)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      },
    }),
  ], [editingRow, register, watch, errors, materialSuggestions, searchQuery, loading])

  // Add new row to table data when editing
  const tableData = useMemo(() => {
    if (editingRow?.id === 'new') {
      const newRow: MaterialItem = {
        id: -1, // Use -1 to distinguish new rows from existing ones
        description: watch('description') || '',
        unit: watch('unit') || 'each',
        quantity: watch('quantity') || 1,
        unit_cost: watch('unit_cost') || 0,
        category: watch('category') || '',
        created_at: new Date().toISOString(),
        updated_at: null,
        subproject_id: subproject.id
      }
      return [...materials, newRow]
    }
    return materials
  }, [materials, editingRow, watch])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalCost = materials.reduce((sum, material) => 
    sum + calculateTotal(material.quantity, material.unit_cost), 0
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-medium text-gray-900">Materials</h4>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Total: <span className="font-medium">{formatCurrency(totalCost)}</span>
          </span>
          {!editingRow && (
            <button
              onClick={handleAddNew}
              className="btn-primary text-sm inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Material
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const isNumericColumn = ['quantity', 'unit_cost', 'total'].includes(header.id)
                  return (
                    <th
                      key={header.id}
                      className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        isNumericColumn ? 'text-right' : 'text-left'
                      }`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())
                      }
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => {
              const isEditingRow = (editingRow?.id === 'new' && row.original.id === -1) || 
                                  (editingRow?.id === row.original.id)
              return (
                <tr key={row.id} className={isEditingRow ? 'bg-blue-50' : ''}>
                                      {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3 whitespace-nowrap text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {materials.length === 0 && !editingRow && (
        <div className="text-center py-8 text-gray-500">
          <p>No materials added yet.</p>
          <button
            onClick={handleAddNew}
            className="mt-2 btn-primary text-sm"
          >
            Add Your First Material
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Material"
        message={`Are you sure you want to delete "${materialToDelete?.description}"? This action cannot be undone.`}
        confirmText="Delete Material"
        loading={deleteLoading}
      />
    </div>
  )
}

export default MaterialsTable 