import React from 'react';
import { MenuItem, Typography } from '@mui/material';
import { Alert } from 'generated-sources';
import { format } from 'date-fns';
import lowerCase from 'lodash/lowerCase';
import AlertStatusItem from 'components/shared/AlertStatusItem/AlertStatusItem';
import KebabIcon from 'components/shared/Icons/KebabIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import AppTooltip from 'components/shared/AppTooltip/AppTooltip';
import AppPopover from 'components/shared/AppPopover/AppPopover';
import { ColContainer } from '../DataEntityAlertsStyles';
import {
  ActionButtonsContainer,
  Container,
} from './DataEntityAlertItemStyles';

interface DataEntityAlertItemProps {
  alert: Alert;
  alertStatusHandler: () => void;
}

const DataEntityAlertItem: React.FC<DataEntityAlertItemProps> = ({
  alert,
  alertStatusHandler,
}) => (
  <Container container>
    <ColContainer item $colType="date">
      <Typography variant="body1">
        {alert.createdAt && format(alert.createdAt, 'd MMM yyyy, HH:MM a')}
      </Typography>
    </ColContainer>
    <ColContainer item $colType="type">
      <AppTooltip title={() => lowerCase(alert.type)}>
        <Typography variant="body1" title={alert.type} noWrap>
          {lowerCase(alert.type)}
        </Typography>
      </AppTooltip>
    </ColContainer>
    <ColContainer item $colType="description">
      <Typography variant="body1" title={alert.description} noWrap>
        {alert.description}
      </Typography>
    </ColContainer>
    <ColContainer item $colType="status">
      <AlertStatusItem typeName={alert.status} />
    </ColContainer>
    <ColContainer item $colType="updatedBy">
      <Typography variant="body1">
        {alert.statusUpdatedBy?.owner?.name ||
          alert.statusUpdatedBy?.identity.username}
      </Typography>
    </ColContainer>
    <ColContainer item $colType="updatedTime">
      <Typography variant="body1">
        {alert.statusUpdatedAt &&
          format(alert.statusUpdatedAt, 'd MMM yyyy, HH:MM a')}
      </Typography>
    </ColContainer>
    <ActionButtonsContainer item $colType="actionBtn">
      <AppPopover
        renderOpenBtn={({ onClick, ariaDescribedBy }) => (
          <AppIconButton
            ariaDescribedBy={ariaDescribedBy}
            size="medium"
            color="primaryLight"
            icon={<KebabIcon />}
            onClick={onClick}
          />
        )}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 100 }}
      >
        <MenuItem onClick={alertStatusHandler}>
          {alert.status === 'OPEN' ? 'Resolve' : 'Reopen'} alert
        </MenuItem>
      </AppPopover>
    </ActionButtonsContainer>
  </Container>
);

export default DataEntityAlertItem;
