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
  PermitItem
} from '../types/api'
import toast from 'react-hot-toast'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { useCostCalculation } from '../context/CostCalculationContext'
import PermitsModal from './PermitsModal'
import { simplifiedColumns } from './permits-columns'


interface PermitsTableProps {
  subprojectId: number
  onCostChange?: (totalCost: number) => void
}


const PermitsTable = ({ subprojectId, onCostChange }: PermitsTableProps) => {
  const [permitItems, setPermitItems] = useState<PermitItem[]>([])
  // Inline editing state (only used when not using modal - removed for cleanup)
  
  // Common state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [permitToDelete, setPermitToDelete] = useState<PermitItem | undefined>()
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPermitForModal, setEditingPermitForModal] = useState<PermitItem | null>(null)

  // Form handling (only used for inline editing when not using modal - removed for cleanup)  
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
    setEditingPermitForModal(null)
    setIsModalOpen(true)
  }

  const handleEdit = (permit: PermitItem) => {
    setEditingPermitForModal(permit)
    setIsModalOpen(true)
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

  // Column definitions
  const columns = useMemo<ColumnDef<PermitItem, any>[]>(() => {
    return simplifiedColumns()
  }, [])

  // Table data
  const tableData = useMemo(() => {
    return permitItems
  }, [permitItems])

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
          <button
            onClick={handleAddNew}
            className="btn-primary text-sm inline-flex items-center"
            title="Add Permit"
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

      {permitItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No permits added yet.</p>
          <button
            onClick={handleAddNew}
            className="mt-2 btn-primary text-sm"
          >
            Add Permit
          </button>
        </div>
      )}

      {/* Permits Modal */}
      <PermitsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onDelete={handleModalDelete}
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