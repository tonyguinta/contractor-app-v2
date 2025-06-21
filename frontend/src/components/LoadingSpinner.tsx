interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  withLogo?: boolean
  fullScreen?: boolean
}

const LoadingSpinner = ({ size = 'md', withLogo = false, fullScreen = true }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const logoSizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto'
  }

  const containerClass = fullScreen 
    ? "min-h-screen flex items-center justify-center bg-background-light"
    : "flex items-center justify-center p-4"

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center space-y-4">
        {withLogo && (
          <img 
            src="/images/logos/logo-dark-mode.png" 
            alt="BuildCraftPro" 
            className={`${logoSizeClasses[size]} animate-pulse`}
          />
        )}
        <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-accent-500 ${sizeClasses[size]}`}></div>
        {withLogo && (
          <p className="text-sm text-gray-600 animate-pulse">Loading...</p>
        )}
      </div>
    </div>
  )
}

export default LoadingSpinner 