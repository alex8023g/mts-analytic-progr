import Link from 'next/link';
import { DataTableTextFilter } from '@/components/employees/DataTableTextFilter';
import { RelevanceDatePicker } from '@/components/employees/RelevanceDatePicker';
import { StatusFilter } from '@/components/employees/StatusFilter';
import { getEmployees } from './employees_actions';
import { EmployeesTable } from '@/components/employees/EmployeesTable';
import { DivisionFilter } from '@/components/employees/DivisionFilter';
import { CreateEmployeeButton } from '@/components/employees/CreateEmployeeButton';
import { getDivisions } from './get_divisions_action';
import { ExportFilter } from '@/components/employees/ExportFilter';

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const employees = await getEmployees(searchParams);
  const divisions = await getDivisions();

  const reportDate = employees[0]?.report_date;

  return (
    <main className='flex w-full flex-col gap-6 p-8'>
      <header className='flex flex-col gap-1'>
        <div className='flex items-center justify-between gap-4'>
          <h1 className='text-2xl font-semibold tracking-tight'>Сотрудники</h1>
          <Link
            href='/import'
            className='inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 underline transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          >
            Импорт файла
          </Link>
        </div>
        {reportDate && (
          <p className='text-sm text-zinc-600 dark:text-zinc-400'>
            Дата выгрузки: {new Date(reportDate).toLocaleDateString('ru-RU')}
          </p>
        )}
      </header>
      <div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
        <DataTableTextFilter />
        <RelevanceDatePicker />
        <StatusFilter />
        <DivisionFilter divisions={divisions} />
        <ExportFilter data={employees} />
        <CreateEmployeeButton divisions={divisions} />
      </div>
      <EmployeesTable data={employees} divisions={divisions} />
    </main>
  );
}
