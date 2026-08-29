"""
Seeds the database with a demo user and 6 months of realistic expense history
(100+ transactions) plus a monthly budget for each month.
Safe to re-run — skips seeding if the demo user already exists.

Usage:
    python -m app.seed
"""

import random
from datetime import date, timedelta
from calendar import monthrange

from app.database import SessionLocal, engine, Base
from app import models

SEED_EMAIL = "demo@budgetflow.com"
SEED_PASSWORD = "demo1234"

# Recurring items that show up (roughly) every month, with realistic price variance
RECURRING_ITEMS = [
    ("Vercel Pro", "Hosting", (18, 22), "Monthly hosting plan"),
    ("AWS EC2 + S3", "Hosting", (25, 60), "Cloud infra usage"),
    ("OpenAI API", "APIs", (20, 90), "GPT API usage"),
    ("Anthropic API", "APIs", (15, 70), "Claude API usage"),
    ("GitHub Copilot", "Subscriptions", (10, 10), "Monthly plan"),
    ("Figma", "Subscriptions", (15, 15), "Team plan"),
    ("Notion", "Subscriptions", (8, 12), "Team workspace"),
    ("Linear", "Subscriptions", (8, 10), "Issue tracker"),
    ("Railway", "Hosting", (5, 20), "Backend hosting"),
    ("Resend API", "APIs", (5, 15), "Transactional email"),
]

# One-off items that appear on some months only
OCCASIONAL_ITEMS = [
    ("budgetflow.com", "Domains", (10, 15), "Domain renewal"),
    ("devexpense.io", "Domains", (10, 15), "Domain renewal"),
    ("Frontend Masters", "Courses", (35, 45), "Course subscription"),
    ("Udemy Course", "Courses", (10, 20), "React advanced course"),
    ("Postman Team", "APIs", (12, 18), "API testing tool"),
    ("DigitalOcean Droplet", "Hosting", (5, 20), "Staging server"),
    ("Stripe API", "APIs", (5, 30), "Payment processing fees"),
    ("Namecheap SSL", "Domains", (8, 12), "SSL certificate"),
    ("Coursera Plus", "Courses", (40, 50), "Annual learning subscription"),
    ("1Password Teams", "Subscriptions", (8, 8), "Password manager"),
    ("Sentry", "Subscriptions", (10, 26), "Error monitoring"),
    ("Cloudflare Workers", "Hosting", (5, 25), "Edge compute usage"),
    ("Twilio API", "APIs", (5, 20), "SMS/notifications"),
    ("Google Domains", "Domains", (10, 15), "Domain renewal"),
]

MONTHLY_BUDGET = 250.0


def _random_day_in_month(year: int, month: int) -> date:
    last_day = monthrange(year, month)[1]
    return date(year, month, random.randint(1, last_day))


def _month_string(year: int, month: int) -> str:
    return f"{year}-{month:02d}"


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    random.seed(42)  # reproducible dataset across runs

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
        expense_count = 0

        # Generate 6 months of history, oldest to most recent
        for months_back in range(5, -1, -1):
            year = today.year
            month = today.month - months_back
            while month <= 0:
                month += 12
                year -= 1

            # Every recurring item shows up this month, with some price variance
            for title, category, price_range, desc in RECURRING_ITEMS:
                amount = round(random.uniform(*price_range), 2)
                db.add(models.Expense(
                    title=title, amount=amount, category=category, description=desc,
                    date=_random_day_in_month(year, month), user_id=user.id,
                ))
                expense_count += 1

            # 5-8 occasional items show up at random each month
            for title, category, price_range, desc in random.sample(OCCASIONAL_ITEMS, k=random.randint(6, 9)):
                amount = round(random.uniform(*price_range), 2)
                db.add(models.Expense(
                    title=title, amount=amount, category=category, description=desc,
                    date=_random_day_in_month(year, month), user_id=user.id,
                ))
                expense_count += 1

            # Set a budget for this month too
            db.add(models.Budget(
                monthly_limit=MONTHLY_BUDGET, month=_month_string(year, month), user_id=user.id,
            ))

        db.commit()
        print(f"Added {expense_count} expenses across 6 months.")
        print(f"Set a ₹{MONTHLY_BUDGET:.0f} budget for each of the 6 months.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()