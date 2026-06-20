'use client';
import { Input } from '../ui/input';
import { useDebounceRouterPush } from '@/hooks/useDebounceRouterPush';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../ui/button';
import { CircleX } from 'lucide-react';
import { twJoin } from 'tailwind-merge';

export function DataTableTextFilter() {
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState<string | null>(
    searchParams.get('full_name'),
  );

  useDebounceRouterPush(inputValue);

  return (
    <div className='relative mr-0 mb-3 w-full lg:mr-3 lg:mb-0 lg:max-w-sm'>
      <Input
        placeholder='фильтр ФИО'
        value={inputValue || ''}
        onChange={(event) => {
          setInputValue(event.target.value);
        }}
        className='mr-2 lg:max-w-sm'
      />
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className={twJoin(
          'absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 text-gray-500 transition-opacity hover:bg-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
          inputValue
            ? 'opacity-100 duration-500'
            : 'pointer-events-none cursor-default opacity-0',
        )}
        onClick={() => setInputValue('')}
      >
        <CircleX />
      </Button>
    </div>
  );
}
