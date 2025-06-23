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
  OtherCostItem,
  OtherCostItemCreate,
  OtherCostItemUpdate,
  ApiError
} from '../types/api'
import toast from 'react-hot-toast'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { useCostCalculation } from '../context/CostCalculationContext'
import OtherCostsModal from './OtherCostsModal'
import { originalColumns, simplifiedColumns } from './other-costs-columns'

// Feature flags for easy rollback
const USE_MODAL_EDITING = true
const USE_SIMPLIFIED_COLUMNS = true

interface OtherCostsTableProps {
  subprojectId: number
  onCostChange?: (totalCost: number) => void
}

interface EditingRow {
  id: number | 'new'
  data: Partial<OtherCostItem>
}

const OtherCostsTable = ({ subprojectId, onCostChange }: OtherCostsTableProps) => {
  const [otherCostItems, setOtherCostItems] = useState<OtherCostItem[]>([])
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null)
  // Inline editing state (only used when not using modal - removed for cleanup)
  
  // Common state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [otherCostToDelete, setOtherCostToDelete] = useState<OtherCostItem | undefined>()
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOtherCostForModal, setEditingOtherCostForModal] = useState<OtherCostItem | null>(null)

  // Form handling (only used for inline editing when not using modal - removed for cleanup)  
  // @ts-ignore - unused variables kept for rollback capability
  const { watch, reset, setValue: _setValue } = useForm<OtherCostItemCreate>()
  const { updateCost, getCost, isPending } = useCostCalculation()

  const fetchOtherCostItems = async () => {
    try {
      const response = await subprojectsApi.getById(subprojectId)
      if (response.data.other_cost_items) {
        setOtherCostItems(response.data.other_cost_items)
      }
    } catch (error: any) {
      console.error('Failed to fetch other cost items:', error)
    }
  }

  useEffect(() => {
    fetchOtherCostItems()
  }, [subprojectId])

  // Update cost calculation whenever other cost items change
  useEffect(() => {
    const totalCost = otherCostItems.reduce((sum, item) => sum + item.cost, 0)
    // For now, just update local cost without server sync since bulk endpoints don't exist yet
    // Individual other cost operations already handle server updates
    updateCost(subprojectId.toString(), 'other', totalCost, []).catch(error => {
      if (error.message !== 'SUPERSEDED' && error.message !== 'REQUEST_CANCELLED') {
        console.error('Failed to update other costs:', error)
      }
    })
    
    // Also call the legacy onCostChange prop if provided
    onCostChange?.(totalCost)
  }, [otherCostItems, subprojectId, updateCost, onCostChange])

  // Focus and search effects removed - only needed for inline editing

  const handleAddNew = () => {
    if (USE_MODAL_EDITING) {
      setEditingOtherCostForModal(null)
      setIsModalOpen(true)
    } else {
      // Original inline editing logic (for rollback)
      setEditingRow({
        id: 'new',
        data: {
          description: '',
          cost: 0,
          notes: ''
        }
      })
      reset({
        description: '',
        cost: 0,
        notes: '',
        subproject_id: subprojectId
      })
    }
  }

  const handleEdit = (otherCost: OtherCostItem) => {
    if (USE_MODAL_EDITING) {
      setEditingOtherCostForModal(otherCost)
      setIsModalOpen(true)
    } else {
      // Original inline editing logic (for rollback)
      setEditingRow({
        id: otherCost.id,
        data: otherCost
      })
      reset({
        description: otherCost.description,
        cost: otherCost.cost,
        notes: otherCost.notes || '',
        subproject_id: subprojectId
      })
    }
  }

  const handleCancel = () => {
    setEditingRow(null)
    reset()
  }

  const handleModalSave = (otherCost: OtherCostItem) => {
    if (editingOtherCostForModal) {
      // Update existing other cost in the list
      setOtherCostItems(otherCostItems.map(oc => oc.id === otherCost.id ? otherCost : oc))
    } else {
      // Add new other cost to the top of the list
      setOtherCostItems([otherCost, ...otherCostItems])
    }
    setIsModalOpen(false)
    setEditingOtherCostForModal(null)
    fetchOtherCostItems() // Refresh to get updated data
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingOtherCostForModal(null)
  }

  const handleModalDelete = async (otherCost: OtherCostItem) => {
    try {
      setDeleteLoading(true)
      await subprojectsApi.deleteOtherCost(otherCost.id)
      setOtherCostItems(otherCostItems.filter(oc => oc.id !== otherCost.id))
      toast.success('Other cost deleted successfully')
      fetchOtherCostItems() // Refresh to get updated data
    } catch (error: any) {
      console.error('Delete other cost error:', error)
      
      let message = 'Failed to delete other cost'
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
  const _handleSave = async (data: OtherCostItemCreate) => {
    try {
      // setLoading(true) - removed unused variable
      
      if (editingRow?.id === 'new') {
        // Create new other cost
        const response = await subprojectsApi.createOtherCost(subprojectId, data)
        setOtherCostItems([response.data, ...otherCostItems]) // Add new other cost to the top
        toast.success('Other cost added successfully')
      } else if (editingRow?.id) {
        // Update existing other cost
        const updateData: OtherCostItemUpdate = {
          description: data.description,
          cost: data.cost,
          notes: data.notes
        }
        const response = await subprojectsApi.updateOtherCost(editingRow.id as number, updateData)
        setOtherCostItems(otherCostItems.map(oc => oc.id === editingRow.id ? response.data : oc))
        toast.success('Other cost updated successfully')
      }
      
      handleCancel()
      fetchOtherCostItems()
    } catch (error: any) {
      const apiError = error.response?.data as ApiError
      const message = apiError?.detail || 'Failed to save other cost'
      toast.error(message)
    } finally {
      // setLoading(false) - removed unused variable
    }
  }

  const handleDeleteClick = (otherCost: OtherCostItem) => {
    setOtherCostToDelete(otherCost)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!otherCostToDelete) return

    try {
      setDeleteLoading(true)
      await subprojectsApi.deleteOtherCost(otherCostToDelete.id)
      setOtherCostItems(otherCostItems.filter(oc => oc.id !== otherCostToDelete.id))
      toast.success('Other cost deleted successfully')
      fetchOtherCostItems()
      setIsDeleteModalOpen(false)
      setOtherCostToDelete(undefined)
    } catch (error: any) {
      console.error('Delete other cost error:', error)
      
      let message = 'Failed to delete other cost'
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
    setOtherCostToDelete(undefined)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Column definitions with rollback capability
  const columns = useMemo<ColumnDef<OtherCostItem, any>[]>(() => {
    if (USE_SIMPLIFIED_COLUMNS) {
      return simplifiedColumns()
    } else {
      return originalColumns(handleEdit, handleDeleteClick)
    }
  }, [])

  // Table data (simplified when using modal editing)
  const tableData = useMemo(() => {
    if (USE_MODAL_EDITING) {
      return otherCostItems
    } else {
      // Original inline editing logic (for rollback)
      if (editingRow?.id === 'new') {
        const newRow: OtherCostItem = {
          id: -1, // Use -1 to distinguish new rows from existing ones
          description: watch('description') || '',
          cost: watch('cost') || 0,
          notes: watch('notes') || '',
          created_at: new Date().toISOString(),
          updated_at: null,
          subproject_id: subprojectId
        }
        return [newRow, ...otherCostItems] // Add new row at the beginning
      }
      return otherCostItems
    }
  }, [otherCostItems, editingRow, watch, USE_MODAL_EDITING])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalCost = getCost(subprojectId.toString(), 'other')
  const isUpdatingCost = isPending(subprojectId.toString(), 'other')

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-medium text-gray-900">Other Costs</h4>
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
              Add Other Cost
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
                  const isNumericColumn = ['cost'].includes(header.id)
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
                      return (
                        <td 
                          key={cell.id} 
                          className={`px-4 py-3 whitespace-nowrap text-sm`}
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

      {otherCostItems.length === 0 && !editingRow && (
        <div className="text-center py-8 text-gray-500">
          <p>No other costs added yet.</p>
          <button
            onClick={handleAddNew}
            className="mt-2 btn-primary text-sm"
          >
            Add Your First Other Cost
          </button>
        </div>
      )}

      {/* Other Costs Modal */}
      <OtherCostsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onDelete={USE_SIMPLIFIED_COLUMNS ? handleModalDelete : undefined}
        subprojectId={subprojectId}
        editingOtherCost={editingOtherCostForModal}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Other Cost"
        message={`Are you sure you want to delete "${otherCostToDelete?.description}"? This action cannot be undone.`}
        confirmText="Delete Other Cost"
        loading={deleteLoading}
      />
    </div>
  )
}

export default OtherCostsTable