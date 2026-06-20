'use client';

import { useRouter } from 'next/navigation';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  updateEmployee,
  type Employee,
} from '@/app/employees/employees_actions';
import type { Division } from '@/app/employees/get_divisions_action';
import { EmployeeForm, employeeToForm } from './EmployeeForm';

export function EditEmployeeDialog({
  employee,
  divisions,
  open,
  onOpenChange,
}: {
  employee: Employee;
  divisions: Division[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Редактировать сотрудника</DialogTitle>
          <DialogDescription>{employee.full_name}</DialogDescription>
        </DialogHeader>

        <EmployeeForm
          divisions={divisions}
          defaultValues={employeeToForm(employee)}
          submitLabel='Сохранить'
          pendingLabel='Сохранение…'
          onCancel={() => onOpenChange(false)}
          onSubmit={async (payload) => {
            await updateEmployee(employee.id, payload);
            onOpenChange(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
