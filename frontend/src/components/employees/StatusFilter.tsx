'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

import { createSearchParams } from '@/lib/createSearchParams';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const PARAM = 'status';
const STATUS_OPTIONS = [
  { label: 'Работает', value: 'employed' },
  { label: 'Уволен', value: 'fired' },
];
const ALL: string[] = STATUS_OPTIONS.map((option) => option.value);

export function StatusFilter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const raw = searchParams.get(PARAM);
  // No param means every status is shown, so all boxes are checked by default.
  const selected = raw
    ? raw.split(',').filter((value) => ALL.includes(value))
    : [...ALL];

  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    // Drop the param when everything is selected (equivalent to no filter).
    const param = next.length === ALL.length ? null : next.join(',');
    const modSearchParams = createSearchParams(
      { [PARAM]: param, page: 0 },
      searchParams,
    );
    router.push(pathname + '?' + modSearchParams);
  };

  const summary =
    selected.length === ALL.length
      ? 'все'
      : STATUS_OPTIONS.filter((option) => selected.includes(option.value))
          .map((option) => option.label)
          .join(', ') || 'нет';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          variant='outline'
          className='w-55 justify-between font-normal'
        >
          <span className='truncate'>Статус: {summary}</span>
          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-55'>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
