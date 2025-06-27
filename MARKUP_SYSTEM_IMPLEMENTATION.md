# Markup System Implementation: Phased Development Plan

## **Overview**
This document outlines the complete implementation plan for markup and discount functionality, broken into 6 bite-sized phases with clear success criteria and approval gates.

## **Implementation Rules**
- ✅ **Stop at the end of each phase** to verify success criteria
- ✅ **Get positive affirmation** before proceeding to next phase
- ✅ **Test thoroughly** at each phase boundary
- ✅ **Commit frequently** with focused, small commits
- ✅ **Ask for approval** - err on the side of too much rather than too little

---

## **Phase 1: Database Foundation** ⏱️ *45-60 mins*
**Goal**: Add markup/discount models and run migration safely

### **Tasks:**

#### **1A: Add Company Markup Defaults** *(20 mins)*
- Add to existing `CompanySettings` model in `backend/app/models/models.py`:
  - `default_material_markup_percent` - NUMERIC(7,4), default=0.0
  - `default_labor_markup_percent` - NUMERIC(7,4), default=0.0

#### **1B: Add Project Markup/Discount Fields** *(25 mins)*  
- Add to existing `Project` model in `models.py`:
  - `material_markup_type` - VARCHAR(10), default='percent'
  - `material_markup_value` - NUMERIC(7,4), default=0.0
  - `labor_markup_type` - VARCHAR(10), default='percent'
  - `labor_markup_value` - NUMERIC(7,4), default=0.0
  - `material_discount_type` - VARCHAR(10), default='percent'
  - `material_discount_value` - NUMERIC(10,2), default=0.0
  - `labor_discount_type` - VARCHAR(10), default='percent'
  - `labor_discount_value` - NUMERIC(10,2), default=0.0
  - `project_discount_type` - VARCHAR(10), default='percent'
  - `project_discount_value` - NUMERIC(10,2), default=0.0

#### **1C: Create Markup Changes Audit Table** *(15 mins)*
- Create new `MarkupChange` model:
  - `id`, `project_id` (FK), `user_id` (FK)
  - `field_changed`, `old_value`, `new_value`, `change_reason`
  - Standard timestamps: `created_at`

### **Testing Steps:**
1. Run `python3 run.py` locally
2. Check database migration runs without errors
3. Visit `/docs` to verify new fields don't appear yet (no schema updates)
4. Test existing project API calls still work

### **✅ Phase 1 Success Criteria:**
- [ ] Local database migrated without errors
- [ ] All existing projects have default markup/discount values (0.0)
- [ ] `markup_changes` table created successfully
- [ ] No breaking changes to existing functionality
- [ ] Can still create/edit projects without markup fields

### **🛑 APPROVAL GATE: Wait for positive confirmation before Phase 2**

---

## **Phase 2: Schema & API Foundation** ⏱️ *45-60 mins*
**Goal**: Update schemas and add basic API support

### **Tasks:**

#### **2A: Update Schemas** *(30 mins)*
- Update `backend/app/schemas/schemas.py`:
  - Add markup/discount fields to `Project`, `ProjectCreate`, `ProjectUpdate`
  - Add company markup defaults to `CompanySettings`, `CompanySettingsUpdate`
  - Create `MarkupChange` schemas

#### **2B: Update Company Settings API** *(15 mins)*
- Modify existing company settings endpoints to include markup defaults
- Ensure proper validation for markup percentages (0-300%)

#### **2C: Add Markup Change Tracking** *(15 mins)*
- Create helper function to log markup changes
- Integration points identified (will implement in Phase 3)

### **Testing Steps:**
1. Check `/docs` shows new markup fields in project schemas
2. Test GET `/company/settings` includes markup defaults
3. Test PUT `/company/settings` with markup defaults
4. Verify schema validation works (negative values rejected)

### **✅ Phase 2 Success Criteria:**
- [ ] All markup/discount fields visible in API documentation
- [ ] Company settings API includes markup defaults
- [ ] Schema validation prevents invalid values
- [ ] Markup change tracking helper function created
- [ ] No breaking changes to existing API calls

