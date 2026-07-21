from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import users, expenses, budgets, dashboard

# Creates tables on startup if they don't exist yet
# (equivalent to spring.jpa.hibernate.ddl-auto=update)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BudgetFlow API")

# Matches the original's @CrossOrigin(origins = "*") on every controller
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(expenses.router)
app.include_router(budgets.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    # The React frontend runs separately (via Vite on port 5173, or its own
    # build output in production) — this backend is API-only.
    return {"message": "BudgetFlow API is running"}


if __name__ == "__main__":
    import uvicorn
    # Same port as the original (server.port=8080)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8080, reload=True)