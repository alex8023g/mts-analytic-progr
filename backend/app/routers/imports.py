from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_session
from app.schemas.employee import EmployeeRead, ImportResult
from app.services import importer

router = APIRouter(tags=["imports"])


@router.post("/imports", response_model=ImportResult)
async def create_import(
    file: UploadFile,
    session: Session = Depends(get_session),
) -> ImportResult:
    if not file.filename or not file.filename.lower().endswith(".xlsb"):
        raise HTTPException(status_code=400, detail="Ожидается файл .xlsb")

    contents = await file.read()

    try:
        count, employees = importer.import_employees(contents, session)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return ImportResult(
        filename=file.filename,
        rows_imported=count,
        preview=[EmployeeRead.model_validate(e) for e in employees[:10]],
    )
