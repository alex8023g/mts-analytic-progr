import asyncio
from datetime import date
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Query, WebSocket
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
from app.services.progress import hub, stream_job_events

router = APIRouter(tags=["exports"])

XLSX_MEDIA_TYPE = (
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
)


@router.get("/export")
async def export_employees(
    full_name: str | None = Query(default=None),
    relevance_date: date | None = Query(default=None),
    status: Literal["employed", "fired"] | None = Query(default=None),
    division: UUID | None = Query(default=None),
    session: Session = Depends(get_session),
    exports: Literal["employees", "departments"] | None = Query(default=None),
    job_id: str | None = Query(
        default=None,
        description="Optional id to stream progress over /ws/exports/{job_id}.",
    ),
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

    loop = asyncio.get_running_loop()

    def publish(event: dict) -> None:
        if job_id:
            loop.call_soon_threadsafe(hub.publish, job_id, event)

    def report(processed: int, total: int) -> None:
        publish({"type": "progress", "processed": processed, "total": total})

    def load_employees() -> list[Employee]:
        return list(session.scalars(stmt))

    def load_divisions() -> list[Division]:
        return list(
            session.scalars(select(Division).order_by(Division.name))
        )

    def build() -> tuple[bytes, str]:
        if exports == "employees":
            return build_employees_xlsx(load_employees(), relevance_date, report), (
                "employees"
            )
        if exports == "departments":
            return build_divisions_xlsx(load_divisions(), report), "departments"
        return (
            build_employees_and_divisions_xlsx(
                load_employees(), load_divisions(), relevance_date, report
            ),
            "employees_departments",
        )

    publish({"type": "status", "stage": "started"})

    try:
        content, name = await asyncio.to_thread(build)
    except Exception as exc: 
        publish({"type": "error", "detail": "Не удалось сформировать экспорт"})
        raise exc

    filename = f"{name}_{date.today().isoformat()}.xlsx"
    publish({"type": "result", "filename": filename})
    return StreamingResponse(
        iter([content]),
        media_type=XLSX_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.websocket("/ws/exports/{job_id}")
async def export_status_ws(websocket: WebSocket, job_id: str) -> None:
    """Events:
        {"type": "status", "stage": "started"}
        {"type": "progress", "processed": N, "total": M} 
        {"type": "result", "filename": "..."} 
        {"type": "error", "detail": "..."}
    """
    await stream_job_events(websocket, job_id)
