import { getEmployees } from './employees_actions';

export default async function EmployeesPage() {
  const employees = await getEmployees();
  console.log('🚀 ~ EmployeesPage ~ employees:', employees);

  return (
    <main className='mx-auto flex w-full max-w-4xl flex-col gap-6 p-8'>
      <h1 className='text-2xl font-semibold tracking-tight'>Сотрудники</h1>
    </main>
  );
}
