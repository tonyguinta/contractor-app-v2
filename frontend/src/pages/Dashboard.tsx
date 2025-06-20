import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Folder, FileText, DollarSign } from 'lucide-react'
import { clientsApi, projectsApi, invoicesApi } from '../api/client'

const Dashboard = () => {
  const [stats, setStats] = useState({
    clients: 0,
    projects: 0,
    invoices: 0,
    revenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientsRes, projectsRes, invoicesRes] = await Promise.all([
          clientsApi.getAll(),
          projectsApi.getAll(),
          invoicesApi.getAll()
        ])

        const revenue = invoicesRes.data
          .filter((invoice: any) => invoice.status === 'paid')
          .reduce((sum: number, invoice: any) => sum + invoice.total_amount, 0)

        setStats({
          clients: clientsRes.data.length,
          projects: projectsRes.data.length,
          invoices: invoicesRes.data.length,
          revenue
        })
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      name: 'Total Clients',
      value: stats.clients,
      icon: Users,
      link: '/clients',
      color: 'bg-blue-500'
    },
    {
      name: 'Active Projects',
      value: stats.projects,
      icon: Folder,
      link: '/projects',
      color: 'bg-green-500'
    },
    {
      name: 'Total Invoices',
      value: stats.invoices,
      icon: FileText,
      link: '/invoices',
      color: 'bg-yellow-500'
    },
    {
      name: 'Total Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      link: '/invoices',
      color: 'bg-purple-500'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back! Here's an overview of your business.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.name}
              to={card.link}
              className="card hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/clients" className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900">Add New Client</span>
              </div>
            </Link>
            <Link to="/projects" className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <div className="flex items-center">
                <Folder className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900">Create Project</span>
              </div>
            </Link>
            <Link to="/invoices" className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900">Generate Invoice</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-sm text-gray-600">
            <p>No recent activity to display.</p>
            <p className="mt-2">Start by adding clients and creating projects!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 