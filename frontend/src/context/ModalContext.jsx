/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react'
import GlassModal from '../components/common/GlassModal'

const ModalContext = createContext()

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState(null)

  const showModal = (modalConfig) => {
    setModal(modalConfig)
  }

  const hideModal = () => {
    setModal(null)
  }

  const showExportModal = (title, message, onConfirm) => {
    showModal({
      title,
      message,
      type: 'info',
      onConfirm: () => {
        onConfirm()
      },
      confirmText: 'Export',
      showCancel: true,
      cancelText: 'Cancel'
    })
  }

  const showConfirmationModal = (title, message, onConfirm, type = 'warning', confirmText = 'Confirm') => {
    showModal({
      title,
      message,
      type,
      onConfirm: async () => {
        if (onConfirm) {
          await onConfirm()
        }
      },
      confirmText: confirmText,
      showCancel: true,
      cancelText: 'Cancel'
    })
  }

  const showInfoModal = (title, message) => {
    showModal({
      title,
      message,
      type: 'info',
      confirmText: 'OK'
    })
  }

  const showSuccessModal = (title, message) => {
    showModal({
      title,
      message,
      type: 'success',
      confirmText: 'OK'
    })
  }

  const showErrorModal = (title, message) => {
    showModal({
      title,
      message,
      type: 'error',
      confirmText: 'OK'
    })
  }

  const showWarningModal = (title, message) => {
    showModal({
      title,
      message,
      type: 'warning',
      confirmText: 'OK'
    })
  }

  const value = {
    showModal,
    hideModal,
    showExportModal,
    showConfirmationModal,
    showInfoModal,
    showSuccessModal,
    showErrorModal,
    showWarningModal
  }

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modal && (
        <GlassModal
          isOpen={!!modal}
          onClose={hideModal}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onConfirm={modal.onConfirm}
          confirmText={modal.confirmText}
          showCancel={modal.showCancel}
          cancelText={modal.cancelText}
        />
      )}
    </ModalContext.Provider>
  )
}

export default ModalContext
