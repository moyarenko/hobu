import { AnyObject, array, number, object, ObjectSchema, string, StringSchema } from 'yup';

import { ORDER_TYPES } from '@/constants';

export type FormFields = Omit<Order.Item, 'id' | 'amount' | 'category_id' | 'created_at'> &
  Partial<Pick<Order.Item, 'id'>> & {
    amounts?: { value: number | string }[];
    category_id: string;
    created_at: string;
  };

export const schema: ObjectSchema<FormFields> = object().shape({
  id: number(),
  category_id: string().required(),
  created_at: string().required(),
  type: string().oneOf(ORDER_TYPES).required(),
  note: string() as StringSchema<string, AnyObject, undefined, ''>,
  amounts: array().of(
    object().shape({
      value: number().required(),
    })
  ),
});
