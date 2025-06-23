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
  PermitItem,
  PermitItemCreate,
  PermitItemUpdate,
  ApiError
} from '../types/api'
import toast from 'react-hot-toast'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { useCostCalculation } from '../context/CostCalculationContext'
import PermitsModal from './PermitsModal'
import { originalColumns, simplifiedColumns } from './permits-columns'

// Feature flags for easy rollback
const USE_MODAL_EDITING = true
const USE_SIMPLIFIED_COLUMNS = true

interface PermitsTableProps {
  subprojectId: number
  onCostChange?: (totalCost: number) => void
}

interface EditingRow {
  id: number | 'new'
  data: Partial<PermitItem>
}

const PermitsTable = ({ subprojectId, onCostChange }: PermitsTableProps) => {
  const [permitItems, setPermitItems] = useState<PermitItem[]>([])
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null)
  // Inline editing state (only used when not using modal - removed for cleanup)
  
  // Common state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [permitToDelete, setPermitToDelete] = useState<PermitItem | undefined>()
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPermitForModal, setEditingPermitForModal] = useState<PermitItem | null>(null)

  // Form handling (only used for inline editing when not using modal - removed for cleanup)  
  // @ts-ignore - unused variables kept for rollback capability
  const { watch, reset, setValue: _setValue } = useForm<PermitItemCreate>()
  const { updateCost, getCost, isPending } = useCostCalculation()

  const fetchPermitItems = async () => {
    try {
      const response = await subprojectsApi.getById(subprojectId)
      if (response.data.permit_items) {
        setPermitItems(response.data.permit_items)
      }
    } catch (error: any) {
      console.error('Failed to fetch permit items:', error)
    }
  }

  useEffect(() => {
    fetchPermitItems()
  }, [subprojectId])

  // Update cost calculation whenever permit items change
  useEffect(() => {
    const totalCost = permitItems.reduce((sum, item) => sum + item.cost, 0)
    // For now, just update local cost without server sync since bulk endpoints don't exist yet
    // Individual permit operations already handle server updates
    updateCost(subprojectId.toString(), 'permits', totalCost, []).catch(error => {
      if (error.message !== 'SUPERSEDED' && error.message !== 'REQUEST_CANCELLED') {
        console.error('Failed to update permits cost:', error)
      }
    })
    
    // Also call the legacy onCostChange prop if provided
    onCostChange?.(totalCost)
  }, [permitItems, subprojectId, updateCost, onCostChange])

  // Focus and search effects removed - only needed for inline editing

  const handleAddNew = () => {
    if (USE_MODAL_EDITING) {
      setEditingPermitForModal(null)
      setIsModalOpen(true)
    } else {
      // Original inline editing logic (for rollback)
      setEditingRow({
        id: 'new',
        data: {
          description: '',
          cost: 0,
          issued_date: null,
          expiration_date: null,
          notes: ''
        }
      })
      reset({
        description: '',
        cost: 0,
        issued_date: '',
        expiration_date: '',
        notes: '',
        subproject_id: subprojectId
      })
    }
  }

  const handleEdit = (permit: PermitItem) => {
    if (USE_MODAL_EDITING) {
      setEditingPermitForModal(permit)
      setIsModalOpen(true)
    } else {
      // Original inline editing logic (for rollback)
      setEditingRow({
        id: permit.id,
        data: permit
      })
      
      // Format dates for form
      const formatDate = (dateStr: string | null) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toISOString().split('T')[0]
      }
      
      reset({
        description: permit.description,
        cost: permit.cost,
        issued_date: formatDate(permit.issued_date),
        expiration_date: formatDate(permit.expiration_date),
        notes: permit.notes || '',
        subproject_id: subprojectId
      })
    }
  }

  const handleCancel = () => {
    setEditingRow(null)
    reset()
  }

  const handleModalSave = (permit: PermitItem) => {
    if (editingPermitForModal) {
      // Update existing permit in the list
      setPermitItems(permitItems.map(p => p.id === permit.id ? permit : p))
    } else {
      // Add new permit to the top of the list
      setPermitItems([permit, ...permitItems])
    }
    setIsModalOpen(false)
    setEditingPermitForModal(null)
    fetchPermitItems() // Refresh to get updated data
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingPermitForModal(null)
  }

  const handleModalDelete = async (permit: PermitItem) => {
    try {
      setDeleteLoading(true)
      await subprojectsApi.deletePermit(permit.id)
      setPermitItems(permitItems.filter(p => p.id !== permit.id))
      toast.success('Permit deleted successfully')
      fetchPermitItems() // Refresh to get updated data
    } catch (error: any) {
      console.error('Delete permit error:', error)
      
      let message = 'Failed to delete permit'
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
  const _handleSave = async (data: PermitItemCreate) => {
    try {
      // setLoading(true) - removed unused variable
      
      if (editingRow?.id === 'new') {
        // Create new permit
        const createData = {
          ...data,
          issued_date: data.issued_date || null,
          expiration_date: data.expiration_date || null
        }
        const response = await subprojectsApi.createPermit(subprojectId, createData)
        setPermitItems([response.data, ...permitItems]) // Add new permit to the top
        toast.success('Permit added successfully')
      } else if (editingRow?.id) {
        // Update existing permit
        const updateData: PermitItemUpdate = {
          description: data.description,
          cost: data.cost,
          issued_date: data.issued_date || null,
          expiration_date: data.expiration_date || null,
          notes: data.notes
        }
        const response = await subprojectsApi.updatePermit(editingRow.id as number, updateData)
        setPermitItems(permitItems.map(p => p.id === editingRow.id ? response.data : p))
        toast.success('Permit updated successfully')
      }
      
      handleCancel()
      fetchPermitItems()
    } catch (error: any) {
      const apiError = error.response?.data as ApiError
      const message = apiError?.detail || 'Failed to save permit'
      toast.error(message)
    } finally {
      // setLoading(false) - removed unused variable
    }
  }

  const handleDeleteClick = (permit: PermitItem) => {
    setPermitToDelete(permit)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!permitToDelete) return

    try {
      setDeleteLoading(true)
      await subprojectsApi.deletePermit(permitToDelete.id)
      setPermitItems(permitItems.filter(p => p.id !== permitToDelete.id))
      toast.success('Permit deleted successfully')
      fetchPermitItems()
      setIsDeleteModalOpen(false)
      setPermitToDelete(undefined)
    } catch (error: any) {
      console.error('Delete permit error:', error)
      
      let message = 'Failed to delete permit'
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
    setPermitToDelete(undefined)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Column definitions with rollback capability
  const columns = useMemo<ColumnDef<PermitItem, any>[]>(() => {
    if (USE_SIMPLIFIED_COLUMNS) {
      return simplifiedColumns()
    } else {
      return originalColumns(handleEdit, handleDeleteClick)
    }
  }, [])

  // Table data (simplified when using modal editing)
  const tableData = useMemo(() => {
    if (USE_MODAL_EDITING) {
      return permitItems
    } else {
      // Original inline editing logic (for rollback)
      if (editingRow?.id === 'new') {
        const newRow: PermitItem = {
          id: -1, // Use -1 to distinguish new rows from existing ones
          description: watch('description') || '',
          cost: watch('cost') || 0,
          issued_date: watch('issued_date') || null,
          expiration_date: watch('expiration_date') || null,
          notes: watch('notes') || '',
          created_at: new Date().toISOString(),
          updated_at: null,
          subproject_id: subprojectId
        }
        return [newRow, ...permitItems] // Add new row at the beginning
      }
      return permitItems
    }
  }, [permitItems, editingRow, watch, USE_MODAL_EDITING])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalCost = getCost(subprojectId.toString(), 'permits')
  const isUpdatingCost = isPending(subprojectId.toString(), 'permits')

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-medium text-gray-900">Permits</h4>
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
              Add Permit
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

      {permitItems.length === 0 && !editingRow && (
        <div className="text-center py-8 text-gray-500">
          <p>No permits added yet.</p>
          <button
            onClick={handleAddNew}
            className="mt-2 btn-primary text-sm"
          >
            Add Your First Permit
          </button>
        </div>
      )}

      {/* Permits Modal */}
      <PermitsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onDelete={USE_SIMPLIFIED_COLUMNS ? handleModalDelete : undefined}
        subprojectId={subprojectId}
        editingPermit={editingPermitForModal}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Permit"
        message={`Are you sure you want to delete "${permitToDelete?.description}"? This action cannot be undone.`}
        confirmText="Delete Permit"
        loading={deleteLoading}
      />
    </div>
  )
}

export default PermitsTable