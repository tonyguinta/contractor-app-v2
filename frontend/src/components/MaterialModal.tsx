import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { subprojectsApi } from '../api/client'
import {
  MaterialItem,
  MaterialItemCreate,
  MaterialItemUpdate,
  MaterialEntry,
  ApiError
} from '../types/api'
import toast from 'react-hot-toast'

interface MaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (material: MaterialItem) => void
  onDelete?: (material: MaterialItem) => void
  subprojectId: number
  editingMaterial?: MaterialItem | null
}

const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  subprojectId,
  editingMaterial
}) => {
  const [materialSuggestions, setMaterialSuggestions] = useState<MaterialEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [lastSelectedValue, setLastSelectedValue] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<MaterialItemCreate>({
    defaultValues: {
      description: '',
      unit: 'each',
      quantity: 1,
      unit_cost: 0,
      category: '',
      subproject_id: subprojectId
    }
  })

  const watchedQuantity = watch('quantity') || 0
  const watchedUnitCost = watch('unit_cost') || 0
  const calculatedTotal = watchedQuantity * watchedUnitCost

  // Reset form when modal opens/closes or editing material changes
  useEffect(() => {
    if (isOpen) {
      if (editingMaterial) {
        reset({
          description: editingMaterial.description,
          unit: editingMaterial.unit,
          quantity: editingMaterial.quantity,
          unit_cost: editingMaterial.unit_cost,
          category: editingMaterial.category || '',
          subproject_id: subprojectId
        })
        setLastSelectedValue(editingMaterial.description) // Set this first to prevent autocomplete
        setSearchQuery(editingMaterial.description)
      } else {
        reset({
          description: '',
          unit: 'each',
          quantity: 1,
          unit_cost: 0,
          category: '',
          subproject_id: subprojectId
        })
        setSearchQuery('')
      }
      setMaterialSuggestions([])
      setShowSuggestions(false)
      setLastSelectedValue('')
      setShowDeleteConfirm(false)
    }
  }, [isOpen, editingMaterial, subprojectId, reset])

  // Debounced material search
  useEffect(() => {
    let abortController: AbortController | null = null
    
    const searchMaterials = async () => {
      if (searchQuery.length < 2) {
        setMaterialSuggestions([])
        setShowSuggestions(false)
        return
      }

      // Don't search if this is the same as the last selected value
      if (searchQuery === lastSelectedValue) {
        setShowSuggestions(false)
        return
      }

      // Don't search when editing existing material and query matches the original description
      if (editingMaterial && searchQuery === editingMaterial.description) {
        setShowSuggestions(false)
        return
      }

      abortController = new AbortController()
      
      try {
        const response = await subprojectsApi.searchMaterials(searchQuery, {
          signal: abortController.signal
        })
        setMaterialSuggestions(response.data)
        setShowSuggestions(response.data.length > 0)
      } catch (error: any) {
        if (error.name !== 'AbortError' && error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          console.error('Failed to search materials:', error)
        }
      }
    }

    const timeoutId = setTimeout(searchMaterials, 300)
    
    return () => {
      clearTimeout(timeoutId)
      if (abortController) {
        abortController.abort()
      }
    }
  }, [searchQuery, lastSelectedValue, editingMaterial])

  const handleMaterialSelect = (material: MaterialEntry) => {
    setValue('description', material.description)
    setValue('unit', material.unit)
    setValue('unit_cost', material.unit_price || 0)
    setValue('category', material.category || '')
    
    // Track this as the last selected value to prevent re-searching
    setLastSelectedValue(material.description)
    setSearchQuery(material.description)
    setMaterialSuggestions([])
    setShowSuggestions(false)
  }

  const handleDescriptionChange = (value: string) => {
    setValue('description', value)
    setSearchQuery(value)
    
    // Clear last selected value when user types something different
    if (value !== lastSelectedValue) {
      setLastSelectedValue('')
    }
  }

  const handleInputBlur = () => {
    // Hide suggestions when input loses focus
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200) // Delay to allow clicking on suggestions
  }

  const handleInputFocus = () => {
    // Show suggestions again if we have them and query is long enough
    if (materialSuggestions.length > 0 && searchQuery.length >= 2) {
      setShowSuggestions(true)
    }
  }

  const handleSave = async (data: MaterialItemCreate) => {
    try {
      setLoading(true)
      
      if (editingMaterial) {
        // Update existing material
        const updateData: MaterialItemUpdate = {
          description: data.description,
          unit: data.unit,
          quantity: data.quantity,
          unit_cost: data.unit_cost,
          category: data.category
        }
        const response = await subprojectsApi.updateMaterial(editingMaterial.id, updateData)
        onSave(response.data)
        toast.success('Material updated successfully')
      } else {
        // Create new material
        const response = await subprojectsApi.createMaterial(subprojectId, data)
        onSave(response.data)
        toast.success('Material added successfully')
      }
      
      onClose()
    } catch (error: any) {
      const apiError = error.response?.data as ApiError
      const message = apiError?.detail || `Failed to ${editingMaterial ? 'update' : 'add'} material`
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingMaterial ? 'Edit Material' : 'Add Material'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleSave)} className="p-6 space-y-4" autoComplete="off">
          {/* Description with Autocomplete */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <div className="relative">
              <input
                {...register('description', { 
                  required: 'Description is required',
                  onChange: (e) => handleDescriptionChange(e.target.value),
                  onBlur: handleInputBlur
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter material description..."
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                onFocus={handleInputFocus}
              />
              
              {/* Autocomplete Dropdown */}
              {showSuggestions && materialSuggestions.length > 0 && (
                <div 
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
                  onMouseDown={(e) => e.preventDefault()} // Prevent input blur when clicking dropdown
                >
                  {materialSuggestions.map((material) => (
                    <button
                      key={material.id}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      onMouseDown={(e) => {
                        e.preventDefault() // Prevent input blur
                        handleMaterialSelect(material)
                      }}
                    >
                      <div className="font-medium text-gray-900">{material.description}</div>
                      <div className="text-sm text-gray-500">
                        {material.unit} • {material.category} • {formatCurrency(material.unit_price || 0)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              {...register('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Building Materials, Hardware"
              autoComplete="off"
            />
          </div>

          {/* Unit and Quantity Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <select
                {...register('unit', { required: 'Unit is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="each">Each</option>
                <option value="lf">Linear Feet</option>
                <option value="sf">Square Feet</option>
                <option value="cf">Cubic Feet</option>
                <option value="bag">Bag</option>
                <option value="box">Box</option>
                <option value="roll">Roll</option>
                <option value="sheet">Sheet</option>
                <option value="gallon">Gallon</option>
                <option value="pound">Pound</option>
              </select>
              {errors.unit && (
                <p className="text-sm text-red-600 mt-1">{errors.unit.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                {...register('quantity', { 
                  required: 'Quantity is required',
                  min: { value: 0.01, message: 'Quantity must be greater than 0' }
                })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                autoComplete="off"
              />
              {errors.quantity && (
                <p className="text-sm text-red-600 mt-1">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          {/* Unit Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Cost *
            </label>
            <input
              {...register('unit_cost', { 
                required: 'Unit cost is required',
                min: { value: 0, message: 'Unit cost must be 0 or greater' }
              })}
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0.00"
              autoComplete="off"
            />
            {errors.unit_cost && (
              <p className="text-sm text-red-600 mt-1">{errors.unit_cost.message}</p>
            )}
          </div>

          {/* Calculated Total */}
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Cost:</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(calculatedTotal)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            {/* Delete button (left side, only when editing) */}
            {editingMaterial && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                disabled={loading}
              >
                Delete
              </button>
            )}
            
            {/* Main actions (right side) */}
            <div className={`flex space-x-3 ${editingMaterial && onDelete ? '' : 'w-full'}`}>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : editingMaterial ? 'Update' : 'Add Material'}
              </button>
            </div>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 mb-3">
                Are you sure you want to delete "{editingMaterial?.description}"? This action cannot be undone.
              </p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editingMaterial && onDelete) {
                      onDelete(editingMaterial)
                      onClose()
                    }
                  }}
                  className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default MaterialModal