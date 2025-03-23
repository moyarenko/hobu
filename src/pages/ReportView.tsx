import { Box, Fab, Grid2, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { format } from 'date-fns';

import { useTitle } from '@/hooks';
import { Routes } from '@/routes';
import { FiltersForm } from '@/components/FiltersForm';
import { useOrders } from '@/hooks/useReports';
import { OrderCard } from '@/components/OrderCard/OrderCard';
import { formatUAH } from '@/helper';

export const ReportView = () => {
  useTitle('Report view');

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filter = useMemo(() => {
    const filter: Order.Filter = {};
    const createdAtFrom = searchParams.get('createdAtFrom');
    const createdAtTo = searchParams.get('createdAtTo');
    const categories = searchParams.getAll('categories').map(Number);

    if (createdAtFrom || createdAtTo) {
      filter.createdAt = {
        from: createdAtFrom || undefined,
        to: createdAtTo || undefined,
      };
    }

    if (categories.length > 0) {
      filter.categories = categories;
    }

    return filter;
  }, [searchParams]);

  const { data: orders } = useOrders(filter);

  const handleFiltersSubmit = (data: Order.Filter) => {
    const params: any = {};
    if (data.createdAt?.from) params.createdAtFrom = data.createdAt.from;
    if (data.createdAt?.to) params.createdAtTo = data.createdAt.to;
    if (data.categories) params.categories = data.categories.map(String);

    setSearchParams(params);
  };

  return (
    <Grid2
      container
      direction="column"
      wrap="nowrap"
      sx={{
        height: '100dvh',
      }}
    >
      <Grid2
        sx={{
          height: 'auto',
        }}
      >
        <FiltersForm onSubmit={handleFiltersSubmit} />
      </Grid2>
      <Grid2
        flexGrow={1}
        size={4}
        sx={{
          overflowY: 'auto',
          paddingBlockEnd: 12,
        }}
      >
        {orders.map((order, index) => {
          const showDateHeader = index === 0 || orders[index - 1].created_at !== order.created_at;
          return (
            <div key={order.id}>
              {showDateHeader && (
                <Typography
                  color="textSecondary"
                  fontStyle="italic"
                  fontWeight="bold"
                  variant="subtitle1"
                  sx={{ mt: 2, mb: 1, ml: 2 }}
                >
                  {format(new Date(order.created_at), 'dd.MM.yyyy')}
                </Typography>
              )}
              <OrderCard order={order} />
            </div>
          );
        })}
      </Grid2>
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
