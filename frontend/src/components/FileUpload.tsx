'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

type UploadResult = {
  filename: string;
  total_rows: number;
  rows_imported: number;
  rows_deleted: number;
};

type Status = 'idle' | 'uploading' | 'done' | 'error';

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((accepted: File[]) => {
    setFile(accepted[0] ?? null);
    setStatus('idle');
    setResult(null);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  async function handleUpload() {
    if (!file) return;

    setStatus('uploading');
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/imports`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Сервер вернул ${res.status}`);
      }

      const result: UploadResult = await res.json();

      console.log('Upload result:', result);

      setResult(result);
      setStatus('done');
      setFile(null);
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить файл');
      setStatus('error');
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-10 text-center text-sm transition-colors ${
          isDragActive
            ? 'border-foreground bg-black/4 dark:bg-white/6'
            : 'border-black/15 hover:border-black/35 dark:border-white/20 dark:hover:border-white/40'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Отпустите файл здесь…</p>
        ) : (
          <p className='text-zinc-600 dark:text-zinc-400'>
            Перетащите файл сюда или нажмите, чтобы выбрать
          </p>
        )}
      </div>

      {file && (
        <p className='text-sm text-zinc-700 dark:text-zinc-300'>
          Выбран: <span className='font-medium'>{file.name}</span> ({file.size}{' '}
          байт)
        </p>
      )}

      <button
        type='button'
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        className='bg-foreground text-background h-11 w-fit rounded-full px-6 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40'
      >
        {status === 'uploading' ? 'Загрузка…' : 'Загрузить'}
      </button>

      {status === 'done' && result && (
        <div className='rounded-lg border border-green-600/30 bg-green-50 p-4 text-sm dark:bg-green-950/30'>
          <p className='font-medium text-green-700 dark:text-green-400'>
            Файл загружен
          </p>
          <ul className='mt-2 text-zinc-700 dark:text-zinc-300'>
            <li>Имя: {result.filename}</li>
            <li>Строк в файле: {result.total_rows}</li>
            <li>
              Проигнорировано строк как неактуальные:{' '}
              {result.total_rows - result.rows_imported}
            </li>
            <li>Сохранено записей: {result.rows_imported}</li>
          </ul>
        </div>
      )}

      {status === 'error' && (
        <div className='rounded-lg border border-red-600/30 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400'>
          {error}
        </div>
      )}
    </div>
  );
}
