'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { format, isToday, parse } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { createSearchParams } from '@/lib/createSearchParams';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const PARAM = 'relevance_date';
const PARAM_FORMAT = 'yyyy-MM-dd';

export function RelevanceDatePicker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const raw = searchParams.get(PARAM);
  const selected = raw ? parse(raw, PARAM_FORMAT, new Date()) : new Date();

  const pushDate = (date: Date) => {
    setOpen(false);
    const modSearchParams = createSearchParams(
      { [PARAM]: isToday(date) ? null : format(date, PARAM_FORMAT), page: 0 },
      searchParams,
    );
    router.push(pathname + '?' + modSearchParams);
  };

  return (
    <div className='flex items-center gap-2'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            className='w-55 justify-start text-left font-normal'
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {format(selected, 'dd.MM.yyyy')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            locale={ru}
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => date && pushDate(date)}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
