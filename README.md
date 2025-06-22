# BuildCraftPro

A SaaS web application for general contractors (carpentry, HVAC, plumbing, electrical) to manage their projects, clients, and invoices.

## 🎨 Brand Identity

BuildCraftPro features a professional construction industry aesthetic with a carefully crafted color palette:

### Color Palette
- **Navy Blueprint** (#15446C) - Primary brand color for headers, navigation, and key UI elements
- **Construction Amber** (#E58C30) - Accent color for call-to-action buttons and interactive highlights
- **Blueprint Off-White** (#F4F5F7) - Light background for optimal readability
- **Builder Green** (#2E7D32) - Success states and positive feedback
- **Jobsite Yellow** (#FFB100) - Warnings and caution indicators
- **Safety Red** (#D32F2F) - Error states and critical alerts

### Logo Implementation
- High-resolution logos optimized for web (90% size reduction via TinyPNG)
- Dual variants: standard logo for light backgrounds, dark-mode variant for navy sidebar
- Responsive sizing across all breakpoints
- Professional branding throughout the application

## Features

- **User Authentication**: Secure JWT-based authentication
- **Client Management**: Store and manage client information
- **Project Management**: Create and track projects with detailed cost breakdowns
- **Subproject Cost Tracking**: Comprehensive cost estimation system with:
  - Materials tracking with autocomplete and real-time calculations
  - Labor cost management with worker roles and hourly rates
  - Permits tracking with dates and expiration management
  - Other costs categorization and tracking
  - Real-time cost summaries and rollups
- **Task Management**: Assign and track tasks within projects
- **Invoice Generation**: Create and manage invoices with tax calculations
- **Dashboard**: Overview of projects, clients, invoices, and revenue metrics
- **Mobile-First Design**: Fully responsive interface for use on job sites
- **Professional Branding**: Construction industry-focused UI with consistent color palette

## Tech Stack

### Backend
- **FastAPI**: Modern, high-performance web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **Pydantic**: Data validation and request/response schemas
- **PostgreSQL**: Production database (SQLite for local development)
- **JWT**: JSON Web Tokens for authentication

### Frontend
- **React**: JavaScript library for building user interfaces
- **TypeScript**: Typed JavaScript for better developer experience
- **TanStack Table**: High-performance table component for complex data display
- **React Hook Form**: Form validation and state management
- **Tailwind CSS**: Utility-first CSS framework with custom BuildCraftPro color palette
- **Vite**: Next-generation frontend build tool
- **React Router**: Declarative routing for React
- **Axios**: HTTP client for API requests

### Design System
- **Custom Color Palette**: Professional construction industry colors
- **CSS Custom Properties**: Theme-ready with CSS variables for future dark mode
- **Component Library**: Consistent button variants and UI elements
- **Responsive Design**: Mobile-first approach with construction site usability

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
git clone https://github.com/yourusername/buildcraftpro.git
cd buildcraftpro
```

2. **Run the automated setup:**
```bash
python3 setup.py
```

3. **Start the backend server:**
```bash
python3 run.py
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
python3 -m venv venv
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
DATABASE_URL=sqlite:///./buildcraftpro.db

# Optional: API URL for frontend (defaults to localhost:8000)
# VITE_API_URL=http://localhost:8000/api
```

**Important**: Always change the `SECRET_KEY` before deploying to production!

## Project Structure

```
buildcraftpro/
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
│   │   ├── main.tsx        # Application entry point
│   │   └── index.css       # BuildCraftPro color palette and CSS variables
│   ├── public/
│   │   └── images/
│   │       └── logos/      # Optimized BuildCraftPro logos and branding guide
│   ├── package.json        # Node.js dependencies
│   ├── tailwind.config.js  # Custom BuildCraftPro color configuration
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
- **Projects**: Construction projects with comprehensive cost tracking
- **Subprojects**: Project subdivisions (e.g., "Kitchen Remodel", "Deck Construction")
- **Material Items**: Detailed materials tracking with quantities, costs, and autocomplete
- **Labor Items**: Worker roles, rates, hours, and calculated costs
- **Permit Items**: Permit costs, dates, and expiration tracking
- **Other Cost Items**: Miscellaneous project expenses
- **Tasks**: Project tasks with time tracking
- **Invoices**: Billing with tax calculations and payment status

## Development Guidelines

This project follows specific coding conventions documented in `.cursor/rules/`:
- **Architecture**: Clear separation between frontend/backend layers
- **Backend Style**: FastAPI with Pydantic validation and SQLAlchemy ORM
- **Frontend Style**: React with TypeScript, Tailwind CSS, and BuildCraftPro design system
- **Authentication**: JWT-based authentication flow
- **Data Modeling**: Consistent database patterns with proper relationships
- **Naming**: Consistent naming conventions across the stack
- **Branding**: Professional construction industry aesthetic with consistent color usage

### Design System Usage

The BuildCraftPro design system includes:

```css
/* Primary Actions */
.btn-primary      /* Navy Blueprint background */
.btn-accent       /* Construction Amber background */
.btn-secondary    /* Neutral gray background */

/* Outline Variants */
.btn-outline-primary  /* Navy Blueprint border */
.btn-outline-accent   /* Construction Amber border */

/* Color Utilities */
.text-primary     /* Navy Blueprint text */
.text-accent      /* Construction Amber text */
.text-success     /* Builder Green text */
.text-warning     /* Jobsite Yellow text */
.text-error       /* Safety Red text */
```

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

### Current Production Setup
- **Frontend**: Deployed on Vercel with automatic deployments from Git
- **Backend**: Deployed on Railway with managed PostgreSQL database
- **Database**: PostgreSQL with automatic backups and connection pooling
- **Environment**: Secrets managed via Railway dashboard, HTTPS enabled

### Local vs Production Architecture
- **Local Development**: SQLite database (automatic, no setup required)
- **Production**: PostgreSQL on Railway (managed hosting, backups, monitoring)
- **Database Switching**: Controlled via `DATABASE_URL` environment variable
- **Deployment**: Git-based with automatic builds and deployments

### Configuration Files
- `railway.toml`: Railway deployment configuration
- `Procfile`: Production server startup command
- `vercel.json`: Frontend deployment and routing configuration

## Roadmap

### Recently Completed
- **Subproject Cost Tracking**: Comprehensive cost estimation system with Materials, Labor, Permits, and Other Costs tables
- **TanStack Table Integration**: High-performance editable tables with inline editing and real-time calculations
- **React Hook Form**: Advanced form validation and state management for complex data entry
- **Real-time Cost Calculations**: Live cost rollups and summaries across all cost categories
- **Material Autocomplete**: Debounced search with reusable material entries for efficiency

### Coming Soon
- **Subproject Management UI**: Modal-based creation and editing of subprojects with status tracking
- **Task Management Kanban View**: Visual task board with drag-and-drop columns (Pending, In Progress, Completed) for enhanced project workflow visualization
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