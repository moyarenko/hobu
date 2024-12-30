import { Grid2 } from '@mui/material';

import { useCategories, useTitle } from '@/hooks';

export const ReportView = () => {
  useTitle('Report view');
  const { data, isPending, isError, error } = useCategories();

  return (
    <Grid2
      container
      spacing={2}
      sx={{
        minHeight: '100dvh',
      }}
    >
      <Grid2 size={8}></Grid2>
      <Grid2
        size={4}
        sx={({ palette }) => ({
          bgcolor: palette.grey[900],
        })}
      ></Grid2>
    </Grid2>
  );
};
