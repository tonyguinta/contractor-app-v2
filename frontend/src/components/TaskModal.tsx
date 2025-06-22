import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { tasksApi, projectsApi } from '../api/client'
import { Task, TaskCreate, TaskUpdate, TaskStatus, TaskPriority, ProjectWithClient } from '../types/api'
import toast from 'react-hot-toast'

interface TaskFormData {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  estimated_hours: number
  due_date?: string
  project_id: number
}

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  task?: Task
  projectId?: number // For creating tasks within a specific project
}

const TaskModal = ({ isOpen, onClose, onSuccess, task, projectId }: TaskModalProps) => {
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<ProjectWithClient[]>([])
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<TaskFormData>()

  useEffect(() => {
    if (isOpen) {
      initializeModal()
    }
  }, [isOpen, task, projectId])

  const initializeModal = async () => {
    try {
      // Fetch projects for dropdown (unless creating task within specific project)
      if (!projectId) {
        const response = await projectsApi.getAll()
        setProjects(response.data)
      }

      if (task) {
        // Populate form for editing
        setValue('title', task.title)
        setValue('description', task.description || '')
        setValue('status', task.status)
        setValue('priority', task.priority)
        setValue('estimated_hours', task.estimated_hours)
        setValue('due_date', task.due_date ? task.due_date.split('T')[0] : '')
        setValue('project_id', task.project_id)
      } else {
        // Reset form for new task
        reset({
          title: '',
          description: '',
          status: 'pending',
          priority: 'medium',
          estimated_hours: 0,
          project_id: projectId || 0
        })
      }
    } catch (error) {
      toast.error('Failed to initialize task form')
    }
  }

  const onSubmit = async (data: TaskFormData) => {
    try {
      setLoading(true)
      
      if (task) {
        // Update existing task
        const updateData: TaskUpdate = {
          title: data.title,
          description: data.description || null,
          status: data.status,
          priority: data.priority,
          estimated_hours: data.estimated_hours,
          due_date: data.due_date ? new Date(data.due_date + 'T00:00:00').toISOString() : null,
        }
        await tasksApi.update(task.id, updateData)
        toast.success('Task updated successfully')
      } else {
        // Create new task
        const createData: TaskCreate = {
          title: data.title,
          project_id: data.project_id,
          description: data.description || null,
          status: data.status,
          priority: data.priority,
          estimated_hours: data.estimated_hours,
          due_date: data.due_date ? new Date(data.due_date + 'T00:00:00').toISOString() : null,
        }
        console.log('Creating task with data:', createData)
        await tasksApi.create(createData)
        toast.success('Task created successfully')
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Task save error:', error)
      // The API interceptor already shows the error toast, so we don't need to show another one
      // But we can add specific handling if needed
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                {...register('title', { required: 'Task title is required' })}
                className="input-field"
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {!projectId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project *
                </label>
                <select
                  {...register('project_id', { required: 'Project is required' })}
                  className="input-field"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title} - {project.client.name}
                    </option>
                  ))}
                </select>
                {errors.project_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.project_id.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select {...register('status')} className="input-field">
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select {...register('priority')} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Hours
              </label>
              <input
                {...register('estimated_hours', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Hours must be positive' }
                })}
                type="number"
                step="0.25"
                min="0"
                className="input-field"
                placeholder="0.0"
              />
              {errors.estimated_hours && (
                <p className="mt-1 text-sm text-red-600">{errors.estimated_hours.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                {...register('due_date')}
                type="date"
                className="input-field"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="input-field"
                placeholder="Enter task description (optional)"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal 