import uuid
from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class OperationLog(Base):

    __tablename__ = "operation_logs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)

    operation: Mapped[str] = mapped_column(String, index=True)  # "import" | "export"
    status: Mapped[str] = mapped_column(String)  # "success" | "error"
    filename: Mapped[str | None] = mapped_column(String)  # имя файла
    file_size: Mapped[int | None] = mapped_column(Integer)  # размер файла в байтах
    rows: Mapped[int | None] = mapped_column(Integer)  # сколько строк обработано
    detail: Mapped[str | None] = mapped_column(String)  # текст ошибки, если была
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
