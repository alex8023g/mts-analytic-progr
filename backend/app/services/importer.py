import io
import uuid
from dataclasses import dataclass
from datetime import date

import pandas as pd
from sqlalchemy import delete, or_, select
from sqlalchemy.orm import Session

from app.models import Division, Employee


@dataclass
class ImportSummary:
    total_rows: int  # сколько строк сотрудников было в файле
    imported: int  # сколько записей в итоге сохранено
    deleted: int  # сколько существующих записей удалено как устаревшие
    employees: list[Employee]

COLUMN_MAP = {
    "Департамент": "department",
    "Отдел": "division",
    "Должность": "position",
    "Руководитель": "manager",
    "ФИО сотрудника": "full_name",
    "Дата приема на работу": "hired_at",
    "Дата увольнения": "fired_at",
    "Штат": "staff_type",
    "заработная плата": "salary",
}
DATE_COLUMNS = ("Дата приема на работу", "Дата увольнения")


def _parse_dates(series: pd.Series) -> pd.Series:
    """Normalize date column"""
    nums = pd.to_numeric(series, errors="coerce")
    from_serial = pd.to_datetime(
        nums, unit="D", origin="1899-12-30", errors="coerce"
    )
    from_string = pd.to_datetime(
        series.where(nums.isna()), dayfirst=True, errors="coerce"
    )
    combined = from_serial.fillna(from_string)
    return combined.dt.date.where(combined.notna(), None)


def _read_report_date(contents: bytes) -> date:
    """Read export date from the first row of the file."""
    head = pd.read_excel(io.BytesIO(contents), engine="pyxlsb", header=None, nrows=1)
    parsed = _parse_dates(head.iloc[0]).dropna()
    if parsed.empty:
        raise ValueError("В первой строке файла не найдена дата выгрузки")
    return parsed.iloc[0]


def _read_dataframe(contents: bytes) -> pd.DataFrame:
    try:
        # header is row 1
        df = pd.read_excel(
            io.BytesIO(contents), engine="pyxlsb", header=1, skiprows=[2]
        )
    except Exception as exc:  # noqa: BLE001 - reported to the client as 400
        raise ValueError(f"Не удалось прочитать файл: {exc}") from exc

    df = df.dropna(axis=1, how="all")

    for col in DATE_COLUMNS:
        if col in df.columns:
            df[col] = _parse_dates(df[col])

    df = df.rename(columns=COLUMN_MAP)
    keep = [attr for attr in COLUMN_MAP.values() if attr in df.columns]
    df = df[keep]
    return df.astype(object).where(pd.notnull(df), None)


def _to_employee(
    record: dict, report_date: date, division: Division | None
) -> Employee:
    salary = record.get("salary")
    return Employee(
        report_date=report_date,
        department=record.get("department"),
        division=division,
        position=record.get("position"),
        manager=record.get("manager"),
        full_name=record.get("full_name"),
        hired_at=_as_date(record.get("hired_at")),
        fired_at=_as_date(record.get("fired_at")),
        staff_type=record.get("staff_type"),
        salary=int(salary) if salary is not None else None,
    )


def _get_or_create_division(
    session: Session, name: str | None, cache: dict[str, Division]
) -> Division | None:
    if name is None:
        return None
    if name in cache:
        return cache[name]
    division = session.scalars(
        select(Division).where(Division.name == name)
    ).first()
    if division is None:
        division = Division(name=name)
        session.add(division)
        session.flush()
    cache[name] = division
    return division


def _as_date(value) -> date | None:
    if value is None:
        return None
    return value.date() if hasattr(value, "date") else value


def _has_fired_record(
    session: Session, full_name: str, division_id: uuid.UUID | None
) -> bool:
    stmt = select(Employee.id).where(
        Employee.full_name == full_name,
        Employee.division_id == division_id,
        Employee.fired_at.is_not(None),
    )
    return session.scalars(stmt).first() is not None


def _delete_active_records(
    session: Session, full_name: str, division_id: uuid.UUID | None, hired_at: date
) -> list[Employee]:
    stmt = select(Employee).where(
        Employee.full_name == full_name,
        or_(
            Employee.division_id == division_id,
            Employee.hired_at == hired_at,
        ),
        Employee.fired_at.is_(None),
    )
    deleted = list(session.scalars(stmt))
    for dup in deleted:
        session.delete(dup)
    return deleted


def _clear_tables(session: Session) -> None:
    session.execute(delete(Employee))
    session.execute(delete(Division))
    session.flush()


def import_employees(contents: bytes, session: Session) -> ImportSummary:
    """Parse the file"""
    report_date = _read_report_date(contents)
    df = _read_dataframe(contents)

    _clear_tables(session)

    total_rows = len(df)
    deleted = 0
    divisions: dict[str, Division] = {}
    added: list[Employee] = []
    for rec in df.to_dict(orient="records"):
        division = _get_or_create_division(session, rec.get("division"), divisions)
        division_id = division.id if division else None
        employee = _to_employee(rec, report_date, division)

        if employee.fired_at is None:
            if _has_fired_record(session, employee.full_name, division_id):
                continue
        else:
            dups = _delete_active_records(
                session, employee.full_name, division_id, employee.hired_at
            )
            deleted += len(dups)
            for dup in dups:
                if dup in added:
                    added.remove(dup)

        session.add(employee)
        session.flush()
        added.append(employee)

    session.commit()
    for employee in added:
        session.refresh(employee)

    return ImportSummary(
        total_rows=total_rows,
        imported=len(added),
        deleted=deleted,
        employees=added,
    )
