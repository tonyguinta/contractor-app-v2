import { useState, useEffect, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table'
import { useForm } from 'react-hook-form'
import { Plus } from 'lucide-react'
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
import { useCostCalculation } from '../context/CostCalculationContext'
import MaterialModal from './MaterialModal'
import { originalColumns, simplifiedColumns } from './materials-columns'

// Feature flags for easy rollback
const USE_MODAL_EDITING = true
const USE_SIMPLIFIED_COLUMNS = true

interface MaterialsTableProps {
  subproject: SubprojectWithItems
  onUpdate: () => void
}

interface EditingRow {
  id: number | 'new'
  data: Partial<MaterialItem>
}

const MaterialsTable = ({ subproject, onUpdate }: MaterialsTableProps) => {
  const [materials, setMaterials] = useState<MaterialItem[]>(subproject.material_items)
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null)
  // Inline editing state (only used when not using modal - removed for cleanup)
  
  // Common state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [materialToDelete, setMaterialToDelete] = useState<MaterialItem | undefined>()
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMaterialForModal, setEditingMaterialForModal] = useState<MaterialItem | null>(null)

  // Form handling (only used for inline editing when not using modal - removed for cleanup)  
  // @ts-ignore - unused variables kept for rollback capability
  const { watch, reset, setValue: _setValue } = useForm<MaterialItemCreate>()
  const { updateCost, getCost, isPending } = useCostCalculation()

  useEffect(() => {
    setMaterials(subproject.material_items)
  }, [subproject.material_items])

  // Update cost calculation whenever materials change
  useEffect(() => {
    const totalCost = materials.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0)
    // For now, just update local cost without server sync since bulk endpoints don't exist yet
    // Individual material operations already handle server updates
    updateCost(subproject.id.toString(), 'materials', totalCost, []).catch(error => {
      if (error.message !== 'SUPERSEDED' && error.message !== 'REQUEST_CANCELLED') {
        console.error('Failed to update materials cost:', error)
      }
    })
  }, [materials, subproject.id, updateCost])

  // Focus and search effects removed - only needed for inline editing

  const handleAddNew = () => {
    if (USE_MODAL_EDITING) {
      setEditingMaterialForModal(null)
      setIsModalOpen(true)
    } else {
      // Original inline editing logic (for rollback)
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
      // setTimeout(() => {
      //   descriptionInputElement?.focus()
      // }, 0)
    }
  }

  const handleEdit = (material: MaterialItem) => {
    if (USE_MODAL_EDITING) {
      setEditingMaterialForModal(material)
      setIsModalOpen(true)
    } else {
      // Original inline editing logic (for rollback)
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
  }

  const handleCancel = () => {
    setEditingRow(null)
    reset()
    // setSearchQuery('') - removed unused variable
    // setMaterialSuggestions([]) - removed unused variable
  }

  const handleModalSave = (material: MaterialItem) => {
    if (editingMaterialForModal) {
      // Update existing material in the list
      setMaterials(materials.map(m => m.id === material.id ? material : m))
    } else {
      // Add new material to the top of the list
      setMaterials([material, ...materials])
    }
    setIsModalOpen(false)
    setEditingMaterialForModal(null)
    onUpdate()
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingMaterialForModal(null)
  }

  const handleModalDelete = async (material: MaterialItem) => {
    try {
      setDeleteLoading(true)
      await subprojectsApi.deleteMaterial(material.id)
      setMaterials(materials.filter(m => m.id !== material.id))
      toast.success('Material deleted successfully')
      onUpdate()
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

  // @ts-ignore - unused function kept for rollback capability
  const _handleSave = async (data: MaterialItemCreate) => {
    try {
      // setLoading(true) - removed unused variable
      
      if (editingRow?.id === 'new') {
        // Create new material
        const response = await subprojectsApi.createMaterial(subproject.id, data)
        setMaterials([response.data, ...materials]) // Add new material to the top
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
      // setLoading(false) - removed unused variable
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

  // @ts-ignore - unused function kept for rollback capability
  const _handleMaterialSelect = (material: MaterialEntry) => {
    // setValue calls removed - function unused with modal editing
    // Form logic kept for rollback capability
    console.log('Material selected (inline editing mode):', material)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // @ts-ignore - unused function kept for rollback capability
  const _calculateTotal = (quantity: number, unitCost: number) => {
    return quantity * unitCost
  }

  // Column definitions with rollback capability
  const columns = useMemo<ColumnDef<MaterialItem, any>[]>(() => {
    if (USE_SIMPLIFIED_COLUMNS) {
      return simplifiedColumns()
    } else {
      return originalColumns(handleEdit, handleDeleteClick)
    }
  }, [USE_SIMPLIFIED_COLUMNS])

  // Table data (simplified when using modal editing)
  const tableData = useMemo(() => {
    if (USE_MODAL_EDITING) {
      return materials
    } else {
      // Original inline editing logic (for rollback)
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
        return [newRow, ...materials] // Add new row at the beginning
      }
      return materials
    }
  }, [materials, editingRow, watch, USE_MODAL_EDITING])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalCost = getCost(subproject.id.toString(), 'materials')
  const isUpdatingCost = isPending(subproject.id.toString(), 'materials')

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-medium text-gray-900">Materials</h4>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Total: <span className="font-medium">{formatCurrency(totalCost)}</span>
            {isUpdatingCost && (
              <span className="ml-2 text-xs text-blue-600 animate-pulse">Updating...</span>
            )}
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
              if (USE_MODAL_EDITING) {
                // Simplified rendering for modal editing
                const isClickableRow = USE_SIMPLIFIED_COLUMNS
                
                return (
                  <tr 
                    key={row.id} 
                    className={`transition-colors ${
                      isClickableRow 
                        ? 'hover:bg-blue-50 hover:shadow-sm cursor-pointer' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={isClickableRow ? () => handleEdit(row.original) : undefined}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                )
              } else {
                // Original complex rendering for inline editing (rollback)
                const isEditingRow = (editingRow?.id === 'new' && row.original.id === -1) || 
                                    (editingRow?.id === row.original.id)
                return (
                  <tr key={row.id} className={`${isEditingRow ? 'bg-blue-50' : ''} ${isEditingRow ? 'relative' : ''}`}>
                    {row.getVisibleCells().map(cell => {
                      const isDescriptionColumn = cell.column.id === 'description'
                      const isEditingThisRow = (editingRow?.id === 'new' && row.original.id === -1) || 
                                              (editingRow?.id === row.original.id)
                      return (
                        <td 
                          key={cell.id} 
                          className={`px-4 py-3 whitespace-nowrap text-sm ${
                            isDescriptionColumn && isEditingThisRow ? 'relative overflow-visible' : ''
                          }`}
                          style={isDescriptionColumn && isEditingThisRow ? { zIndex: 10 } : undefined}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      )
                    })}
                  </tr>
                )
              }
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

      {/* Material Modal */}
      <MaterialModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onDelete={USE_SIMPLIFIED_COLUMNS ? handleModalDelete : undefined}
        subprojectId={subproject.id}
        editingMaterial={editingMaterialForModal}
      />

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