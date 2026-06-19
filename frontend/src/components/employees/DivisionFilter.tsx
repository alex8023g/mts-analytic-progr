'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

import { Division } from '@/app/employees/get_divisions_action';
import { createSearchParams } from '@/lib/createSearchParams';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const PARAM = 'division';
const ALL = 'all';

const shortName = (name: string) => name.replace(/Отдел/gi, '').trim();

export function DivisionFilter({ divisions }: { divisions: Division[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const selected = searchParams.get(PARAM);
  const selectedDivision = divisions.find((d) => d.id === selected);
  const selectedName = selectedDivision && shortName(selectedDivision.name);

  const select = (value: string) => {
    const modSearchParams = createSearchParams(
      { [PARAM]: value === ALL ? null : value, page: 0 },
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
          className='w-55 justify-between font-normal'
        >
          <span className='truncate'>Отдел: {selectedName ?? 'все'}</span>
          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='max-h-80 w-55 overflow-y-auto'
      >
        <DropdownMenuRadioGroup value={selected ?? ALL} onValueChange={select}>
          <DropdownMenuRadioItem value={ALL}>Все</DropdownMenuRadioItem>
          {divisions.map((division) => (
            <DropdownMenuRadioItem key={division.id} value={division.id}>
              {shortName(division.name)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
