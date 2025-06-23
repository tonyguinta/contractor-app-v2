import { useState, useEffect, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { subprojectsApi } from '../api/client'
import {
  LaborItem
} from '../types/api'
import toast from 'react-hot-toast'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { useCostCalculation } from '../context/CostCalculationContext'
import LaborModal from './LaborModal'
import { simplifiedColumns } from './labor-columns'


interface LaborTableProps {
  subprojectId: number
  onCostChange?: (totalCost: number) => void
}


const LaborTable = ({ subprojectId, onCostChange }: LaborTableProps) => {
  const [laborItems, setLaborItems] = useState<LaborItem[]>([])
  // Inline editing state (only used when not using modal - removed for cleanup)
  
  // Common state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [laborToDelete, setLaborToDelete] = useState<LaborItem | undefined>()
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLaborForModal, setEditingLaborForModal] = useState<LaborItem | null>(null)

  // Form handling (only used for inline editing when not using modal - removed for cleanup)  
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
    setEditingLaborForModal(null)
    setIsModalOpen(true)
  }

  const handleEdit = (labor: LaborItem) => {
    setEditingLaborForModal(labor)
    setIsModalOpen(true)
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


  // Column definitions
  const columns = useMemo<ColumnDef<LaborItem, any>[]>(() => {
    return simplifiedColumns()
  }, [])

  // Table data
  const tableData = useMemo(() => {
    return laborItems
  }, [laborItems])

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
          <button
            onClick={handleAddNew}
            className="btn-primary text-sm inline-flex items-center"
            title="Add Labor"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </button>
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
            {table.getRowModel().rows.map(row => (
              <tr 
                key={row.id} 
                className="transition-colors hover:bg-blue-50 hover:shadow-sm cursor-pointer"
                onClick={() => handleEdit(row.original)}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {laborItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No labor items added yet.</p>
          <button
            onClick={handleAddNew}
            className="mt-2 btn-primary text-sm"
          >
            Add Labor
          </button>
        </div>
      )}

      {/* Labor Modal */}
      <LaborModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onDelete={handleModalDelete}
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