import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { projectsApi, clientsApi } from '../api/client'
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
          setValue('estimated_cost', project.estimated_cost)
          setValue('start_date', project.start_date ? project.start_date.split('T')[0] : '')
          setValue('end_date', project.end_date ? project.end_date.split('T')[0] : '')
          setValue('labor_cost', project.labor_cost || 0)
          setValue('material_cost', project.material_cost || 0)
          setValue('permit_cost', project.permit_cost || 0)
          setValue('other_cost', project.other_cost || 0)
        } else {
          // Reset form for new project
          reset({
            title: '',
            description: '',
            status: 'planning',
            estimated_cost: 0,
            labor_cost: 0,
            material_cost: 0,
            permit_cost: 0,
            other_cost: 0
          })
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
        estimated_cost: Number(data.estimated_cost),
        labor_cost: Number(data.labor_cost || 0),
        material_cost: Number(data.material_cost || 0),
        permit_cost: Number(data.permit_cost || 0),
        other_cost: Number(data.other_cost || 0),
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

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                {...register('title', { required: 'Project title is required' })}
                className="input-field"
                placeholder="Enter project title"
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
              <select {...register('status')} className="input-field">
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
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Cost Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Total Cost
                </label>
                <input
                  {...register('estimated_cost')}
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Labor Cost
                </label>
                <input
                  {...register('labor_cost')}
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Cost
                </label>
                <input
                  {...register('material_cost')}
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permit Cost
                </label>
                <input
                  {...register('permit_cost')}
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Costs
                </label>
                <input
                  {...register('other_cost')}
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  placeholder="0.00"
                />
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