### **🛑 APPROVAL GATE: Wait for positive confirmation before Phase 3**

---

## **Phase 3: Calculation Logic** ⏱️ *60-75 mins*
**Goal**: Implement markup/discount calculations

### **Tasks:**

#### **3A: Update Project Calculation Helper** *(45 mins)*
- Modify existing `calculate_project_totals()` function in `utils/calculations.py`
- New calculation order: Base Cost → Markup → Discount → Tax → Total
- Handle both percent and flat markup/discount types
- Add proper decimal arithmetic for accuracy
- Include markup change logging

#### **3B: Integrate with Project Update API** *(15 mins)*
- Ensure markup calculations trigger on project updates
- Log markup changes when values are modified
- Validate markup limits (warning at 100%, cap at 300%)

#### **3C: Default Markup Inheritance** *(15 mins)*
- When creating new projects, fetch company default markups
- Apply to new projects automatically
- Fall back to 0.0 if no company settings exist

### **Testing Steps:**
1. Create test project with known values
2. Verify calculation: $1000 base + 20% markup + 10% discount + 8.75% tax
3. Test both percent and flat markup/discount combinations
4. Test markup change logging
5. Test company default inheritance for new projects

### **✅ Phase 3 Success Criteria:**
- [ ] Markup/discount calculations work correctly: base → markup → discount → tax → total
- [ ] Both percent and flat calculations accurate to the penny
- [ ] Markup change audit trail functions properly
- [ ] New projects inherit company default markups
- [ ] Markup validation warnings/limits work
- [ ] All calculations use proper decimal arithmetic

### **🛑 APPROVAL GATE: Wait for positive confirmation before Phase 4**

---

## **Phase 4: Frontend Company Settings** ⏱️ *60-90 mins*
**Goal**: Add markup defaults to company settings page

### **Tasks:**

#### **4A: Update Company Settings Page** *(45 mins)*
- Modify existing `frontend/src/pages/CompanySettings.tsx`
- Add markup default inputs for Materials and Labor
- Percentage format with % suffix
- Include tooltips about markup vs discount visibility

#### **4B: Form Validation** *(30 mins)*
- 0-300% range validation with warning above 100%
- Convert percentage input (20%) to decimal (0.20) for API
- Show validation errors and warnings clearly
- Real-time feedback for unusual values

#### **4C: Default Inheritance Testing** *(15 mins)*
- Verify company defaults save and persist
- Test that new projects inherit these defaults

### **Testing Steps:**
1. Access company settings page
2. Test markup default inputs with valid values (0%, 20%, 100%, 150%)
3. Test validation (negative values, >300%)
4. Test warning display for >100%
5. Create new project and verify markup inheritance

### **✅ Phase 4 Success Criteria:**
- [ ] Company settings page includes markup default inputs
- [ ] Markup inputs accept percentage format (with % suffix)
- [ ] Input validation prevents invalid markups (0-300% range)
- [ ] Warning indicator appears for markups >100%
- [ ] Company defaults save successfully and persist
- [ ] New projects inherit company markup defaults
- [ ] Tooltips explain markup behavior clearly

### **🛑 APPROVAL GATE: Wait for positive confirmation before Phase 5**

---

## **Phase 5: Frontend Project Markup Interface** ⏱️ *90-120 mins*
**Goal**: Add markup/discount controls to project editing

### **Tasks:**

#### **5A: Update Project Modal** *(60 mins)*
- Add markup section to `ProjectModal.tsx`
- Separate inputs for Materials and Labor markup
- Type selector (percent/flat) per category
- Discount section with project-level discount
- Real-time calculation preview

#### **5B: Add Validation & Warnings** *(30 mins)*
- Markup validation (0-300% with override capability)
- Discount warnings when > project total
- Visual indicators for high markups
- Clear separation of markup (internal) vs discount (client-facing)

#### **5C: Update Project Display** *(30 mins)*
- Modify `CostSummary.tsx` to show markup/discount breakdown
- Internal view: Show markups and discounts separately
- Hide markup from any client-facing displays
- Update project detail pages with markup information

### **Testing Steps:**
1. Edit project - verify markup/discount inputs appear
2. Test type switching (percent ↔ flat) per category
3. Test real-time calculation updates
4. Verify warnings appear for high markups and excessive discounts
5. Test markup override capability (>300%)
6. Verify markup is hidden from client-facing views

### **✅ Phase 5 Success Criteria:**
- [ ] Project edit modal includes markup/discount sections
- [ ] Separate markup controls for Materials and Labor
- [ ] Type selector (percent/flat) works for each category
- [ ] Project-level discount controls function properly
- [ ] Real-time calculation updates work smoothly
- [ ] Validation warnings appear appropriately
- [ ] Markup override capability functions (>300%)
- [ ] Client-facing views hide markup, show discount only
- [ ] Form inherits company defaults for new projects

### **🛑 APPROVAL GATE: Wait for positive confirmation before Phase 6**

---

## **Phase 6: Integration Testing & Polish** ⏱️ *45-60 mins*
**Goal**: End-to-end verification and staging deployment

### **Tasks:**

#### **6A: Complete Workflow Testing** *(30 mins)*
- Test complete user workflow:
  1. Set company default markups (20% materials, 15% labor)
  2. Create new project (should inherit defaults)
  3. Override project markups (different values)
  4. Add project discount (property damage scenario)
  5. Verify calculation chain throughout
  6. Test audit trail functionality

#### **6B: Edge Case Testing** *(15 mins)*
- Test discount > project total (warning appears)
- Test markup at limits (100% warning, 300% cap)
- Test percent vs flat combinations
- Verify rounding accuracy

#### **6C: Staging Deployment** *(15 mins)*
- Commit all changes with descriptive messages
- Deploy to staging environment
- Test migration on staging PostgreSQL database
- Verify all functionality works in staging

### **Testing Steps:**
1. Complete workflow testing locally
2. Test all validation scenarios
3. Verify audit trail captures all changes
4. Check calculation accuracy across different scenarios
5. Deploy to staging and retest key workflows

### **✅ Phase 6 Success Criteria:**
- [ ] Complete markup workflow functional end-to-end
- [ ] Company default markup inheritance works
- [ ] Project-level markup override works
- [ ] Discount system works correctly with warnings
- [ ] Audit trail captures all markup changes
- [ ] All calculations accurate across different scenarios
- [ ] Staging environment migration successful
- [ ] No regressions in existing functionality
- [ ] Ready for final user approval

### **🛑 APPROVAL GATE: Wait for positive confirmation before marking complete**

---

## **Success Scenario Testing Matrix**

| Scenario | Expected Result |
|----------|----------------|
| New user, no company markup defaults | Projects default to 0% markup |
| Set company defaults: 20% materials, 15% labor | New projects inherit these values |
| Project: $1000 materials + 20% markup | Materials total: $1,200 |
| Project: $2000 labor + 15% markup | Labor total: $2,300 |
| Combined + 10% project discount | Subtotal: $3,500, Discount: $350, Total: $3,150 |
| Add 8.75% tax to final total | Final total: $3,425.63 |
| Markup >100% | Shows warning but allows |
| Markup >300% | Requires override confirmation |
| Discount > project total | Shows warning but allows (credit scenario) |
| Markup change | Logged in audit trail |

---

## **Rollback Plan**
If any phase fails its success criteria:
1. **Stop immediately** - do not proceed to next phase
2. **Identify the issue** - review error logs and testing results
3. **Fix the problem** - address the specific failure
4. **Re-test the phase** - verify success criteria are met
5. **Get approval** - confirm resolution before continuing

## **Deployment Notes**
- All phases can be tested locally before staging deployment
- Phase 6 includes staging deployment and verification
- Production deployment only after successful staging verification and final approval

**REMEMBER: Ask for explicit approval at every approval gate! 🛑**

---

## **Architecture Notes**

### **Integration with Existing Systems**
- Builds on existing `calculate_project_totals()` function
- Extends current tax calculation system
- Reuses company settings infrastructure
- Maintains existing cost calculation patterns

### **Data Migration Strategy**
- All new fields have safe defaults (0.0)
- No recalculation of existing projects during migration
- Recalculation only occurs on next project save/edit
- Backwards compatible with existing cost structure

### **Future Extensibility**
- Schema supports additional markup types if needed
- Audit trail can track any field changes
- Company defaults easily extendable to other categories
- Calculation order designed for future additions

---

## **🔧 Addendum: Final Implementation Details**

These refinements are based on finalized decisions and should be incorporated into the implementation plan as enhancements to ensure correctness, precision, and future extensibility.

---

### **✅ Enhanced Database Schema Design**

**Separate Fields for Precision Consistency:**
```sql
-- Project markup fields (separate columns for proper precision)
material_markup_type VARCHAR(10) DEFAULT 'percent' -- 'percent' or 'flat'
material_markup_percent NUMERIC(7,4) DEFAULT 0.0    -- Percentage values
material_markup_flat NUMERIC(10,2) DEFAULT 0.0      -- Currency values
labor_markup_type VARCHAR(10) DEFAULT 'percent'
labor_markup_percent NUMERIC(7,4) DEFAULT 0.0
labor_markup_flat NUMERIC(10,2) DEFAULT 0.0

-- Discount fields with same precision approach
material_discount_type VARCHAR(10) DEFAULT 'percent'
material_discount_percent NUMERIC(7,4) DEFAULT 0.0
material_discount_flat NUMERIC(10,2) DEFAULT 0.0
labor_discount_type VARCHAR(10) DEFAULT 'percent' 
labor_discount_percent NUMERIC(7,4) DEFAULT 0.0
labor_discount_flat NUMERIC(10,2) DEFAULT 0.0
project_discount_type VARCHAR(10) DEFAULT 'percent'
project_discount_percent NUMERIC(7,4) DEFAULT 0.0
project_discount_flat NUMERIC(10,2) DEFAULT 0.0
```

**Rationale**: Separate fields ensure proper precision for each data type - percentages get 4 decimal places, currency gets 2 decimal places.

### **✅ Enhanced Validation Rules**

**Stepped Validation Approach:**
- **Minimum values**: 0.01% for percentages, $0.01 for flat amounts
- **Warning threshold**: 100% markup (unusual but allowed)
- **Hard cap**: 300% markup (requires override confirmation)
- **Override workflow**: Clear confirmation dialog with business justification

**Smart Company Defaults:**
- Materials: 20% (industry standard for material markup)
- Labor: 15% (typical labor markup range)
- Reduces initial configuration burden for new users

### **✅ Calculation Architecture**

**Immutable Audit Trail:**
- Every calculation stored with timestamp and user
- Calculation history preserved for disputes/compliance
- Real-time preview with backend verification

**Precision Handling:**
- All intermediate calculations use full decimal precision
- Final rounding only at project total level
- Prevents compound rounding errors

### **✅ User Interface Enhancements**

**Tabbed Interface Design:**
- **Company Settings**: General → Tax → Markup tabs
- **Project Modal**: Costs → Markup → Discounts tabs
- Reduces cognitive load and improves organization

**Advanced Warning System:**
- **Color-coded badges**: Green (normal), Yellow (warning), Red (requires override)
- **Contextual messages**: "Markup >100% is unusual - confirm intentional"
- **Override confirmations**: Clear business justification required

### **✅ Implementation Priority Updates**

**Phase 1 Enhancements:**
- Use separate precision fields in database schema
- Add smart company defaults (20%/15%)
- Enhanced audit trail table with calculation history

**Phase 4-5 Enhancements:**
- Tabbed interface implementation
- Advanced warning badge system
- Override confirmation workflows

**Testing Matrix Additions:**
| Scenario | Expected Result |
|----------|----------------|
| Flat markup: $100 materials, $50 labor | Direct addition: $1,100 + $2,050 = $3,150.00 |
| Mixed: 10% materials, $200 labor flat | Materials: $1,100, Labor: $2,200, Total: $3,300.00 |
| Override >300% markup | Confirmation dialog → Audit log entry |
| Minimum validation | 0.01% and $0.01 enforced |

---

**NEXT STEP: Begin Phase 1 - Database Foundation with Enhanced Schema** 🚀