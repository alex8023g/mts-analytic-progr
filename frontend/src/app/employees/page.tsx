import { DataTableTextFilter } from '@/components/employees/DataTableTextFilter';
import { RelevanceDatePicker } from '@/components/employees/RelevanceDatePicker';
import { getEmployees } from './employees_actions';
import { EmployeesTable } from '@/components/employees/EmployeesTable';

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const employees = await getEmployees(searchParams);

  const reportDate = employees[0]?.report_date;

  return (
    <main className='flex w-full flex-col gap-6 p-8'>
      <header className='flex flex-col gap-1'>
        <h1 className='text-2xl font-semibold tracking-tight'>Сотрудники</h1>
        {reportDate && (
          <p className='text-sm text-zinc-600 dark:text-zinc-400'>
            Дата выгрузки: {new Date(reportDate).toLocaleDateString('ru-RU')}
          </p>
        )}
      </header>
      <div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
        <DataTableTextFilter />
        <RelevanceDatePicker />
      </div>
      <EmployeesTable data={employees} />
    </main>
  );
}
