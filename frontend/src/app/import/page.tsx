import { FileUpload } from '@/components/FileUpload';

export default function ImportPage() {
  return (
    <main className='mx-auto flex w-full max-w-xl flex-col gap-6 p-8'>
      <header className='flex flex-col gap-1'>
        <h1 className='text-2xl font-semibold tracking-tight'>Импорт файла</h1>
        <p className='text-zinc-600 dark:text-zinc-400'>
          Выберите файл и загрузите его на сервер.
        </p>
      </header>
      <FileUpload />
    </main>
  );
}
