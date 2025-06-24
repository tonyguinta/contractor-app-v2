import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { tasksApi } from '../api/client'
import { Task } from '../types/api'
import TaskModal from './TaskModal'
import toast from 'react-hot-toast'

interface TasksTableProps {
  projectId: number
  onTaskChange?: () => void
}

const TasksTable: React.FC<TasksTableProps> = ({ projectId, onTaskChange }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()

  useEffect(() => {
    fetchTasks()
  }, [projectId])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await tasksApi.getAll(projectId)
      setTasks(response.data)
    } catch (error: any) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = () => {
    setEditingTask(undefined)
    setIsModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleDeleteTask = async (task: Task) => {
    if (!confirm(`Are you sure you want to delete "${task.title}"?`)) return

    try {
      await tasksApi.delete(task.id)
      setTasks(tasks.filter(t => t.id !== task.id))
      toast.success('Task deleted successfully')
      onTaskChange?.()
    } catch (error: any) {
      console.error('Delete task error:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleModalSuccess = () => {
    fetchTasks()
    setIsModalOpen(false)
    setEditingTask(undefined)
    onTaskChange?.()
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTask(undefined)
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    }
    
    const statusLabels = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityStyles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyles[priority as keyof typeof priorityStyles] || 'bg-gray-100 text-gray-800'}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    )
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Tasks</h3>
        <button
          onClick={handleAddTask}
          className="btn-accent inline-flex items-center text-sm"
          title="Add Task"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </button>
      </div>

      {/* Tasks Table */}
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-3">No tasks yet</p>
          <button
            onClick={handleAddTask}
            className="btn-accent inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEditTask(task)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(task.due_date)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditTask(task)
                          }}
                          className="text-primary-600 hover:text-primary-900 p-1"
                          title="Edit Task"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTask(task)
                          }}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleEditTask(task)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditTask(task)
                      }}
                      className="text-primary-600 hover:text-primary-900 p-1"
                      title="Edit Task"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTask(task)
                      }}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete Task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
                  </div>
                  <div className="text-gray-500">
                    Due: {formatDate(task.due_date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        task={editingTask}
        projectId={projectId}
      />
    </div>
  )
}

export default TasksTable