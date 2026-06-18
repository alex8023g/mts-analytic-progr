import io
from datetime import date

import pandas as pd
from sqlalchemy.orm import Session

from app.models import Employee

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


def _to_employee(record: dict, report_date: date) -> Employee:
    salary = record.get("salary")
    return Employee(
        report_date=report_date,
        department=record.get("department"),
        division=record.get("division"),
        position=record.get("position"),
        manager=record.get("manager"),
        full_name=record.get("full_name"),
        hired_at=_as_date(record.get("hired_at")),
        fired_at=_as_date(record.get("fired_at")),
        staff_type=record.get("staff_type"),
        salary=int(salary) if salary is not None else None,
    )


def _as_date(value) -> date | None:
    if value is None:
        return None
    return value.date() if hasattr(value, "date") else value


def import_employees(contents: bytes, session: Session) -> tuple[int, list[Employee]]:
    """Parse the file"""
    report_date = _read_report_date(contents)
    df = _read_dataframe(contents)
    employees = [
        _to_employee(rec, report_date) for rec in df.to_dict(orient="records")
    ]

    session.add_all(employees)
    session.commit()
    for employee in employees:
        session.refresh(employee)

    return len(employees), employees
