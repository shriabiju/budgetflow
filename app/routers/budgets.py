from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/budgets", tags=["budgets"])


@router.post("", response_model=schemas.BudgetOut)
def set_budget(dto: schemas.BudgetCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == dto.userId).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found!")

    existing = (
        db.query(models.Budget)
        .filter(models.Budget.user_id == dto.userId, models.Budget.month == dto.month)
        .first()
    )

    if existing:
        existing.monthly_limit = dto.monthlyLimit
        db.commit()
        db.refresh(existing)
        return schemas.BudgetOut.from_model(existing)

    budget = models.Budget(monthly_limit=dto.monthlyLimit, month=dto.month, user_id=dto.userId)
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return schemas.BudgetOut.from_model(budget)


@router.get("/user/{user_id}/month/{month}", response_model=schemas.BudgetOut)
def get_budget(user_id: int, month: str, db: Session = Depends(get_db)):
    budget = (
        db.query(models.Budget)
        .filter(models.Budget.user_id == user_id, models.Budget.month == month)
        .first()
    )
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found!")
    return schemas.BudgetOut.from_model(budget)


@router.get("/user/{user_id}/month/{month}/remaining", response_model=float)
def get_remaining(user_id: int, month: str, db: Session = Depends(get_db)):
    budget = (
        db.query(models.Budget)
        .filter(models.Budget.user_id == user_id, models.Budget.month == month)
        .first()
    )
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found!")

    # Matches original behavior: total spending is across ALL of the user's
    # expenses (not filtered to this month) — kept identical intentionally.
    total_spent = (
        db.query(func.sum(models.Expense.amount))
        .filter(models.Expense.user_id == user_id)
        .scalar()
    ) or 0.0

    return budget.monthly_limit - total_spent