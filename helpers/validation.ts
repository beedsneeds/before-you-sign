import * as z from 'zod';
import { Types } from 'mongoose';

export const BinSchema = z.coerce
  .number()
  .int('BIN must be a whole number')
  .positive('BIN must be positive');

export const ObjectIdSchema = z
  .string()
  .refine((s) => Types.ObjectId.isValid(s), { message: 'Invalid id' })
  .transform((s) => new Types.ObjectId(s));

export const checkString = (
  str: string,
  minLength: number,
  maxLength: number | undefined,
  invalidChars: RegExp,
) => {
  str = str.trim();
  if (typeof str !== "string") {
    throw `Error: ${str} must be a string.`;
  }
  if (str.length === 0) {
    throw `Error: ${str} cannot be an empty string or just spaces.`;
  }
  if (str.length < minLength) {
    throw `Error: ${str} must be at least ${minLength} characters long.`;
  }
  if (maxLength === undefined || maxLength === null) {
    maxLength = Infinity;
  }
  if (str.length > maxLength) {
    throw `Error: ${str} must be no more than ${maxLength} characters long.`;
  }
  if (invalidChars.test(str)) {
    throw `Error: ${str} contains invalid characters.`;
  }

  return str;
};

export const formatZodError = (err: z.ZodError): string => z.prettifyError(err);
