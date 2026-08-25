"""
Seeds the database with a demo user, some sample expenses, and a budget.
Safe to re-run — skips seeding if the demo user already exists.

Usage:
    python -m app.seed
"""

from datetime import date, timedelta

from app.database import SessionLocal, engine, Base
from app import models

SEED_EMAIL = "demo@budgetflow.com"
SEED_PASSWORD = "demo1234"

SAMPLE_EXPENSES = [
    ("Vercel Pro", 20.0, "Hosting", "Monthly hosting plan", 0),
    ("OpenAI API", 45.5, "APIs", "GPT API usage", 2),
    ("budgetflow.com", 12.0, "Domains", "Domain renewal", 5),
    ("Frontend Masters", 39.0, "Courses", "Annual subscription", 8),
    ("GitHub Copilot", 10.0, "Subscriptions", "Monthly plan", 10),
    ("Figma", 15.0, "Subscriptions", "Team plan", 15),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        existing = db.query(models.User).filter(models.User.email == SEED_EMAIL).first()
        if existing:
            print(f"Demo user already exists (id={existing.id}) — skipping seed.")
            return

        user = models.User(name="Demo User", email=SEED_EMAIL, password=SEED_PASSWORD)
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created demo user: {SEED_EMAIL} / {SEED_PASSWORD} (id={user.id})")

        today = date.today()
        for title, amount, category, description, days_ago in SAMPLE_EXPENSES:
            expense = models.Expense(
                title=title,
                amount=amount,
                category=category,
                description=description,
                date=today - timedelta(days=days_ago),
                user_id=user.id,
            )
            db.add(expense)
        db.commit()
        print(f"Added {len(SAMPLE_EXPENSES)} sample expenses.")

        month_str = f"{today.year}-{today.month:02d}"
        budget = models.Budget(monthly_limit=200.0, month=month_str, user_id=user.id)
        db.add(budget)
        db.commit()
        print(f"Set budget of ₹200 for {month_str}.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()