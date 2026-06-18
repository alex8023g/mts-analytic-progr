'use client';

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

import type { Employee } from './employees_actions';

const dateFmt = new Intl.DateTimeFormat('ru-RU');
const moneyFmt = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

function formatDate(value: string | null) {
  return value ? dateFmt.format(new Date(value)) : '—';
}

const columns: ColumnDef<Employee>[] = [
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
    cell: ({ row }) => (row.original.fired_at ? 'Уволен' : 'Работает'),
  },
  { accessorKey: 'staff_type', header: 'Штат' },
  {
    accessorKey: 'salary',
    header: 'Зарплата',
    cell: ({ getValue }) => moneyFmt.format(getValue() as number),
  },
];

export function EmployeesTable({ data }: { data: Employee[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='rounded-lg border border-black/10 dark:border-white/15'>
      <Table>
        <TableHeader>
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
