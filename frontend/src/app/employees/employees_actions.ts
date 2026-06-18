'use server';

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

export async function getEmployees(): Promise<Employee[]> {
  const res = await fetch(`${API_URL}/employees`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`Не удалось загрузить сотрудников (${res.status})`);
  }

  return res.json();
}
