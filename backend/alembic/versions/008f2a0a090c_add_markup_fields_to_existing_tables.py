"""Add markup fields to existing tables

Revision ID: 008f2a0a090c
Revises: 6087350756df
Create Date: 2025-06-27 00:18:02.761374

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '008f2a0a090c'
down_revision: Union[str, None] = '6087350756df'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add company markup defaults to company_settings table
    op.add_column('company_settings', sa.Column('default_material_markup_percent', sa.Numeric(precision=7, scale=4), server_default='0.0', nullable=True))
    op.add_column('company_settings', sa.Column('default_labor_markup_percent', sa.Numeric(precision=7, scale=4), server_default='0.0', nullable=True))
    
    # Add markup fields to projects table
    op.add_column('projects', sa.Column('material_markup_type', sa.String(length=10), server_default='percent', nullable=True))
    op.add_column('projects', sa.Column('material_markup_percent', sa.Numeric(precision=7, scale=4), server_default='0.0', nullable=True))
    op.add_column('projects', sa.Column('material_markup_flat', sa.Numeric(precision=10, scale=2), server_default='0.0', nullable=True))
    op.add_column('projects', sa.Column('labor_markup_type', sa.String(length=10), server_default='percent', nullable=True))
    op.add_column('projects', sa.Column('labor_markup_percent', sa.Numeric(precision=7, scale=4), server_default='0.0', nullable=True))
    op.add_column('projects', sa.Column('labor_markup_flat', sa.Numeric(precision=10, scale=2), server_default='0.0', nullable=True))
    
    # Add discount fields to projects table
    op.add_column('projects', sa.Column('material_discount_type', sa.String(length=10), server_default='percent', nullable=True))
    op.add_column('projects', sa.Column('material_discount_percent', sa.Numeric(precision=7, scale=4), server_default='0.0', nullable=True))
    op.add_column('projects', sa.Column('material_discount_flat', sa.Numeric(precision=10, scale=2), server_default='0.0', nullable=True))
    op.add_column('projects', sa.Column('labor_discount_type', sa.String(length=10), server_default='percent', nullable=True))
    op.add_column('projects', sa.Column('labor_discount_percent', sa.Numeric(precision=7, scale=4), server_default='0.0', nullable=True))
    op.add_column('projects', sa.Column('labor_discount_flat', sa.Numeric(precision=10, scale=2), server_default='0.0', nullable=True))
    op.add_column('projects', sa.Column('project_discount_type', sa.String(length=10), server_default='percent', nullable=True))
    op.add_column('projects', sa.Column('project_discount_percent', sa.Numeric(precision=7, scale=4), server_default='0.0', nullable=True))
    op.add_column('projects', sa.Column('project_discount_flat', sa.Numeric(precision=10, scale=2), server_default='0.0', nullable=True))


def downgrade() -> None:
    # Remove markup and discount fields from projects table
    op.drop_column('projects', 'project_discount_flat')
    op.drop_column('projects', 'project_discount_percent')
    op.drop_column('projects', 'project_discount_type')
    op.drop_column('projects', 'labor_discount_flat')
    op.drop_column('projects', 'labor_discount_percent')
    op.drop_column('projects', 'labor_discount_type')
    op.drop_column('projects', 'material_discount_flat')
    op.drop_column('projects', 'material_discount_percent')
    op.drop_column('projects', 'material_discount_type')
    op.drop_column('projects', 'labor_markup_flat')
    op.drop_column('projects', 'labor_markup_percent')
    op.drop_column('projects', 'labor_markup_type')
    op.drop_column('projects', 'material_markup_flat')
    op.drop_column('projects', 'material_markup_percent')
    op.drop_column('projects', 'material_markup_type')
    
    # Remove company markup defaults
    op.drop_column('company_settings', 'default_labor_markup_percent')
    op.drop_column('company_settings', 'default_material_markup_percent')
