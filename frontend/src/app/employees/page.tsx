import { getEmployees } from './employees_actions';
import { EmployeesTable } from './EmployeesTable';

export default async function EmployeesPage() {
  const employees = await getEmployees();

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
      <EmployeesTable data={employees} />
    </main>
  );
}
