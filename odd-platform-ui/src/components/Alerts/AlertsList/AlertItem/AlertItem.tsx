import React from 'react';
import { Alert } from 'redux/interfaces';
import { AlertStatus, Permission, PermissionResourceType } from 'generated-sources';
import {
  getResourcePermissions,
  getResourcePermissionsFetchingStatuses,
  isResourcePermissionsAlreadyFetched,
} from 'redux/selectors';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchResourcePermissions } from 'redux/thunks';
import { WithPermissionsProvider } from 'components/shared/contexts';
import AlertItemContent from './AlertItemContent/AlertItemContent';

interface AlertItemProps {
  alert: Alert;
  alertStatusHandler: (alertId: Alert['id'], alertStatus: AlertStatus) => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, alertStatusHandler }) => {
  const dispatch = useAppDispatch();

  const resourcePermissions = useAppSelector(
    getResourcePermissions(PermissionResourceType.DATA_ENTITY, alert.dataEntity?.id)
  );
  const isPermFetched = useAppSelector(
    isResourcePermissionsAlreadyFetched(
      PermissionResourceType.DATA_ENTITY,
      alert.dataEntity?.id
    )
  );

  const { isLoading: isPermissionsFetching } = useAppSelector(
    getResourcePermissionsFetchingStatuses
  );

  const alertOnClickHandle = (
    e: React.MouseEvent<HTMLButtonElement>,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  ) => {
    if (alert.dataEntity?.id && !isPermFetched) {
      dispatch(
        fetchResourcePermissions({
          resourceId: alert.dataEntity.id,
          permissionResourceType: PermissionResourceType.DATA_ENTITY,
        })
      );
    }
    onClick(e);
  };

  return (
    <WithPermissionsProvider
      allowedPermissions={[Permission.DATA_ENTITY_ALERT_RESOLVE]}
      resourcePermissions={resourcePermissions}
      render={() => (
        <AlertItemContent
          alertEntity={alert.dataEntity}
          id={alert.id}
          type={alert.type}
          // description={alert.description}
          createdAt={alert.createdAt}
          status={alert.status}
          statusUpdatedAt={alert.statusUpdatedAt}
          isPermissionsFetching={isPermissionsFetching}
          alertOnClickHandle={alertOnClickHandle}
          alertStatusHandler={alertStatusHandler}
        />
      )}
    />
  );
};

export default AlertItem;
