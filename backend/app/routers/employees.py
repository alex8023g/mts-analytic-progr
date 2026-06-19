from datetime import date
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.database import get_session
from app.models import Employee
from app.schemas.employee import EmployeeRead

router = APIRouter(tags=["employees"])


@router.get("/employees", response_model=list[EmployeeRead])
def list_employees(
    full_name: str | None = Query(default=None),
    relevance_date: date | None = Query(default=None),
    status: Literal["employed", "fired"] | None = Query(default=None),
    division: UUID | None = Query(default=None),
    session: Session = Depends(get_session),
) -> list[Employee]:
    stmt = select(Employee).order_by(Employee.full_name)

    if full_name:
        stmt = stmt.where(Employee.full_name.ilike(f"%{full_name}%"))

    if division:
        stmt = stmt.where(Employee.division_id == division)

    if relevance_date:
        stmt = stmt.where(Employee.hired_at <= relevance_date)

    if status:
        ref_date = relevance_date or date.today()
        if status == "fired":
            stmt = stmt.where(
                Employee.fired_at.is_not(None), Employee.fired_at <= ref_date
            )
        else:
            stmt = stmt.where(
                or_(Employee.fired_at.is_(None), Employee.fired_at > ref_date)
            )

    return list(session.scalars(stmt))
