import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, CheckSquare, Clock, AlertCircle, Edit } from 'lucide-react'
import { ProjectWithClient, Task } from '../types/api'
import { tasksApi } from '../api/client'
import TaskModal from './TaskModal'
import ProjectModal from './ProjectModal'
import ConfirmDialog from './ConfirmDialog'
import toast from 'react-hot-toast'

interface ProjectDetailViewProps {
  project: ProjectWithClient
  onBack: () => void
  onProjectUpdate: () => void
}

const ProjectDetailView = ({ project, onBack, onProjectUpdate }: ProjectDetailViewProps) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null)

  useEffect(() => {
    fetchProjectTasks()
  }, [project.id])

  const fetchProjectTasks = async () => {
    try {
      const response = await tasksApi.getAll(project.id)
      setTasks(response.data)
    } catch (error) {
      toast.error('Failed to fetch project tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setIsTaskModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const handleDeleteTask = (taskId: number) => {
    setTaskToDelete(taskId)
    setIsConfirmDialogOpen(true)
  }

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      try {
        await tasksApi.delete(taskToDelete)
        toast.success('Task deleted successfully')
        fetchProjectTasks()
      } catch (error) {
        toast.error('Failed to delete task')
      } finally {
        setTaskToDelete(null)
      }
    }
  }

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false)
    setEditingTask(null)
  }

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false)
  }

  const handleProjectUpdated = () => {
    onProjectUpdate()
    setIsProjectModalOpen(false)
  }

  const getStatusColor = (status: string) => {
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

  const getPriorityColor = (priority: string) => {
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

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date'
    return new Date(dateString).toLocaleDateString()
  }

  const isOverdue = (dueDateString: string | null, status: string) => {
    if (!dueDateString || status === 'completed') return false
    return new Date(dueDateString) < new Date()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckSquare className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-gray-400" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  // Task statistics
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => isOverdue(t.due_date, t.status)).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-gray-600">Client: {project.client.name}</p>
          </div>
        </div>
        <button
          onClick={() => setIsProjectModalOpen(true)}
          className="btn-secondary inline-flex items-center"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Project
        </button>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Project Details</h3>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)}`}>
                {formatStatus(project.status)}
              </span>
            </div>
            
            {project.description && (
              <p className="text-gray-600 mb-6">{project.description}</p>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Cost Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Labor:</span>
                    <span>${project.labor_cost?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Materials:</span>
                    <span>${project.material_cost?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Permits:</span>
                    <span>${project.permit_cost?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other:</span>
                    <span>${project.other_cost?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Estimated Total:</span>
                    <span>${project.estimated_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Actual Total:</span>
                    <span>${project.actual_cost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Start Date:</span>
                    <span>{project.start_date ? formatDate(project.start_date) : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End Date:</span>
                    <span>{project.end_date ? formatDate(project.end_date) : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                  {project.updated_at && (
                    <div className="flex justify-between">
                      <span>Updated:</span>
                      <span>{formatDate(project.updated_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Task Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Tasks:</span>
                <span className="font-medium">{taskStats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending:</span>
                <span className="font-medium text-gray-600">{taskStats.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">In Progress:</span>
                <span className="font-medium text-blue-600">{taskStats.in_progress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium text-green-600">{taskStats.completed}</span>
              </div>
              {taskStats.overdue > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Overdue:</span>
                  <span className="font-medium text-red-600">{taskStats.overdue}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Project Tasks ({tasks.length})
          </h3>
          <button
            onClick={handleCreateTask}
            className="btn-primary inline-flex items-center"
            title="Add Task"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first task using the button above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(task.status)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {formatStatus(task.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {formatPriority(task.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className={`${isOverdue(task.due_date, task.status) ? 'text-red-600 font-medium' : ''}`}>
                        {formatDate(task.due_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.actual_hours > 0 ? (
                        <span>{task.actual_hours} / {task.estimated_hours}h</span>
                      ) : (
                        <span className="text-gray-500">{task.estimated_hours}h est.</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onSuccess={fetchProjectTasks}
        task={editingTask || undefined}
        projectId={project.id}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={handleCloseProjectModal}
        onSuccess={handleProjectUpdated}
        project={project}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

export default ProjectDetailView 