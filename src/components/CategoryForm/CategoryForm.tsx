import { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { MuiColorInput } from 'mui-color-input';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDB } from '@/hooks';
import { Routes } from '@/routes';

import { FormFields, schema } from './schema';

type CategoryFormProps = {
  category?: Category.Item;
};

export const CategoryForm: FC<CategoryFormProps> = ({ category }) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { control, handleSubmit, reset } = useForm<FormFields>({
    defaultValues: {
      id: category?.id,
      name: category?.name || '',
      color: category?.color || '',
    },
    resolver: yupResolver(schema),
  });

  const db = useDB();

  const { mutate, isPending } = useMutation<number, unknown, FormFields>({
    mutationFn: (data) => {
      if (data.id) return db.updateCategory(data as Required<FormFields>);
      return db.addCategory(data);
    },
  });

  const onSubmit = (data: FormFields) =>
    mutate(data, {
      onSuccess: () => {
        reset({
          id: undefined,
          name: '',
          color: '',
        });
        const search = new URLSearchParams({
          created_at: state.created_at,
        });
        navigate({
          pathname: Routes.REPORT_CREATE,
          search: search.toString(),
        });
      },
    });

  return (
    <Stack spacing={2}>
      <Typography variant="caption">Додати категорію</Typography>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState: { error } }) => (
          <TextField autoComplete="off" error={!!error} {...field} label="Імʼя" />
        )}
      />
      <Controller
        control={control}
        name="color"
        render={({ field, fieldState: { error } }) => (
          <MuiColorInput label="Колір" format="hex" error={!!error} {...field} />
        )}
      />
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
          disabled={isPending}
        >
          Додати
        </Button>
      </Box>
    </Stack>
  );
};
