'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RowActions } from '@/components/employees/RowActions';

import type { Employee } from '@/app/employees/employees_actions';
import type { Division } from '@/app/employees/get_divisions_action';

const dateFmt = new Intl.DateTimeFormat('ru-RU');
const moneyFmt = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

function formatDate(value: string | null) {
  return value ? dateFmt.format(new Date(value)) : '—';
}

function buildColumns(
  relevanceDate: string,
  divisions: Division[],
): ColumnDef<Employee>[] {
  return [
    { accessorKey: 'full_name', header: 'ФИО' },
    { accessorKey: 'position', header: 'Должность' },
    { accessorKey: 'department', header: 'Департамент' },
    {
      accessorKey: 'division',
      header: 'Отдел',
      cell: ({ getValue }) => (getValue() as string | null) ?? '—',
    },
    {
      accessorKey: 'manager',
      header: 'Руководитель',
      cell: ({ getValue }) => (getValue() as string | null) ?? '—',
    },
    {
      accessorKey: 'hired_at',
      header: 'Дата приема',
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      accessorKey: 'fired_at',
      header: 'Дата увольнения',
      cell: ({ getValue }) => formatDate(getValue() as string | null),
    },
    {
      id: 'status',
      header: 'Статус',
      cell: ({ row }) => {
        const firedAt = row.original.fired_at;
        return firedAt && firedAt.slice(0, 10) <= relevanceDate
          ? 'Уволен'
          : 'Работает';
      },
    },
    { accessorKey: 'staff_type', header: 'Штат' },
    {
      accessorKey: 'salary',
      header: 'Зарплата',
      cell: ({ getValue }) => moneyFmt.format(getValue() as number),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions employee={row.original} divisions={divisions} />
      ),
    },
  ];
}

export function EmployeesTable({
  data,
  divisions,
}: {
  data: Employee[];
  divisions: Division[];
}) {
  const searchParams = useSearchParams();
  const relevanceDate =
    searchParams.get('relevance_date') ?? format(new Date(), 'yyyy-MM-dd');
  const columns = useMemo(
    () => buildColumns(relevanceDate, divisions),
    [relevanceDate, divisions],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='rounded-lg border border-black/10 dark:border-white/15'>
      <Table>
        <TableHeader className='bg-gray-100'>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='text-center'>
                Нет данных
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
