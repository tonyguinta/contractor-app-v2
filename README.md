# Contractor App

A SaaS web application for general contractors (carpentry, HVAC, plumbing, electrical) to manage their projects, clients, and invoices.

## Features

- **User Authentication**: Secure JWT-based authentication
- **Client Management**: Store and manage client information
- **Project Management**: Create and track projects with detailed cost breakdowns
- **Task Management**: Assign and track tasks within projects
- **Invoice Generation**: Create and manage invoices with tax calculations
- **Dashboard**: Overview of projects, clients, invoices, and revenue metrics
- **Mobile-First Design**: Fully responsive interface for use on job sites

## Tech Stack

### Backend
- **FastAPI**: Modern, high-performance web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **Pydantic**: Data validation and request/response schemas
- **SQLite**: Database (easily upgradeable to PostgreSQL)
- **JWT**: JSON Web Tokens for authentication

### Frontend
- **React**: JavaScript library for building user interfaces
- **TypeScript**: Typed JavaScript for better developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Next-generation frontend build tool
- **React Router**: Declarative routing for React
- **Axios**: HTTP client for API requests

### Development Tools
- **Python Virtual Environment**: Isolated Python environment
- **ESLint & Prettier**: Code formatting and linting
- **Hot Reload**: Development servers with auto-refresh

## Getting Started

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- Git (optional)

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/contractor-app.git
cd contractor-app
```

2. **Run the automated setup:**
```bash
python setup.py
```

3. **Start the backend server:**
```bash
python run.py
```
*Note: `run.py` starts the FastAPI backend server with hot reload on port 8000*

4. **In a new terminal, start the frontend:**
```bash
cd frontend
npm run dev
```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

For detailed instructions and troubleshooting, see [SETUP_GUIDE.md](SETUP_GUIDE.md)

### Manual Setup

#### Backend

1. **Create and activate virtual environment:**
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Create environment file:**
Copy `env.example` to `backend/.env` and update the values (see Environment Variables section below)

4. **Run the development server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

## Environment Variables

Copy the `env.example` file to `backend/.env` and update the values for your environment. The file contains the following variables:

```env
# Required: Change this secret key for production!
SECRET_KEY=your-secret-key-change-in-production

# Database URL (SQLite for development, PostgreSQL for production)
DATABASE_URL=sqlite:///./contractor_app.db

# Optional: API URL for frontend (defaults to localhost:8000)
# VITE_API_URL=http://localhost:8000/api
```

**Important**: Always change the `SECRET_KEY` before deploying to production!

## Project Structure

```
contractor-app/
├── backend/
│   ├── app/
│   │   ├── api/            # API endpoints (auth, clients, projects, invoices)
│   │   ├── core/           # Security, dependencies, configuration
│   │   ├── db/             # Database setup and connection
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   └── main.py         # FastAPI application entry point
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/            # API client configuration
│   │   ├── components/     # Reusable React components
│   │   ├── context/        # React context providers (Auth)
│   │   ├── pages/          # Page components (Dashboard, Clients, etc.)
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   ├── package.json        # Node.js dependencies
│   └── vite.config.ts      # Vite configuration
├── .cursor/               # Cursor IDE rules and conventions
├── env.example            # Environment variables template
├── README.md              # This file
├── SETUP_GUIDE.md         # Detailed setup instructions
├── run.py                 # Backend server startup script
└── setup.py               # Automated setup script
```

## Database Schema

The application uses the following main entities:

- **Users**: Contractor authentication and profile
- **Clients**: Customer information and contact details
- **Projects**: Construction projects with cost tracking
- **Tasks**: Project tasks with time tracking
- **Invoices**: Billing with tax calculations and payment status

## Development Guidelines

This project follows specific coding conventions documented in `.cursor/rules/`:
- **Architecture**: Clear separation between frontend/backend layers
- **Backend Style**: FastAPI with Pydantic validation and SQLAlchemy ORM
- **Frontend Style**: React with TypeScript and Tailwind CSS
- **Authentication**: JWT-based authentication flow
- **Data Modeling**: Consistent database patterns with proper relationships
- **Naming**: Consistent naming conventions across the stack

## API Documentation

When running the backend server, visit http://localhost:8000/docs for interactive API documentation powered by FastAPI's automatic OpenAPI generation.

### API Authentication

The API uses JWT Bearer token authentication. To authenticate:

1. **Register/Login**: Use `/api/auth/register` or `/api/auth/login` endpoints
2. **Get Token**: The login response includes an `access_token`
3. **Use Token**: Include in requests as `Authorization: Bearer <your-token>`

Example:
```bash
curl -H "Authorization: Bearer <your-token>" http://localhost:8000/api/clients
```

## Deployment

For production deployment, consider these upgrades:

### Database
- **PostgreSQL**: Replace SQLite with PostgreSQL for better performance and concurrent access
- **Connection Pooling**: Configure SQLAlchemy connection pooling for production load

### Hosting Options
- **Fly.io**: Modern platform with automatic scaling
- **Render**: Simple deployment with managed PostgreSQL
- **Railway**: Git-based deployment with database add-ons
- **Docker**: Containerized deployment on any VPS or cloud provider

### Environment
- **Environment Variables**: Use proper secrets management
- **HTTPS**: Enable SSL/TLS certificates
- **CORS**: Configure appropriate CORS settings for your domain

## Roadmap

### Coming Soon
- **Scheduling & Calendar**: Project timeline management and milestone tracking
- **Change Orders**: Handle project scope changes and additional work requests
- **Subcontractor Management**: Manage subcontractor relationships and payments
- **Mobile PWA**: Progressive Web App for better mobile experience
- **Document Storage**: File uploads and document management for projects
- **Email Integration**: Automated invoice delivery and project notifications
- **Advanced Reporting**: Profit/loss reports, project analytics, and business insights
- **Time Tracking**: Detailed time logging for labor cost accuracy
- **Expense Tracking**: Track and categorize project-related expenses
- **Multi-user Teams**: Collaborate with team members and assign roles

### Future Enhancements
- **Integration APIs**: Connect with accounting software (QuickBooks, Xero)
- **Payment Processing**: Online payment acceptance for invoices
- **Inventory Management**: Track materials and equipment
- **Customer Portal**: Client access to project updates and invoices
- **Mobile Apps**: Native iOS and Android applications

## Contributing

1. Follow the coding conventions in `.cursor/rules/`
2. Use the provided setup scripts for consistent development environment
3. Test both frontend and backend changes
4. Update documentation when adding new features

## License

This project is licensed under the MIT License - see the LICENSE file for details. 