import type { MouseEvent } from 'react';
import React, { type FC, useCallback, useState } from 'react';
import { Typography } from '@mui/material';
import ChevronIcon from 'components/shared/icons/ChevronIcon';
import { type DataEntityStatus, DataEntityStatusEnum } from 'generated-sources';
import AppMenuItem from 'components/shared/elements/AppMenuItem/AppMenuItem';
import AppMenu from 'components/shared/elements/AppMenu/AppMenu';
import { useAppDateTime, useAppParams, useUpdateDataEntityStatus } from 'lib/hooks';
import type { SerializeDateToNumber } from 'redux/interfaces';
import { useAppDispatch } from 'redux/lib/hooks';
import { updateEntityStatus } from 'redux/slices/dataentities.slice';
import DefaultEntityStatus from '../DefaultEntityStatus/DefaultEntityStatus';
import StatusSettingsForm from '../StatusSettingsForm/StatusSettingsForm';
import * as S from '../EntityStatus.styles';

interface SelectableEntityStatusProps {
  entityStatus: DataEntityStatus | SerializeDateToNumber<DataEntityStatus>;
}

const SelectableEntityStatus: FC<SelectableEntityStatusProps> = ({ entityStatus }) => {
  const dispatch = useAppDispatch();
  const { formatDistanceToNow } = useAppDateTime();
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
    async (newStatus: DataEntityStatusEnum) => {
      const params = { dataEntityId, dataEntityStatus: { status: newStatus } };
      const updatedStatus = await updateStatus(params);
      dispatch(updateEntityStatus({ dataEntityId, status: updatedStatus }));
      handleMenuClose();
    },
    [dataEntityId]
  );

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
        {statusList.map(s =>
          s === 'DRAFT' || s === 'DEPRECATED' ? (
            <StatusSettingsForm
              handleMenuClose={handleMenuClose}
              openBtnEl={
                <AppMenuItem>
                  <DefaultEntityStatus isPointer entityStatus={{ status: s }} />
                </AppMenuItem>
              }
              status={s}
              key={s}
            />
          ) : (
            <AppMenuItem key={s} onClick={() => handleOnClick(s)}>
              <DefaultEntityStatus isPointer entityStatus={{ status: s }} />
            </AppMenuItem>
          )
        )}
      </AppMenu>
    </>
  );
};

export default SelectableEntityStatus;
