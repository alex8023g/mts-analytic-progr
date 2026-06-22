'use server';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:8000';

export type OperationLog = {
  id: string;
  operation: 'import' | 'export';
  status: 'success' | 'error';
  filename: string | null;
  file_size: number | null;
  rows: number | null;
  detail: string | null;
  created_at: string;
};

export async function getHistory(): Promise<OperationLog[]> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/history`, { cache: 'no-store' });
  } catch {
    throw new Error('Не удалось связаться с сервером. Проверьте подключение.');
  }

  if (!res.ok) {
    throw new Error(`Не удалось загрузить историю операций (${res.status})`);
  }

  return res.json();
}
