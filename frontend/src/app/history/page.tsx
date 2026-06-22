import Link from 'next/link';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getHistory, type OperationLog } from './history_actions';

function formatBytes(bytes: number | null): string {
  if (bytes === null) return '—';
  if (bytes < 1024) return `${bytes} Б`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} КБ`;
  return `${(kb / 1024).toFixed(1)} МБ`;
}

function StatusBadge({ status }: { status: OperationLog['status'] }) {
  const ok = status === 'success';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        ok
          ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
          : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
      }`}
    >
      {ok ? 'Успех' : 'Ошибка'}
    </span>
  );
}

export default async function HistoryPage() {
  const history = await getHistory();

  return (
    <main className='flex w-full flex-col gap-6 p-8'>
      <header className='flex items-center justify-between gap-4'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          История операций
        </h1>
        <div className='flex items-center gap-4'>
          <Link
            href='/employees'
            className='inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 underline transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          >
            Сотрудники
          </Link>
          <Link
            href='/import'
            className='inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 underline transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          >
            Импорт файла
          </Link>
        </div>
      </header>

      {history.length === 0 ? (
        <p className='text-sm text-zinc-600 dark:text-zinc-400'>
          Операций импорта и экспорта пока не было.
        </p>
      ) : (
        <div className='rounded-lg border border-black/10 dark:border-white/10'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата и время</TableHead>
                <TableHead>Операция</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Файл</TableHead>
                <TableHead className='text-right'>Размер</TableHead>
                <TableHead className='text-right'>Строк</TableHead>
                <TableHead>Детали</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className='whitespace-nowrap'>
                    {new Date(row.created_at).toLocaleString('ru-RU')}
                  </TableCell>
                  <TableCell>
                    {row.operation === 'import' ? 'Импорт' : 'Экспорт'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className='max-w-xs truncate'>
                    {row.filename ?? '—'}
                  </TableCell>
                  <TableCell className='text-right whitespace-nowrap'>
                    {formatBytes(row.file_size)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {row.rows ?? '—'}
                  </TableCell>
                  <TableCell className='max-w-xs truncate text-red-700 dark:text-red-400'>
                    {row.detail ?? ''}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
