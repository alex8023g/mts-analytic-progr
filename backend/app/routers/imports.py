import asyncio

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    UploadFile,
    WebSocket,
)
from sqlalchemy.orm import Session

from app.database import get_session
from app.schemas.employee import EmployeeRead, ImportResult
from app.services import importer
from app.services.progress import hub, stream_job_events

router = APIRouter(tags=["imports"])


@router.post("/imports", response_model=ImportResult)
async def create_import(
    file: UploadFile,
    job_id: str | None = Query(
        default=None,
        description="Optional id to stream progress over /ws/imports/{job_id}.",
    ),
    session: Session = Depends(get_session),
) -> ImportResult:
    if not file.filename or not file.filename.lower().endswith(".xlsb"):
        raise HTTPException(status_code=400, detail="Ожидается файл .xlsb")

    contents = await file.read()

    loop = asyncio.get_running_loop()

    def publish(event: dict) -> None:
        if job_id:
            loop.call_soon_threadsafe(hub.publish, job_id, event)

    def report(processed: int, total: int) -> None:
        publish({"type": "progress", "processed": processed, "total": total})

    publish({"type": "status", "stage": "started"})

    try:
        summary = await asyncio.to_thread(
            importer.import_employees, contents, session, report
        )
    except ValueError as exc:
        publish({"type": "error", "detail": str(exc)})
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    result = ImportResult(
        filename=file.filename,
        total_rows=summary.total_rows,
        rows_imported=summary.imported,
        rows_deleted=summary.deleted,
        preview=[EmployeeRead.model_validate(e) for e in summary.employees[:10]],
    )
    publish({"type": "result", **result.model_dump(mode="json")})
    return result


@router.websocket("/ws/imports/{job_id}")
async def import_status_ws(websocket: WebSocket, job_id: str) -> None:
    """ Events:
        {"type": "status", "stage": "started"}
        {"type": "progress", "processed": N, "total": M} 
        {"type": "result", ...ImportResult}
        {"type": "error", "detail": "..."}
    """
    await stream_job_events(websocket, job_id)
