import { Grid2, Paper, Stack, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Dispatch, SetStateAction, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { format } from 'date-fns';
import { PieChart } from '@mui/x-charts/PieChart';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

import { useCategories, useTitle } from '@/hooks';
import { useOrders } from '@/hooks/useReports';
export type ReportPageContext = {
  refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<Order.Item[], Error>>;
  setDate: Dispatch<SetStateAction<string | null>>;
};

type MappedOrderCategory = {
  id: number;
  label: string;
  value: number;
};
export const ReportCreate = () => {
  useTitle('Create report');
  const containerRef = useRef<HTMLDivElement>(null);
  const [date, setDate] = useState<string | null>(null);
  const [width, setWidth] = useState(0);

  const createdAt = useMemo<Order.Filter['createdAt'] | undefined>(() => {
    if (date) {
      const from = new Date(date);
      from.setHours(0);
      from.setMinutes(0);
      from.setSeconds(0);
      from.setMilliseconds(0);

      const to = new Date(from);
      to.setDate(to.getDate() + 1);

      return {
        from: from.toISOString(),
        to: to.toISOString(),
      };
    }
    return undefined;
  }, [date]);

  const { data: categories } = useCategories();
  const { data: orders, refetch } = useOrders({
    createdAt,
  });

  const orderCategories = useMemo(() => {
    const cats = new Map<number, MappedOrderCategory>([]);
    orders.forEach(({ category_id, amount }) => {
      const cat = cats.get(category_id);
      if (cat) {
        cats.set(category_id, {
          ...cat,
          value: amount + cat.value,
        });
      } else {
        cats.set(category_id, {
          id: category_id,
          value: amount,
          label: categories.find(({ id }) => id === category_id)?.name || 'DELETED',
        });
      }
    });
    return Array.from(cats.values());
  }, [categories, orders]);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.getBoundingClientRect().width);
    }
  }, []);

  console.log(orderCategories, width);

  return (
    <Grid2
      container
      spacing={2}
      sx={{
        minHeight: '100dvh',
      }}
    >
      <Grid2 size={8}>
        <Grid2 container spacing={1}>
          <Grid2 size={6}>
            <Stack
              spacing={1}
              sx={({ spacing }) => ({
                paddingInline: spacing(2),
                paddingBlock: spacing(3),
              })}
            >
              <Typography variant="subtitle1">
                Записи за <b>{!!date && format(date, 'dd.MM.yyyy')}</b>
              </Typography>
              {orders.map((order) => {
                const cat = categories.find((item) => order.category_id === item.id);
                return (
                  <Paper
                    sx={({ spacing }) => ({
                      paddingBlock: spacing(0.5),
                      paddingInline: spacing(2),
                    })}
                    key={order.id}
                  >
                    <Stack spacing={3} direction="row" justifyContent="space-between">
                      <Typography
                        sx={{
                          flexBasis: '80px',
                        }}
                        variant="body2"
                        color="textPrimary"
                      >
                        ₴{order.amount}
                      </Typography>
                      {}
                      <Typography variant="body2" color={cat?.color || 'textSecondary'}>
                        {cat?.name}
                      </Typography>
                      <Typography
                        sx={{
                          flexBasis: '40%',
                          flexGrow: 1,
                        }}
                        variant="caption"
                      >
                        {order.note}
                      </Typography>
                      {order.type === 'credit' && <KeyboardDoubleArrowDownIcon color="error" />}
                      {order.type === 'debit' && <KeyboardDoubleArrowUpIcon color="success" />}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </Grid2>
          <Grid2 ref={containerRef} size={6}>
            {!!width && (
              <PieChart
                series={[
                  {
                    data: orderCategories,
                    innerRadius: 30,
                    outerRadius: 100,
                    paddingAngle: 5,
                    cornerRadius: 5,
                    startAngle: -45,
                    cx: 150,
                    cy: 150,
                  },
                ]}
                width={width}
                height={window.innerHeight * 0.5}
              />
            )}
          </Grid2>
        </Grid2>
      </Grid2>
      <Grid2
        size={4}
        sx={({ palette, spacing }) => ({
          bgcolor: palette.grey[900],
          padding: spacing(2),
        })}
      >
        <Outlet
          context={{
            refetch,
            setDate,
          }}
        />
      </Grid2>
    </Grid2>
  );
};
