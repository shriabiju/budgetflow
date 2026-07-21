from datetime import date as date_type
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


@router.post("", response_model=schemas.ExpenseOut)
def add_expense(dto: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == dto.userId).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found!")

    expense = models.Expense(
        title=dto.title,
        amount=dto.amount,
        category=dto.category,
        description=dto.description,
        date=dto.date,
        user_id=dto.userId,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.get("/user/{user_id}", response_model=List[schemas.ExpenseOut])
def get_expenses(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.Expense).filter(models.Expense.user_id == user_id).all()


@router.get("/user/{user_id}/category/{category}", response_model=List[schemas.ExpenseOut])
def get_by_category(user_id: int, category: str, db: Session = Depends(get_db)):
    return (
        db.query(models.Expense)
        .filter(models.Expense.user_id == user_id, models.Expense.category == category)
        .all()
    )


@router.get("/user/{user_id}/date", response_model=List[schemas.ExpenseOut])
def get_by_date_range(user_id: int, start: date_type, end: date_type, db: Session = Depends(get_db)):
    return (
        db.query(models.Expense)
        .filter(
            models.Expense.user_id == user_id,
            models.Expense.date >= start,
            models.Expense.date <= end,
        )
        .all()
    )


@router.put("/{expense_id}", response_model=schemas.ExpenseOut)
def update_expense(expense_id: int, dto: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found!")

    expense.title = dto.title
    expense.amount = dto.amount
    expense.category = dto.category
    expense.description = dto.description
    expense.date = dto.date
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found!")
    db.delete(expense)
    db.commit()
    return "Expense deleted successfully!"


@router.get("/user/{user_id}/total", response_model=float)
def get_total_spending(user_id: int, db: Session = Depends(get_db)):
    total = (
        db.query(func.sum(models.Expense.amount))
        .filter(models.Expense.user_id == user_id)
        .scalar()
    )
    return total if total is not None else 0.0