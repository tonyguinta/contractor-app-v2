# Mobile-First Editable Tables Implementation Guide

This guide provides step-by-step instructions for implementing the mobile-first click-to-edit pattern across all cost tracking tables (Labor, Permits, Other Costs).

## Reference Implementation
The MaterialsTable implementation serves as the complete reference. All patterns should follow this exact structure.

## Step-by-Step Implementation

### 1. Create Modal Component
**File**: `src/components/{Type}Modal.tsx`

Copy `MaterialModal.tsx` and adapt:
- [ ] Update interface types (`{Type}Item`, `{Type}ItemCreate`, `{Type}ItemUpdate`)
- [ ] Remove autocomplete logic (only Materials has autocomplete)
- [ ] Update form fields (remove category/unit fields if not applicable)
- [ ] Update API calls (`subprojectsApi.create{Type}`, `update{Type}`, `delete{Type}`)
- [ ] Update button text: "Add {Type}", "Update", "Delete"

### 2. Create Column Definitions  
**File**: `src/components/{type}-columns.tsx`

Copy `materials-columns.tsx` and adapt:
- [ ] Update type imports
- [ ] Simplify to 3 columns: Description, Quantity, Total
- [ ] Remove unit/category display if not applicable
- [ ] Maintain original columns function for rollback

### 3. Update Table Component
**File**: `src/components/{Type}Table.tsx`

Apply these changes:
- [ ] Add feature flags: `USE_MODAL_EDITING = true`, `USE_SIMPLIFIED_COLUMNS = true`
- [ ] Import and use `CostCalculationContext`
- [ ] Add modal state management
- [ ] Import column definitions from separate file
- [ ] Implement click-to-edit rows with hover effects
- [ ] Remove action buttons when simplified columns enabled
- [ ] Update cost calculation effect to use optimistic UI
- [ ] Add modal component at bottom

### 4. Integration Checklist
- [ ] Import modal in parent component
- [ ] Verify CostCalculationContext is provided in App.tsx
- [ ] Test mobile responsiveness
- [ ] Test optimistic UI updates
- [ ] Test conflict resolution (if applicable)
- [ ] Verify rollback capability with feature flags

## Code Templates

### Modal Component Template
```typescript
interface {Type}ModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: {Type}Item) => void
  onDelete?: (item: {Type}Item) => void
  subprojectId: number
  editing{Type}?: {Type}Item | null
}
```

### Column Definitions Template
```typescript
// Simplified columns (mobile-friendly)
export const simplifiedColumns = (): ColumnDef<{Type}Item, any>[] => [
  columnHelper.accessor('description', {
    header: 'Description',
    cell: ({ row }) => {
      const item = row.original
      return (
        <div>
          <div className="font-medium text-gray-900">{item.description}</div>
          <div className="text-sm text-gray-500">
            {item.quantity} {item.unit}
          </div>
        </div>
      )
    },
  }),
  // ... quantity and total columns
]
```

### Table Integration Template
```typescript
// Feature flags
const USE_MODAL_EDITING = true
const USE_SIMPLIFIED_COLUMNS = true

// Context integration
const { updateCost, getCost, isPending } = useCostCalculation()

// Cost calculation effect
useEffect(() => {
  const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0)
  updateCost(subproject.id.toString(), '{type}', totalCost, [])
}, [items, subproject.id, updateCost])
```

## Testing Checklist
- [ ] Mobile viewport (375px width) shows 3 columns properly
- [ ] Click any row opens modal with correct data
- [ ] Modal form validation works
- [ ] Delete confirmation appears in modal
- [ ] Cost calculations update immediately (optimistic UI)
- [ ] Feature flags allow rollback to original design
- [ ] No console errors or TypeScript issues

## Notes
- Only Materials table has autocomplete functionality
- Labor table should have hourly rate field instead of unit cost
- Permits table typically has fixed costs (no quantity/unit)
- Other Costs table is the most flexible (various cost types)
- Always maintain rollback capability through feature flags