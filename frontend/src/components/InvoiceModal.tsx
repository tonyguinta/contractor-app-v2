import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { invoicesApi, clientsApi, projectsApi } from '../api/client'
import { InvoiceWithClient, Client, ProjectWithClient } from '../types/api'
import toast from 'react-hot-toast'

// Form-specific interface for HTML form inputs (strings)
interface InvoiceFormData {
  title: string
  description?: string
  client_id: string
  project_id?: string
  amount: string
  tax_rate: string
  issue_date: string
  due_date: string
}

interface InvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  invoice?: InvoiceWithClient
}

const InvoiceModal = ({ isOpen, onClose, onSuccess, invoice }: InvoiceModalProps) => {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<ProjectWithClient[]>([])
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<InvoiceFormData>()

  const watchedClientId = watch('client_id')

  useEffect(() => {
    if (isOpen) {
      const initializeModal = async () => {
        // First fetch clients and projects
        await fetchClients()
        await fetchProjects()
        
        if (invoice) {
          // Then populate form with invoice data for editing
          setValue('title', invoice.title)
          setValue('description', invoice.description || '')
          setValue('client_id', invoice.client_id.toString())
          setValue('project_id', invoice.project_id?.toString() || '')
          setValue('amount', invoice.amount.toString())
          setValue('tax_rate', invoice.tax_rate.toString())
          setValue('issue_date', invoice.issue_date.split('T')[0])
          setValue('due_date', invoice.due_date.split('T')[0])
          setSelectedClientId(invoice.client_id)
        } else {
          // Reset form for new invoice
          const today = new Date().toISOString().split('T')[0]
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + 30)
          const dueDateStr = dueDate.toISOString().split('T')[0]
          
          reset({
            title: '',
            description: '',
            client_id: '',
            project_id: '',
            amount: '0',
            tax_rate: '0',
            issue_date: today,
            due_date: dueDateStr
          })
          setSelectedClientId(null)
        }
      }
      
      initializeModal()
    }
  }, [isOpen, invoice, setValue, reset])

  useEffect(() => {
    if (watchedClientId) {
      setSelectedClientId(Number(watchedClientId))
    }
  }, [watchedClientId])

  // Backup effect to ensure client_id is set after clients are loaded
  useEffect(() => {
    if (invoice && clients.length > 0) {
      setValue('client_id', invoice.client_id.toString())
      setSelectedClientId(invoice.client_id)
    }
  }, [invoice, clients, setValue])

  // Backup effect to ensure project_id is set after both clients and projects are loaded
  useEffect(() => {
    if (invoice && clients.length > 0 && projects.length > 0 && invoice.project_id) {
      setValue('project_id', invoice.project_id.toString())
    }
  }, [invoice, clients, projects, setValue])

  const fetchClients = async () => {
    try {
      const response = await clientsApi.getAll()
      setClients(response.data)
    } catch (error) {
      toast.error('Failed to fetch clients')
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getAll()
      setProjects(response.data)
    } catch (error) {
      toast.error('Failed to fetch projects')
    }
  }

  const getFilteredProjects = () => {
    if (!selectedClientId) return []
    return projects.filter(project => project.client.id === selectedClientId)
  }

  const onSubmit = async (data: InvoiceFormData) => {
    setLoading(true)
    try {
      const invoiceData = {
        ...data,
        amount: Number(data.amount),
        tax_rate: Number(data.tax_rate),
        client_id: Number(data.client_id),
        project_id: data.project_id ? Number(data.project_id) : null,
        issue_date: new Date(data.issue_date).toISOString(),
        due_date: new Date(data.due_date).toISOString(),
      }

      if (invoice) {
        await invoicesApi.update(invoice.id, invoiceData)
        toast.success('Invoice updated successfully!')
      } else {
        await invoicesApi.create(invoiceData)
        toast.success('Invoice created successfully!')
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to save invoice'
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
            {invoice ? 'Edit Invoice' : 'New Invoice'}
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
                Invoice Title *
              </label>
              <input
                {...register('title', { required: 'Invoice title is required' })}
                className="input-field"
                placeholder="Enter invoice title"
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
                className="input-field"
                defaultValue={invoice?.client_id || ''}
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
                Project (Optional)
              </label>
              <select
                {...register('project_id')}
                className="input-field"
                disabled={!selectedClientId}
                defaultValue={invoice?.project_id?.toString() || ''}
              >
                <option value="">Select a project</option>
                {getFilteredProjects().map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <input
                {...register('amount', { required: 'Amount is required', min: 0.01 })}
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                {...register('tax_rate')}
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="input-field"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date *
              </label>
              <input
                {...register('issue_date', { required: 'Issue date is required' })}
                type="date"
                className="input-field"
              />
              {errors.issue_date && (
                <p className="mt-1 text-sm text-red-600">{errors.issue_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                {...register('due_date', { required: 'Due date is required' })}
                type="date"
                className="input-field"
              />
              {errors.due_date && (
                <p className="mt-1 text-sm text-red-600">{errors.due_date.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="input-field"
              placeholder="Invoice description or notes..."
            />
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
              {loading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InvoiceModal 