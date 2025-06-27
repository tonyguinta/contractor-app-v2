import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { projectsApi, clientsApi, companyApi } from '../api/client'
import { ProjectWithClient, ProjectCreate, Client } from '../types/api'
import toast from 'react-hot-toast'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  project?: ProjectWithClient
}

const ProjectModal = ({ isOpen, onClose, onSuccess, project }: ProjectModalProps) => {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProjectCreate>()

  useEffect(() => {
    if (isOpen) {
      const initializeModal = async () => {
        // First fetch clients
        await fetchClients()
        
        if (project) {
          // Then populate form with project data for editing
          setValue('title', project.title)
          setValue('description', project.description || '')
          setValue('status', project.status)
          setValue('client_id', project.client_id)
          setValue('start_date', project.start_date ? project.start_date.split('T')[0] : '')
          setValue('end_date', project.end_date ? project.end_date.split('T')[0] : '')
          setValue('sales_tax_rate', project.sales_tax_rate ? parseFloat((parseFloat(project.sales_tax_rate) * 100).toFixed(6)) : 0)
          setValue('is_tax_exempt', project.is_tax_exempt || false)
        } else {
          // Reset form for new project and fetch company default tax rate
          try {
            const companySettings = await companyApi.getSettings()
            const defaultTaxRatePercentage = parseFloat(companySettings.data.default_sales_tax_rate) * 100
            // Remove floating point artifacts while preserving real precision
            const cleanPercentage = parseFloat(defaultTaxRatePercentage.toFixed(6))
            
            reset({
              title: '',
              description: '',
              status: 'planning',
              sales_tax_rate: cleanPercentage === 0 ? 0 : cleanPercentage,
              is_tax_exempt: false
            })
          } catch (error) {
            // Fallback to 0 if company settings fetch fails
            reset({
              title: '',
              description: '',
              status: 'planning',
              sales_tax_rate: 0,
              is_tax_exempt: false
            })
          }
        }
      }
      
      initializeModal()
    }
  }, [isOpen, project, setValue, reset])

  // Separate effect to ensure client_id is set after clients are loaded
  useEffect(() => {
    if (project && clients.length > 0) {
      setValue('client_id', project.client_id)
    }
  }, [project, clients, setValue])

  const fetchClients = async () => {
    try {
      const response = await clientsApi.getAll()
      setClients(response.data)
      return response.data
    } catch (error) {
      toast.error('Failed to fetch clients')
      return []
    }
  }

  const onSubmit = async (data: ProjectCreate) => {
    setLoading(true)
    try {
      const projectData = {
        ...data,
        // Convert percentage to decimal (7.875 -> 0.07875)
        sales_tax_rate: data.sales_tax_rate ? Number(data.sales_tax_rate) / 100 : 0,
        start_date: data.start_date ? new Date(data.start_date).toISOString() : null,
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
      }

      if (project) {
        await projectsApi.update(project.id, projectData)
        toast.success('Project updated successfully!')
      } else {
        await projectsApi.create(projectData)
        toast.success('Project created successfully!')
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to save project'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {project ? 'Edit Project' : 'New Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6" autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                {...register('title', { required: 'Project title is required' })}
                className="input-field"
                placeholder="Enter project title"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <select
                {...register('client_id', { required: 'Client is required' })}
                name="client_id"
                className="input-field"
                defaultValue={project?.client_id || ''}
                autoComplete="off"
                data-form-type="other"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              {errors.client_id && (
                <p className="mt-1 text-sm text-red-600">{errors.client_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select {...register('status')} className="input-field" autoComplete="off" data-form-type="other">
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                {...register('start_date')}
                type="date"
                className="input-field"
                autoComplete="off"
                data-form-type="other"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                {...register('end_date')}
                type="date"
                className="input-field"
                autoComplete="off"
                data-form-type="other"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input-field"
              placeholder="Project description..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-form-type="other"
            />
          </div>


          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Tax Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sales Tax Rate (%)
                </label>
                <div className="relative">
                  <input
                    {...register('sales_tax_rate', { 
                      min: { value: 0, message: 'Tax rate cannot be negative' },
                      max: { value: 50, message: 'Tax rate cannot exceed 50%' }
                    })}
                    type="number"
                    step="0.000001"
                    min="0"
                    max="50"
                    className="input-field pr-8"
                    placeholder="7.5"
                    autoComplete="off"
                    data-form-type="other"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 text-sm">
                    %
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter as percentage (7.5 for 7.5%)
                </p>
                {errors.sales_tax_rate && (
                  <p className="mt-1 text-sm text-red-600">{errors.sales_tax_rate.message}</p>
                )}
              </div>

              <div className="flex items-center h-fit pt-8">
                <input
                  {...register('is_tax_exempt')}
                  type="checkbox"
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  autoComplete="off"
                  data-form-type="other"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Tax Exempt Project
                </label>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-md">
              <div className="flex items-start">
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Tax Information</p>
                  <p>
                    Tax is applied to the full project total. Note: Labor and permit fees may not be taxable in your jurisdiction. Adjust the tax rate accordingly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProjectModal 