# Feature Planning & Requirements Documentation

## **Priority Roadmap Consensus**

### **🔴 High Priority (Revenue Management Core)**
1. **Project-Level Sales Tax** - Foundation for estimates/invoices
2. **Markup System (Labor & Materials)** - Core profitability feature  
3. **Estimate Generation** - Client-facing PDF estimates with signatures
4. **Change Order System** - Track estimate modifications and approvals

### **🟡 Medium Priority (UX & Standards)**
5. **Standardized API Error Format** - Consistent error handling
6. **Phone Number & Currency Formatting** - Professional data display
7. **Trip Charge Functionality** - Additional revenue line item
8. **Legal Boilerplate Templates** - Estimate/invoice legal text
9. **Demo User System** - Sales and testing capabilities
10. **AI Material Estimation** - GPT-assisted quantity prediction

### **🟢 Low Priority (Technical Debt)**
11. **Staging Static Asset 401 Bug** - Cosmetic issue fix

### **📋 Post-Estimate Features Cleanup Milestone**
- **Refactor models.py/schemas.py** - Domain-based file separation (planned after estimate generation features complete)
- **Advanced Trip Charge Features** - GPS/distance integration based on user feedback
- **Third-party E-Signature Integration** - DocuSign/HelloSign API for full compliance

## **Detailed Feature Specifications**

### **1. Project-Level Sales Tax**

**Agreed Requirements:**
- Store `tax_rate` at project level with company-wide default
- Calculate tax AFTER markup application
- Display full breakdown on estimates/invoices
- Support future API integration (TaxJar, Avalara)

**Technical Decisions:**
- **Storage Format**: Store as decimal (0.0875) for calculations, display as percentage (8.75%)
- **Default Behavior**: Use contractor's home state tax as company default
- **Override Capability**: Per-project tax rate override

**Questions to Answer Before Implementation:**
- Should we validate tax rates (0-50% range)?
- How do we handle tax-exempt projects?
- Do we need separate tax rates for materials vs labor?
- What tax breakdown detail should invoices show (state/county/local)?

**Migration Considerations:**
- Add `tax_rate`, `tax_amount`, `total_with_tax` columns to projects table
- Create company settings table for default tax rate
- Migrate existing projects with zero tax rate

---

### **2. Markup System (Labor & Materials)**

**Agreed Requirements:**
- **NEVER show markup percentages to clients** - only final totals
- Support both flat amount and percentage markup
- Settable at project level with company defaults
- Apply to Materials and Labor categories only (not Permits/Other)

**Technical Implementation:**
- Store markup as separate fields: `material_markup_type` (flat/percentage), `material_markup_value`
- Calculate markup before tax application
- Display only final totals on client-facing documents

**Questions to Answer Before Implementation:**
- Should markup be per-category or single project-wide?
- Do we need markup history/audit trail?
- Should there be maximum markup limits?
- How do we handle negative markups (discounts)?

**Business Logic Decisions:**
- **Markup Application Order**: Base Cost → Markup → Tax
- **Markup Visibility**: Internal only, never client-facing
- **Default Behavior**: Zero markup if not set

---

### **3. Estimate Generation**

**Agreed Requirements:**
- PDF-based estimate generation
- Include cost breakdown (Materials, Labor, Permits, Other, Markup, Tax)
- Editable legal text section
- Print/email capability
- Client signature capture
- **Lock estimate once submitted/signed** (read-only snapshot)

**Technical Implementation:**
- **PDF Generation**: Server-side using `WeasyPrint` (excellent CSS support) or `pdfkit` (HTML-based)
- **Client Access**: Anonymous estimate viewing via shareable links
- **Estimate States**: `draft` → `sent` → `viewed` → `signed` → `locked`

**Electronic Signature Phased Approach:**
1. **Phase 1 (MVP)**: Draw-to-sign canvas (familiar UX, simple implementation)
2. **Phase 2**: Typed name + checkbox + timestamp (legally sufficient for most cases)
3. **Phase 3**: DocuSign/HelloSign API integration (full compliance, robust audit trail)

**Legal Framework - RESOLVED:**
- **Estimate Legal Status**: Treat as formal "offer" that becomes binding only upon signature with legal disclaimers
- **User Control**: Toggle option for whether estimate is considered binding
- **Default Disclaimer**: "This estimate is not a contract unless signed and accompanied by a mutually agreed work start date."
- **Legal Boilerplate**: Editor can include "Signed estimate constitutes agreement to proceed."

**Implementation Approach:**
- Legal-lite for MVP with flexibility for contract-ready use
- User-configurable binding vs good faith estimate classification
- Comprehensive audit trail for all estimate interactions

**Remaining Questions:**
- How do clients receive estimates? (Email link with anonymous access - CONFIRMED)
- What happens when estimates expire? (automatic status change, notification)
- How granular should cost breakdowns be? (category totals vs line items)

---

### **4. Change Order System**

**Agreed Requirements:**
- Log all estimate modifications post-signature
- Show diffs between original and revised scope/cost
- Timestamped change approvals with notes
- Client-visible history section

**Technical Implementation Strategy:**
- **Create new estimate versions** rather than modifying originals
- Maintain complete audit trail of who changed what when
- **Clear approval workflow**: pending → approved → rejected

**Questions to Answer Before Implementation:**
- Should change orders require re-signature or just approval?
- How do we handle partial change order approvals?
- What level of detail should change diffs show?
- Should clients be able to request changes directly in the system?

**Data Structure Decisions:**
- Use estimate versioning with change tracking
- Store approval metadata (user, timestamp, notes)
- Link change orders to specific project phases if applicable

---

### **5. Legal Boilerplate Templates**

**Agreed Requirements:**
- Editable boilerplate templates for estimates/invoices
- Project-level and company-level customization
- Common construction industry clauses

**Technical Implementation:**
- Store templates in database with versioning
- Support rich text editing (not just plain text)
- Include merge fields for dynamic data (project name, dates, amounts)
- **CRITICAL**: Clear disclaimer that this is convenience only, not legal advice

**Standard Clauses to Include:**
- Scope of work definition
- Payment terms (due dates, late fees)
- Permitting responsibilities
- Dispute resolution process
- Warranty and liability disclaimers
- Change order process agreement

**Questions to Answer Before Implementation:**
- Should we provide industry-standard templates out of the box?
- How do we handle template versioning for legal compliance?
- What merge fields are most important?
- Should we integrate with legal document services?

---

### **6. Phone Number & Currency Formatting**

**Agreed Technical Approach:**
- Frontend: `libphonenumber-js` for phone validation/formatting
- Currency: `Intl.NumberFormat` for consistent display
- Backend: Sanitization and validation

**Implementation Details:**
- Store phone numbers in E.164 format
- Display formatting based on user locale
- Consistent currency display across all components

---

### **7. Trip Charge Functionality**

**MVP Approach (Simplified Implementation):**
- Manual trip charge entry per project
- Dropdown options: Flat Fee, Per Visit, Per Mile (manual input)
- Simple integration with existing cost structure
- Apply markup and tax to trip charges like other costs

**Advanced Features (Future Phase):**
- GPS/distance-based calculation
- Integration with project scheduling
- Different rates for different service types

**Questions to Answer Before Implementation:**
- Should trip charges be per-project or per-invoice?
- How do trip charges interact with markup and tax calculation order?
- What are common contractor patterns for trip charge billing?

---

## **Technical Architecture Decisions**

### **Database Schema Strategy**
**RESOLVED - Compromise Approach:**
- **Current Phase**: Maintain single-file structure for `models.py` and `schemas.py`
- **Post-Estimate Milestone**: Plan deliberate refactor after core financial features complete
- **Rationale**: Avoid premature optimization while acknowledging future complexity will require cleanup

**Implementation Plan:**
- Continue with current structure through sales tax, markup, and estimate features
- Create cleanup milestone once financial feature complexity grows
- Domain-based separation: `user.py`, `project.py`, `invoice.py`, `estimate.py`

### **PDF Generation Strategy**
**RESOLVED - Server-side Approach:**
- **Recommended**: `WeasyPrint` (excellent CSS support) or `pdfkit` (HTML-based)
- **Rationale**: Server-side generation for legally-sensitive documents provides better control and consistency
- **Future Consideration**: Third-party services (Docmosis, PDFMonkey) if layout complexity grows significantly

**Implementation Benefits:**
- Full control over PDF rendering
- Consistent output across environments  
- Better security for sensitive financial documents
- Professional layout capabilities with CSS

---

## **Pre-Implementation Checklist**

### **Before Starting Any Feature:**
1. ✅ Review this document for feature-specific questions
2. ✅ Make final decisions on open technical questions
3. ✅ Document any changes to requirements
4. ✅ Plan database migration strategy if needed
5. ✅ Consider impact on existing features
6. ✅ Define testing approach for staging environment

### **Sales Tax Implementation (Next Up):**
- [ ] Decide on tax rate validation ranges
- [ ] Design company settings data structure
- [ ] Plan migration for existing projects
- [ ] Research tax-exempt project handling

