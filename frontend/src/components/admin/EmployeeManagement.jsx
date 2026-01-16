import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, UserPlus, Edit, Trash2, Shield, Eye, EyeOff, Save, X, Check, AlertTriangle, Info } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useNotifications } from '../../hooks/useNotifications'

const EmployeeManagement = () => {
  const { isLightMode, isDarkMode, isCloudMode } = useTheme()
  const { addNotification } = useNotifications()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [showPermissions, setShowPermissions] = useState({})

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'admin',
    permissions: {
      can_view_users: false,
      can_edit_users: false,
      can_view_transactions: false,
      can_edit_transactions: false,
      can_access_llm: false,
      can_manage_system: false,
      can_view_analytics: false,
      can_manage_advertisements: false
    }
  })

  // Load employees on component mount with AbortController
  useEffect(() => {
    const abortController = new AbortController()
    loadEmployees(abortController.signal)
    
    return () => {
      abortController.abort()
    }
  }, [])

  const loadEmployees = async (signal = null) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3' || localStorage.getItem('authToken')
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        setEmployees(data.employees)
      } else {
        console.error('Error loading employees:', data.error)
        addNotification({
          type: 'error',
          title: 'Load Failed',
          message: `Error loading employees: ${data.error}`,
          timestamp: new Date()
        })
      }
      if (!signal?.aborted) {
        // Dispatch page load completion event for Loading Report
        window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
          detail: { pageId: 'employees' }
        }))
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading employees:', error)
        addNotification({
          type: 'error',
          title: 'Load Failed',
          message: `Error loading employees: ${error.message}`,
          timestamp: new Date()
        })
        // Still dispatch completion event even on error
        if (!signal?.aborted) {
          window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
            detail: { pageId: 'employees' }
          }))
        }
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }

  const handleAddEmployee = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/employees`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3' || localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Employee Added',
          message: 'Employee added successfully!',
          timestamp: new Date()
        })
        loadEmployees() // Reload the list
        setFormData({
          email: '',
          password: '',
          name: '',
          role: 'admin',
          permissions: {
            can_view_users: false,
            can_edit_users: false,
            can_view_transactions: false,
            can_edit_transactions: false,
            can_access_llm: false,
            can_manage_system: false,
            can_view_analytics: false,
            can_manage_advertisements: false
          }
        })
        setShowAddForm(false)
      } else {
        addNotification({
          type: 'error',
          title: 'Add Failed',
          message: `Error adding employee: ${data.error}`,
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Error adding employee:', error)
      addNotification({
        type: 'error',
        title: 'Add Failed',
        message: `Error adding employee: ${error.message}`,
        timestamp: new Date()
      })
    }
  }

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee)
    setFormData({
      email: employee.email,
      password: '', // Don't show existing password
      name: employee.name,
      role: employee.role,
      permissions: { ...employee.permissions }
    })
  }

  const handleUpdateEmployee = async () => {
    try {
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3' || localStorage.getItem('authToken')
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Employee Updated',
          message: 'Employee updated successfully!',
          timestamp: new Date()
        })
        loadEmployees() // Reload the list
        setEditingEmployee(null)
        setFormData({
          email: '',
          password: '',
          name: '',
          role: 'admin',
          permissions: {
            can_view_users: false,
            can_edit_users: false,
            can_view_transactions: false,
            can_edit_transactions: false,
            can_access_llm: false,
            can_manage_system: false,
            can_view_analytics: false,
            can_manage_advertisements: false
          }
        })
      } else {
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: `Error updating employee: ${data.error}`,
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Error updating employee:', error)
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: `Error updating employee: ${error.message}`,
        timestamp: new Date()
      })
    }
  }

  const handleDeleteEmployee = async (employeeId) => {
    if (!confirm('Are you sure you want to delete this employee?')) return
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/employees/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3' || localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Employee Deleted',
          message: 'Employee deleted successfully!',
          timestamp: new Date()
        })
        loadEmployees() // Reload the list
      } else {
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: `Error deleting employee: ${data.error}`,
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: `Error deleting employee: ${error.message}`,
        timestamp: new Date()
      })
    }
  }

  const togglePermission = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }))
  }

  const getPermissionLabel = (permission) => {
    const labels = {
      can_view_users: 'View Users',
      can_edit_users: 'Edit Users',
      can_view_transactions: 'View Transactions',
      can_edit_transactions: 'Edit Transactions',
      can_access_llm: 'Access LLM Center',
      can_manage_system: 'Manage System',
      can_view_analytics: 'View Analytics',
      can_manage_advertisements: 'Manage Advertisements'
    }
    return labels[permission] || permission
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin': return 'bg-red-100 text-red-800 border-red-200'
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'moderator': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getContainerClass = () => {
    if (isLightMode) return 'bg-white/20 backdrop-blur-sm border border-gray-200/50'
    return 'bg-white/10 backdrop-blur-sm border border-white/20'
  }

  const getTextClass = () => {
    if (isLightMode) return 'text-gray-800'
    return 'text-white'
  }

  const getInputClass = () => {
    if (isLightMode) return 'w-full px-3 py-2 border border-gray-300 rounded-lg bg-white/50 text-gray-800 placeholder-gray-500'
    return 'w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/50'
  }

  const getButtonClass = () => {
    if (isLightMode) return 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
    return 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading employees...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${getTextClass()}`}>Employee Management</h2>
          <p className={`text-sm ${getTextClass()} opacity-70`}>
            Manage admin employees and their permissions
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Employees List */}
      <div className={`rounded-lg p-6 ${getContainerClass()}`}>
        <div className="space-y-4">
          {employees.map((employee) => (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${getContainerClass()}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className={`text-lg font-semibold ${getTextClass()}`}>
                      {employee.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getRoleColor(employee.role)}`}>
                      {employee.role}
                    </span>
                  </div>
                  <p className={`text-sm ${getTextClass()} opacity-70`}>
                    {employee.email}
                  </p>
                  <p className={`text-xs ${getTextClass()} opacity-50`}>
                    ID: {employee.id} • Created: {new Date(employee.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowPermissions(prev => ({
                      ...prev,
                      [employee.id]: !prev[employee.id]
                    }))}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="View Permissions"
                  >
                    {showPermissions[employee.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEditEmployee(employee)}
                    className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                    title="Edit Employee"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {employee.role !== 'superadmin' && (
                    <button
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete Employee"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Permissions Display */}
              {showPermissions[employee.id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-white/10"
                >
                  <h4 className={`text-sm font-medium ${getTextClass()} mb-2`}>Permissions:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {employee.permissions ? Object.entries(employee.permissions).map(([permission, value]) => (
                      <div key={permission} className="flex items-center space-x-2">
                        {value ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm ${getTextClass()}`}>
                          {getPermissionLabel(permission)}
                        </span>
                      </div>
                    )) : (
                      <div className={`text-sm ${getTextClass()} opacity-70`}>
                        No permissions defined
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add/Edit Employee Modal */}
      {(showAddForm || editingEmployee) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-6 ${getContainerClass()}`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${getTextClass()}`}>
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setEditingEmployee(null)
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${getTextClass()} mb-2`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={getInputClass()}
                    placeholder="employee@kamioi.com"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${getTextClass()} mb-2`}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className={getInputClass()}
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${getTextClass()} mb-2`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={getInputClass()}
                    placeholder="Employee Name"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${getTextClass()} mb-2`}>
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className={getInputClass()}
                  >
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label className={`block text-sm font-medium ${getTextClass()} mb-3`}>
                  Permissions
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(formData.permissions).map(([permission, value]) => (
                    <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => togglePermission(permission)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300"
                      />
                      <span className={`text-sm ${getTextClass()}`}>
                        {getPermissionLabel(permission)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingEmployee(null)
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
                  className={getButtonClass()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default EmployeeManagement
