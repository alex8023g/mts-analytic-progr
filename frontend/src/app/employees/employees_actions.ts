'use server';

import { searchParamsSchema } from '@/lib/searchParamsSchema';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

export type Employee = {
  id: string;
  report_date: string;
  department: string;
  division: string | null;
  position: string;
  manager: string | null;
  full_name: string;
  hired_at: string;
  fired_at: string | null;
  staff_type: string;
  salary: number;
};

export async function getEmployees(
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>,
): Promise<Employee[]> {
  const raw = (await searchParams) ?? {};
  const parsed = searchParamsSchema.parse(raw);

  const qs = new URLSearchParams(
    Object.entries(parsed).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  ).toString();

  const res = await fetch(`${API_URL}/employees${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Не удалось загрузить сотрудников (${res.status})`);
  }

  return res.json();
}

export async function deleteEmployee(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/employees/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error(`Не удалось удалить сотрудника (${res.status})`);
  }
}

export type EmployeeUpdate = {
  full_name: string;
  position: string;
  department: string;
  manager: string | null;
  staff_type: string;
  salary: number;
  hired_at: string;
  fired_at: string | null;
  division: string | null;
};

export async function updateEmployee(
  id: string,
  data: EmployeeUpdate,
): Promise<void> {
  const res = await fetch(`${API_URL}/employees/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Не удалось сохранить сотрудника (${res.status})`);
  }
}

export async function createEmployee(data: EmployeeUpdate): Promise<void> {
  const res = await fetch(`${API_URL}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Не удалось создать сотрудника (${res.status})`);
  }
}
