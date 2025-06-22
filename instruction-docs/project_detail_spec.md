## Contractor App – Project Detail Screen Specification (Claude-Friendly)

### 🎯 Objective

We are improving the Project detail screen in a contractor-focused app to support estimation of costs for subprojects. We want to allow users to manage materials, labor, permits, and other costs within each project. Each section should be displayed using AG Grid tables with inline editing and cost calculations.

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
- Accordion or tab layout for each subproject's nested details

---

#### 2. Materials Table (per subproject)

Editable AG Grid section. Each row contains:

- `description` (text with autocomplete from previous user entries)
- `unit` (dropdown: ["each", "lf", "sf", "bag", etc.])
- `quantity` (number)
- `unit_cost` (currency/number)
- `total_cost` (auto-calculated)
- `category` (optional dropdown or free text)

Behavior:

- As user types in `description`, autocomplete from past user-entered materials
- Selecting a suggestion will auto-fill `unit`, `unit_cost`, and `category`
- On save, new materials should be stored in a global `MaterialEntry` table for future reuse

---

#### 3. Labor Table (per subproject)

Editable AG Grid section. Each row contains:

- `role` (text)
- `number_of_workers` (integer)
- `hourly_rate` (currency)
- `hours` (number)
- `total_cost` (calculated)

---

#### 4. Permits Table (per subproject)

Editable AG Grid section. Each row contains:

- `description` (text)
- `cost` (currency)
- `issued_date` (date)
- `expiration_date` (date, optional)
- `notes` (text, optional)

---

#### 5. Other Costs Table (per subproject)

Editable AG Grid section. Each row contains:

- `description` (text)
- `cost` (currency)
- `notes` (optional text)

---

#### 6. Cost Summary

Auto-calculated rollup of totals for each subproject:

- Total Materials
- Total Labor
- Total Permits
- Total Other
- Estimated Total Cost

Totals should be updated in real time as AG Grid data changes.

---

### 🗃️ Backend Schema Requirements

```ts
MaterialEntry {
  id: uuid
  user_id: uuid
  description: string
  unit: string
  category: string | null
  unit_price: number | null
  created_at: datetime
}

MaterialItem {
  id: uuid
  subproject_id: uuid
  description: string
  unit: string
  quantity: number
  unit_cost: number
  category: string | null
  created_at: datetime
}

LaborItem {
  id: uuid
  subproject_id: uuid
  role: string
  number_of_workers: integer
  hourly_rate: number
  hours: number
  created_at: datetime
}

PermitItem {
  id: uuid
  subproject_id: uuid
  description: string
  cost: number
  issued_date: date
  expiration_date: date | null
  notes: string | null
}

OtherCostItem {
  id: uuid
  subproject_id: uuid
  description: string
  cost: number
  notes: string | null
}

Subproject {
  id: uuid
  project_id: uuid
  title: string
  description: string | null
  start_date: date | null
  end_date: date | null
  status: string
  created_at: datetime
}
```

---

### 🔗 Routing/UI Structure

- Route: `/projects/:projectId`
- Replace modal with full-page layout
- Vertical tabs or accordions:
  - Overview (project meta, cost rollup)
  - Subprojects
    - For each subproject: show Material, Labor, Permits, Other tabs

---

### 🤖 AI Prompt Guidance (Optional)

> "Generate a list of common construction materials used in decks, kitchens, and bathrooms with default unit types and estimated prices per unit. Format as JSON with fields: description, unit, default\_price, category."

---

### ✅ Execution Instruction

Please generate updated backend models, API endpoints, and React frontend using AG Grid to support the above features. Use FastAPI (backend) and React + TypeScript + Tailwind (frontend). Prioritize minimal UI friction and inline editability.

**Important:** If you identify any potential issues, gaps in requirements, architectural concerns, or things that may break existing features, please notify me before proceeding so we can make an informed decision.

**Also:** Please update any documentation or Cursor `.rules` files as needed to reflect the new data models, endpoints, and frontend behaviors introduced here.

---

### 🔧 Suggested Task Breakdown

1. **Subproject model, database table, and CRUD API**
2. **MaterialEntry autocomplete system**
3. **MaterialItem: model, API, and AG Grid UI**
4. **LaborItem: model, API, and AG Grid UI**
5. **PermitItem: model, API, and AG Grid UI**
6. **OtherCostItem: model, API, and AG Grid UI**
7. **Cost Summary rollups (frontend calculations)**
8. **Page route and layout for **``
9. **Documentation and Cursor rules updates**

**Feel free to suggest the most logical or efficient development sequence. If you believe certain tasks should be grouped or split differently, or if there are any dependencies that should be handled first, please call that out before proceeding.**

