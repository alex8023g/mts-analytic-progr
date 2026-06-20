'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createEmployee } from '@/app/employees/employees_actions';
import type { Division } from '@/app/employees/get_divisions_action';
import { EmployeeForm, EMPTY_EMPLOYEE_FORM } from './EmployeeForm';

export function CreateEmployeeButton({ divisions }: { divisions: Division[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type='button'>
          <Plus className='h-4 w-4' />
          Создать
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Новый сотрудник</DialogTitle>
          <DialogDescription>
            Заполните данные нового сотрудника.
          </DialogDescription>
        </DialogHeader>

        <EmployeeForm
          divisions={divisions}
          defaultValues={EMPTY_EMPLOYEE_FORM}
          submitLabel='Создать'
          pendingLabel='Создание…'
          onCancel={() => setOpen(false)}
          onSubmit={async (payload) => {
            await createEmployee(payload);
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
