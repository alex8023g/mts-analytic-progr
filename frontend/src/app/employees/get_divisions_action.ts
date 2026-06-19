'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

export type Division = {
  id: string;
  name: string;
};

export async function getDivisions(): Promise<Division[]> {
  const res = await fetch(`${API_URL}/departments`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Не удалось загрузить отделы (${res.status})`);
  }

  return res.json();
}
