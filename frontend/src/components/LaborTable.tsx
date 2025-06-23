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
  LaborItem,
  LaborItemCreate,
  LaborItemUpdate,
  ApiError
} from '../types/api'
import toast from 'react-hot-toast'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { useCostCalculation } from '../context/CostCalculationContext'
import LaborModal from './LaborModal'
import { originalColumns, simplifiedColumns } from './labor-columns'

// Feature flags for easy rollback
const USE_MODAL_EDITING = true
const USE_SIMPLIFIED_COLUMNS = true

interface LaborTableProps {
  subprojectId: number
  onCostChange?: (totalCost: number) => void
}

interface EditingRow {
  id: number | 'new'
  data: Partial<LaborItem>
}

const LaborTable = ({ subprojectId, onCostChange }: LaborTableProps) => {
  const [laborItems, setLaborItems] = useState<LaborItem[]>([])
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null)
  // Inline editing state (only used when not using modal - removed for cleanup)
  
  // Common state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [laborToDelete, setLaborToDelete] = useState<LaborItem | undefined>()
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLaborForModal, setEditingLaborForModal] = useState<LaborItem | null>(null)

  // Form handling (only used for inline editing when not using modal - removed for cleanup)  
  // @ts-ignore - unused variables kept for rollback capability
  const { watch, reset, setValue: _setValue } = useForm<LaborItemCreate>()
  const { updateCost, getCost, isPending } = useCostCalculation()

  const fetchLaborItems = async () => {
    try {
      const response = await subprojectsApi.getById(subprojectId)
      if (response.data.labor_items) {
        setLaborItems(response.data.labor_items)
      }
    } catch (error: any) {
      console.error('Failed to fetch labor items:', error)
    }
  }

  useEffect(() => {
    fetchLaborItems()
  }, [subprojectId])

  // Update cost calculation whenever labor items change
  useEffect(() => {
    const totalCost = laborItems.reduce((sum, item) => sum + (item.number_of_workers * item.hourly_rate * item.hours), 0)
    // For now, just update local cost without server sync since bulk endpoints don't exist yet
    // Individual labor operations already handle server updates
    updateCost(subprojectId.toString(), 'labor', totalCost, []).catch(error => {
      if (error.message !== 'SUPERSEDED' && error.message !== 'REQUEST_CANCELLED') {
        console.error('Failed to update labor cost:', error)
      }
    })
    
    // Also call the legacy onCostChange prop if provided
    onCostChange?.(totalCost)
  }, [laborItems, subprojectId, updateCost, onCostChange])

  // Focus and search effects removed - only needed for inline editing

  const handleAddNew = () => {
    if (USE_MODAL_EDITING) {
      setEditingLaborForModal(null)
      setIsModalOpen(true)
    } else {
      // Original inline editing logic (for rollback)
      setEditingRow({
        id: 'new',
        data: {
          role: '',
          number_of_workers: 1,
          hourly_rate: 0,
          hours: 0
        }
      })
      reset({
        role: '',
        number_of_workers: 1,
        hourly_rate: 0,
        hours: 0,
        subproject_id: subprojectId
      })
      
      // Focus the description input after the component re-renders
      // setTimeout(() => {
      //   descriptionInputElement?.focus()
      // }, 0)
    }
  }

  const handleEdit = (labor: LaborItem) => {
    if (USE_MODAL_EDITING) {
      setEditingLaborForModal(labor)
      setIsModalOpen(true)
    } else {
      // Original inline editing logic (for rollback)
      setEditingRow({
        id: labor.id,
        data: labor
      })
      reset({
        role: labor.role,
        number_of_workers: labor.number_of_workers,
        hourly_rate: labor.hourly_rate,
        hours: labor.hours,
        subproject_id: subprojectId
      })
    }
  }

  const handleCancel = () => {
    setEditingRow(null)
    reset()
    // setSearchQuery('') - removed unused variable
    // setMaterialSuggestions([]) - removed unused variable
  }

  const handleModalSave = (labor: LaborItem) => {
    if (editingLaborForModal) {
      // Update existing labor in the list
      setLaborItems(laborItems.map(l => l.id === labor.id ? labor : l))
    } else {
      // Add new labor to the top of the list
      setLaborItems([labor, ...laborItems])
    }
    setIsModalOpen(false)
    setEditingLaborForModal(null)
    fetchLaborItems() // Refresh to get updated data
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingLaborForModal(null)
  }

  const handleModalDelete = async (labor: LaborItem) => {
    try {
      setDeleteLoading(true)
      await subprojectsApi.deleteLabor(labor.id)
      setLaborItems(laborItems.filter(l => l.id !== labor.id))
      toast.success('Labor deleted successfully')
      fetchLaborItems() // Refresh to get updated data
    } catch (error: any) {
      console.error('Delete labor error:', error)
      
      let message = 'Failed to delete labor'
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
  const _handleSave = async (data: LaborItemCreate) => {
    try {
      // setLoading(true) - removed unused variable
      
      if (editingRow?.id === 'new') {
        // Create new labor
        const response = await subprojectsApi.createLabor(subprojectId, data)
        setLaborItems([response.data, ...laborItems]) // Add new labor to the top
        toast.success('Labor added successfully')
      } else if (editingRow?.id) {
        // Update existing labor
        const updateData: LaborItemUpdate = {
          role: data.role,
          number_of_workers: data.number_of_workers,
          hourly_rate: data.hourly_rate,
          hours: data.hours
        }
        const response = await subprojectsApi.updateLabor(editingRow.id as number, updateData)
        setLaborItems(laborItems.map(l => l.id === editingRow.id ? response.data : l))
        toast.success('Labor updated successfully')
      }
      
      handleCancel()
      fetchLaborItems()
    } catch (error: any) {
      const apiError = error.response?.data as ApiError
      const message = apiError?.detail || 'Failed to save labor'
      toast.error(message)
    } finally {
      // setLoading(false) - removed unused variable
    }
  }

  const handleDeleteClick = (labor: LaborItem) => {
    setLaborToDelete(labor)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!laborToDelete) return

    try {
      setDeleteLoading(true)
      await subprojectsApi.deleteLabor(laborToDelete.id)
      setLaborItems(laborItems.filter(l => l.id !== laborToDelete.id))
      toast.success('Labor deleted successfully')
      fetchLaborItems()
      setIsDeleteModalOpen(false)
      setLaborToDelete(undefined)
    } catch (error: any) {
      console.error('Delete labor error:', error)
      
      let message = 'Failed to delete labor'
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
    setLaborToDelete(undefined)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // @ts-ignore - unused function kept for rollback capability
  const _calculateTotal = (workers: number, rate: number, hours: number) => {
    return workers * rate * hours
  }

  // Column definitions with rollback capability
  const columns = useMemo<ColumnDef<LaborItem, any>[]>(() => {
    if (USE_SIMPLIFIED_COLUMNS) {
      return simplifiedColumns()
    } else {
      return originalColumns(handleEdit, handleDeleteClick)
    }
  }, [])

  // Table data (simplified when using modal editing)
  const tableData = useMemo(() => {
    if (USE_MODAL_EDITING) {
      return laborItems
    } else {
      // Original inline editing logic (for rollback)
      if (editingRow?.id === 'new') {
        const newRow: LaborItem = {
          id: -1, // Use -1 to distinguish new rows from existing ones
          role: watch('role') || '',
          number_of_workers: watch('number_of_workers') || 1,
          hourly_rate: watch('hourly_rate') || 0,
          hours: watch('hours') || 0,
          created_at: new Date().toISOString(),
          updated_at: null,
          subproject_id: subprojectId
        }
        return [newRow, ...laborItems] // Add new row at the beginning
      }
      return laborItems
    }
  }, [laborItems, editingRow, watch, USE_MODAL_EDITING])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalCost = getCost(subprojectId.toString(), 'labor')
  const isUpdatingCost = isPending(subprojectId.toString(), 'labor')

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-medium text-gray-900">Labor</h4>
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
              Add Labor
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
                  const isNumericColumn = ['number_of_workers', 'hourly_rate', 'hours', 'total'].includes(header.id)
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

      {laborItems.length === 0 && !editingRow && (
        <div className="text-center py-8 text-gray-500">
          <p>No labor items added yet.</p>
          <button
            onClick={handleAddNew}
            className="mt-2 btn-primary text-sm"
          >
            Add Your First Labor Item
          </button>
        </div>
      )}

      {/* Labor Modal */}
      <LaborModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onDelete={USE_SIMPLIFIED_COLUMNS ? handleModalDelete : undefined}
        subprojectId={subprojectId}
        editingLabor={editingLaborForModal}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Labor"
        message={`Are you sure you want to delete "${laborToDelete?.role}"? This action cannot be undone.`}
        confirmText="Delete Labor"
        loading={deleteLoading}
      />
    </div>
  )
}

export default LaborTable