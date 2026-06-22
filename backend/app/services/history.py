from app.database import SessionLocal
from app.models import OperationLog


def record_operation(
    operation: str,
    status: str,
    *,
    filename: str | None = None,
    file_size: int | None = None,
    rows: int | None = None,
    detail: str | None = None,
) -> None:

    with SessionLocal() as session:
        session.add(
            OperationLog(
                operation=operation,
                status=status,
                filename=filename,
                file_size=file_size,
                rows=rows,
                detail=detail,
            )
        )
        session.commit()
