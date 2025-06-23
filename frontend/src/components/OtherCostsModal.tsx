import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { subprojectsApi } from '../api/client'
import {
  OtherCostItem,
  OtherCostItemCreate,
  OtherCostItemUpdate,
  ApiError
} from '../types/api'
import toast from 'react-hot-toast'

interface OtherCostsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (otherCost: OtherCostItem) => void
  onDelete?: (otherCost: OtherCostItem) => void
  subprojectId: number
  editingOtherCost?: OtherCostItem | null
}

const OtherCostsModal: React.FC<OtherCostsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  subprojectId,
  editingOtherCost
}) => {
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<OtherCostItemCreate>({
    defaultValues: {
      description: '',
      cost: 0,
      notes: '',
      subproject_id: subprojectId
    }
  })

  const watchedCost = watch('cost') || 0

  // Reset form when modal opens/closes or editing other cost changes
  useEffect(() => {
    if (isOpen) {
      if (editingOtherCost) {
        reset({
          description: editingOtherCost.description,
          cost: editingOtherCost.cost,
          notes: editingOtherCost.notes || '',
          subproject_id: subprojectId
        })
      } else {
        reset({
          description: '',
          cost: 0,
          notes: '',
          subproject_id: subprojectId
        })
      }
      setShowDeleteConfirm(false)
    }
  }, [isOpen, editingOtherCost, subprojectId, reset])

  const handleSave = async (data: OtherCostItemCreate) => {
    try {
      setLoading(true)
      
      if (editingOtherCost) {
        // Update existing other cost
        const updateData: OtherCostItemUpdate = {
          description: data.description,
          cost: data.cost,
          notes: data.notes
        }
        const response = await subprojectsApi.updateOtherCost(editingOtherCost.id, updateData)
        onSave(response.data)
        toast.success('Other cost updated successfully')
      } else {
        // Create new other cost
        const response = await subprojectsApi.createOtherCost(subprojectId, data)
        onSave(response.data)
        toast.success('Other cost added successfully')
      }
      
      onClose()
    } catch (error: any) {
      const apiError = error.response?.data as ApiError
      const message = apiError?.detail || `Failed to ${editingOtherCost ? 'update' : 'add'} other cost`
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingOtherCost ? 'Edit Other Cost' : 'Add Other Cost'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleSave)} className="p-6 space-y-4" autoComplete="off">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              {...register('description', { 
                required: 'Description is required'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Equipment Rental, Delivery Fees, Insurance"
              autoComplete="off"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost *
            </label>
            <input
              {...register('cost', { 
                required: 'Cost is required',
                min: { value: 0, message: 'Cost must be 0 or greater' }
              })}
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0.00"
              autoComplete="off"
            />
            {errors.cost && (
              <p className="text-sm text-red-600 mt-1">{errors.cost.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Additional details or receipt information..."
              autoComplete="off"
            />
          </div>

          {/* Cost Display */}
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Cost:</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(watchedCost)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            {/* Delete button (left side, only when editing) */}
            {editingOtherCost && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                disabled={loading}
              >
                Delete
              </button>
            )}
            
            {/* Main actions (right side) */}
            <div className={`flex space-x-3 ${editingOtherCost && onDelete ? '' : 'w-full'}`}>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : editingOtherCost ? 'Update' : 'Add Other Cost'}
              </button>
            </div>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 mb-3">
                Are you sure you want to delete "{editingOtherCost?.description}"? This action cannot be undone.
              </p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editingOtherCost && onDelete) {
                      onDelete(editingOtherCost)
                      onClose()
                    }
                  }}
                  className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default OtherCostsModal