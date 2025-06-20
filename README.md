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
- **Pydantic**: Data validation and settings management
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

3. **Start the application:**
```bash
python run.py
```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

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

3. **Run the development server:**
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
│   ├── requirements.txt    # Python dependencies
│   └── venv/              # Virtual environment
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
├── README.md              # This file
├── SETUP_GUIDE.md         # Detailed setup instructions
├── run.py                 # Application startup script
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

## Contributing

1. Follow the coding conventions in `.cursor/rules/`
2. Use the provided setup scripts for consistent development environment
3. Test both frontend and backend changes
4. Update documentation when adding new features

## License

This project is licensed under the MIT License - see the LICENSE file for details. 