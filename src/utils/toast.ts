// Simple toast notification utility
type ToastType = 'success' | 'error' | 'info'

export function showToast(message: string, type: ToastType = 'info') {
  // Create toast element
  const toast = document.createElement('div')
  toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-slide-in-right transition-all duration-300 ${
    type === 'success' ? 'bg-green-600' :
    type === 'error' ? 'bg-red-600' :
    'bg-blue-600'
  }`
  toast.textContent = message

  document.body.appendChild(toast)

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}

