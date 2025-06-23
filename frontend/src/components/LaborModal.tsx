import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { subprojectsApi } from '../api/client'
import {
  LaborItem,
  LaborItemCreate,
  LaborItemUpdate,
  ApiError
} from '../types/api'
import toast from 'react-hot-toast'

interface LaborModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (labor: LaborItem) => void
  onDelete?: (labor: LaborItem) => void
  subprojectId: number
  editingLabor?: LaborItem | null
}

const LaborModal: React.FC<LaborModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  subprojectId,
  editingLabor
}) => {
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<LaborItemCreate>({
    defaultValues: {
      role: '',
      number_of_workers: 1,
      hourly_rate: 0,
      hours: 0,
      subproject_id: subprojectId
    }
  })

  const watchedWorkers = watch('number_of_workers') || 0
  const watchedRate = watch('hourly_rate') || 0
  const watchedHours = watch('hours') || 0
  const calculatedTotal = watchedWorkers * watchedRate * watchedHours

  // Reset form when modal opens/closes or editing labor changes
  useEffect(() => {
    if (isOpen) {
      if (editingLabor) {
        reset({
          role: editingLabor.role,
          number_of_workers: editingLabor.number_of_workers,
          hourly_rate: editingLabor.hourly_rate,
          hours: editingLabor.hours,
          subproject_id: subprojectId
        })
      } else {
        reset({
          role: '',
          number_of_workers: 1,
          hourly_rate: 0,
          hours: 0,
          subproject_id: subprojectId
        })
      }
      setShowDeleteConfirm(false)
    }
  }, [isOpen, editingLabor, subprojectId, reset])

  const handleSave = async (data: LaborItemCreate) => {
    try {
      setLoading(true)
      
      if (editingLabor) {
        // Update existing labor
        const updateData: LaborItemUpdate = {
          role: data.role,
          number_of_workers: data.number_of_workers,
          hourly_rate: data.hourly_rate,
          hours: data.hours
        }
        const response = await subprojectsApi.updateLabor(editingLabor.id, updateData)
        onSave(response.data)
        toast.success('Labor updated successfully')
      } else {
        // Create new labor
        const response = await subprojectsApi.createLabor(subprojectId, data)
        onSave(response.data)
        toast.success('Labor added successfully')
      }
      
      onClose()
    } catch (error: any) {
      const apiError = error.response?.data as ApiError
      const message = apiError?.detail || `Failed to ${editingLabor ? 'update' : 'add'} labor`
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
            {editingLabor ? 'Edit Labor' : 'Add Labor'}
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
          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <input
              {...register('role', { 
                required: 'Role is required'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Carpenter, Electrician, Plumber"
              autoComplete="off"
            />
            {errors.role && (
              <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Workers and Rate Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workers *
              </label>
              <input
                {...register('number_of_workers', { 
                  required: 'Number of workers is required',
                  min: { value: 1, message: 'Must have at least 1 worker' }
                })}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                autoComplete="off"
              />
              {errors.number_of_workers && (
                <p className="text-sm text-red-600 mt-1">{errors.number_of_workers.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate *
              </label>
              <input
                {...register('hourly_rate', { 
                  required: 'Hourly rate is required',
                  min: { value: 0, message: 'Hourly rate must be 0 or greater' }
                })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
                autoComplete="off"
              />
              {errors.hourly_rate && (
                <p className="text-sm text-red-600 mt-1">{errors.hourly_rate.message}</p>
              )}
            </div>
          </div>

          {/* Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hours *
            </label>
            <input
              {...register('hours', { 
                required: 'Hours is required',
                min: { value: 0, message: 'Hours must be 0 or greater' }
              })}
              type="number"
              step="0.25"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0.00"
              autoComplete="off"
            />
            {errors.hours && (
              <p className="text-sm text-red-600 mt-1">{errors.hours.message}</p>
            )}
          </div>

          {/* Calculated Total */}
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Cost:</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(calculatedTotal)}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {watchedWorkers} worker{watchedWorkers !== 1 ? 's' : ''} × {formatCurrency(watchedRate)}/hr × {watchedHours} hrs
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            {/* Delete button (left side, only when editing) */}
            {editingLabor && onDelete && (
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
            <div className={`flex space-x-3 ${editingLabor && onDelete ? '' : 'w-full'}`}>
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
                {loading ? 'Saving...' : editingLabor ? 'Update' : 'Add Labor'}
              </button>
            </div>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 mb-3">
                Are you sure you want to delete "{editingLabor?.role}"? This action cannot be undone.
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
                    if (editingLabor && onDelete) {
                      onDelete(editingLabor)
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

export default LaborModal