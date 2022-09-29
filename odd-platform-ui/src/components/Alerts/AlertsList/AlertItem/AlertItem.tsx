import { Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  AlertStatusItem,
  AppIconButton,
  AppMenuItem,
  AppPopover,
  AppTooltip,
  EntityClassItem,
} from 'components/shared';
import { KebabIcon } from 'components/shared/Icons';
import { useAppPaths, usePermissions } from 'lib/hooks';
import { Alert } from 'redux/interfaces';
import { alertDateFormat } from 'lib/constants';
import { AlertStatus } from 'generated-sources';
import { fetchDataEntityPermissions } from 'redux/thunks';
import {
  getDataEntityPermissionsFetchingStatuses,
  isDataEntityPermissionsAlreadyFetched,
} from 'redux/selectors';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { ColContainer } from '../AlertsListStyles';
import * as S from './AlertItemStyles';

interface AlertItemProps {
  alert: Alert;
  alertStatusHandler: (alertId: Alert['id'], alertStatus: AlertStatus) => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, alertStatusHandler }) => {
  const { dataEntityDetailsPath } = useAppPaths();
  const dispatch = useAppDispatch();
  const { isAllowedTo: alertProcessing } = usePermissions({
    dataEntityId: alert.dataEntity?.id,
  });

  const isPermFetched = useAppSelector(
    isDataEntityPermissionsAlreadyFetched(alert.dataEntity?.id)
  );

  const { isLoading: isPermissionsFetching } = useAppSelector(
    getDataEntityPermissionsFetchingStatuses
  );

  const alertOnClickHandle = (
    e: React.MouseEvent<HTMLButtonElement>,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  ) => {
    if (alert.dataEntity?.id && !isPermFetched) {
      dispatch(fetchDataEntityPermissions({ dataEntityId: alert.dataEntity.id }));
    }
    onClick(e);
  };

  return (
    <S.Container container>
      <ColContainer
        item
        container
        $colType='name'
        justifyContent='space-between'
        wrap='nowrap'
      >
        <S.NameContainer>
          <Link
            to={alert.dataEntity?.id ? dataEntityDetailsPath(alert.dataEntity.id) : '#'}
          >
            <AppTooltip
              title={() =>
                alert.dataEntity?.internalName || alert.dataEntity?.externalName
              }
            >
              <Typography variant='body1' noWrap>
                {alert.dataEntity?.internalName || alert.dataEntity?.externalName}
              </Typography>
            </AppTooltip>
          </Link>
        </S.NameContainer>
        <S.TypesContainer>
          {alert.dataEntity?.entityClasses?.map(entityClass => (
            <EntityClassItem
              sx={{ ml: 0.5 }}
              key={entityClass.id}
              entityClassName={entityClass.name}
            />
          ))}
        </S.TypesContainer>
      </ColContainer>
      <ColContainer item $colType='description'>
        <Typography variant='body1' title={alert.type} noWrap>
          {alert.description}
        </Typography>
      </ColContainer>
      <ColContainer item container $colType='status' justifyContent='center'>
        <AlertStatusItem typeName={alert.status} />
      </ColContainer>
      <ColContainer item $colType='createdTime'>
        <Typography variant='body1'>
          {alert.createdAt && format(alert.createdAt, alertDateFormat)}
        </Typography>
      </ColContainer>
      <ColContainer item $colType='updatedBy' />
      <ColContainer item $colType='updatedAt'>
        <Typography variant='body1'>
          {alert.statusUpdatedAt && format(alert.statusUpdatedAt, alertDateFormat)}
        </Typography>
      </ColContainer>
      <ColContainer item $colType='actionBtn'>
        <S.OptionsBtn>
          <AppPopover
            renderOpenBtn={({ onClick, ariaDescribedBy }) => (
              <AppIconButton
                ariaDescribedBy={ariaDescribedBy}
                size='medium'
                color='primaryLight'
                icon={<KebabIcon />}
                onClick={e => alertOnClickHandle(e, onClick)}
              />
            )}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            isLoading={isPermissionsFetching}
          >
            <AppMenuItem
              disabled={!alertProcessing}
              onClick={() => alertStatusHandler(alert.id, alert.status)}
            >
              {alert.status === 'OPEN' ? 'Resolve' : 'Reopen'} alert
            </AppMenuItem>
          </AppPopover>
        </S.OptionsBtn>
      </ColContainer>
    </S.Container>
  );
};

export default AlertItem;
