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
  MaterialItem,
  SubprojectWithItems
} from '../types/api'
import toast from 'react-hot-toast'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { useCostCalculation } from '../context/CostCalculationContext'
import MaterialModal from './MaterialModal'
import { simplifiedColumns } from './materials-columns'

interface MaterialsTableProps {
  subproject: SubprojectWithItems
  onUpdate: () => void
}


const MaterialsTable = ({ subproject, onUpdate }: MaterialsTableProps) => {
  const [materials, setMaterials] = useState<MaterialItem[]>(subproject.material_items)
  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [materialToDelete, setMaterialToDelete] = useState<MaterialItem | undefined>()
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMaterialForModal, setEditingMaterialForModal] = useState<MaterialItem | null>(null)

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
    setEditingMaterialForModal(null)
    setIsModalOpen(true)
  }

  const handleEdit = (material: MaterialItem) => {
    setEditingMaterialForModal(material)
    setIsModalOpen(true)
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


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }


  // Column definitions
  const columns = useMemo<ColumnDef<MaterialItem, any>[]>(() => {
    return simplifiedColumns()
  }, [])

  // Table data
  const tableData = useMemo(() => {
    return materials
  }, [materials])

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
          <button
            onClick={handleAddNew}
            className="btn-primary text-sm inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Material
          </button>
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

      {materials.length === 0 && (
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
        onDelete={handleModalDelete}
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