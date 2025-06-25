import { useState, useEffect } from 'react'
import { Save, Info } from 'lucide-react'
import { companyApi } from '../api/client'
import { CompanySettings as CompanySettingsType, ApiError } from '../types/api'
import toast from 'react-hot-toast'

const CompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettingsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [taxRateInput, setTaxRateInput] = useState<string>('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await companyApi.getSettings()
      setSettings(response.data)
      // Convert decimal to percentage for display (0.0875 -> 8.75)
      const percentage = parseFloat(response.data.default_sales_tax_rate) * 100
      setTaxRateInput(percentage === 0 ? '' : percentage.toString())
    } catch (error: any) {
      const apiError = error.response?.data as ApiError
      const message = apiError?.detail || 'Failed to fetch company settings'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return
    
    // Validate tax rate
    const taxRate = parseFloat(taxRateInput) || 0
    if (taxRate < 0 || taxRate > 50) {
      toast.error('Tax rate must be between 0% and 50%')
      return
    }

    setSaving(true)
    try {
      // Convert percentage to decimal for API (8.75 -> 0.0875)
      const decimalRate = taxRate / 100
      const response = await companyApi.updateSettings({
        default_sales_tax_rate: decimalRate
      })
      setSettings(response.data)
      toast.success('Company settings saved successfully')
    } catch (error: any) {
      const apiError = error.response?.data as ApiError
      const message = apiError?.detail || 'Failed to save company settings'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleTaxRateChange = (value: string) => {
    // Allow empty string, numbers, and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTaxRateInput(value)
    }
  }

  const getTaxRateWarning = () => {
    const taxRate = parseFloat(taxRateInput) || 0
    if (taxRate > 25) {
      return 'Warning: Tax rate above 25% is unusually high'
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading company settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure default settings for your company
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="tax-rate" className="block text-sm font-medium text-gray-700 mb-2">
                  Default Sales Tax Rate
                </label>
                <div className="relative">
                  <input
                    id="tax-rate"
                    type="text"
                    value={taxRateInput}
                    onChange={(e) => handleTaxRateChange(e.target.value)}
                    placeholder="8.75"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                    %
                  </span>
                </div>
                
                {getTaxRateWarning() && (
                  <div className="mt-2 flex items-center text-amber-600">
                    <Info className="h-4 w-4 mr-1" />
                    <span className="text-sm">{getTaxRateWarning()}</span>
                  </div>
                )}
                
                <div className="mt-3 p-4 bg-blue-50 rounded-md">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Tax Rate Guidelines</p>
                      <p>
                        Tax is applied to the full project total. Note: Labor and permit fees may not be taxable in your jurisdiction. Adjust the tax rate accordingly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanySettings