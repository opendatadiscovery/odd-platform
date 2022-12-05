import React from 'react';
import { Typography } from '@mui/material';
import lowerCase from 'lodash/lowerCase';
import { AlertStatusItem, AppButton, AppTooltip } from 'components/shared';
import type { Alert } from 'redux/interfaces';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import { useAppDateTime } from 'lib/hooks';
import { ColContainer } from '../DataEntityAlertsStyles';
import * as S from './DataEntityAlertItemStyles';

interface DataEntityAlertItemProps {
  alert: Alert;
  alertStatusHandler: () => void;
}

const DataEntityAlertItem: React.FC<DataEntityAlertItemProps> = ({
  alert: { createdAt, type, statusUpdatedAt, statusUpdatedBy, status },
  alertStatusHandler,
}) => {
  const { alertFormattedDateTime } = useAppDateTime();

  return (
    <S.Container container>
      <ColContainer item $colType='date'>
        <Typography variant='body1'>{alertFormattedDateTime(createdAt)}</Typography>
      </ColContainer>
      <ColContainer item $colType='type'>
        <AppTooltip title={() => lowerCase(type)}>
          <Typography variant='body1' title={type} noWrap>
            {lowerCase(type)}
          </Typography>
        </AppTooltip>
      </ColContainer>
      {/* <ColContainer item $colType='description'> */}
      {/*   <Typography variant='body1' title={description} noWrap> */}
      {/*     {description} */}
      {/*   </Typography> */}
      {/* </ColContainer> */}
      <ColContainer item $colType='status'>
        <AlertStatusItem typeName={status} />
      </ColContainer>
      <ColContainer item $colType='updatedBy'>
        <Typography variant='body1'>
          {statusUpdatedBy?.owner?.name || statusUpdatedBy?.identity.username}
        </Typography>
      </ColContainer>
      <ColContainer item $colType='updatedTime'>
        <Typography variant='body1'>{alertFormattedDateTime(statusUpdatedAt)}</Typography>
      </ColContainer>
      <S.ActionButtonsContainer item $colType='actionBtn'>
        <WithPermissions permissionTo={Permission.DATA_ENTITY_ALERT_RESOLVE}>
          <AppButton size='medium' color='primaryLight' onClick={alertStatusHandler}>
            {status === 'OPEN' ? 'Resolve' : 'Reopen'}
          </AppButton>
        </WithPermissions>
      </S.ActionButtonsContainer>
    </S.Container>
  );
};

export default DataEntityAlertItem;
