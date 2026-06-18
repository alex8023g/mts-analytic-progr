from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_session
from app.models import Employee
from app.schemas.employee import EmployeeRead

router = APIRouter(tags=["employees"])


@router.get("/employees", response_model=list[EmployeeRead])
def list_employees(
    session: Session = Depends(get_session),
) -> list[Employee]:
    return list(session.scalars(select(Employee).order_by(Employee.id)))
