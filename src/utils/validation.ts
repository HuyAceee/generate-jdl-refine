import { z, ZodTypeAny } from 'zod';

export const validationMessages = {
  required: 'This field is required',
  string: {
    default: 'Invalid string format',
    min: (min: number) => `Must be at least ${min} characters`,
    max: (max: number) => `Must be at most ${max} characters`,
    email: 'Invalid email format',
    url: 'Invalid URL format',
    phone: 'Invalid phone number format',
    pattern: 'Invalid format',
  },
  number: {
    default: 'Invalid number format',
    min: (min: number) => `Must be at least ${min}`,
    max: (max: number) => `Must be at most ${max}`,
  },
  array: {
    min: (min: number) => `Must have at least ${min} items`,
  },
};

const extractEnumValues = <T extends Record<string, string | number>>(enumObj: T): string[] =>
  Object.values(enumObj).filter(v => typeof v === 'string') as string[];

const withMessage = <T extends ZodTypeAny>(schema: T, message: string) => schema.refine(val => !!val, { message });

export const schemaUtils = {
  required: (message?: string) => withMessage(z.any(), message ?? validationMessages.required),
  string: {
    default: (message?: string) => z.string({ message: message ?? validationMessages.string.default }),
    min: (length: number, message?: string) => z.string().min(length, message ?? validationMessages.string.min(length)),
    email: (message?: string) => z.string().email(message ?? validationMessages.string.email),
    url: (message?: string) => z.string().url(message ?? validationMessages.string.url),
    phone: (message?: string) => z.string().regex(/^\+?[1-9]\d{1,14}$/, message ?? validationMessages.string.phone),
    pattern: (regex: RegExp, message?: string) => z.string().regex(regex, message ?? validationMessages.string.pattern),
    required: (message?: string) => z.string().min(1, message ?? validationMessages.required),
  },
  number: {
    default: (message?: string) => z.number({ message: message ?? validationMessages.number.default }),
    min: (value: number, message?: string) => z.number().min(value, message ?? validationMessages.number.min(value)),
    max: (value: number, message?: string) => z.number().max(value, message ?? validationMessages.number.max(value)),
  },
  array: {
    min: (length: number, message?: string) =>
      z.array(z.any()).min(length, message ?? validationMessages.array.min(length)),
  },
  enum: <T extends Record<string, string | number>>(enumObj: T, message?: string) =>
    z.enum(extractEnumValues(enumObj) as [string, ...string[]], { message }),
};
