import { DatePicker } from '@mui/x-date-pickers';
import { useEffect, memo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';

import { useCategories } from '@/hooks';

import { FormFields, schema } from './schema';

interface FiltersFormProps {
  onSubmit: (data: FormFields) => void;
  defaultParams?: {
    createdAtFrom?: string;
    createdAtTo?: string;
    categories?: number[];
  };
}

export const FiltersForm = memo<FiltersFormProps>(
  function FiltersForm({ onSubmit, defaultParams }) {
    const { t } = useTranslation();
    const { data: categories } = useCategories();

    const { control, handleSubmit, watch } = useForm<FormFields>({
      defaultValues: {
        createdAt: {
          from: defaultParams?.createdAtFrom || '',
          to: defaultParams?.createdAtTo || '',
        },
        categories: defaultParams?.categories || [],
      },
      resolver: yupResolver(schema),
    });

    const data = watch();

    useEffect(() => {
      handleSubmit(onSubmit)();
    }, [data, handleSubmit, onSubmit]);

    return (
      <Stack spacing={2} direction="row" justifyContent="space-between" sx={{ my: 2 }}>
        <Controller
          control={control}
          name="createdAt.from"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <FormControl fullWidth error={!!error}>
              <DatePicker
                label={t('filters.createdAtFrom')}
                format="dd/MM/yyyy"
                value={value ? new Date(value) : null}
                onClose={onBlur}
                onChange={onChange}
              />
            </FormControl>
          )}
        />
        <Controller
          control={control}
          name="createdAt.to"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <FormControl fullWidth error={!!error}>
              <DatePicker
                label={t('filters.createdAtTo')}
                format="dd/MM/yyyy"
                value={value ? new Date(value) : null}
                onClose={onBlur}
                onChange={onChange}
              />
            </FormControl>
          )}
        />
        <Controller
          control={control}
          name="categories"
          render={({ field, fieldState: { error } }) => (
            <FormControl fullWidth error={!!error}>
              <InputLabel>{t('filters.categories')}</InputLabel>
              <Select
                multiple
                {...field}
                renderValue={(selected) =>
                  selected.map((id) => categories.find((cat) => cat.id === id)?.name).join(', ')
                }
              >
                {categories.map(({ id, name }) => (
                  <MenuItem key={id} value={id}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Stack>
    );
  },
  () => true
);
