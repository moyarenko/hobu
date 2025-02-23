import { Grid2, Stack, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Dispatch, SetStateAction, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { PieChart } from '@mui/x-charts/PieChart';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { format } from 'date-fns';

import { useCategories, useTitle } from '@/hooks';
import { useOrders } from '@/hooks/useReports';
import { OrderCard } from '@/components/OrderCard';
export type ReportPageContext = {
  refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<Order.Item[], Error>>;
  setDate: Dispatch<SetStateAction<string | null>>;
};

type MappedOrderCategory = {
  id: string;
  label: string;
  value: number;
  color?: string;
};

const getSize = (x: number, y: number[]) => {
  //y - 100
  //res -  x
  return (x * Math.min(...y)) / 100;
};
export const ReportCreate = () => {
  useTitle('Create report');
  const containerRef = useRef<HTMLDivElement>(null);
  const [date, setDate] = useState<string | null>(null);
  const [size, setSize] = useState([0, 0]);

  const [width, height] = size;

  const createdAt = useMemo<Order.Filter['createdAt'] | undefined>(() => {
    if (date) {
      const from = new Date(date);
      from.setHours(0);
      from.setMinutes(0);
      from.setSeconds(0);
      from.setMilliseconds(0);

      const to = new Date(from);
      to.setDate(to.getDate() + 1);
      to.setMilliseconds(to.getMilliseconds() - 1);

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

  const sorted = useMemo(() => orders.sort((a, b) => (a.id < b.id ? -1 : 1)), [orders]);

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
            label: `${findedCategory?.name || 'DELETED'} (витрата)`,
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
            label: `${findedCategory?.name || 'DELETED'} (дохід)`,
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
              {sorted.map((order) => {
                const category = categories.find((item) => order.category_id === item.id);
                return <OrderCard key={order.id} order={order} category={category} onSuccessDelete={refetch} />;
              })}
            </Stack>
          </Grid2>
          <Grid2 ref={containerRef} size={6}>
            <Stack
              sx={({ spacing }) => ({
                paddingInline: spacing(2),
                paddingBlock: spacing(3),
              })}
              direction="row"
              justifyContent="flex-end"
              spacing={3}
            >
              <Typography
                sx={{
                  flexGrow: 1,
                }}
                variant="subtitle1"
              >
                Записи за <b>{!!date && format(date, 'dd.MM.yyyy')}</b>
              </Typography>
              <Stack alignItems="center" spacing={0.5} direction="row">
                <KeyboardDoubleArrowDownIcon color="success" />
                <Typography color="success" variant="subtitle1">
                  Дохід <b>₴&nbsp;{debits.reduce((acc, cur) => acc + cur.value, 0)}</b>
                </Typography>
              </Stack>
              <Stack alignItems="center" spacing={0.5} direction="row">
                <KeyboardDoubleArrowUpIcon color="error" />
                <Typography color="error" align="right" variant="subtitle1">
                  Витрати <b>₴&nbsp;{credits.reduce((acc, cur) => acc + cur.value, 0)}</b>
                </Typography>
              </Stack>
            </Stack>
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
                  },
                ]}
                width={width}
                height={height}
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
