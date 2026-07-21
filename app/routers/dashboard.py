from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health"]


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

    return schemas.DashboardOut(
        totalMonthlySpending=total_spending,
        monthlyBudget=monthly_budget,
        remainingBudget=remaining_budget,
        categoryWiseSpending=category_spending,
    )