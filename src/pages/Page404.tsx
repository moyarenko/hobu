import { Alert, Grid2 as Grid } from '@mui/material';

export const Page404 = () => {
  return (
    <Grid
      sx={{
        height: '100dvh',
      }}
      alignItems="center"
      justifyContent="center"
      container
    >
      <Alert severity="error">Sorry, the page you visited does not exist.</Alert>
    </Grid>
  );
};
