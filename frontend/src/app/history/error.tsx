'use client';

import { useEffect } from 'react';
import { RotateCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function HistoryError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className='flex w-full flex-col items-center justify-center gap-4 p-8 text-center'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Не удалось открыть историю операций
        </h1>
        <p className='text-sm text-zinc-600 dark:text-zinc-400'>
          {error.message || 'Произошла непредвиденная ошибка.'}
        </p>
      </div>
      <Button type='button' onClick={() => window.location.reload()}>
        <RotateCw className='h-4 w-4' />
        Повторить
      </Button>
    </main>
  );
}
