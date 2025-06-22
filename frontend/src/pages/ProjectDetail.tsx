import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react'
import { projectsApi, subprojectsApi } from '../api/client'
import {
  ProjectWithClient,
  SubprojectWithItems,
  ApiError
} from '../types/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import MaterialsTable from '../components/MaterialsTable'
import LaborTable from '../components/LaborTable'
import PermitsTable from '../components/PermitsTable'
import OtherCostsTable from '../components/OtherCostsTable'
import CostSummary from '../components/CostSummary'
import SubprojectModal from '../components/SubprojectModal'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<ProjectWithClient | null>(null)
  const [subprojects, setSubprojects] = useState<SubprojectWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'subprojects'>('overview')
  const [isSubprojectModalOpen, setIsSubprojectModalOpen] = useState(false)
  const [editingSubproject, setEditingSubproject] = useState<SubprojectWithItems | undefined>()
  const [expandedSubprojects, setExpandedSubprojects] = useState<Set<number>>(new Set())
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [subprojectToDelete, setSubprojectToDelete] = useState<SubprojectWithItems | undefined>()
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (projectId) {
      fetchProjectData()
    }
  }, [projectId])

  const fetchProjectData = async () => {
    if (!projectId) return
    
    try {
      setLoading(true)
      const [projectResponse, subprojectsResponse] = await Promise.all([
        projectsApi.getById(parseInt(projectId)),
        subprojectsApi.getByProject(parseInt(projectId))
      ])
      
      setProject(projectResponse.data)
      setSubprojects(subprojectsResponse.data)
    } catch (error: any) {
      const apiError = error.response?.data as ApiError
      const message = apiError?.detail || 'Failed to fetch project details'
      toast.error(message)
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }

  const calculateProjectTotals = () => {
    const totals = subprojects.reduce(
      (acc, subproject) => {
        const materialTotal = subproject.material_items.reduce(
          (sum, item) => sum + (item.quantity * item.unit_cost), 0
        )
        const laborTotal = subproject.labor_items.reduce(
          (sum, item) => sum + (item.number_of_workers * item.hourly_rate * item.hours), 0
        )
        const permitTotal = subproject.permit_items.reduce(
          (sum, item) => sum + item.cost, 0
        )
        const otherTotal = subproject.other_cost_items.reduce(
          (sum, item) => sum + item.cost, 0
        )

        return {
          materials: acc.materials + materialTotal,
          labor: acc.labor + laborTotal,
          permits: acc.permits + permitTotal,
          other: acc.other + otherTotal,
        }
      },
      { materials: 0, labor: 0, permits: 0, other: 0 }
    )

    return {
      ...totals,
      total: totals.materials + totals.labor + totals.permits + totals.other
    }
  }

  const handleAddSubproject = () => {
    setEditingSubproject(undefined)
    setIsSubprojectModalOpen(true)
  }

  const handleEditSubproject = (subproject: SubprojectWithItems) => {
    setEditingSubproject(subproject)
    setIsSubprojectModalOpen(true)
  }

  const handleCloseSubprojectModal = () => {
    setIsSubprojectModalOpen(false)
    setEditingSubproject(undefined)
  }

  const handleSubprojectSuccess = () => {
    fetchProjectData()
  }

  const handleToggleSubprojectExpand = (subprojectId: number) => {
    setExpandedSubprojects(prev => {
      const newSet = new Set(prev)
      if (newSet.has(subprojectId)) {
        newSet.delete(subprojectId)
      } else {
        newSet.add(subprojectId)
      }
      return newSet
    })
  }

  const handleDeleteSubproject = (subproject: SubprojectWithItems) => {
    setSubprojectToDelete(subproject)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!subprojectToDelete) return

    try {
      setDeleteLoading(true)
      await subprojectsApi.delete(subprojectToDelete.id)
      toast.success('Subproject deleted successfully')
      fetchProjectData()
      setIsDeleteModalOpen(false)
      setSubprojectToDelete(undefined)
    } catch (error: any) {
      console.error('Delete subproject error:', error)
      
      let message = 'Failed to delete subproject'
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
    setSubprojectToDelete(undefined)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Project not found</h3>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 btn-primary"
        >
          Back to Projects
        </button>
      </div>
    )
  }

  const projectTotals = calculateProjectTotals()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/projects')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-gray-600">Client: {project.client.name}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary inline-flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('subprojects')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subprojects'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Subprojects ({subprojects.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Project Details</h3>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {formatStatus(project.status)}
              </span>
            </div>
            
            {project.description && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">{project.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Start Date</p>
                <p className="font-medium text-gray-900">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">End Date</p>
                <p className="font-medium text-gray-900">
                  {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <CostSummary
              materialsCost={projectTotals.materials}
              laborCost={projectTotals.labor}
              permitsCost={projectTotals.permits}
              otherCost={projectTotals.other}
            />
          </div>
        </div>
      )}

      {activeTab === 'subprojects' && (
        <div className="space-y-6">
          {/* Subprojects Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Subprojects</h3>
            <button 
              onClick={handleAddSubproject}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Subproject
            </button>
          </div>

          {/* Subprojects List */}
          {subprojects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-900">No subprojects</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first subproject.</p>
              <div className="mt-6">
                <button 
                  onClick={handleAddSubproject}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subproject
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {subprojects.map((subproject) => (
                <SubprojectCard
                  key={subproject.id}
                  subproject={subproject}
                  onUpdate={fetchProjectData}
                  onEdit={handleEditSubproject}
                  onDelete={handleDeleteSubproject}
                  isExpanded={expandedSubprojects.has(subproject.id)}
                  onToggleExpand={handleToggleSubprojectExpand}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subproject Modal */}
      {projectId && (
        <SubprojectModal
          isOpen={isSubprojectModalOpen}
          onClose={handleCloseSubprojectModal}
          onSuccess={handleSubprojectSuccess}
          projectId={parseInt(projectId)}
          subproject={editingSubproject}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Subproject"
        message={`Are you sure you want to delete "${subprojectToDelete?.title}"? This action cannot be undone and will also delete all associated materials, labor, permits, and other costs.`}
        confirmText="Delete Subproject"
        loading={deleteLoading}
      />
    </div>
  )
}

// Subproject Card Component
interface SubprojectCardProps {
  subproject: SubprojectWithItems
  onUpdate: () => void
  onEdit: (subproject: SubprojectWithItems) => void
  onDelete: (subproject: SubprojectWithItems) => void
  isExpanded: boolean
  onToggleExpand: (subprojectId: number) => void
}

const SubprojectCard = ({ subproject, onUpdate, onEdit, onDelete, isExpanded, onToggleExpand }: SubprojectCardProps) => {
  const [materialsCost, setMaterialsCost] = useState(0)
  const [laborCost, setLaborCost] = useState(0)
  const [permitsCost, setPermitsCost] = useState(0)
  const [otherCost, setOtherCost] = useState(0)

  const calculateSubprojectTotal = () => {
    return materialsCost + laborCost + permitsCost + otherCost
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div 
            className="flex-1 cursor-pointer"
            onClick={() => onToggleExpand(subproject.id)}
          >
            <div className="flex items-center space-x-3">
              <h4 className="text-lg font-medium text-gray-900">{subproject.title}</h4>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subproject.status)}`}>
                {formatStatus(subproject.status)}
              </span>
              <div className="text-gray-400">
                {isExpanded ? '▼' : '▶'}
              </div>
            </div>
            {subproject.description && (
              <p className="mt-1 text-sm text-gray-600">{subproject.description}</p>
            )}
            <div className="mt-2 text-sm text-gray-500">
              Total Cost: <span className="font-medium text-gray-900">{formatCurrency(calculateSubprojectTotal())}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onEdit(subproject)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onDelete(subproject)
              }}
              className="text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-6 space-y-6">
            {/* Cost Summary */}
            <CostSummary
              materialsCost={materialsCost}
              laborCost={laborCost}
              permitsCost={permitsCost}
              otherCost={otherCost}
            />
            
            {/* Materials Table */}
            <MaterialsTable 
              subproject={subproject} 
              onUpdate={onUpdate}
              onCostChange={setMaterialsCost}
            />
            
            {/* Labor Table */}
            <LaborTable
              subprojectId={subproject.id}
              onCostChange={setLaborCost}
            />
            
            {/* Permits Table */}
            <PermitsTable
              subprojectId={subproject.id}
              onCostChange={setPermitsCost}
            />
            
            {/* Other Costs Table */}
            <OtherCostsTable
              subprojectId={subproject.id}
              onCostChange={setOtherCost}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectDetail 