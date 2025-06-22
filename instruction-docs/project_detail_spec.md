## Contractor App – Project Detail Screen Specification (Updated)

### 🎯 Objective

We are improving the Project detail screen in a contractor-focused app to support estimation of costs for subprojects. We want to allow users to manage materials, labor, permits, and other costs within each project. Each section should be displayed using TanStack Table with inline editing and real-time cost calculations.

---

### 🧱 Feature Breakdown

#### 1. Subprojects

Each project can contain multiple subprojects (e.g., "Deck", "Kitchen Remodel").

Each subproject should include:

- `title` (string)
- `description` (text, optional)
- `start_date` (date, optional)
- `end_date` (date, optional)
- `status` (Planning, In Progress, Complete)

UI Requirements:

- Users can add/edit/delete subprojects within the project detail page
- Expandable card layout for each subproject's nested cost tables
- Modal-based creation and editing of subprojects

---

#### 2. Materials Table (per subproject)

Editable TanStack Table section with React Hook Form validation. Each row contains:

- `description` (text with debounced autocomplete from previous user entries)
- `unit` (dropdown: ["each", "lf", "sf", "bag", etc.])
- `quantity` (number)
- `unit_cost` (currency/number)
- `total_cost` (auto-calculated, read-only)
- `category` (optional dropdown or free text)

Behavior:

- As user types in `description`, debounced autocomplete from past user-entered materials
- Selecting a suggestion will auto-fill `unit`, `unit_cost`, and `category`
- On save, new materials should be stored in a global `MaterialEntry` table for future reuse
- Real-time cost calculations with debounced API persistence
- Toast notifications for successful operations and error handling

---

#### 3. Labor Table (per subproject)

Editable TanStack Table section with React Hook Form validation. Each row contains:

- `role` (text)
- `number_of_workers` (integer)
- `hourly_rate` (currency)
- `hours` (number)
- `total_cost` (calculated: number_of_workers × hourly_rate × hours)

---

#### 4. Permits Table (per subproject)

Editable TanStack Table section with React Hook Form validation. Each row contains:

- `description` (text)
- `cost` (currency)
- `issued_date` (date)
- `expiration_date` (date, optional)
- `notes` (text, optional)

---

#### 5. Other Costs Table (per subproject)

Editable TanStack Table section with React Hook Form validation. Each row contains:

- `description` (text)
- `cost` (currency)
- `notes` (optional text)

---

#### 6. Cost Summary

Auto-calculated rollup of totals for each subproject with real-time updates:

- Total Materials
- Total Labor
- Total Permits
- Total Other
- **Estimated Total Cost**

Totals should be updated in real time as table data changes using React state management and useEffect hooks.

---

### 🗃️ Backend Schema Requirements

```python
# SQLAlchemy Models (implemented)

class MaterialEntry(Base):
    __tablename__ = "material_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    description = Column(String, nullable=False)
    unit = Column(String, nullable=False)
    category = Column(String, nullable=True)
    unit_price = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Subproject(Base):
    __tablename__ = "subprojects"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(String, default="planning")
    created_at = Column(DateTime, default=datetime.utcnow)

class MaterialItem(Base):
    __tablename__ = "material_items"
    
    id = Column(Integer, primary_key=True, index=True)
    subproject_id = Column(Integer, ForeignKey("subprojects.id"), nullable=False)
    description = Column(String, nullable=False)
    unit = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit_cost = Column(Float, nullable=False)
    category = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class LaborItem(Base):
    __tablename__ = "labor_items"
    
    id = Column(Integer, primary_key=True, index=True)
    subproject_id = Column(Integer, ForeignKey("subprojects.id"), nullable=False)
    role = Column(String, nullable=False)
    number_of_workers = Column(Integer, nullable=False)
    hourly_rate = Column(Float, nullable=False)
    hours = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class PermitItem(Base):
    __tablename__ = "permit_items"
    
    id = Column(Integer, primary_key=True, index=True)
    subproject_id = Column(Integer, ForeignKey("subprojects.id"), nullable=False)
    description = Column(String, nullable=False)
    cost = Column(Float, nullable=False)
    issued_date = Column(Date, nullable=True)
    expiration_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)

class OtherCostItem(Base):
    __tablename__ = "other_cost_items"
    
    id = Column(Integer, primary_key=True, index=True)
    subproject_id = Column(Integer, ForeignKey("subprojects.id"), nullable=False)
    description = Column(String, nullable=False)
    cost = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
```

---

### 🔗 Routing/UI Structure

- Route: `/projects/:projectId` (implemented)
- Full-page layout replacing modal approach
- Tabbed interface:
  - **Overview**: Project metadata and cost rollup summary
  - **Subprojects**: Expandable cards for each subproject containing:
    - Materials table (TanStack Table + React Hook Form)
    - Labor table (placeholder - to be implemented)
    - Permits table (placeholder - to be implemented)  
    - Other Costs table (placeholder - to be implemented)

---

### 🛠️ Technical Implementation Decisions

#### Frontend Architecture:
- **TanStack Table** instead of AG Grid for better performance and lighter bundle
- **React Hook Form** for validation and form state management
- **Debounced calculations** for real-time cost updates without excessive API calls
- **Toast notifications** using `react-hot-toast` for user feedback
- **TypeScript** with comprehensive type definitions

#### Backend Architecture:
- **FastAPI** with SQLAlchemy ORM
- **PostgreSQL** database with proper foreign key relationships
- **Cascade deletes** for data integrity
- **Full-text search** for material autocomplete optimization
- **User ownership validation** on all endpoints

#### Performance Optimizations:
- Debounced autocomplete search (300ms delay)
- Real-time frontend calculations with periodic backend persistence
- Efficient table rendering with TanStack Table's virtualization capabilities
- Optimized API responses with selective data loading

---

### ✅ Implementation Status

#### ✅ Completed:
- Complete backend API with all models and CRUD endpoints
- Database migration with new tables and relationships
- Frontend routing and navigation updates
- ProjectDetail page with tabbed interface
- MaterialsTable component with full functionality:
  - Inline editing with validation
  - Debounced autocomplete
  - Real-time cost calculations
  - CRUD operations with error handling
- Toast notification system
- TypeScript type definitions

#### 🚧 In Progress:
- Subproject creation/editing modal
- Labor, Permits, and Other Costs table components
- Cost summary aggregation across all subprojects

#### 📋 Future Enhancements:
- Keyboard navigation and accessibility improvements
- Bulk import/export functionality
- Advanced filtering and sorting
- Cost history tracking
- Budget vs. actual reporting

---

### 🔧 API Endpoints (Implemented)

```
GET    /api/subprojects/project/{project_id}     # Get all subprojects for a project
POST   /api/subprojects/                         # Create new subproject
PUT    /api/subprojects/{subproject_id}          # Update subproject
DELETE /api/subprojects/{subproject_id}          # Delete subproject

GET    /api/subprojects/materials/search         # Autocomplete material search
POST   /api/subprojects/{subproject_id}/materials/    # Create material item
PUT    /api/subprojects/materials/{item_id}           # Update material item
DELETE /api/subprojects/materials/{item_id}           # Delete material item

# Similar patterns for labor, permits, and other_costs endpoints
GET    /api/subprojects/{subproject_id}/cost-summary  # Get calculated totals
```

---

### 🎨 UI/UX Guidelines

- Maintain BuildCraftPro design system consistency
- Use Tailwind CSS for styling
- Implement loading states and skeleton screens
- Provide clear visual feedback for all user actions
- Ensure responsive design for tablet and desktop use
- Follow accessibility best practices (WCAG 2.1 AA)

---

### 🧪 Testing Strategy

- Unit tests for calculation logic
- Integration tests for API endpoints
- E2E tests for critical user workflows
- Performance testing for large datasets
- Cross-browser compatibility testing

This specification reflects our implemented architecture and serves as the foundation for completing the remaining table components and subproject management features.

