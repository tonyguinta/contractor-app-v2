import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { clientsApi } from '../api/client'
import toast from 'react-hot-toast'

interface ClientFormData {
  name: string
  email?: string
  phone?: string
  company?: string
  address?: string
  notes?: string
}

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  client?: {
    id: number
    name: string
    email?: string
    phone?: string
    company?: string
    address?: string
    notes?: string
  }
}

const ClientModal = ({ isOpen, onClose, onSuccess, client }: ClientModalProps) => {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ClientFormData>()

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        address: client.address || '',
        notes: client.notes || ''
      })
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        notes: ''
      })
    }
  }, [client, reset])

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true)
    try {
      if (client) {
        await clientsApi.update(client.id, data)
        toast.success('Client updated successfully!')
      } else {
        await clientsApi.create(data)
        toast.success('Client created successfully!')
      }
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${client ? 'update' : 'create'} client`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-primary-600">
            {client ? 'Edit Client' : 'New Client'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              type="text"
              className="input-field"
              placeholder="Enter client name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-error">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...register('email', {
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className="input-field"
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-error">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="input-field"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company
            </label>
            <input
              {...register('company')}
              type="text"
              className="input-field"
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              {...register('address')}
              className="input-field"
              rows={3}
              placeholder="Enter address"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              {...register('notes')}
              className="input-field"
              rows={3}
              placeholder="Enter any additional notes"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClientModal 