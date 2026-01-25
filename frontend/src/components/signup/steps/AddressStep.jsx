/**
 * AddressStep - Step 4: Address Information
 * Collects: Street, City, State, ZIP, Country
 */

import React, { useState } from 'react'
import { useSignup } from '../SignupContext'
import { MapPin, Loader2 } from 'lucide-react'

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'Washington DC' }
]

const AddressStep = () => {
  const { formData, updateField, setErrors, nextStep, setLoading } = useSignup()
  const [saving, setSaving] = useState(false)

  const validateZip = (zip) => {
    return /^\d{5}(-\d{4})?$/.test(zip)
  }

  const handleSubmit = async () => {
    const errors = {}

    if (!formData.address.trim()) {
      errors.address = 'Street address is required'
    }
    if (!formData.city.trim()) {
      errors.city = 'City is required'
    }
    if (!formData.state) {
      errors.state = 'State is required'
    }
    if (!validateZip(formData.zipCode)) {
      errors.zipCode = 'Please enter a valid ZIP code'
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors)
      return
    }

    setSaving(true)
    setLoading(true)

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const token = formData.token || localStorage.getItem('kamioi_user_token')

      const response = await fetch(`${apiBaseUrl}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          address: formData.address,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          zip_code: formData.zipCode,
          country: formData.country
        })
      })

      const data = await response.json()

      if (data.success || response.ok) {
        nextStep()
      } else {
        setErrors({ address: data.error || 'Failed to save address information' })
      }
    } catch (error) {
      console.error('Error saving address:', error)
      setErrors({ address: 'An error occurred. Please try again.' })
    } finally {
      setSaving(false)
      setLoading(false)
    }
  }

  const isFormValid =
    formData.address.trim() &&
    formData.city.trim() &&
    formData.state &&
    validateZip(formData.zipCode)

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Your Address</h2>
        <p className="text-white/70">Where should we send important documents?</p>
      </div>

      {/* Street Address */}
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Street Address *
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="text"
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="123 Main Street"
            className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              formData.errors?.address ? 'border-red-500' : 'border-white/20'
            }`}
          />
        </div>
        {formData.errors?.address && (
          <p className="text-red-400 text-sm mt-1">{formData.errors.address}</p>
        )}
      </div>

      {/* City and State */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            City *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="New York"
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              formData.errors?.city ? 'border-red-500' : 'border-white/20'
            }`}
          />
          {formData.errors?.city && (
            <p className="text-red-400 text-sm mt-1">{formData.errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            State *
          </label>
          <select
            value={formData.state}
            onChange={(e) => updateField('state', e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              formData.errors?.state ? 'border-red-500' : 'border-white/20'
            }`}
          >
            <option value="" className="bg-slate-800">Select State</option>
            {US_STATES.map((state) => (
              <option key={state.code} value={state.code} className="bg-slate-800">
                {state.name}
              </option>
            ))}
          </select>
          {formData.errors?.state && (
            <p className="text-red-400 text-sm mt-1">{formData.errors.state}</p>
          )}
        </div>
      </div>

      {/* ZIP and Country */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            ZIP Code *
          </label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => updateField('zipCode', e.target.value.replace(/[^\d-]/g, '').slice(0, 10))}
            placeholder="10001"
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              formData.errors?.zipCode ? 'border-red-500' : 'border-white/20'
            }`}
          />
          {formData.errors?.zipCode && (
            <p className="text-red-400 text-sm mt-1">{formData.errors.zipCode}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Country
          </label>
          <select
            value={formData.country}
            onChange={(e) => updateField('country', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="USA" className="bg-slate-800">United States</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isFormValid || saving}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center ${
          isFormValid && !saving
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-white/10 text-white/50 cursor-not-allowed'
        }`}
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Saving...
          </>
        ) : (
          'Continue'
        )}
      </button>
    </div>
  )
}

export default AddressStep
