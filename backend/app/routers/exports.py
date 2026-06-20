from datetime import date
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.database import get_session
from app.models import Division, Employee
from app.services.exporter import (
    build_divisions_xlsx,
    build_employees_and_divisions_xlsx,
    build_employees_xlsx,
)

router = APIRouter(tags=["exports"])

XLSX_MEDIA_TYPE = (
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
)


@router.get("/export")
def export_employees(
    full_name: str | None = Query(default=None),
    relevance_date: date | None = Query(default=None),
    status: Literal["employed", "fired"] | None = Query(default=None),
    division: UUID | None = Query(default=None),
    session: Session = Depends(get_session),
    exports: Literal["employees", "departments"] | None = Query(default=None)
) -> StreamingResponse:

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

    def load_employees() -> list[Employee]:
        return list(session.scalars(stmt))

    def load_divisions() -> list[Division]:
        return list(
            session.scalars(select(Division).order_by(Division.name))
        )

    if exports == "employees":
        content = build_employees_xlsx(load_employees(), relevance_date)
        name = "employees"
    elif exports == "departments":
        content = build_divisions_xlsx(load_divisions())
        name = "departments"
    else:
        content = build_employees_and_divisions_xlsx(
            load_employees(), load_divisions(), relevance_date
        )
        name = "employees_departments"

    filename = f"{name}_{date.today().isoformat()}.xlsx"
    return StreamingResponse(
        iter([content]),
        media_type=XLSX_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
