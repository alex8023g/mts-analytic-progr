'use server';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:8000';

export type ImportResult = {
  filename: string;
  total_rows: number;
  rows_imported: number;
  rows_deleted: number;
};

export async function importFile(
  formData: FormData,
  jobId?: string,
): Promise<ImportResult> {
  const query = jobId ? `?job_id=${encodeURIComponent(jobId)}` : '';

  let res: Response;
  try {
    res = await fetch(`${API_URL}/imports${query}`, {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new Error('Не удалось связаться с сервером. Проверьте подключение.');
  }

  if (!res.ok) {
    let detail = `Сервер вернул ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) {
        detail = body.detail;
      }
    } catch (err) {
      console.warn('Не удалось разобрать ответ об ошибке импорта:', err);
    }
    throw new Error(detail);
  }

  return res.json();
}
