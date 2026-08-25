from datetime import date
from typing import Optional, Dict

from pydantic import BaseModel, ConfigDict


# ---------- User ----------

class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    # Note: password is intentionally excluded from responses.
    # (The original Spring DTO returned it, but leaving it out here is safer
    # and doesn't change anything the frontend reads from the login/register response.)


# ---------- Expense ----------

class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    description: Optional[str] = None
    date: date
    userId: int


class ExpenseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    title: str
    amount: float
    category: str
    description: Optional[str] = None
    date: date


# ---------- Budget ----------

class BudgetCreate(BaseModel):
    monthlyLimit: float
    month: str  # Format: "2024-01"
    userId: int


class BudgetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    monthlyLimit: float
    month: str
    userId: int

    @classmethod
    def from_model(cls, budget):
        return cls(
            id=budget.id,
            monthlyLimit=budget.monthly_limit,
            month=budget.month,
            userId=budget.user_id,
        )


# ---------- Dashboard ----------

class DashboardOut(BaseModel):
    totalMonthlySpending: float
    monthlyBudget: float
    remainingBudget: float
    categoryWiseSpending: Dict[str, float]
    currentMonthSpending: float
    previousMonthSpending: float
    percentChangeFromLastMonth: float