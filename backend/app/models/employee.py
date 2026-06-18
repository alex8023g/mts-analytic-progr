import uuid
from datetime import date

from sqlalchemy import Date, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Employee(Base):
    """A single employee row imported from the .xlsb file."""

    __tablename__ = "employees"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)

    report_date: Mapped[date] = mapped_column(Date)  # Дата выгрузки из первой строки файла ("Данные")
    department: Mapped[str] = mapped_column(String)  # Департамент
    division: Mapped[str | None] = mapped_column(String)  # Отдел
    position: Mapped[str] = mapped_column(String)  # Должность
    manager: Mapped[str | None] = mapped_column(String)  # Руководитель хранится как текст, а не ссылка на другого сотрудника т.к. могут быть сотрудники с одинаковыми ФИО
    full_name: Mapped[str] = mapped_column(String)  # ФИО сотрудника
    hired_at: Mapped[date] = mapped_column(Date)  # Дата приема на работу
    fired_at: Mapped[date | None] = mapped_column(Date)  # Дата увольнения
    # статус определяется по наличию даты увольнения: если она есть, то сотрудник уволен, иначе - работает
    staff_type: Mapped[str] = mapped_column(String)  # Штат
    salary: Mapped[int] = mapped_column(Integer)  # заработная плата
