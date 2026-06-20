'use client';

import { useSearchParams } from 'next/navigation';
import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Employee } from '@/app/employees/employees_actions';

export function ExportButton({ data }: { data: Employee[] }) {
  const searchParams = useSearchParams();

  function handleExport() {
    const qs = searchParams.toString();
    const url = `/api/export${qs ? `?${qs}` : ''}`;
    const link = document.createElement('a');
    link.href = url;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
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
  );
}
