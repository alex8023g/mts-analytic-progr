from datetime import date
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.database import get_session
from app.models import Employee
from app.schemas.employee import EmployeeRead, EmployeeUpdate
from app.services.importer import _get_or_create_division

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


@router.post("/employees", response_model=EmployeeRead, status_code=201)
def create_employee(
    payload: EmployeeUpdate,
    session: Session = Depends(get_session),
) -> Employee:
    data = payload.model_dump()
    division_name = data.pop("division")
    employee = Employee(report_date=date.today(), **data)
    employee.division = _get_or_create_division(session, division_name, {})

    session.add(employee)
    session.commit()
    session.refresh(employee)
    return employee


@router.get("/employees/{id}", response_model=EmployeeRead)
def get_employee(
    id: UUID,
    session: Session = Depends(get_session),
) -> Employee:
    employee = session.get(Employee, id)
    if employee is None:
        raise HTTPException(status_code=404, detail="Сотрудник не найден")
    return employee


@router.patch("/employees/{id}", response_model=EmployeeRead)
def update_employee(
    id: UUID,
    payload: EmployeeUpdate,
    session: Session = Depends(get_session),
) -> Employee:
    employee = session.get(Employee, id)
    if employee is None:
        raise HTTPException(status_code=404, detail="Сотрудник не найден")

    data = payload.model_dump()
    division_name = data.pop("division")
    employee.division = _get_or_create_division(session, division_name, {})
    for field, value in data.items():
        setattr(employee, field, value)

    session.commit()
    session.refresh(employee)
    return employee


@router.delete("/employees/{id}", status_code=204)
def delete_employee(
    id: UUID,
    session: Session = Depends(get_session),
) -> None:
    employee = session.get(Employee, id)
    if employee is None:
        raise HTTPException(status_code=404, detail="Сотрудник не найден")
    session.delete(employee)
    session.commit()
