from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.models import CompanySettings, Project

def calculate_project_totals(project: Project, db: Session) -> Dict[str, Decimal]:
    """
    Calculate project totals with proper tax calculation.
    
    Calculation order: Base Cost → Markup → Tax → Total
    
    Args:
        project: Project instance with cost fields
        db: Database session for company settings lookup
    
    Returns:
        Dict with calculated sales_tax_amount and total_with_tax
    """
    # Base costs
    base_cost = Decimal(str(project.estimated_cost or 0))
    labor_cost = Decimal(str(project.labor_cost or 0))
    material_cost = Decimal(str(project.material_cost or 0))
    permit_cost = Decimal(str(project.permit_cost or 0))
    other_cost = Decimal(str(project.other_cost or 0))
    
    # Calculate subtotal (base + all costs)
    subtotal = base_cost + labor_cost + material_cost + permit_cost + other_cost
    
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