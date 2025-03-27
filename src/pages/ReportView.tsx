import { Box, Fab, Grid2, Paper, Stack, styled, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { PieChart } from '@mui/x-charts';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

import { useCategories, useTitle } from '@/hooks';
import { Routes } from '@/routes';
import { FiltersForm } from '@/components/FiltersForm';
import { useOrders } from '@/hooks/useReports';
import { OrderCard } from '@/components/OrderCard/OrderCard';
import { formatUAH, getSize } from '@/helper';

type Statistic = {
  average: Record<
    number,
    {
      category: Category.Item;
      value: number;
    }
  >;
  debit: number;
  credit: number;
  total: number;
};

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
  const { data: categories } = useCategories();

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState([0, 0]);
  const [width, height] = size;

  const statistics = useMemo(() => {
    const statistic: Statistic = {
      average: {},
      debit: 0,
      credit: 0,
      total: 0,
    };

    orders.forEach((order) => {
      const category = categories.find((cat) => cat.id === order.category_id);
      if (!category) return;

      if (order.type === 'debit') {
        statistic.debit += order.amount;
        statistic.total += order.amount;
      } else {
        statistic.credit += order.amount;
        statistic.total -= order.amount;
      }

      if (!statistic.average[category.id]) {
        statistic.average[category.id] = {
          category,
          value: 0,
        };
      }

      if (order.type === 'debit') {
        statistic.average[category.id].value += order.amount;
      } else {
        statistic.average[category.id].value -= order.amount;
      }
    });

    return statistic;
  }, [categories, orders]);

  const { credits, debits } = useMemo(() => {
    const credits = new Map<number, MappedOrderCategory>([]);
    orders.forEach(({ category_id, amount, type }) => {
      if (type === 'credit') {
        const cat = credits.get(category_id);
        if (cat) {
          credits.set(category_id, {
            ...cat,
            value: amount + cat.value,
          });
        } else {
          const findedCategory = categories.find(({ id }) => id === category_id);
          credits.set(category_id, {
            id: `${category_id}-${type}`,
            value: amount,
            label: `${findedCategory?.name || 'DELETED'} (вит.)`,
            color: findedCategory?.color,
          });
        }
      }
    });
    const debits = new Map<number, MappedOrderCategory>([]);
    orders.forEach(({ category_id, amount, type }) => {
      if (type === 'debit') {
        const cat = debits.get(category_id);
        if (cat) {
          debits.set(category_id, {
            ...cat,
            value: amount + cat.value,
          });
        } else {
          const findedCategory = categories.find(({ id }) => id === category_id);
          debits.set(category_id, {
            id: `${category_id}-${type}`,
            value: amount,
            label: `${findedCategory?.name || 'DELETED'} (дох.)`,
            color: findedCategory?.color,
          });
        }
      }
    });
    return {
      credits: Array.from(credits.values()),
      debits: Array.from(debits.values()),
    };
  }, [categories, orders]);

  const handleFiltersSubmit = (data: Order.Filter) => {
    const params: any = {};
    if (data.createdAt?.from) params.createdAtFrom = data.createdAt.from;
    if (data.createdAt?.to) params.createdAtTo = data.createdAt.to;
    if (data.categories) params.categories = data.categories.map(String);

    setSearchParams(params);
  };

  useLayoutEffect(() => {
    setTimeout(() => {
      if (containerRef.current) {
        setSize([
          containerRef.current.getBoundingClientRect().width,
          containerRef.current.getBoundingClientRect().height,
        ]);
      }
    }, 100);
  }, []);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateAreas: `
          'filter filter filter'
          'orders statistics statistics'
        `,
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 2,
        height: '100dvh',
        overflow: 'hidden',
      }}
    >
      <Grid2
        sx={{
          gridArea: 'filter',
        }}
      >
        <FiltersForm onSubmit={handleFiltersSubmit} />
      </Grid2>
      <ScrolledBox
        sx={{
          gridArea: 'orders',
        }}
        container
        direction="column"
        wrap="nowrap"
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
      </ScrolledBox>
      <Grid2 sx={{ p: 2, gridArea: 'statistics' }} size={8} container direction={'column'}>
        <Typography variant="h6">Загальна статистика</Typography>
        <Grid2 size={12} gap={2} container>
          <Paper sx={{ p: 2, flexGrow: 1 }}>
            <Stack alignItems="center" spacing={0.5} direction="row">
              <KeyboardDoubleArrowDownIcon color="success" />
              <Typography color="success" variant="body1">
                Доходи: <b>{formatUAH(statistics.debit)}</b>
              </Typography>
            </Stack>
          </Paper>
          <Paper sx={{ p: 2, flexGrow: 1 }}>
            <Stack alignItems="center" spacing={0.5} direction="row">
              <KeyboardDoubleArrowUpIcon color="error" />
              <Typography color="error" variant="body1">
                Витрати: <b>{formatUAH(statistics.credit)}</b>
              </Typography>
            </Stack>
          </Paper>
          <Paper sx={{ p: 2, flexGrow: 1 }}>
            <Typography color="warning" variant="body1">
              Загальна сума: <b>{formatUAH(statistics.total)}</b>
            </Typography>
          </Paper>
        </Grid2>
        <Typography variant="h6">По категоріям</Typography>
        <Grid2 size={12} gap={2}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gridTemplateRows: 'min-content',
              gap: 2,
            }}
          >
            {Object.values(statistics.average)
              .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
              .map(({ category, value }) => (
                <Paper key={category.id} sx={{ p: 2 }}>
                  <Typography variant="body1" component="div">
                    <Stack alignItems="center" spacing={0.5} direction="row">
                      {value > 0 ? (
                        <KeyboardDoubleArrowDownIcon color="success" />
                      ) : (
                        <KeyboardDoubleArrowUpIcon color="error" />
                      )}
                      {category.name}:
                    </Stack>
                    <br />
                    <b>{formatUAH(value)}</b>
                  </Typography>
                </Paper>
              ))}
          </Box>
        </Grid2>
        <Grid2 flexGrow={1} size={12} ref={containerRef}>
          {!!width && (
            <PieChart
              series={[
                {
                  data: credits,
                  innerRadius: getSize(30, size),
                  outerRadius: getSize(15, size),
                  paddingAngle: 5,
                  cornerRadius: 10,
                  startAngle: -45,
                  cx: getSize(45, size),
                  cy: getSize(50, size),
                  valueFormatter: ({ value }) => formatUAH(value),
                },
                {
                  data: debits,
                  innerRadius: getSize(8, size),
                  outerRadius: getSize(10, size),
                  paddingAngle: 5,
                  cornerRadius: 5,
                  startAngle: -45,
                  cx: getSize(45, size),
                  cy: getSize(50, size),
                  valueFormatter: ({ value }) => formatUAH(value),
                },
              ]}
              width={width}
              height={height}
              slotProps={{
                legend: {
                  hidden: width < 500,
                },
              }}
            />
          )}
        </Grid2>
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
    </Box>
  );
};

const ScrolledBox = styled(Grid2)(
  ({ theme: { palette, spacing } }) => `
  & {
    overflow-y: auto;
    padding-block-end: ${spacing(12)};
  }
  &::-webkit-scrollbar {
    width: 5px !important;
    height: 5px !important;
  }
  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 3px ${palette.grey[700]} !important;
    border-radius: 5px !important;
  }
  &::-webkit-scrollbar-thumb {
    background: ${palette.grey[800]} !important;
    border-radius: 10px !important;
  }
`
);
