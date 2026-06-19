'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { DialogFooter } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type {
  Employee,
  EmployeeUpdate,
} from '@/app/employees/employees_actions';
import type { Division } from '@/app/employees/get_divisions_action';

const REQUIRED = 'Обязательное поле';
// Radix Select can't use "" as a value, so the "no division" option needs a sentinel.
const NO_DIVISION = '__none__';
const STAFF_TYPES = ['Штатный сотрудник', 'Внештатный сотрудник'];

export const employeeFormSchema = z.object({
  full_name: z.string().min(1, REQUIRED),
  position: z.string().min(1, REQUIRED),
  department: z.string().min(1, REQUIRED),
  division: z.string(),
  manager: z.string(),
  staff_type: z.string().min(1, REQUIRED),
  hired_at: z.string().min(1, REQUIRED),
  fired_at: z.string(),
  salary: z.string().min(1, REQUIRED).regex(/^\d+$/, 'Введите целое число'),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export const EMPTY_EMPLOYEE_FORM: EmployeeFormValues = {
  full_name: '',
  position: '',
  department: '',
  division: '',
  manager: '',
  staff_type: '',
  hired_at: '',
  fired_at: '',
  salary: '',
};

const toDateInput = (value: string | null) => value?.slice(0, 10) ?? '';

export function employeeToForm(employee: Employee): EmployeeFormValues {
  return {
    full_name: employee.full_name,
    position: employee.position,
    department: employee.department,
    division: employee.division ?? '',
    manager: employee.manager ?? '',
    staff_type: employee.staff_type,
    hired_at: toDateInput(employee.hired_at),
    fired_at: toDateInput(employee.fired_at),
    salary: String(employee.salary),
  };
}

function formToPayload(values: EmployeeFormValues): EmployeeUpdate {
  return {
    full_name: values.full_name,
    position: values.position,
    department: values.department,
    staff_type: values.staff_type,
    hired_at: values.hired_at,
    manager: values.manager.trim() === '' ? null : values.manager,
    division: values.division.trim() === '' ? null : values.division,
    fired_at: values.fired_at === '' ? null : values.fired_at,
    salary: Number(values.salary),
  };
}

export function EmployeeForm({
  divisions,
  defaultValues,
  submitLabel,
  pendingLabel,
  onSubmit,
  onCancel,
}: {
  divisions: Division[];
  defaultValues: EmployeeFormValues;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (payload: EmployeeUpdate) => Promise<void>;
  onCancel: () => void;
}) {
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues,
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(formToPayload(values)))}
        className='grid gap-4 sm:grid-cols-2'
      >
        <FormField
          control={form.control}
          name='full_name'
          render={({ field }) => (
            <FormItem className='sm:col-span-2'>
              <FormLabel>ФИО</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='position'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Должность</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='department'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Департамент</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='division'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Отдел</FormLabel>
              <Select
                value={field.value === '' ? NO_DIVISION : field.value}
                onValueChange={(value) =>
                  field.onChange(value === NO_DIVISION ? '' : value)
                }
              >
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Выберите отдел' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NO_DIVISION}>Без отдела</SelectItem>
                  {divisions.map((division) => (
                    <SelectItem key={division.id} value={division.name}>
                      {division.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='manager'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Руководитель</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='hired_at'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Дата приема</FormLabel>
              <FormControl>
                <Input type='date' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='fired_at'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Дата увольнения</FormLabel>
              <FormControl>
                <Input type='date' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='staff_type'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Штат</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Выберите штат' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {STAFF_TYPES.map((staffType) => (
                    <SelectItem key={staffType} value={staffType}>
                      {staffType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='salary'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Зарплата</FormLabel>
              <FormControl>
                <Input inputMode='numeric' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className='sm:col-span-2'>
          <Button
            type='button'
            variant='outline'
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Отмена
          </Button>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? pendingLabel : submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
