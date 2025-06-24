import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit } from 'lucide-react'
import { subprojectsApi, projectsApi } from '../api/client'
import { SubprojectWithItems, ProjectWithClient, ApiError } from '../types/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import MaterialsTable from '../components/MaterialsTable'
import LaborTable from '../components/LaborTable'
import PermitsTable from '../components/PermitsTable'
import OtherCostsTable from '../components/OtherCostsTable'
import CostSummary from '../components/CostSummary'
import SubprojectModal from '../components/SubprojectModal'
import { useCostCalculation } from '../context/CostCalculationContext'

const SubprojectDetail = () => {
  const { projectId, subprojectId } = useParams<{ projectId: string; subprojectId: string }>()
  const navigate = useNavigate()
  const [subproject, setSubproject] = useState<SubprojectWithItems | null>(null)
  const [project, setProject] = useState<ProjectWithClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { getCost, setConfirmedCost } = useCostCalculation()
  const [laborCost, setLaborCost] = useState(0)
  const [permitsCost, setPermitsCost] = useState(0)
  const [otherCost, setOtherCost] = useState(0)

  useEffect(() => {
    if (projectId && subprojectId) {
      fetchData()
    }
  }, [projectId, subprojectId])

  // Initialize confirmed costs from subproject data
  useEffect(() => {
    if (subproject) {
      const materialTotal = subproject.material_items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0)
      setConfirmedCost(subproject.id.toString(), 'materials', materialTotal)
    }
  }, [subproject, setConfirmedCost])

  const fetchData = async () => {
    if (!projectId || !subprojectId) return
    
    try {
      setLoading(true)
      const [projectResponse, subprojectResponse] = await Promise.all([
        projectsApi.getById(parseInt(projectId)),
        subprojectsApi.getById(parseInt(subprojectId))
      ])
      
      setProject(projectResponse.data)
      setSubproject(subprojectResponse.data)
    } catch (error: any) {
      const apiError = error.response?.data as ApiError
      const message = apiError?.detail || 'Failed to fetch subproject details'
      toast.error(message)
      navigate(`/projects/${projectId}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubproject = () => {
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
  }

  const handleSubprojectUpdateSuccess = () => {
    fetchData()
    setIsEditModalOpen(false)
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'on_hold':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!subproject || !project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Subproject not found</h3>
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="mt-4 btn-primary"
        >
          Back to Project
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/projects/${projectId}`)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 truncate">{subproject.title}</h1>
              <p className="text-sm text-gray-500">{project.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subproject.status)}`}>
              {formatStatus(subproject.status)}
            </span>
            <button 
              onClick={handleEditSubproject}
              className="btn-secondary inline-flex items-center text-sm"
            >
              <Edit className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Subproject Description */}
        {subproject.description && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
            <p className="text-gray-600">{subproject.description}</p>
          </div>
        )}

        {/* Cost Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Summary</h3>
          <CostSummary
            materialsCost={getCost(subproject.id.toString(), 'materials')}
            laborCost={laborCost}
            permitsCost={permitsCost}
            otherCost={otherCost}
          />
        </div>

        {/* Materials Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Materials</h3>
          </div>
          <div className="p-6">
            <MaterialsTable 
              subproject={subproject} 
              onUpdate={fetchData}
            />
          </div>
        </div>

        {/* Labor Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Labor</h3>
          </div>
          <div className="p-6">
            <LaborTable
              subprojectId={subproject.id}
              onCostChange={setLaborCost}
            />
          </div>
        </div>

        {/* Permits Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Permits</h3>
          </div>
          <div className="p-6">
            <PermitsTable
              subprojectId={subproject.id}
              onCostChange={setPermitsCost}
            />
          </div>
        </div>

        {/* Other Costs Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Other Costs</h3>
          </div>
          <div className="p-6">
            <OtherCostsTable
              subprojectId={subproject.id}
              onCostChange={setOtherCost}
            />
          </div>
        </div>
      </div>

      {/* Edit Subproject Modal */}
      {projectId && (
        <SubprojectModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSuccess={handleSubprojectUpdateSuccess}
          projectId={parseInt(projectId)}
          subproject={subproject}
        />
      )}
    </div>
  )
}

export default SubprojectDetail