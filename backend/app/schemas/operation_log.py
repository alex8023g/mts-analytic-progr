from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class OperationLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    operation: str
    status: str
    filename: str | None
    file_size: int | None
    rows: int | None
    detail: str | None
    created_at: datetime
