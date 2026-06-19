import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.division import Division


class Employee(Base):
    """A single employee row imported from the .xlsb file."""

    __tablename__ = "employees"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)

    report_date: Mapped[date] = mapped_column(Date)  # Дата выгрузки из первой строки файла ("Данные")
    department: Mapped[str] = mapped_column(String)  # Департамент
    # Отдел вынесен в таблицу divisions
    division_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("divisions.id"))
    division: Mapped[Division | None] = relationship(lazy="joined")
    position: Mapped[str] = mapped_column(String)  # Должность
    manager: Mapped[str | None] = mapped_column(String)  # Руководитель хранится как текст, а не ссылка на другого сотрудника т.к. могут быть сотрудники с одинаковыми ФИО
    full_name: Mapped[str] = mapped_column(String)  # ФИО сотрудника
    hired_at: Mapped[date] = mapped_column(Date)  # Дата приема на работу
    fired_at: Mapped[date | None] = mapped_column(Date)  # Дата увольнения
    # статус определяется по наличию даты увольнения
    staff_type: Mapped[str] = mapped_column(String)  # Штат
    salary: Mapped[int] = mapped_column(Integer)  # заработная плата
