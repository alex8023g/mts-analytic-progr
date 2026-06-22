from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_session
from app.models import OperationLog
from app.schemas.operation_log import OperationLogRead

router = APIRouter(tags=["history"])


@router.get("/history", response_model=list[OperationLogRead])
def list_history(
    limit: int = Query(default=100, ge=1, le=500),
    session: Session = Depends(get_session),
) -> list[OperationLog]:
    stmt = (
        select(OperationLog)
        .order_by(OperationLog.created_at.desc())
        .limit(limit)
    )
    return list(session.scalars(stmt))
