import { Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import AlertStatusItem from 'components/shared/AlertStatusItem/AlertStatusItem';
import KebabIcon from 'components/shared/Icons/KebabIcon';
import EntityClassItem from 'components/shared/EntityClassItem/EntityClassItem';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import AppTooltip from 'components/shared/AppTooltip/AppTooltip';
import AppPopover from 'components/shared/AppPopover/AppPopover';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import { useAppPaths } from 'lib/hooks';
import { Alert } from 'redux/interfaces';
import { alertDateFormat } from 'lib/constants';
import { ColContainer } from '../AlertsListStyles';
import * as S from './AlertItemStyles';

interface AlertItemProps {
  alert: Alert;
  alertStatusHandler: () => void;
}

const AlertItem: React.FC<AlertItemProps> = ({
  alert,
  alertStatusHandler,
}) => {
  const { dataEntityDetailsPath } = useAppPaths();

  return (
    <S.Container container>
      <ColContainer
        item
        container
        $colType="name"
        justifyContent="space-between"
        wrap="nowrap"
      >
        <S.NameContainer>
          <Link
            to={
              alert?.dataEntity?.id
                ? dataEntityDetailsPath(alert.dataEntity.id)
                : '#'
            }
          >
            <AppTooltip
              title={() =>
                alert.dataEntity?.internalName ||
                alert.dataEntity?.externalName
              }
            >
              <Typography variant="body1" noWrap>
                {alert.dataEntity?.internalName ||
                  alert.dataEntity?.externalName}
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
      <ColContainer item $colType="description">
        <Typography variant="body1" title={alert.type} noWrap>
          {alert.description}
        </Typography>
      </ColContainer>
      <ColContainer
        item
        container
        $colType="status"
        justifyContent="center"
      >
        <AlertStatusItem typeName={alert.status} />
      </ColContainer>
      <ColContainer item $colType="createdTime">
        <Typography variant="body1">
          {alert.createdAt && format(alert.createdAt, alertDateFormat)}
        </Typography>
      </ColContainer>
      <ColContainer item $colType="updatedBy" />
      <ColContainer item $colType="updatedAt">
        <Typography variant="body1">
          {alert.statusUpdatedAt &&
            format(alert.statusUpdatedAt, alertDateFormat)}
        </Typography>
      </ColContainer>
      <ColContainer item $colType="actionBtn">
        <S.OptionsBtn>
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
            <AppMenuItem onClick={alertStatusHandler}>
              {alert.status === 'OPEN' ? 'Resolve' : 'Reopen'} alert
            </AppMenuItem>
          </AppPopover>
        </S.OptionsBtn>
      </ColContainer>
    </S.Container>
  );
};

export default AlertItem;
