import io
from collections.abc import Iterable
from datetime import date

from openpyxl import Workbook
from openpyxl.styles import Font
from openpyxl.utils import get_column_letter

from app.models import Employee

COLUMNS: list[tuple[str, int]] = [
    ("ФИО", 32),
    ("Должность", 28),
    ("Департамент", 28),
    ("Отдел", 24),
    ("Руководитель", 28),
    ("Дата приема", 14),
    ("Дата увольнения", 16),
    ("Статус", 12),
    ("Штат", 16),
    ("Зарплата", 14),
]
DATE_FORMAT = "DD.MM.YYYY"
MONEY_FORMAT = "#,##0 ₽"


def _status(employee: Employee, ref_date: date) -> str:
    fired_at = employee.fired_at
    if fired_at is not None and fired_at <= ref_date:
        return "Уволен"
    return "Работает"


def build_employees_xlsx(
    employees: Iterable[Employee], relevance_date: date | None = None
) -> bytes:

    ref_date = relevance_date or date.today()

    wb = Workbook()
    ws = wb.active
    ws.title = "Сотрудники"

    header_font = Font(bold=True)
    for idx, (title, width) in enumerate(COLUMNS, start=1):
        cell = ws.cell(row=1, column=idx, value=title)
        cell.font = header_font
        ws.column_dimensions[get_column_letter(idx)].width = width
    ws.freeze_panes = "A2"

    for employee in employees:
        row = [
            employee.full_name,
            employee.position,
            employee.department,
            employee.division.name if employee.division else None,
            employee.manager,
            employee.hired_at,
            employee.fired_at,
            _status(employee, ref_date),
            employee.staff_type,
            employee.salary,
        ]
        ws.append(row)
        excel_row = ws.max_row
        ws.cell(row=excel_row, column=6).number_format = DATE_FORMAT
        ws.cell(row=excel_row, column=7).number_format = DATE_FORMAT
        ws.cell(row=excel_row, column=10).number_format = MONEY_FORMAT

    buffer = io.BytesIO()
    wb.save(buffer)
    return buffer.getvalue()
