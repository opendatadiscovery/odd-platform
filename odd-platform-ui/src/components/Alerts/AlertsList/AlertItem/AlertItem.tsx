import React from 'react';
import type { Alert } from 'redux/interfaces';
import { AlertStatus, Permission, PermissionResourceType } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchResourcePermissions, updateAlertStatus } from 'redux/thunks';
import { useAppDateTime, useAppPaths } from 'lib/hooks';
import { Collapse, Grid, Typography } from '@mui/material';
import { GearIcon, UserIcon } from 'components/shared/icons';
import { AlertStatusItem, Button, EntityClassItem } from 'components/shared/elements';
import { alertTitlesMap } from 'lib/constants';
import { getGlobalPermissions } from 'redux/selectors';
import * as S from './AlertItemStyles';

interface AlertItemProps {
  alert: Alert;
}

const AlertItem: React.FC<AlertItemProps> = ({
  alert: {
    id,
    lastCreatedAt,
    alertChunkList,
    dataEntity,
    status: alertStatus,
    type,
    statusUpdatedAt,
    statusUpdatedBy,
  },
}) => {
  const dispatch = useAppDispatch();
  const { alertFormattedDateTime } = useAppDateTime();
  const { dataEntityOverviewPath } = useAppPaths();

  const [showHistory, setShowHistory] = React.useState(false);
  const [disableResolve, setDisableResolve] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const globalPermissions = useAppSelector(getGlobalPermissions);

  const dispatchUpdateAlertStatus = () => {
    const status =
      alertStatus === AlertStatus.OPEN ? AlertStatus.RESOLVED : AlertStatus.OPEN;
    dispatch(updateAlertStatus({ alertId: id, alertStatusFormData: { status } })).then(
      () => setIsUpdating(false)
    );
  };

  const handleResolve = () => {
    if (dataEntity?.id) {
      const params = {
        resourceId: dataEntity.id,
        permissionResourceType: PermissionResourceType.DATA_ENTITY,
      };
      setIsUpdating(true);
      dispatch(fetchResourcePermissions(params))
        .unwrap()
        .then(({ permissions }) => {
          if (
            [...globalPermissions, ...permissions].includes(
              Permission.DATA_ENTITY_ALERT_RESOLVE
            )
          ) {
            dispatchUpdateAlertStatus();
          } else {
            setIsUpdating(false);
            setDisableResolve(true);
          }
        });
    }
  };

  const resolvedInfo = React.useMemo(() => {
    const updatedAt = statusUpdatedAt && (
      <Typography variant='body1' color='texts.hint'>
        {alertFormattedDateTime(statusUpdatedAt)}
      </Typography>
    );

    if (alertStatus === 'RESOLVED') {
      return (
        <S.Wrapper container sx={{ mr: 1 }} alignItems='baseline'>
          {statusUpdatedBy && (
            <>
              <UserIcon stroke='black' />
              <Typography variant='body1' color='texts.hint' sx={{ mx: 0.5 }}>
                {statusUpdatedBy?.owner?.name || statusUpdatedBy?.identity?.username}
                {', '}
              </Typography>
            </>
          )}
          {updatedAt}
        </S.Wrapper>
      );
    }

    if (alertStatus === 'RESOLVED_AUTOMATICALLY') {
      return (
        <S.Wrapper container sx={{ mr: 1 }} alignItems='baseline'>
          <Grid>
            <GearIcon stroke='black' />
          </Grid>
          <Typography variant='body1' color='texts.hint' sx={{ mx: 0.5 }}>
            Automatically
          </Typography>
          {updatedAt}
        </S.Wrapper>
      );
    }

    return null;
  }, [alertStatus, statusUpdatedAt, statusUpdatedBy]);

  return (
    <S.Container container>
      <Grid display='flex' container alignItems='center' flexWrap='nowrap'>
        {dataEntity && (
          <>
            <Button
              text={dataEntity.externalName || dataEntity.internalName}
              to={dataEntityOverviewPath(dataEntity.id)}
              buttonType='link-m'
            />
            {dataEntity?.entityClasses?.map(entityClass => (
              <EntityClassItem
                sx={{ ml: 0.5 }}
                key={entityClass.id}
                entityClassName={entityClass.name}
              />
            ))}
          </>
        )}
      </Grid>
      <Grid sx={{ mt: 0.5 }} container flexWrap='nowrap'>
        <Grid container flexWrap='nowrap' lg={8}>
          <Grid container flexDirection='column'>
            <Typography variant='h4'>{alertTitlesMap.get(type)}</Typography>
            <Grid container flexWrap='nowrap' alignItems='center' sx={{ mt: 0.5 }}>
              {lastCreatedAt && (
                <Typography variant='subtitle1'>
                  {alertFormattedDateTime(lastCreatedAt)}
                </Typography>
              )}
              {alertChunkList && alertChunkList?.length > 0 && (
                <Button
                  text={`${showHistory ? 'Hide' : 'Show'} history`}
                  sx={{ ml: 1 }}
                  buttonType='link-m'
                  onClick={() => setShowHistory(prev => !prev)}
                />
              )}
            </Grid>
          </Grid>
        </Grid>
        <S.Wrapper container lg={4} $alignItems='flex-start'>
          {resolvedInfo}
          <AlertStatusItem status={alertStatus} />
          <Grid display='flex' flexDirection='column' alignItems='center' sx={{ ml: 2 }}>
            <Button
              text={alertStatus === 'OPEN' ? 'Resolve' : 'Reopen'}
              sx={{ minWidth: '72px !important', minHeight: '24px' }}
              buttonType='secondary-m'
              onClick={handleResolve}
              disabled={disableResolve}
              isLoading={isUpdating}
            />
            {disableResolve && <Typography variant='caption'>No access!</Typography>}
          </Grid>
        </S.Wrapper>
      </Grid>
      <Collapse in={showHistory} timeout={0} unmountOnExit>
        <Grid container flexDirection='column' flexWrap='nowrap' sx={{ ml: 0.5, mt: 2 }}>
          {alertChunkList?.map(alertChunk => (
            <Grid
              key={alertChunk.description}
              container
              flexWrap='nowrap'
              sx={{ py: 0.75 }}
            >
              {alertChunk.createdAt && (
                <Typography whiteSpace='nowrap' variant='subtitle1'>
                  {alertFormattedDateTime(alertChunk.createdAt)}
                </Typography>
              )}
              <Typography sx={{ ml: 1.25 }} variant='subtitle1'>
                {alertChunk.description}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Collapse>
    </S.Container>
  );
};

export default AlertItem;
