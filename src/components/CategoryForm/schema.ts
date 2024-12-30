import { number, object, ObjectSchema, string } from 'yup';

export type FormFields = Omit<Category.Item, 'id'> & Partial<Pick<Category.Item, 'id'>>;

export const schema: ObjectSchema<FormFields> = object().shape({
  id: number(),
  name: string().required(),
  color: string().required(),
});
