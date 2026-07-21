# BudgetFlow 💰

A full-stack personal finance management app — track expenses, set monthly budgets, and visualize spending by category.

## Tech Stack

- **Frontend:** React.js, React Router, Chart.js (via react-chartjs-2), Bootstrap 5
- **Backend:** FastAPI, Python
- **ORM:** SQLAlchemy
- **Database:** PostgreSQL

## Features

- User registration and login
- Add, edit, delete, and filter expenses by category
- Set and update monthly budgets, with automatic upsert per month
- Dashboard with real-time stat cards, category-wise doughnut chart, and spending bar chart
- Budget overview with a live progress bar (color-shifts past 80% usage) and spent-vs-remaining doughnut chart

## Project Structure

```
budgetflow/
├── app/                  # FastAPI backend
│   ├── main.py           # App entrypoint, routing, CORS setup
│   ├── database.py       # SQLAlchemy engine/session
│   ├── models.py         # User, Expense, Budget tables
│   ├── schemas.py        # Pydantic request/response schemas
│   └── routers/          # users, expenses, budgets, dashboard endpoints
├── frontend/              # React (Vite) frontend
│   └── src/
│       ├── pages/         # Login, Register, Dashboard, Expenses, Budget
│       └── components/    # Shared Navbar
├── requirements.txt
├── .env.example
└── .gitignore
```

## Setup

### Backend

```bash
pip install -r requirements.txt
cp .env.example .env   # fill in your PostgreSQL credentials
python -m app.main
```

Runs on `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` in dev mode (talks to the backend on port 8080).

## 📸 Screenshots

### Login Page
![Login Page](./screenshots/login.png)


### Dashboard
![Dashboard](./screenshots/dashboard1.png)
![Dashboard](./screenshots/dashboard2.png)


### Expense Management
![Expense Management](./screenshots/expense.png)


### Budget Management
![Budget Management](./screenshots/budget.png)


## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register` | Register a new user |
| POST | `/api/users/login` | Login with email/password |
| GET | `/api/users/{id}` | Get user by ID |
| POST | `/api/expenses` | Add an expense |
| GET | `/api/expenses/user/{id}` | Get all expenses for a user |
| GET | `/api/expenses/user/{id}/category/{category}` | Filter by category |
| GET | `/api/expenses/user/{id}/date?start=&end=` | Filter by date range |
| PUT | `/api/expenses/{id}` | Update an expense |
| DELETE | `/api/expenses/{id}` | Delete an expense |
| GET | `/api/expenses/user/{id}/total` | Total spending |
| POST | `/api/budgets` | Set or update a monthly budget |
| GET | `/api/budgets/user/{id}/month/{month}` | Get budget for a month |
| GET | `/api/budgets/user/{id}/month/{month}/remaining` | Remaining budget |
| GET | `/api/dashboard/user/{id}/month/{month}` | Aggregated dashboard data |