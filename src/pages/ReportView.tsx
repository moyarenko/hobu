import { Box, Fab, Grid2 } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

import { useTitle } from '@/hooks';
import { Routes } from '@/routes';

export const ReportView = () => {
  useTitle('Report view');

  const navigate = useNavigate();
  // const { data, isPending, isError, error } = useCategories();

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
      <Box
        sx={({ spacing }) => ({
          position: 'fixed',
          bottom: spacing(3),
          left: spacing(3),
        })}
      >
        <Fab size="large" color="primary" aria-label="add" onClick={() => navigate(Routes.REPORT_CREATE)}>
          <AddIcon />
        </Fab>
      </Box>
    </Grid2>
  );
};
