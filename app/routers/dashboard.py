from datetime import date
from calendar import monthrange

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

CATEGORIES = ["Hosting", "APIs", "Domains", "Courses", "Subscriptions", "Other"]


def _month_bounds(month: str):
    """'2026-07' -> (date(2026,7,1), date(2026,7,31))"""
    year, mon = map(int, month.split("-"))
    start = date(year, mon, 1)
    end = date(year, mon, monthrange(year, mon)[1])
    return start, end


def _previous_month(month: str) -> str:
    year, mon = map(int, month.split("-"))
    if mon == 1:
        return f"{year - 1}-12"
    return f"{year}-{mon - 1:02d}"


def _spending_in_month(db: Session, user_id: int, month: str) -> float:
    start, end = _month_bounds(month)
    total = (
        db.query(func.sum(models.Expense.amount))
        .filter(
            models.Expense.user_id == user_id,
            models.Expense.date >= start,
            models.Expense.date <= end,
        )
        .scalar()
    )
    return total or 0.0


@router.get("/user/{user_id}/month/{month}", response_model=schemas.DashboardOut)
def get_dashboard(user_id: int, month: str, db: Session = Depends(get_db)):
    # Note: matches original behavior — this is the user's ALL-TIME total,
    # not filtered to `month`. The original computed a month start/end range
    # but never actually used it in the query. Kept identical intentionally.
    total_spending = (
        db.query(func.sum(models.Expense.amount))
        .filter(models.Expense.user_id == user_id)
        .scalar()
    ) or 0.0

    monthly_budget = 0.0
    remaining_budget = 0.0
    budget = (
        db.query(models.Budget)
        .filter(models.Budget.user_id == user_id, models.Budget.month == month)
        .first()
    )
    if budget:
        monthly_budget = budget.monthly_limit
        remaining_budget = monthly_budget - total_spending

    category_spending = {}
    for category in CATEGORIES:
        amount = (
            db.query(func.sum(models.Expense.amount))
            .filter(models.Expense.user_id == user_id, models.Expense.category == category)
            .scalar()
        )
        category_spending[category] = amount if amount is not None else 0.0

    # NEW: month-over-month comparison — this IS properly scoped to each
    # month's actual date range (unlike totalMonthlySpending above, which
    # is a legacy all-time figure kept for backward compatibility).
    current_month_spending = _spending_in_month(db, user_id, month)
    previous_month_spending = _spending_in_month(db, user_id, _previous_month(month))

    if previous_month_spending > 0:
        percent_change = ((current_month_spending - previous_month_spending) / previous_month_spending) * 100
    elif current_month_spending > 0:
        percent_change = 100.0
    else:
        percent_change = 0.0

    return schemas.DashboardOut(
        totalMonthlySpending=total_spending,
        monthlyBudget=monthly_budget,
        remainingBudget=remaining_budget,
        categoryWiseSpending=category_spending,
        currentMonthSpending=current_month_spending,
        previousMonthSpending=previous_month_spending,
        percentChangeFromLastMonth=percent_change,
    )