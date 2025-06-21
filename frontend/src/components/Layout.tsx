import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Home, 
  Users, 
  Folder, 
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const Layout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Projects', href: '/projects', icon: Folder },
    { name: 'Invoices', href: '/invoices', icon: FileText },
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full nav-primary">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} isActive={isActive} user={user} logout={logout} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 nav-primary border-r border-primary-700">
          <SidebarContent navigation={navigation} isActive={isActive} user={user} logout={logout} />
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-background-light">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

const SidebarContent = ({ navigation, isActive, user, logout }: any) => {
  return (
    <>
      <div className="flex items-center h-24 flex-shrink-0 px-4 py-4 bg-primary-600">
        <Link to="/" className="flex items-center">
          <img 
            src="/images/logos/logo-dark-mode.png" 
            alt="BuildCraftPro" 
            className="h-36 w-auto hover:opacity-90 transition-opacity"
          />
        </Link>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item: any) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  isActive(item.href)
                    ? 'bg-accent-500 text-white shadow-sm'
                    : 'text-gray-200 hover:bg-primary-700 hover:text-white'
                } group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200`}
              >
                <Icon className={`mr-3 h-5 w-5 ${
                  isActive(item.href) ? 'text-white' : 'text-gray-300'
                }`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="flex-shrink-0 flex border-t border-primary-700 p-4">
          <div className="flex items-center w-full">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-accent-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">{user?.full_name}</p>
              <button
                onClick={logout}
                className="flex items-center text-xs text-gray-300 hover:text-white transition-colors duration-200"
              >
                <LogOut className="mr-1 h-3 w-3" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Layout 