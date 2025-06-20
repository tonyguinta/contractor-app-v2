import { useState, useEffect } from 'react'
import { Plus, User } from 'lucide-react'
import { clientsApi } from '../api/client'
import toast from 'react-hot-toast'

interface Client {
  id: number
  name: string
  email?: string
  phone?: string
  company?: string
  created_at: string
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await clientsApi.getAll()
      setClients(response.data)
    } catch (error) {
      toast.error('Failed to fetch clients')
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your client relationships and contact information.
          </p>
        </div>
        <button className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          New Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No clients</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first client.</p>
          <div className="mt-6">
            <button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Client
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <div key={client.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
                  {client.company && (
                    <p className="text-sm text-gray-500 truncate">{client.company}</p>
                  )}
                  {client.email && (
                    <p className="text-sm text-gray-500 truncate">{client.email}</p>
                  )}
                  {client.phone && (
                    <p className="text-sm text-gray-500 truncate">{client.phone}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Clients 