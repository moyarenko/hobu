import { DatePicker } from '@mui/x-date-pickers';
import { FC, useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import InvertColorsIcon from '@mui/icons-material/InvertColors';

import { useCategories, useDB } from '@/hooks';
import { ORDER_TYPES } from '@/constants';
import { ReportPageContext } from '@/pages';

import { FormFields, schema } from './schema';

type OrderFormProps = {
  order?: Order.Item;
};

export const OrderForm: FC<OrderFormProps> = ({ order }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const db = useDB();
  const { data: categories } = useCategories();

  const { control, handleSubmit, reset, watch } = useForm<FormFields>({
    defaultValues: {
      id: order?.id,
      category_id: order?.category_id ? String(order.category_id) : '',
      note: order?.note || '',
      created_at: order?.created_at ? new Date(order?.created_at).toISOString() : new Date().toISOString(),
      type: order?.type || 'credit',
      amounts: [{ value: order?.amount || '' }],
    },
    resolver: yupResolver(schema),
  });

  const { refetch, setDate } = useOutletContext<ReportPageContext>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'amounts',
  });

  const { mutate } = useMutation<number, unknown, Omit<Order.Item, 'id'> & Partial<Pick<Order.Item, 'id'>>>({
    mutationFn: ({ id, ...data }) => (id ? db.updateOrder({ ...data, id }) : db.addOrder(data)),
  });

  const createdAt = watch('created_at');

  useEffect(() => {
    setDate(createdAt);
  }, [createdAt, setDate]);

  const onSubmit = ({ amounts, category_id, created_at, ...data }: FormFields) => {
    const amount = amounts?.reduce((acc, curr) => (acc += Number(curr.value)), 0) || 0;
    mutate(
      { ...data, category_id: Number(category_id), amount, created_at: new Date(created_at).getTime() },
      {
        onSuccess: () => {
          reset({
            note: '',
            amounts: [{ value: order?.amount || '' }],
            created_at: createdAt,
          });
          refetch();
        },
      }
    );
  };

  const handleCreateCategory = () => navigate('category');

  return (
    <Stack spacing={2}>
      <Typography variant="caption">Додати елемент</Typography>
      <Controller
        control={control}
        name="created_at"
        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
          <FormControl error={!!error}>
            <DatePicker
              label="Дата:"
              format="dd/MM/yyyy"
              value={new Date(value)}
              onClose={onBlur}
              onChange={onChange}
            />
          </FormControl>
        )}
      />
      <Controller
        control={control}
        name="type"
        render={({ field, fieldState: { error } }) => (
          <FormControl fullWidth error={!!error}>
            <InputLabel>Тип</InputLabel>
            <Select label="Тип" {...field}>
              {ORDER_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {t(`order.type.${type}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
      <Controller
        control={control}
        name="note"
        render={({ field, fieldState: { error } }) => (
          <TextField error={!!error} maxRows={4} multiline {...field} label="Опис" />
        )}
      />
      <Controller
        control={control}
        name="category_id"
        render={({ field, fieldState: { error } }) => (
          <FormControl fullWidth error={!!error}>
            <InputLabel>Категорія</InputLabel>
            <Stack spacing={2} direction="row" alignItems="center">
              <Select fullWidth label="Категорія" {...field}>
                {categories.length === 0 && (
                  <MenuItem disabled value="">
                    <em>Немає доступних категорій</em>
                  </MenuItem>
                )}
                {categories.map(({ id, name, color }) => (
                  <MenuItem key={id} value={id}>
                    <InvertColorsIcon sx={{ color }} />
                    {name}
                  </MenuItem>
                ))}
              </Select>
              <IconButton color="info" aria-label="create category" size="small" onClick={handleCreateCategory}>
                <AddCircleOutlineIcon fontSize="inherit" />
              </IconButton>
            </Stack>
          </FormControl>
        )}
      />
      {fields.map((item, index) => {
        return (
          <Stack direction="row" key={item.id} spacing={2} alignItems="center">
            <Controller
              render={({ field: { onChange, ...field }, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error}>
                  <InputLabel>Сумма</InputLabel>
                  <OutlinedInput
                    startAdornment={<InputAdornment position="start">₴</InputAdornment>}
                    label="Сумма"
                    {...field}
                    onChange={(e) =>
                      onChange(
                        e.target.value
                          .replace(/(?<!^)-/g, '')
                          .replace(/(?<=\..*)\./g, '')
                          .replace(/[^\d-.]/g, '')
                      )
                    }
                  />
                </FormControl>
              )}
              name={`amounts.${index}.value`}
              control={control}
            />
            {index === 0 ? (
              <IconButton color="warning" aria-label="add" size="small" onClick={() => append({ value: '' })}>
                <AddCircleOutlineIcon fontSize="inherit" />
              </IconButton>
            ) : (
              <IconButton color="error" aria-label="delete" size="small" onClick={() => remove(index)}>
                <RemoveCircleOutlineIcon fontSize="inherit" />
              </IconButton>
            )}
          </Stack>
        );
      })}
      <Box>
        <Button
          sx={({ spacing }) => ({
            marginTop: spacing(6),
          })}
          variant="contained"
          fullWidth
          color="success"
          type="button"
          onClick={handleSubmit(onSubmit)}
        >
          Додати
        </Button>
      </Box>
    </Stack>
  );
};
