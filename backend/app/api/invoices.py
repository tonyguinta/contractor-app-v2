from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid
from app.db.database import get_db
from app.models.models import Invoice, User, Client, Project
from app.schemas.schemas import Invoice as InvoiceSchema, InvoiceCreate, InvoiceUpdate, InvoiceWithClient
from app.core.deps import get_current_active_user
from app.core.constants import DEFAULT_SKIP, DEFAULT_LIMIT

router = APIRouter()

def generate_invoice_number():
    """Generate a unique invoice number"""
    return f"INV-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

@router.post("/", response_model=InvoiceSchema)
def create_invoice(
    invoice: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify client belongs to current user
    client = db.query(Client).filter(Client.id == invoice.client_id, Client.owner_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Verify project belongs to current user (if provided)
    if invoice.project_id:
        project = db.query(Project).filter(Project.id == invoice.project_id, Project.owner_id == current_user.id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
    
    # Calculate tax and total amounts
    tax_amount = invoice.amount * (invoice.tax_rate / 100)
    total_amount = invoice.amount + tax_amount
    
    db_invoice = Invoice(
        **invoice.dict(),
        owner_id=current_user.id,
        invoice_number=generate_invoice_number(),
        tax_amount=tax_amount,
        total_amount=total_amount
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.get("/", response_model=List[InvoiceWithClient])
def read_invoices(
    skip: int = DEFAULT_SKIP,
    limit: int = DEFAULT_LIMIT,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    invoices = db.query(Invoice).filter(Invoice.owner_id == current_user.id).offset(skip).limit(limit).all()
    return invoices

@router.get("/{invoice_id}", response_model=InvoiceWithClient)
def read_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.owner_id == current_user.id).first()
    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.put("/{invoice_id}", response_model=InvoiceSchema)
def update_invoice(
    invoice_id: int,
    invoice_update: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.owner_id == current_user.id).first()
    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    update_data = invoice_update.dict(exclude_unset=True)
    
    # Recalculate tax and total if amount or tax_rate changed
    if 'amount' in update_data or 'tax_rate' in update_data:
        new_amount = update_data.get('amount', invoice.amount)
        new_tax_rate = update_data.get('tax_rate', invoice.tax_rate)
        update_data['tax_amount'] = new_amount * (new_tax_rate / 100)
        update_data['total_amount'] = new_amount + update_data['tax_amount']
    
    for field, value in update_data.items():
        setattr(invoice, field, value)
    
    db.commit()
    db.refresh(invoice)
    return invoice

@router.delete("/{invoice_id}")
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.owner_id == current_user.id).first()
    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    db.delete(invoice)
    db.commit()
    return {"message": "Invoice deleted successfully"} 