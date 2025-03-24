import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from '@refinedev/react-hook-form';
import { z, ZodType } from 'zod';

export function useRefineForm<T extends ZodType<any, any>>(schema: T, defaultValues?: Partial<z.infer<T>>) {
  const refineForm = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return {
    ...refineForm,
    formProps: refineForm,
  };
}
