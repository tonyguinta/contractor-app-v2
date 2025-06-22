import { X, AlertTriangle } from 'lucide-react'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  loading?: boolean
}

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  loading = false
}: ConfirmDeleteModalProps) => {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-error" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600">{message}</p>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="btn-secondary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-error hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal 