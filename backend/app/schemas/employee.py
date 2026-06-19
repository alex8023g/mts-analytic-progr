from datetime import date
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator


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

    @field_validator("division", mode="before")
    @classmethod
    def _division_name(cls, value):
        """Отдаём имя отдела из связанной записи Division (или None)."""
        if value is None or isinstance(value, str):
            return value
        return value.name


class EmployeeUpdate(BaseModel):
    full_name: str
    position: str
    department: str
    manager: str | None = None
    staff_type: str
    salary: int
    hired_at: date
    fired_at: date | None = None
    division: str | None = None


class ImportResult(BaseModel):
    filename: str
    rows_imported: int
    preview: list[EmployeeRead]
