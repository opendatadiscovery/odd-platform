import type { MouseEvent } from 'react';
import React, { type FC, useCallback, useState } from 'react';
import { Typography } from '@mui/material';
import ChevronIcon from 'components/shared/icons/ChevronIcon';
import { formatDistanceToNow } from 'date-fns';
import { type DataEntityStatus, DataEntityStatusEnum } from 'generated-sources';
import AppMenuItem from 'components/shared/elements/AppMenuItem/AppMenuItem';
import AppMenu from 'components/shared/elements/AppMenu/AppMenu';
import { useAppParams, useUpdateDataEntityStatus } from 'lib/hooks';
import DefaultEntityStatus from '../DefaultEntityStatus/DefaultEntityStatus';
import * as S from '../EntityStatus.styles';

interface SelectableEntityStatusProps {
  entityStatus: DataEntityStatus;
}

const SelectableEntityStatus: FC<SelectableEntityStatusProps> = ({ entityStatus }) => {
  const { dataEntityId } = useAppParams();
  const menuId = 'entity-status-menu';
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const isMenuOpen = Boolean(anchorEl);
  const { mutateAsync: updateStatus } = useUpdateDataEntityStatus();

  const handleMenuOpen = (event: MouseEvent) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const { status, statusSwitchTime } = entityStatus;

  const isTimeSensitiveStatus =
    ['DRAFT', 'DEPRECATED', 'DELETED'].includes(status) && statusSwitchTime;
  const formattedToNowDate = isTimeSensitiveStatus
    ? formatDistanceToNow(statusSwitchTime)
    : '';
  const text = isTimeSensitiveStatus ? `${formattedToNowDate} left` : '';

  const handleOnClick = useCallback(
    async (newStatus: DataEntityStatusEnum) =>
      updateStatus({ dataEntityId, dataEntityStatus: { status: newStatus } }),
    [dataEntityId]
  );

  const statusList = Object.values(DataEntityStatusEnum);

  return (
    <>
      <S.EntityStatus $status={entityStatus.status} $selectable onClick={handleMenuOpen}>
        <>{entityStatus.status}</>
        {text && (
          <Typography ml={0.5} variant='subtitle2'>
            {text}
          </Typography>
        )}
        <ChevronIcon sx={{ ml: 0.5 }} />
      </S.EntityStatus>
      <AppMenu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={menuId}
        keepMounted
        transformOrigin={{ vertical: -30, horizontal: 'right' }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        {statusList.map(s => (
          <AppMenuItem
            key={s}
            onClick={
              s === 'DRAFT' || s === 'DELETED' || s === 'DEPRECATED'
                ? undefined
                : () => handleOnClick(s)
            }
          >
            <DefaultEntityStatus entityStatus={{ status: s }} disablePointerEvents />
          </AppMenuItem>
        ))}
      </AppMenu>
    </>
  );
};

export default SelectableEntityStatus;
