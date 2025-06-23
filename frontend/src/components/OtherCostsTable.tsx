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
  OtherCostItem
} from '../types/api'
import toast from 'react-hot-toast'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { useCostCalculation } from '../context/CostCalculationContext'
import OtherCostsModal from './OtherCostsModal'
import { simplifiedColumns } from './other-costs-columns'


interface OtherCostsTableProps {
  subprojectId: number
  onCostChange?: (totalCost: number) => void
}


const OtherCostsTable = ({ subprojectId, onCostChange }: OtherCostsTableProps) => {
  const [otherCostItems, setOtherCostItems] = useState<OtherCostItem[]>([])
  // Inline editing state (only used when not using modal - removed for cleanup)
  
  // Common state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [otherCostToDelete, setOtherCostToDelete] = useState<OtherCostItem | undefined>()
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOtherCostForModal, setEditingOtherCostForModal] = useState<OtherCostItem | null>(null)

  // Form handling (only used for inline editing when not using modal - removed for cleanup)  
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
    setEditingOtherCostForModal(null)
    setIsModalOpen(true)
  }

  const handleEdit = (otherCost: OtherCostItem) => {
    setEditingOtherCostForModal(otherCost)
    setIsModalOpen(true)
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

  // Column definitions
  const columns = useMemo<ColumnDef<OtherCostItem, any>[]>(() => {
    return simplifiedColumns()
  }, [])

  // Table data
  const tableData = useMemo(() => {
    return otherCostItems
  }, [otherCostItems])

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
          <button
            onClick={handleAddNew}
            className="btn-primary text-sm inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Other Cost
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

      {otherCostItems.length === 0 && (
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
        onDelete={handleModalDelete}
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