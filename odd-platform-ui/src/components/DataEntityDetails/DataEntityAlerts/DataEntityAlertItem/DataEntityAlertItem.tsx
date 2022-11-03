import React from 'react';
import { Typography } from '@mui/material';
import { format } from 'date-fns';
import lowerCase from 'lodash/lowerCase';
import { AlertStatusItem, AppButton, AppTooltip } from 'components/shared';
import { Alert } from 'redux/interfaces';
import { alertDateFormat } from 'lib/constants';
import { useAppParams } from 'lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import { ColContainer } from '../DataEntityAlertsStyles';
import * as S from './DataEntityAlertItemStyles';

interface DataEntityAlertItemProps {
  alert: Alert;
  alertStatusHandler: () => void;
}

const DataEntityAlertItem: React.FC<DataEntityAlertItemProps> = ({
  alert,
  alertStatusHandler,
}) => {
  const { dataEntityId } = useAppParams();

  return (
    <S.Container container>
      <ColContainer item $colType='date'>
        <Typography variant='body1'>
          {alert.createdAt && format(alert.createdAt, alertDateFormat)}
        </Typography>
      </ColContainer>
      <ColContainer item $colType='type'>
        <AppTooltip title={() => lowerCase(alert.type)}>
          <Typography variant='body1' title={alert.type} noWrap>
            {lowerCase(alert.type)}
          </Typography>
        </AppTooltip>
      </ColContainer>
      <ColContainer item $colType='description'>
        <Typography variant='body1' title={alert.description} noWrap>
          {alert.description}
        </Typography>
      </ColContainer>
      <ColContainer item $colType='status'>
        <AlertStatusItem typeName={alert.status} />
      </ColContainer>
      <ColContainer item $colType='updatedBy'>
        <Typography variant='body1'>
          {alert.statusUpdatedBy?.owner?.name || alert.statusUpdatedBy?.identity.username}
        </Typography>
      </ColContainer>
      <ColContainer item $colType='updatedTime'>
        <Typography variant='body1'>
          {alert.statusUpdatedAt && format(alert.statusUpdatedAt, alertDateFormat)}
        </Typography>
      </ColContainer>
      <S.ActionButtonsContainer item $colType='actionBtn'>
        <WithPermissions
          permissionTo={Permission.DATA_ENTITY_ALERT_RESOLVE}
          resourceId={dataEntityId}
        >
          <AppButton size='medium' color='primaryLight' onClick={alertStatusHandler}>
            {alert.status === 'OPEN' ? 'Resolve' : 'Reopen'}
          </AppButton>
        </WithPermissions>
      </S.ActionButtonsContainer>
    </S.Container>
  );
};

export default DataEntityAlertItem;
