import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertStatusItem,
  AppIconButton,
  AppMenuItem,
  AppPopover,
  AppTooltip,
  EntityClassItem,
} from 'components/shared';
import { Typography } from '@mui/material';
import { KebabIcon } from 'components/shared/Icons';
import { useAppDateTime, useAppPaths, usePermissions } from 'lib/hooks';
import type { Alert } from 'redux/interfaces';
import { AlertStatus } from 'generated-sources';
import * as S from './AlertItemContentStyles';
import { ColContainer } from '../../AlertsListStyles';

interface AlertItemContentProps {
  alertEntity: Alert['dataEntity'];
  id: Alert['id'];
  type: Alert['type'];
  // description: Alert['description'];
  createdAt: Alert['createdAt'];
  status: Alert['status'];
  statusUpdatedAt: Alert['statusUpdatedAt'];
  isPermissionsFetching: boolean;
  alertOnClickHandle: (
    e: React.MouseEvent<HTMLButtonElement>,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  ) => void;
  alertStatusHandler: (alertId: Alert['id'], alertStatus: AlertStatus) => void;
}

const AlertItemContent: React.FC<AlertItemContentProps> = ({
  alertEntity,
  id,
  createdAt,
  alertStatusHandler,
  alertOnClickHandle,
  // description,
  status,
  statusUpdatedAt,
  type,
  isPermissionsFetching,
}) => {
  const { dataEntityDetailsPath } = useAppPaths();
  const { isAllowedTo: alertProcessing } = usePermissions();
  const { alertFormattedDateTime } = useAppDateTime();

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
          <Link to={alertEntity?.id ? dataEntityDetailsPath(alertEntity.id) : '#'}>
            <AppTooltip
              title={() => alertEntity?.internalName || alertEntity?.externalName}
            >
              <Typography variant='body1' noWrap>
                {alertEntity?.internalName || alertEntity?.externalName}
              </Typography>
            </AppTooltip>
          </Link>
        </S.NameContainer>
        <S.TypesContainer>
          {alertEntity?.entityClasses?.map(entityClass => (
            <EntityClassItem
              sx={{ ml: 0.5 }}
              key={entityClass.id}
              entityClassName={entityClass.name}
            />
          ))}
        </S.TypesContainer>
      </ColContainer>
      {/* <ColContainer item $colType='description'> */}
      {/*   <Typography variant='body1' title={type} noWrap> */}
      {/*     {description} */}
      {/*   </Typography> */}
      {/* </ColContainer> */}
      <ColContainer item container $colType='status' justifyContent='center'>
        <AlertStatusItem typeName={status} />
      </ColContainer>
      <ColContainer item $colType='createdTime'>
        <Typography variant='body1'>{alertFormattedDateTime(createdAt)}</Typography>
      </ColContainer>
      <ColContainer item $colType='updatedBy' />
      <ColContainer item $colType='updatedAt'>
        <Typography variant='body1'>{alertFormattedDateTime(statusUpdatedAt)}</Typography>
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
              onClick={() => alertStatusHandler(id, status)}
            >
              {status === 'OPEN' ? 'Resolve' : 'Reopen'} alert
            </AppMenuItem>
          </AppPopover>
        </S.OptionsBtn>
      </ColContainer>
    </S.Container>
  );
};

export default AlertItemContent;
