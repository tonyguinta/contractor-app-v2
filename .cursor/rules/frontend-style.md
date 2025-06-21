# Frontend Code Style

## Core Principles

- Use **React with TypeScript** for all components
- Use **Tailwind CSS** with **BuildCraftPro color palette** for styling (no custom CSS files)
- Keep all components **functional and stateless** unless state is needed
- Use **custom hooks** for shared logic (API calls, local state)
- Use `axios` in `src/api` and never directly inside pages/components
- Keep forms in pages; decompose layout/UI into reusable components
- Follow **BuildCraftPro design system** for consistent branding

## BuildCraftPro Design System

### Color Palette
Use the BuildCraftPro color palette for consistent branding:

```css
/* Primary Brand Colors */
.text-primary     /* Navy Blueprint (#15446C) */
.bg-primary       /* Navy Blueprint background */
.text-accent      /* Construction Amber (#E58C30) */
.bg-accent        /* Construction Amber background */

/* Status Colors */
.text-success     /* Builder Green (#2E7D32) */
.text-warning     /* Jobsite Yellow (#FFB100) */
.text-error       /* Safety Red (#D32F2F) */

/* Background Colors */
.bg-background-light  /* Blueprint Off-White (#F4F5F7) */
```

### Button System
Use consistent button classes for all interactive elements:

```tsx
// Primary actions (Navy Blueprint)
<button className="btn-primary">Save Changes</button>

// Call-to-action (Construction Amber)
<button className="btn-accent">Create Project</button>

// Secondary actions
<button className="btn-secondary">Cancel</button>

// Outline variants
<button className="btn-outline-primary">View Details</button>
<button className="btn-outline-accent">Learn More</button>
```

### Logo Usage
Follow proper logo implementation:

```tsx
// Light backgrounds (login, register, main content)
<img src="/images/logos/logo.png" alt="BuildCraftPro" className="h-20 w-auto" />

// Dark backgrounds (navy sidebar)
<img src="/images/logos/logo-dark-mode.png" alt="BuildCraftPro" className="h-36 w-auto" />
```

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
      {/* Use BuildCraftPro design system classes */}
      <h1 className="text-3xl font-bold text-primary-600">Page Title</h1>
      <button className="btn-accent">Call to Action</button>
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

- Use BuildCraftPro Tailwind color palette exclusively
- Follow mobile-first responsive design
- Use consistent spacing scale (space-y-4, space-y-6, etc.)
- Use semantic color classes from BuildCraftPro palette
- Apply consistent card styling with `card` class

```tsx
// Good: Using BuildCraftPro design system
<div className="card">
  <h2 className="text-lg font-semibold text-primary-600 mb-4">Client Details</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <button className="btn-accent">Add New Client</button>
    <button className="btn-outline-primary">View All</button>
  </div>
</div>

// Bad: Generic colors or custom CSS
<div style={{ padding: '16px', backgroundColor: '#blue' }}>
  <button className="bg-blue-500">Generic Button</button>
</div>
```

## Error Handling & Status Messages

Use BuildCraftPro status colors for consistent feedback:

```tsx
// Success messages
<p className="text-success">Client created successfully!</p>

// Warning messages  
<p className="text-warning">Please review the project details.</p>

// Error messages
<p className="text-error">Failed to save changes.</p>
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
- Apply BuildCraftPro styling to navigation elements

```tsx
import { Link } from 'react-router-dom'

// Good: Using Link component with BuildCraftPro styling
<Link to="/clients" className="btn-accent">
  View Clients
</Link>
```

## Form Handling

- Keep forms simple with controlled components
- Implement proper validation and error handling
- Use BuildCraftPro color system for form styling

```tsx
const [formData, setFormData] = useState({
  name: '',
  email: ''
})

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    await clientsApi.create(formData)
    toast.success('Client created successfully!') // Success feedback
  } catch (error) {
    toast.error('Failed to create client') // Error feedback
  }
}

// Form with BuildCraftPro styling
<form onSubmit={handleSubmit} className="space-y-4">
  <input className="input-field" placeholder="Client name" />
  <button type="submit" className="btn-accent">Create Client</button>
</form>
```

## What to Avoid

- Class-based components (use functional components)
- CSS-in-JS libraries (stick with Tailwind + BuildCraftPro palette)
- Generic color classes (use BuildCraftPro semantic colors)
- Complex state management libraries (Redux, Zustand)
- Direct API calls in components (use api/client.ts)
- Custom CSS files (use BuildCraftPro design system)
- Inconsistent button styling (use btn-primary, btn-accent, etc.)
- Custom CSS files (use Tailwind utilities)