const API_URL = process.env.API_URL ?? 'http://127.0.0.1:8000';

const XLSX_MEDIA_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export async function GET(request: Request) {
  const qs = new URL(request.url).searchParams.toString();

  let res: Response;
  try {
    res = await fetch(`${API_URL}/export${qs ? `?${qs}` : ''}`);
  } catch {
    return new Response('Не удалось связаться с сервером', { status: 502 });
  }

  if (!res.ok) {
    return new Response('Не удалось сформировать экспорт', {
      status: res.status,
    });
  }

  return new Response(res.body, {
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? XLSX_MEDIA_TYPE,
      'Content-Disposition':
        res.headers.get('Content-Disposition') ?? 'attachment',
    },
  });
}
