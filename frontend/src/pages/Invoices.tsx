import { useState, useEffect } from 'react'
import { Plus, FileText } from 'lucide-react'
import { invoicesApi } from '../api/client'
import toast from 'react-hot-toast'
import InvoiceModal from '../components/InvoiceModal'

interface Invoice {
  id: number
  invoice_number: string
  title: string
  description?: string
  amount: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  status: string
  issue_date: string
  due_date: string
  paid_date?: string
  created_at: string
  owner_id: number
  client_id: number
  project_id?: number
  client: {
    id: number
    name: string
  }
}

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await invoicesApi.getAll()
      setInvoices(response.data)
    } catch (error) {
      toast.error('Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingInvoice(null)
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
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage invoices for your clients.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first invoice.</p>
          <div className="mt-6">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <li 
                key={invoice.id} 
                className="px-6 py-4 hover:bg-blue-50 hover:border-l-4 hover:border-primary-500 transition-all duration-200 cursor-pointer"
                onClick={() => handleEditInvoice(invoice)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary-600">
                          {invoice.invoice_number}
                        </p>
                        <p className="text-sm font-medium text-gray-900">{invoice.title}</p>
                        <p className="text-sm text-gray-600">Client: {invoice.client.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">
                          ${invoice.total_amount.toLocaleString()}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {formatStatus(invoice.status)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>
                        Issued: {new Date(invoice.issue_date).toLocaleDateString()}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchInvoices}
        invoice={editingInvoice ? {
          id: editingInvoice.id,
          title: editingInvoice.title,
          description: editingInvoice.description,
          client_id: editingInvoice.client_id,
          project_id: editingInvoice.project_id,
          amount: editingInvoice.amount,
          tax_rate: editingInvoice.tax_rate,
          issue_date: editingInvoice.issue_date,
          due_date: editingInvoice.due_date
        } : undefined}
      />
    </div>
  )
}

export default Invoices 