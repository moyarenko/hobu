import { Alert, Grid2 as Grid } from '@mui/material';

export const ErrorElement = () => (
  <Grid
    sx={{
      height: '100dvh',
    }}
    alignItems="center"
    justifyContent="center"
    container
  >
    <Alert severity="error">Some Failed.</Alert>
  </Grid>
);
