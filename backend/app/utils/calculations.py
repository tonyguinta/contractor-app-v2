from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, select
from app.models.models import CompanySettings, Project, Subproject, MaterialItem, LaborItem, PermitItem, OtherCostItem

def calculate_project_totals(project: Project, db: Session) -> Dict[str, Decimal]:
    """
    Calculate project totals with proper tax calculation.
    
    Calculation order: Subproject Totals → Markup → Tax → Total
    
    Args:
        project: Project instance
        db: Database session for subproject queries and company settings lookup
    
    Returns:
        Dict with calculated sales_tax_amount and total_with_tax
    """
    # Calculate totals from subproject items
    subproject_ids_query = select(Subproject.id).where(Subproject.project_id == project.id)
    
    # Materials total: sum(quantity * unit_cost)
    materials_total = db.query(
        func.coalesce(func.sum(MaterialItem.quantity * MaterialItem.unit_cost), 0)
    ).filter(MaterialItem.subproject_id.in_(subproject_ids_query)).scalar() or Decimal('0')
    
    # Labor total: sum(number_of_workers * hourly_rate * hours)
    labor_total = db.query(
        func.coalesce(func.sum(LaborItem.number_of_workers * LaborItem.hourly_rate * LaborItem.hours), 0)
    ).filter(LaborItem.subproject_id.in_(subproject_ids_query)).scalar() or Decimal('0')
    
    # Permits total: sum(cost)
    permits_total = db.query(
        func.coalesce(func.sum(PermitItem.cost), 0)
    ).filter(PermitItem.subproject_id.in_(subproject_ids_query)).scalar() or Decimal('0')
    
    # Other costs total: sum(cost)
    other_total = db.query(
        func.coalesce(func.sum(OtherCostItem.cost), 0)
    ).filter(OtherCostItem.subproject_id.in_(subproject_ids_query)).scalar() or Decimal('0')
    
    # Convert to Decimal for precise calculation
    materials_total = Decimal(str(materials_total))
    labor_total = Decimal(str(labor_total))
    permits_total = Decimal(str(permits_total))
    other_total = Decimal(str(other_total))
    
    # Calculate subtotal from subproject items
    subtotal = materials_total + labor_total + permits_total + other_total
    
    # TODO: Apply markup here when markup system is implemented
    # For now, subtotal_with_markup = subtotal
    subtotal_with_markup = subtotal
    
    # Tax calculation
    if project.is_tax_exempt:
        # Tax exempt override - no tax regardless of rate
        sales_tax_amount = Decimal('0.00')
    else:
        # Get tax rate (project override or company default)
        tax_rate = project.sales_tax_rate
        if tax_rate is None:
            tax_rate = Decimal('0.0')
        else:
            # Ensure tax_rate is a Decimal
            tax_rate = Decimal(str(tax_rate))
        
        # Calculate tax on subtotal with markup
        sales_tax_amount = subtotal_with_markup * tax_rate
        
        # Round to nearest cent
        sales_tax_amount = sales_tax_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    # Final total
    total_with_tax = subtotal_with_markup + sales_tax_amount
    
    return {
        'sales_tax_amount': sales_tax_amount,
        'total_with_tax': total_with_tax
    }

def get_company_default_tax_rate(user_id: int, db: Session) -> Decimal:
    """
    Get company default tax rate for user.
    Falls back to 0.0 if no company settings exist.
    
    Args:
        user_id: User ID to look up company settings
        db: Database session
    
    Returns:
        Default tax rate as Decimal
    """
    company_settings = db.query(CompanySettings).filter(
        CompanySettings.user_id == user_id
    ).first()
    
    if company_settings:
        return company_settings.default_sales_tax_rate
    else:
        return Decimal('0.0')