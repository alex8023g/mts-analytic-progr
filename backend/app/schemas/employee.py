from datetime import date
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class EmployeeRead(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    report_date: date
    department: str
    division: str | None
    position: str
    manager: str | None
    full_name: str
    hired_at: date
    fired_at: date | None
    staff_type: str
    salary: int


class ImportResult(BaseModel):
    filename: str
    rows_imported: int
    preview: list[EmployeeRead]
