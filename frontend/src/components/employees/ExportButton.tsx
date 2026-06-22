'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { openJobSocket } from '@/lib/jobProgress';
import type { Employee } from '@/app/employees/employees_actions';

type Status = 'exporting' | 'done' | 'error';

type Progress = { processed: number; total: number };

function filenameFromResponse(res: Response, fallback: string): string {
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? fallback;
}

export function ExportButton({ data }: { data: Employee[] }) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('exporting');
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState('');

  async function handleExport() {
    setOpen(true);
    setStatus('exporting');
    setProgress(null);
    setError('');

    const jobId = crypto.randomUUID();

    const socket = await openJobSocket('exports', jobId, {
      onProgress: (processed, total) => setProgress({ processed, total }),
    });

    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set('job_id', jobId);

      const res = await fetch(`/api/export?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Не удалось сформировать экспорт');
      }

      const blob = await res.blob();
      const filename = filenameFromResponse(res, 'export.xlsx');

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setStatus('done');
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'Не удалось сформировать экспорт',
      );
      setStatus('error');
    } finally {
      socket?.close();
    }
  }

  const percent =
    progress && progress.total
      ? Math.round((progress.processed / progress.total) * 100)
      : 0;

  return (
    <>
      <Button
        type='button'
        variant='outline'
        className='/w-full'
        onClick={handleExport}
        disabled={data.length === 0}
      >
        <Download className='h-4 w-4' />
        Загрузить в XLSX
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          // Don't let the user dismiss the dialog mid-export.
          if (status !== 'exporting') setOpen(next);
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Экспорт в XLSX</DialogTitle>
            <DialogDescription>
              {status === 'exporting' && 'Формируем файл…'}
              {status === 'done' && 'Файл сформирован и загружается.'}
              {status === 'error' && 'Не удалось сформировать файл.'}
            </DialogDescription>
          </DialogHeader>

          {status === 'exporting' && (
            <div className='flex flex-col gap-1.5'>
              <div className='h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10'>
                <div
                  className='bg-foreground h-full rounded-full transition-[width] duration-150 ease-out'
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className='text-xs text-zinc-600 dark:text-zinc-400'>
                {progress
                  ? `Обработано ${progress.processed} из ${progress.total} строк`
                  : 'Подготовка…'}
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className='rounded-lg border border-red-600/30 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400'>
              {error}
            </div>
          )}

          {status !== 'exporting' && (
            <div className='flex justify-end'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Закрыть
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
