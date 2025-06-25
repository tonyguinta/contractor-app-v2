from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import CompanySettings, User
from app.schemas.schemas import CompanySettings as CompanySettingsSchema, CompanySettingsCreate, CompanySettingsUpdate
from app.core.deps import get_current_active_user
from decimal import Decimal

router = APIRouter()

@router.get("/settings", response_model=CompanySettingsSchema)
def get_company_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get company settings for the current user"""
    settings = db.query(CompanySettings).filter(CompanySettings.user_id == current_user.id).first()
    
    if not settings:
        # Return default settings if none exist
        return CompanySettingsSchema(
            id=0,
            user_id=current_user.id,
            default_sales_tax_rate=Decimal("0.0"),
            created_at=current_user.created_at,
            updated_at=current_user.updated_at
        )
    
    return settings

@router.put("/settings", response_model=CompanySettingsSchema)
def update_company_settings(
    settings_update: CompanySettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update company settings for the current user"""
    settings = db.query(CompanySettings).filter(CompanySettings.user_id == current_user.id).first()
    
    if not settings:
        # Create new settings if none exist
        settings = CompanySettings(
            user_id=current_user.id,
            default_sales_tax_rate=settings_update.default_sales_tax_rate
        )
        db.add(settings)
    else:
        # Update existing settings
        if settings_update.default_sales_tax_rate is not None:
            settings.default_sales_tax_rate = settings_update.default_sales_tax_rate
    
    db.commit()
    db.refresh(settings)
    return settings