import Link from 'next/link';

import { FileUpload } from '@/components/FileUpload';

export default function ImportPage() {
  return (
    <main className='flex w-full flex-col gap-6 p-8'>
      <header className='flex flex-col gap-1'>
        <div className='flex items-center justify-between gap-4'>
          <h1 className='text-2xl font-semibold tracking-tight'>Импорт файла</h1>
          <div className='flex items-center gap-4'>
            <Link
              href='/employees'
              className='inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 underline transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            >
              Сотрудники
            </Link>
            <Link
              href='/history'
              className='inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 underline transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            >
              История операций
            </Link>
          </div>
        </div>
        <p className='text-zinc-600 dark:text-zinc-400'>
          Выберите файл и загрузите его на сервер.
        </p>
      </header>
      <FileUpload />
    </main>
  );
}
