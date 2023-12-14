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
import { AlertStatus, Permission, PermissionResourceType } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  WithPermissionsProvider,
  DataEntityTypeContext,
} from 'components/shared/contexts';
import { useDataEntityRouteParams } from 'routes';
import DataEntityDetailsHeader from './DataEntityDetailsHeader/DataEntityDetailsHeader';
import DataEntityDetailsSkeleton from './DataEntityDetailsSkeleton/DataEntityDetailsSkeleton';
import * as S from './DataEntityDetailsStyles';
import DataEntityDetailsTabs from './DataEntityDetailsTabs/DataEntityDetailsTabs';
import DataEntityDetailsRoutes from './DataEntityDetailsRoutes/DataEntityDetailsRoutes';

const DataEntityDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useDataEntityRouteParams();

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

  useEffect(() => {
    dispatch(fetchDataEntityDetails({ dataEntityId }));
  }, [
    dataEntityId,
    isDataEntityGroupUpdated,
    isDataEntityAddedToGroup,
    isDataEntityDeletedFromGroup,
    details.status?.status,
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
    <DataEntityTypeContext.Provider value={details.type}>
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
    </DataEntityTypeContext.Provider>
  );
};

export default DataEntityDetails;
