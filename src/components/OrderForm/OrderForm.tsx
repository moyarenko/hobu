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
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useLocation, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import InvertColorsIcon from '@mui/icons-material/InvertColors';

import { useCategories, useDB } from '@/hooks';
import { ORDER_TYPES } from '@/constants';
import { ReportPageContext } from '@/pages';
import { Routes } from '@/routes';

import { FormFields, schema } from './schema';

type OrderFormProps = {
  order?: Order.Item;
};

const getZeroTimeDate = () => {
  const date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
};

export const OrderForm: FC<OrderFormProps> = ({ order }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useLocation();
  const db = useDB();
  const { data: categories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();

  const { control, handleSubmit, reset, watch } = useForm<FormFields>({
    defaultValues: {
      id: order?.id,
      category_id: order?.category_id ? String(order.category_id) : '',
      note: order?.note || '',
      created_at: order?.created_at
        ? new Date(order?.created_at).toISOString()
        : searchParams.get('created_at')
          ? (searchParams.get('created_at') as string)
          : getZeroTimeDate().toISOString(),
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
    setSearchParams({
      created_at: createdAt,
    });
  }, [createdAt, setSearchParams]);

  useEffect(() => {
    setDate(createdAt);
  }, [createdAt, setDate]);

  useEffect(() => {
    if (state && state.order) {
      const { created_at, amount, category_id, ...rest } = state.order as Partial<Order.Item>;
      reset({
        ...rest,
        created_at: new Date(created_at as number).toISOString(),
        amounts: [{ value: amount || '' }],
        category_id: `${category_id}`,
      });
    }
  }, [reset, state]);

  const onSubmit = ({ amounts, note, category_id, created_at, ...data }: FormFields) => {
    const amount = amounts?.reduce((acc, curr) => (acc += Number(curr.value)), 0) || 0;
    console.log('submit: ', data, amount);

    if (!data.id)
      note = amounts && amounts.length > 1 ? `${note} (${amounts.map(({ value }) => value).join(', ')})` : note;

    const isMultiMutate = amounts && amounts.length > 1 && !data.id;

    mutate(
      { ...data, note, category_id: Number(category_id), amount, created_at: new Date(created_at).getTime() },
      {
        onSuccess: () => {
          if (!isMultiMutate) {
            reset({
              id: undefined,
              note: '',
              amounts: [{ value: order?.amount || '' }],
              created_at: createdAt,
            });
            refetch();
          }
        },
      }
    );

    if (isMultiMutate) {
      const amountsForMutate = amounts.slice(1).filter((amount) => !!amount.category_id && !!amount.value);
      amountsForMutate.forEach(({ category_id, value }, index) => {
        mutate(
          {
            type: data.type,
            note: '',
            category_id: Number(category_id),
            amount: Number(value) * -1,
            created_at: new Date(created_at).getTime(),
          },
          {
            onSuccess: () => {
              if (index === amountsForMutate.length - 1) {
                reset({
                  note: '',
                  amounts: [{ value: order?.amount || '' }],
                  created_at: createdAt,
                });
                refetch();
              }
            },
          }
        );
      });
    }
  };

  const handleCreateCategory = () =>
    navigate(
      {
        pathname: Routes.REPORT_CREATE_CATEGORY,
      },
      {
        state: {
          created_at: createdAt,
        },
      }
    );

  return (
    <Stack spacing={2}>
      <Controller
        control={control}
        name="created_at"
        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
          <>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography
                sx={{
                  flexGrow: 1,
                }}
                variant="caption"
              >
                Додати елемент
              </Typography>
              <IconButton
                color="default"
                aria-label="prev day"
                size="small"
                onClick={() => {
                  const date = new Date(value);
                  date.setDate(date.getDate() - 1);
                  onChange(date.toISOString());
                }}
              >
                <ArrowBackIosIcon fontSize="inherit" />
              </IconButton>
              <IconButton
                color="default"
                aria-label="next day"
                size="small"
                onClick={() => {
                  const date = new Date(value);
                  date.setDate(date.getDate() + 1);
                  onChange(date.toISOString());
                }}
              >
                <ArrowForwardIosIcon fontSize="inherit" />
              </IconButton>
            </Stack>
            <FormControl error={!!error}>
              <DatePicker
                label="Дата:"
                format="dd/MM/yyyy"
                value={new Date(value)}
                onClose={onBlur}
                onChange={onChange}
              />
            </FormControl>
          </>
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
                    autoComplete="off"
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
            {index > 0 && (
              <Controller
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>Категорія</InputLabel>
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
                  </FormControl>
                )}
                name={`amounts.${index}.category_id`}
                control={control}
              />
            )}
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
