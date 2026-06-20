from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_session
from app.models import Division
from app.schemas.division import DivisionRead

router = APIRouter(tags=["departments"])


@router.get("/departments", response_model=list[DivisionRead])
def list_divisions(
    session: Session = Depends(get_session),
) -> list[Division]:
    stmt = select(Division).order_by(Division.name)
    return list(session.scalars(stmt))
