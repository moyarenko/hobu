import { array, number, object, ObjectSchema, string } from 'yup';

export type FormFields = Order.Filter;

export const schema: ObjectSchema<FormFields> = object().shape({
  createdAt: object().shape({
    from: string(),
    to: string(),
  }),
  categories: array().of(number().required()),
});
