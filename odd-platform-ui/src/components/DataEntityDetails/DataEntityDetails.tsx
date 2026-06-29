import { Grid } from '@mui/material';
import React, { useEffect } from 'react';
import { AppErrorPage, SkeletonWrapper } from 'components/shared/elements';
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
import { AlertStatus, AssetKind, Permission, PermissionResourceType } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { useRecordRecentlyViewed } from 'lib/hooks';
import { useDataEntityRouteParams } from 'routes';
import DataEntityDetailsHeader from './DataEntityDetailsHeader/DataEntityDetailsHeader';
import DataEntityDetailsSkeleton from './DataEntityDetailsSkeleton/DataEntityDetailsSkeleton';
import * as S from './DataEntityDetailsStyles';
import DataEntityDetailsTabs from './DataEntityDetailsTabs/DataEntityDetailsTabs';
import DataEntityDetailsRoutes from './DataEntityDetailsRoutes/DataEntityDetailsRoutes';

const DataEntityDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useDataEntityRouteParams();

  // Record this open in the user's Recently Viewed history (a deliberate signal — distinct from the
  // view-count increment on the GET; lookup tables are recorded as their DATA_ENTITY projection). #1816
  useRecordRecentlyViewed(AssetKind.DATA_ENTITY, dataEntityId);

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

  // details.status?.status must NOT be a dependency here: it is populated by this
  // fetch's own fulfilled action, so listing it re-fires the effect once per first
  // visit — every page-open registered two GET /api/dataentities/{id} calls and the
  // backend counted +2 views per visit (#1764). The refetch a status change needs is
  // dispatched explicitly by StatusSettingsForm after the status update succeeds.
  useEffect(() => {
    dispatch(fetchDataEntityDetails({ dataEntityId }));
  }, [
    dataEntityId,
    isDataEntityGroupUpdated,
    isDataEntityAddedToGroup,
    isDataEntityDeletedFromGroup,
  ]);

  useEffect(() => {
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
              Permission.DATA_ENTITY_STATUS_UPDATE,
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
                lastIngestedAt={details.lastIngestedAt}
                isStale={details.isStale}
                status={details.status}
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
