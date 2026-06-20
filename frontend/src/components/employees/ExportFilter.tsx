'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

import { createSearchParams } from '@/lib/createSearchParams';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Employee } from '@/app/employees/employees_actions';
import { ExportButton } from './ExportButton';

const PARAM = 'exports';
const STATUS_OPTIONS = [
  { label: 'Сотрудники', value: 'employees' },
  { label: 'Отделы', value: 'departments' },
];
const ALL: string[] = STATUS_OPTIONS.map((option) => option.value);

export function ExportFilter({ data }: { data: Employee[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const raw = searchParams.get(PARAM);
  const selected = raw
    ? raw.split(',').filter((value) => ALL.includes(value))
    : [...ALL];

  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    const param = next.length === ALL.length ? null : next.join(',');
    const modSearchParams = createSearchParams(
      { [PARAM]: param, page: 0 },
      searchParams,
    );
    router.push(pathname + '?' + modSearchParams);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          variant='outline'
          className='w-45 justify-between font-normal'
        >
          <span className='truncate'>Экспорт XLSX</span>
          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-45'>
        {STATUS_OPTIONS.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            onCheckedChange={() => toggle(option.value)}
            onSelect={(event) => event.preventDefault()}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuItem>
          {' '}
          <ExportButton data={data} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
