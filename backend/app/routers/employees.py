from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_session
from app.models import Employee
from app.schemas.employee import EmployeeRead

router = APIRouter(tags=["employees"])


@router.get("/employees", response_model=list[EmployeeRead])
def list_employees(
    full_name: str | None = Query(default=None),
    relevance_date: date | None = Query(default=None),
    session: Session = Depends(get_session),
) -> list[Employee]:
    stmt = select(Employee).order_by(Employee.full_name)

    if full_name:
        stmt = stmt.where(Employee.full_name.ilike(f"%{full_name}%"))

    if relevance_date:
        stmt = stmt.where(Employee.hired_at <= relevance_date)

    return list(session.scalars(stmt))
