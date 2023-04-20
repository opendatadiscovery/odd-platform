import { Grid } from '@mui/material';
import React from 'react';
import { AppErrorPage, SkeletonWrapper } from 'components/shared/elements';
import { useAppParams } from 'lib/hooks';
import {
  fetchDataEntityAlertsCounts,
  fetchDataEntityDetails,
  fetchDataSetQualitySLAReport,
  fetchDataSetQualityTestReport,
  fetchResourcePermissions,
} from 'redux/thunks';
import {
  getDataEntityAddToGroupStatuses,
  getDataEntityDeleteFromGroupStatuses,
  getDataEntityDetails,
  getDataEntityDetailsFetchingError,
  getDataEntityDetailsFetchingStatuses,
  getDataEntityGroupUpdatingStatuses,
  getResourcePermissions,
} from 'redux/selectors';
import { AlertStatus, Permission, PermissionResourceType } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { WithPermissionsProvider } from 'components/shared/contexts';
import DataEntityDetailsHeader from './DataEntityDetailsHeader/DataEntityDetailsHeader';
import DataEntityDetailsSkeleton from './DataEntityDetailsSkeleton/DataEntityDetailsSkeleton';
import * as S from './DataEntityDetailsStyles';
import DataEntityDetailsTabs from './DataEntityDetailsTabs/DataEntityDetailsTabs';
import DataEntityDetailsRoutes from './DataEntityDetailsRoutes/DataEntityDetailsRoutes';

const DataEntityDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

  const details = useAppSelector(getDataEntityDetails(dataEntityId));
  const resourcePermissions = useAppSelector(
    getResourcePermissions(PermissionResourceType.DATA_ENTITY, dataEntityId)
  );

  const { isLoaded: isDataEntityGroupUpdated } = useAppSelector(
    getDataEntityGroupUpdatingStatuses
  );
  const {
    isLoading: isDataEntityDetailsFetching,
    isNotLoaded: isDataEntityDetailsNotFetched,
  } = useAppSelector(getDataEntityDetailsFetchingStatuses);
  const dataEntityDetailsFetchingError = useAppSelector(
    getDataEntityDetailsFetchingError
  );
  const { isLoaded: isDataEntityAddedToGroup } = useAppSelector(
    getDataEntityAddToGroupStatuses
  );
  const { isLoaded: isDataEntityDeletedFromGroup } = useAppSelector(
    getDataEntityDeleteFromGroupStatuses
  );

  React.useEffect(() => {
    dispatch(fetchDataEntityDetails({ dataEntityId }));
  }, [
    dataEntityId,
    isDataEntityGroupUpdated,
    isDataEntityAddedToGroup,
    isDataEntityDeletedFromGroup,
  ]);

  React.useEffect(() => {
    dispatch(fetchDataEntityAlertsCounts({ dataEntityId, status: AlertStatus.OPEN }));
    dispatch(fetchDataSetQualityTestReport({ dataEntityId }));
    dispatch(fetchDataSetQualitySLAReport({ dataEntityId }));
    dispatch(
      fetchResourcePermissions({
        resourceId: dataEntityId,
        permissionResourceType: PermissionResourceType.DATA_ENTITY,
      })
    );
  }, [dataEntityId]);

  return (
    <S.Container>
      {details.id && !isDataEntityDetailsFetching ? (
        <>
          <WithPermissionsProvider
            allowedPermissions={[
              Permission.DATA_ENTITY_INTERNAL_NAME_UPDATE,
              Permission.DATA_ENTITY_GROUP_UPDATE,
              Permission.DATA_ENTITY_GROUP_DELETE,
            ]}
            resourcePermissions={resourcePermissions}
            render={() => (
              <DataEntityDetailsHeader
                dataEntityId={dataEntityId}
                internalName={details.internalName}
                externalName={details.externalName}
                entityClasses={details.entityClasses}
                type={details.type}
                manuallyCreated={details.manuallyCreated}
                updatedAt={details.updatedAt}
              />
            )}
          />
          <Grid sx={{ mt: 2 }}>
            <DataEntityDetailsTabs />
          </Grid>
        </>
      ) : null}
      {isDataEntityDetailsFetching ? (
        <SkeletonWrapper
          renderContent={({ randWidth }) => (
            <DataEntityDetailsSkeleton width={randWidth()} />
          )}
        />
      ) : null}
      <DataEntityDetailsRoutes />
      <AppErrorPage
        showError={isDataEntityDetailsNotFetched}
        error={dataEntityDetailsFetchingError}
      />
    </S.Container>
  );
};

export default DataEntityDetails;
