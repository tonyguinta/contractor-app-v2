# BuildCraftPro - Setup Guide

A comprehensive SaaS web application for general contractors to manage their projects, clients, and invoices.

## 🎨 Professional Branding
BuildCraftPro features a construction industry-focused design with:
- **Navy Blueprint** and **Construction Amber** color palette
- Optimized high-resolution logos for all screen sizes
- Professional UI designed for construction site usability

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher (for frontend)
- Git (optional)

### Automated Setup
Run the setup script to automatically configure everything:

```bash
python3 setup.py
```

This will:
- Create a Python virtual environment
- Install all backend dependencies
- Install frontend dependencies (if Node.js is available)
- Create necessary configuration files

## 🏗️ Manual Setup

### Backend Setup

1. **Create virtual environment:**
   ```bash
   cd backend
   python3 -m venv venv
   ```

2. **Activate virtual environment:**
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create environment file:**
   Create a `.env` file in the `backend` directory:
   ```
   SECRET_KEY=your-secret-key-change-in-production
   DATABASE_URL=sqlite:///./buildcraftpro.db
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## 🚀 Running the Application

### Method 1: Using the run script
```bash
python3 run.py
```

### Method 2: Manual startup

1. **Start the backend server:**
   ```bash
   cd backend
   # Activate virtual environment first
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

### Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

## 📱 Features

### ✅ Implemented (MVP)
- **User Authentication**: Secure registration and login
- **Client Management**: Add, view, and manage client information
- **Project Management**: Create and track construction projects
- **Invoice Management**: Generate and manage invoices
- **Dashboard**: Overview of business metrics and quick actions
- **Responsive Design**: Mobile-first interface for job site use

### 🔄 Core Functionality
- JWT-based authentication
- SQLite database (easily upgradeable to PostgreSQL)
- RESTful API with FastAPI
- Modern React frontend with TypeScript
- Tailwind CSS for styling
- Form validation and error handling

## 🏗️ Architecture

### Backend (FastAPI)
```
backend/
├── app/
│   ├── api/            # API endpoints
│   │   ├── auth.py     # Authentication routes
│   │   ├── clients.py  # Client management
│   │   ├── projects.py # Project management
│   │   └── invoices.py # Invoice management
│   ├── core/           # Core configuration
│   │   ├── security.py # Password hashing, JWT
│   │   └── deps.py     # Dependencies
│   ├── db/             # Database setup
│   │   └── database.py # SQLAlchemy configuration
│   ├── models/         # SQLAlchemy models
│   │   └── models.py   # Database models
│   ├── schemas/        # Pydantic schemas
│   │   └── schemas.py  # Request/response models
│   └── main.py         # Application entry point
└── requirements.txt    # Python dependencies
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── api/            # API client
│   │   └── client.ts   # Axios configuration
│   ├── components/     # React components
│   │   ├── Layout.tsx  # Main layout
│   │   └── LoadingSpinner.tsx
│   ├── context/        # React context
│   │   └── AuthContext.tsx # Authentication state
│   ├── pages/          # Page components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Clients.tsx
│   │   ├── Projects.tsx
│   │   └── Invoices.tsx
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Tailwind styles
├── package.json        # Node dependencies
└── vite.config.ts      # Vite configuration
```

## 🔧 Development

### Backend Development
- Uses FastAPI with automatic API documentation
- SQLAlchemy ORM for database operations
- Pydantic for data validation
- JWT for authentication
- CORS enabled for frontend communication

### Frontend Development
- React with TypeScript for type safety
- Tailwind CSS for styling
- React Hook Form for form handling
- React Router for navigation
- Axios for API communication
- React Hot Toast for notifications

## 📊 Database Schema

### Users
- User authentication and profile information
- Company details for contractors

### Clients
- Client contact information
- Company associations
- Project relationships

### Projects
- Project details and status tracking
- Cost estimation (labor, materials, permits)
- Client associations
- Task management capability

### Invoices
- Invoice generation and tracking
- Payment status management
- Client and project associations
- Tax calculations

## 🚀 Next Steps

### Immediate Enhancements
1. **Add CRUD Forms**: Complete forms for adding/editing clients, projects, and invoices
2. **Task Management**: Full task creation and tracking within projects
3. **File Uploads**: Document and image attachments
4. **Email Integration**: Send invoices via email
5. **Reporting**: Generate PDF invoices and reports

### Advanced Features
1. **Calendar Integration**: Schedule project milestones
2. **Time Tracking**: Log hours worked on projects
3. **Expense Tracking**: Track project-related expenses
4. **Mobile App**: Native mobile application
5. **Multi-user Support**: Team collaboration features

## 🔒 Security Notes

- Change the `SECRET_KEY` in production
- Use environment variables for sensitive configuration
- Consider using PostgreSQL for production
- Implement rate limiting for API endpoints
- Add input sanitization for user data

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use:**
   - Backend: Change port in uvicorn command
   - Frontend: Vite will automatically suggest alternative ports

2. **Module not found errors:**
   - Ensure virtual environment is activated
   - Check if all dependencies are installed

3. **Database issues:**
   - Delete `buildcraftpro.db` to reset database
   - Check file permissions in project directory

4. **CORS errors:**
   - Verify frontend is running on http://localhost:3000
   - Check CORS configuration in `backend/app/main.py`

## 📞 Support

This is a development version. For production deployment:
- Use a production WSGI server (Gunicorn)
- Set up a reverse proxy (Nginx)
- Use a production database (PostgreSQL)
- Implement proper logging and monitoring
- Set up SSL/TLS certificates

## 📄 License

MIT License - See LICENSE file for details. 