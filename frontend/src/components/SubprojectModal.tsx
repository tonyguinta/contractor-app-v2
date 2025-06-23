import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { subprojectsApi } from '../api/client'
import {
  SubprojectCreate,
  SubprojectUpdate,
  SubprojectWithItems
} from '../types/api'
import toast from 'react-hot-toast'

interface SubprojectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  projectId: number
  subproject?: SubprojectWithItems
}

const SubprojectModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  projectId, 
  subproject 
}: SubprojectModalProps) => {
  const [loading, setLoading] = useState(false)
  const isEditing = !!subproject

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm<SubprojectCreate>({
    defaultValues: {
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'planning',
      project_id: projectId
    }
  })

  useEffect(() => {
    if (isOpen) {
      if (subproject) {
        // Populate form for editing - convert ISO dates to YYYY-MM-DD format for HTML date inputs
        const formatDateForInput = (dateString: string | null) => {
          if (!dateString) return ''
          return new Date(dateString).toISOString().split('T')[0]
        }
        
        reset({
          title: subproject.title,
          description: subproject.description || '',
          start_date: formatDateForInput(subproject.start_date),
          end_date: formatDateForInput(subproject.end_date),
          status: subproject.status,
          project_id: projectId
        })
      } else {
        // Reset form for new subproject
        reset({
          title: '',
          description: '',
          start_date: '',
          end_date: '',
          status: 'planning',
          project_id: projectId
        })
      }
    }
  }, [isOpen, subproject, projectId, reset])

  const onSubmit = async (data: SubprojectCreate) => {
    try {
      setLoading(true)
      
      // Convert date strings to ISO format for backend
      const processedData = {
        ...data,
        start_date: data.start_date ? new Date(data.start_date).toISOString() : null,
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
        description: data.description || null
      }
      
      if (isEditing && subproject) {
        // Update existing subproject
        const updateData: SubprojectUpdate = {
          title: processedData.title,
          description: processedData.description,
          start_date: processedData.start_date,
          end_date: processedData.end_date,
          status: processedData.status
        }
        await subprojectsApi.update(subproject.id, updateData)
        toast.success('Subproject updated successfully')
      } else {
        // Create new subproject
        await subprojectsApi.create(processedData)
        toast.success('Subproject created successfully')
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Subproject operation error:', error)
      
      let message = `Failed to ${isEditing ? 'update' : 'create'} subproject`
      
      if (error.response?.data) {
        const errorData = error.response.data
        
        // Handle validation errors (422)
        if (Array.isArray(errorData.detail)) {
          const validationErrors = errorData.detail.map((err: any) => err.msg).join(', ')
          message = `Validation error: ${validationErrors}`
        } else if (typeof errorData.detail === 'string') {
          message = errorData.detail
        } else if (errorData.message) {
          message = errorData.message
        }
      }
      
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit Subproject' : 'Add New Subproject'}
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4" autoComplete="off">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-form-type="other"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Kitchen Remodel, Deck Construction"
            />
            {errors.title && (
              <p className="text-sm text-error mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-form-type="other"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Optional description of the subproject scope and details"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              {...register('status', { required: 'Status is required' })}
              autoComplete="off"
              data-form-type="other"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            {errors.status && (
              <p className="text-sm text-error mt-1">{errors.status.message}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                {...register('start_date')}
                type="date"
                autoComplete="off"
                data-form-type="other"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                {...register('end_date')}
                type="date"
                autoComplete="off"
                data-form-type="other"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="btn-secondary disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Subproject' : 'Create Subproject')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubprojectModal 