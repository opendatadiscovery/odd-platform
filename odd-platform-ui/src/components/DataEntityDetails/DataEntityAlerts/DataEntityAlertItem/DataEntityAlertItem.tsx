import React from 'react';
import type { Alert } from 'redux/interfaces';
import { AlertStatus, Permission } from 'generated-sources';
import { useAppDateTime } from 'lib/hooks';
import { updateAlertStatus } from 'redux/thunks';
import { useAppDispatch } from 'redux/lib/hooks';
import { Collapse, Grid, Typography } from '@mui/material';
import { AlertStatusItem, AppButton } from 'components/shared';
import { WithPermissions } from 'components/shared/contexts';
import { GearIcon, UserIcon } from 'components/shared/Icons';
import { alertTitlesMap } from 'lib/constants';
import * as S from './DataEntityAlertItemStyles';

interface DataEntityAlertItemProps {
  alert: Alert;
}

const DataEntityAlertItem: React.FC<DataEntityAlertItemProps> = ({
  alert: {
    id: alertId,
    type,
    statusUpdatedAt,
    statusUpdatedBy,
    status: alertStatus,
    lastCreatedAt,
    alertChunkList,
  },
}) => {
  const dispatch = useAppDispatch();
  const { alertFormattedDateTime } = useAppDateTime();

  const [showHistory, setShowHistory] = React.useState(false);

  const alertStatusHandler = () => {
    const status =
      alertStatus === AlertStatus.OPEN ? AlertStatus.RESOLVED : AlertStatus.OPEN;

    dispatch(updateAlertStatus({ alertId, alertStatusFormData: { status } }));
  };

  const resolvedInfo = React.useMemo(() => {
    const updatedAt = statusUpdatedAt && (
      <Typography variant='body1' color='texts.hint'>
        {alertFormattedDateTime(statusUpdatedAt)}
      </Typography>
    );

    if (alertStatus === 'RESOLVED') {
      return (
        <S.Wrapper container sx={{ mr: 1 }}>
          <UserIcon stroke='black' />
          <Typography variant='body1' color='texts.hint' sx={{ mx: 0.5 }}>
            {statusUpdatedBy?.owner?.name || statusUpdatedBy?.identity?.username}
            {', '}
          </Typography>
          {updatedAt}
        </S.Wrapper>
      );
    }

    if (alertStatus === 'RESOLVED_AUTOMATICALLY') {
      return (
        <S.Wrapper container sx={{ mr: 1 }}>
          <GearIcon stroke='black' />
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
      <Grid container flexWrap='nowrap'>
        <Grid container flexWrap='nowrap' lg={8}>
          <Grid container flexDirection='column'>
            <Typography variant='h4'>{alertTitlesMap.get(type)}</Typography>
            <Grid container flexWrap='nowrap' sx={{ mt: 0.5 }}>
              {lastCreatedAt && (
                <Typography variant='subtitle1'>
                  {alertFormattedDateTime(lastCreatedAt)}
                </Typography>
              )}
              {alertChunkList && alertChunkList?.length > 0 && (
                <AppButton
                  sx={{ ml: 1 }}
                  size='medium'
                  color='tertiary'
                  onClick={() => setShowHistory(prev => !prev)}
                >
                  {`${showHistory ? 'Hide' : 'Show'} history`}
                </AppButton>
              )}
            </Grid>
          </Grid>
        </Grid>
        <S.Wrapper container lg={4}>
          {resolvedInfo}
          <AlertStatusItem status={alertStatus} />
          <WithPermissions permissionTo={Permission.DATA_ENTITY_ALERT_RESOLVE}>
            <Grid>
              <AppButton
                sx={{ ml: 2 }}
                size='medium'
                color='primaryLight'
                onClick={alertStatusHandler}
              >
                {alertStatus === 'OPEN' ? 'Resolve' : 'Reopen'}
              </AppButton>
            </Grid>
          </WithPermissions>
        </S.Wrapper>
      </Grid>
      <Collapse in={showHistory} timeout={0} unmountOnExit>
        <Grid container flexDirection='column' flexWrap='nowrap' sx={{ mt: 2 }}>
          {alertChunkList?.map(alertChunk => (
            <Grid container flexWrap='nowrap' sx={{ py: 0.75 }}>
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

export default DataEntityAlertItem;
