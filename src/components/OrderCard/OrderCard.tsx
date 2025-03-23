import { ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper, Stack, Typography } from '@mui/material';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { useCategories, useDB } from '@/hooks';
import { Routes } from '@/routes';
import { formatUAH } from '@/helper';

interface OrderCardPropsBase {
  order: Order.Item;
}

interface OrderCardPropsWithActions extends OrderCardPropsBase {
  onSuccessDelete: () => void;
  canActions: true;
}

interface OrderCardPropsWithoutActions extends OrderCardPropsBase {
  canActions?: false;
  onSuccessDelete?: never;
}

type OrderCardProps = OrderCardPropsWithActions | OrderCardPropsWithoutActions;

export const OrderCard = ({ order, onSuccessDelete, canActions = false }: OrderCardProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const { data: categories } = useCategories();

  const category = useMemo(
    () => categories.find((item) => order.category_id === item.id),
    [categories, order.category_id]
  );

  const db = useDB();

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);

  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const { mutate } = useMutation<void, unknown, number>({
    mutationFn: (id) => db.deleteOrder(id),
  });

  const handleEdit = (event: Event | React.SyntheticEvent) => {
    navigate(Routes.REPORT_CREATE, {
      state: {
        order,
      },
    });
    handleClose(event);
  };

  const handleConfirmArhive = () => {
    mutate(order.id, {
      onSuccess: () => {
        navigate(Routes.REPORT_CREATE);
        if (onSuccessDelete) onSuccessDelete();
      },
    });
  };

  const handleArhive = (event: Event | React.SyntheticEvent) => {
    if (confirm(`Ви дійсно хочете видалити ₴ ${order.amount} (${category?.name || 'DELETED'})`)) {
      handleConfirmArhive();
    }
    handleClose(event);
  };

  return (
    <>
      <Paper
        sx={({ spacing }) => ({
          paddingBlock: spacing(0.5),
          paddingInline: spacing(2),
        })}
        elevation={open ? 24 : 1}
        key={order.id}
        ref={anchorRef}
        onClick={handleToggle}
      >
        <Stack spacing={3} direction="row" justifyContent="space-between">
          <Typography
            sx={{
              flexBasis: '80px',
            }}
            variant="body2"
            color="textPrimary"
          >
            {formatUAH(order.amount)}
          </Typography>
          <Typography variant="body2" color={category?.color || 'textSecondary'}>
            {category?.name || 'DELETED'}
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
          {order.type === 'credit' && <KeyboardDoubleArrowUpIcon color="error" />}
          {order.type === 'debit' && <KeyboardDoubleArrowDownIcon color="success" />}
        </Stack>
      </Paper>
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} placement="bottom-end" transition disablePortal>
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open} onKeyDown={handleListKeyDown}>
                  {canActions && (
                    <>
                      <MenuItem onClick={handleEdit} disableRipple>
                        <EditIcon />
                        Edit
                      </MenuItem>
                      <MenuItem onClick={handleArhive} disableRipple>
                        <ArchiveIcon />
                        Archive
                      </MenuItem>
                    </>
                  )}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};
