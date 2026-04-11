import React, { type FC, useState, type MouseEvent } from 'react';
import { Typography } from '@mui/material';
import ChevronIcon from 'components/shared/icons/ChevronIcon';
import { type DataEntityStatus, DataEntityStatusEnum } from 'generated-sources';
import AppMenuItem from 'components/shared/elements/AppMenuItem/AppMenuItem';
import AppMenu from 'components/shared/elements/AppMenu/AppMenu';
import { useAppDateTime } from 'lib/hooks';
import type { SerializeDateToNumber } from 'redux/interfaces';
import StatusSettingsForm from 'components/shared/elements/EntityStatus/StatusSettingsForm/StatusSettingsForm';
import DefaultEntityStatus from '../DefaultEntityStatus/DefaultEntityStatus';
import * as S from '../EntityStatus.styles';

interface SelectableEntityStatusProps {
  entityStatus: DataEntityStatus | SerializeDateToNumber<DataEntityStatus>;
  isPropagatable: boolean;
}

const SelectableEntityStatus: FC<SelectableEntityStatusProps> = ({
  entityStatus,
  isPropagatable,
}) => {
  const { formatDistanceToNow } = useAppDateTime();
  const menuId = 'entity-status-menu';
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: MouseEvent) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const { status, statusSwitchTime } = entityStatus;

  const isTimeSensitiveStatus =
    ['DRAFT', 'DEPRECATED', 'DELETED'].includes(status) && statusSwitchTime;
  const formattedToNowDate = isTimeSensitiveStatus
    ? formatDistanceToNow(statusSwitchTime)
    : '';
  const text = isTimeSensitiveStatus ? `${formattedToNowDate} left` : '';

  const statusList = Object.values(DataEntityStatusEnum);

  return (
    <>
      <S.EntityStatus
        $status={entityStatus.status}
        $active
        $isPointer
        onClick={handleMenuOpen}
      >
        <>{entityStatus.status}</>
        {text && (
          <Typography ml={0.5} variant='subtitle2' whiteSpace='nowrap'>
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
          <StatusSettingsForm
            handleMenuClose={handleMenuClose}
            openBtnEl={
              <AppMenuItem>
                <DefaultEntityStatus isPointer entityStatus={{ status: s }} />
              </AppMenuItem>
            }
            newStatus={s}
            oldStatus={entityStatus.status}
            isPropagatable={isPropagatable}
            isTimeSensitive={s === 'DEPRECATED' || s === 'DRAFT'}
            key={s}
          />
        ))}
      </AppMenu>
    </>
  );
};

export default SelectableEntityStatus;