### **Markup System Implementation:**
- [ ] Finalize markup storage approach (per-category vs project-wide)
- [ ] Design markup audit trail if needed
- [ ] Plan integration with existing cost calculations

### **Estimate Generation Implementation:**
- [ ] Choose PDF generation approach
- [ ] Design client access method (portal vs anonymous)
- [ ] Research electronic signature compliance requirements
- [ ] Plan estimate versioning data structure

### **Change Order System Implementation:**
- [ ] Design approval workflow state machine
- [ ] Plan change diff calculation approach
- [ ] Determine client interaction capabilities

---

## **Audit Trail & Event Logging**

### **Financial Event Tracking**
Track every major financial or legal change with complete audit trail:

```json
{
  "event": "estimate_revision",
  "user": "tony",
  "timestamp": "2025-01-15T10:30:00Z",
  "entity_type": "project", 
  "entity_id": 123,
  "old": { "labor": 5000 },
  "new": { "labor": 6000 },
  "note": "Plumber cost updated after bid",
  "ip_address": "192.168.1.1"
}
```

### **Estimate Lifecycle Events**
**Required State Transitions:**
- `draft` → `sent` → `viewed` → `signed` → `locked`
- Each transition logged with timestamp, user, and context
- Complete traceability for disputes or compliance audits

### **Event Types to Track:**
- Estimate creation, revision, sending, viewing, signing
- Change order creation and approval  
- Markup modifications
- Tax rate changes
- Payment status updates
- Project status changes

---

## **Compliance & Legal Considerations**

### **Electronic Signatures:**
**Phased Compliance Approach:**
1. **Phase 1**: Draw-to-sign + timestamp (simple, familiar UX)
2. **Phase 2**: Typed name + checkbox + IP logging (legally sufficient for most states)
3. **Phase 3**: Third-party integration (DocuSign/HelloSign for full compliance)

**Research Requirements:**
- Construction industry signature requirements by state
- Audit trail and verification standards
- Binding vs non-binding estimate classification

### **Data Retention:**
- Signed estimate storage requirements
- Change order documentation retention
- Legal compliance for financial records

### **Disclaimers Required:**
- Legal boilerplate templates are for convenience only
- Tax calculations may require professional review
- Electronic signatures compliance with local laws
- Warranty and liability limitations

---

## **Success Metrics for Each Feature**

### **Sales Tax:**
- Accurate tax calculations on all estimates/invoices
- Easy per-project tax rate override
- Clear tax breakdown display

### **Markup System:**
- Markup never visible to clients
- Accurate profit margin calculations
- Easy markup configuration per project

### **Estimate Generation:**
- Professional PDF estimates
- Successful signature capture
- Locked estimate integrity

### **Change Orders:**
- Complete audit trail of changes
- Clear approval workflow
- Client-visible change history

## **Key Questions Requiring Clarification**

### **Critical Legal/Business Questions:**
1. ✅ **RESOLVED - Estimate Legal Status**: Formal "offer" that becomes binding upon signature with user-configurable legal stance and disclaimers

2. **What are common contractor patterns for trip charge billing?**
   - Per-project vs per-invoice
   - Distance-based vs flat fee preferences  
   - Integration with existing cost structures

3. **Should markup be per-category (Materials/Labor separate) or project-wide?**
   - Affects database design and calculation complexity
   - Impacts contractor workflow and profitability tracking

### **Technical Implementation Questions:**
1. **How granular should estimate cost breakdowns be?**
   - Category totals only vs detailed line items
   - Client-facing transparency vs internal detail

2. **What happens when estimates expire?**
   - Automatic status changes, notifications
   - Re-approval workflow requirements

---

## **Implementation Readiness Status**

### **✅ Ready to Implement:**
1. **Sales Tax System** - All decisions made, ready to begin
2. **Trip Charges (MVP)** - Manual entry approach confirmed
3. **PDF Generation** - Server-side WeasyPrint approach locked in  
4. **E-Signature (Phase 1)** - Draw-to-sign canvas for MVP

### **🟡 Needs Final Decisions:**
1. **Markup System** - Per-category vs project-wide structure
2. **Estimate Breakdowns** - Granularity level for client-facing documents

### **🔴 Requires Research:**
1. **Trip Charge Patterns** - Industry billing practices
2. **Estimate Expiration** - Workflow and notification requirements

---

**NEXT STEP: Begin Sales Tax implementation** - All requirements clear and technical approach defined.

This document will be referenced before implementing each feature to ensure all decisions are made and requirements are clear.