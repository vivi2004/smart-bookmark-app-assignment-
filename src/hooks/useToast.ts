"use client"

import { useState, useCallback } from "react"
import { ReactNode } from "react"
import { ToastType } from "@/components/Toast"
import Toast from "@/components/Toast"

interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now().toString()
    const newToast: ToastMessage = { id, message, type }
    
    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const ToastContainer = useCallback((): ReactNode => {
    return (
      <>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </>
    )
  }, [toasts, removeToast])

  return {
    addToast,
    removeToast,
    ToastContainer
  }
}
