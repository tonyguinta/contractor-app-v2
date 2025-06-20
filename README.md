# Contractor App

A SaaS web application for general contractors (carpentry, HVAC, plumbing, electrical) to manage their projects, clients, and invoices.

## Features

- **User Authentication**: Secure JWT-based authentication
- **Client Management**: Store and manage client information
- **Project Management**: Create and track projects with detailed information
- **Cost Estimation**: Break down project costs by labor, materials, permits, and more
- **Task Assignment**: Assign and track tasks for each project
- **Invoice Generation**: Create and manage invoices for clients
- **Dashboard**: Overview of projects, tasks, and financial metrics
- **Mobile-First Design**: Fully responsive interface for use on job sites

## Tech Stack

### Backend
- **FastAPI**: Modern, high-performance web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **Pydantic**: Data validation and settings management
- **PostgreSQL**: Relational database
- **JWT**: JSON Web Tokens for authentication

### Frontend
- **React**: JavaScript library for building user interfaces
- **TypeScript**: Typed JavaScript for better developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Next-generation frontend build tool
- **React Router**: Declarative routing for React
- **Axios**: HTTP client for API requests

### DevOps
- **Docker**: Containerization for consistent environments
- **Docker Compose**: Multi-container Docker applications
- **Nginx**: Web server for the frontend
- **Vercel**: Frontend hosting (planned)
- **Render**: Backend hosting (planned)

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Python (for local development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/contractor-app.git
cd contractor-app
```

2. Start the application with Docker Compose:
```bash
docker-compose up -d
```

3. Access the application:
   - Frontend: http://localhost:3000
   - API: http://localhost:8000/docs

### Local Development

#### Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the development server:
```bash
uvicorn app.main:app --reload
```

#### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

## Project Structure

```
contractor-app/
├── backend/
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core configuration
│   │   ├── db/             # Database setup
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── main.py         # Application entry point
│   ├── tests/              # Backend tests
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── api/            # API clients
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── package.json        # Node.js dependencies
└── docker-compose.yml      # Docker Compose configuration
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 