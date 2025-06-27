import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Folder } from 'lucide-react'
import { projectsApi } from '../api/client'
import { ProjectWithClient, ApiError } from '../types/api'
import toast from 'react-hot-toast'
import ProjectModal from '../components/ProjectModal'

const Projects = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getAll()
      setProjects(response.data)
    } catch (error: any) {
      const apiError = error.response?.data as ApiError
      const message = apiError?.detail || 'Failed to fetch projects'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
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

  const handleViewProject = (project: ProjectWithClient) => {
    navigate(`/projects/${project.id}`)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track and manage your construction projects.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first project.</p>
          <div className="mt-6">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="card hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
              onClick={() => handleViewProject(project)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                  <p className="text-sm text-gray-600">Client: {project.client.name}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {formatStatus(project.status)}
                </span>
              </div>
              
              {project.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
              )}
              
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Cost (with tax)</p>
                  <p className="font-medium text-gray-900">${(project.total_with_tax || 0).toLocaleString()}</p>
                </div>
                {/* Estimated cost will be calculated from subproject data in future implementation */}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                  {project.updated_at && (
                    <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
                    ))}
        </div>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchProjects}
      />
    </div>
  )
}

export default Projects 