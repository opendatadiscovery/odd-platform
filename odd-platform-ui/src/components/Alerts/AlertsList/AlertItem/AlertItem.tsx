import React from 'react';
import { Collapse, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Alert } from 'redux/interfaces';
import { AlertStatus, Permission, PermissionResourceType } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchResourcePermissions, updateAlertStatus } from 'redux/thunks';
import { useAppDateTime } from 'lib/hooks';
import { GearIcon, UserIcon } from 'components/shared/icons';
import {
  AlertStatusItem,
  Button,
  ConfirmationDialog,
  EntityClassItem,
} from 'components/shared/elements';
import { alertTitlesMap } from 'lib/constants';
import { getGlobalPermissions } from 'redux/selectors';
import { dataEntityDetailsPath } from 'routes';
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
  const { t } = useTranslation();

  const [showHistory, setShowHistory] = React.useState(false);

  const globalPermissions = useAppSelector(getGlobalPermissions);

  const isOpen = alertStatus === AlertStatus.OPEN;

  // The global Alerts page lists alerts across entities, so DATA_ENTITY_ALERT_RESOLVE is checked per entity
  // at confirm time. Both the permission check and the status change use `.unwrap()` so a denial / failure
  // REJECTS the dialog's onConfirm — surfaced inline, the dialog stays open — instead of resolving and
  // closing as success (odd-platform#1766 / CTRIB-031 idiom). The ConfirmationDialog renders its own loading
  // + error state, so the previous bespoke isUpdating / disableResolve / "No access!" caption is gone.
  const onConfirmStatusChange = async () => {
    if (!dataEntity?.id) return;
    const { permissions } = await dispatch(
      fetchResourcePermissions({
        resourceId: dataEntity.id,
        permissionResourceType: PermissionResourceType.DATA_ENTITY,
      })
    ).unwrap();
    if (
      ![...globalPermissions, ...permissions].includes(
        Permission.DATA_ENTITY_ALERT_RESOLVE
      )
    ) {
      // getErrorResponse reads a Response body's `message`, so a thrown Response surfaces "No access!"
      // in the dialog without a shared-util change.
      throw new Response(JSON.stringify({ message: t('No access!') }), { status: 403 });
    }
    const status = isOpen ? AlertStatus.RESOLVED : AlertStatus.OPEN;
    await dispatch(
      updateAlertStatus({ alertId: id, alertStatusFormData: { status } })
    ).unwrap();
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
            {t('Automatically')}
          </Typography>
          {updatedAt}
        </S.Wrapper>
      );
    }

    return null;
  }, [alertStatus, statusUpdatedAt, statusUpdatedBy, t]);

  return (
    <S.Container container>
      <Grid display='flex' container alignItems='center' flexWrap='nowrap'>
        {dataEntity && (
          <>
            <Button
              text={dataEntity.externalName || dataEntity.internalName}
              to={dataEntityDetailsPath(dataEntity.id)}
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
        <Grid container item flexWrap='nowrap' lg={8}>
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
                  text={showHistory ? t('Hide history') : t('Show history')}
                  sx={{ ml: 1 }}
                  buttonType='link-m'
                  onClick={() => setShowHistory(prev => !prev)}
                />
              )}
            </Grid>
          </Grid>
        </Grid>
        <S.Wrapper container item lg={4} $alignItems='flex-start'>
          {resolvedInfo}
          <AlertStatusItem status={alertStatus} />
          <Grid display='flex' flexDirection='column' alignItems='center' sx={{ ml: 2 }}>
            <ConfirmationDialog
              actionTitle={isOpen ? t('Resolve') : t('Reopen')}
              actionName={isOpen ? t('Resolve') : t('Reopen')}
              actionText={
                isOpen
                  ? t('Are you sure you want to resolve this alert?')
                  : t('Are you sure you want to reopen this alert?')
              }
              onConfirm={onConfirmStatusChange}
              actionBtn={
                <Button
                  text={isOpen ? t('Resolve') : t('Reopen')}
                  sx={{ minWidth: '72px !important', minHeight: '24px' }}
                  buttonType='secondary-m'
                />
              }
            />
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
