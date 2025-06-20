# Frontend Code Style

## Core Principles

- Use **React with TypeScript** for all components
- Use **Tailwind CSS** for styling (no custom CSS files)
- Keep all components **functional and stateless** unless state is needed
- Use **custom hooks** for shared logic (API calls, local state)
- Use `axios` in `src/api` and never directly inside pages/components
- Keep forms in pages; decompose layout/UI into reusable components

## Component Structure

```tsx
import { useState, useEffect } from 'react'
import { LoadingSpinner } from '../components/LoadingSpinner'

interface Props {
  // Define props with TypeScript interfaces
}

const ComponentName = ({ prop1, prop2 }: Props) => {
  const [loading, setLoading] = useState(false)
  
  // Component logic here
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  return (
    <div className="space-y-6">
      {/* Use Tailwind classes for styling */}
    </div>
  )
}

export default ComponentName
```

## API Integration Pattern

- All API calls go through `src/api/client.ts`
- Use axios interceptors for authentication
- Handle loading and error states consistently

```tsx
// In src/api/client.ts
export const clientsApi = {
  getAll: () => api.get('/clients/'),
  create: (data: ClientCreate) => api.post('/clients/', data),
  update: (id: number, data: ClientUpdate) => api.put(`/clients/${id}`, data),
  delete: (id: number) => api.delete(`/clients/${id}`)
}

// In components
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await clientsApi.getAll()
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  fetchData()
}, [])
```

## Styling Guidelines

- Use Tailwind utility classes exclusively
- Follow mobile-first responsive design
- Use consistent spacing scale (space-y-4, space-y-6, etc.)
- Use semantic color classes (text-gray-900, bg-primary-600)
- Apply consistent card styling with `card` class

```tsx
// Good: Using Tailwind classes
<div className="card">
  <h2 className="text-lg font-medium text-gray-900 mb-4">Title</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Content */}
  </div>
</div>

// Bad: Custom CSS or inline styles
<div style={{ padding: '16px' }}>
```

## State Management

- Use React's built-in state (useState, useContext)
- Use AuthContext for authentication state
- Keep component state local when possible
- Use custom hooks for complex state logic

```tsx
// Custom hook example
const useClients = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  
  const fetchClients = async () => {
    // API logic here
  }
  
  return { clients, loading, fetchClients }
}
```

## Navigation and Routing

- Use React Router for navigation
- Use Link components instead of anchor tags
- Implement proper route protection with AuthContext

```tsx
import { Link } from 'react-router-dom'

// Good: Using Link component
<Link to="/clients" className="btn btn-primary">
  View Clients
</Link>
```

## Form Handling

- Keep forms simple with controlled components
- Implement proper validation and error handling
- Use consistent form styling with Tailwind

```tsx
const [formData, setFormData] = useState({
  name: '',
  email: ''
})

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    await clientsApi.create(formData)
    // Handle success
  } catch (error) {
    // Handle error
  }
}
```

## What to Avoid

- Class-based components (use functional components)
- CSS-in-JS libraries (stick with Tailwind)
- Complex state management libraries (Redux, Zustand)
- Direct API calls in components (use api/client.ts)
- Custom CSS files (use Tailwind utilities)