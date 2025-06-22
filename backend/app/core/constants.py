"""
Application constants for BuildCraftPro.

This module defines all status values, priorities, and configuration constants
used throughout the application to ensure consistency and prevent typos.
"""

# Project Status Constants
PROJECT_STATUS_PLANNING = "planning"
PROJECT_STATUS_IN_PROGRESS = "in_progress" 
PROJECT_STATUS_COMPLETED = "completed"
PROJECT_STATUS_ON_HOLD = "on_hold"

PROJECT_STATUSES = [
    PROJECT_STATUS_PLANNING,
    PROJECT_STATUS_IN_PROGRESS,
    PROJECT_STATUS_COMPLETED,
    PROJECT_STATUS_ON_HOLD
]

# Task Status Constants
TASK_STATUS_PENDING = "pending"
TASK_STATUS_IN_PROGRESS = "in_progress"
TASK_STATUS_COMPLETED = "completed"

TASK_STATUSES = [
    TASK_STATUS_PENDING,
    TASK_STATUS_IN_PROGRESS,
    TASK_STATUS_COMPLETED
]

# Task Priority Constants
TASK_PRIORITY_LOW = "low"
TASK_PRIORITY_MEDIUM = "medium"
TASK_PRIORITY_HIGH = "high"

TASK_PRIORITIES = [
    TASK_PRIORITY_LOW,
    TASK_PRIORITY_MEDIUM,
    TASK_PRIORITY_HIGH
]

# Invoice Status Constants
INVOICE_STATUS_DRAFT = "draft"
INVOICE_STATUS_SENT = "sent"
INVOICE_STATUS_PAID = "paid"
INVOICE_STATUS_OVERDUE = "overdue"

INVOICE_STATUSES = [
    INVOICE_STATUS_DRAFT,
    INVOICE_STATUS_SENT,
    INVOICE_STATUS_PAID,
    INVOICE_STATUS_OVERDUE
]

# Configuration Constants
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Pagination Constants
DEFAULT_SKIP = 0
DEFAULT_LIMIT = 100 