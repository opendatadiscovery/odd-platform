import { Grid } from '@mui/material';
import React, { useMemo } from 'react';
import {
  getDataEntityDetails,
  getDataEntityDetailsFetchingStatuses,
  getDatasetTestReport,
  getIsDataEntityBelongsToClass,
  getResourcePermissions,
} from 'redux/selectors';
import { hasDataQualityTestExpectations } from 'lib/helpers';
import { SkeletonWrapper } from 'components/shared/elements';
import { useAppSelector } from 'redux/lib/hooks';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { Permission, PermissionResourceType } from 'generated-sources';
import { useDataEntityRouteParams } from 'routes';
import OverviewMetrics from './OverviewMetrics/OverviewMetrics';
import OverviewDQTestReport from './OverviewDataQualityReport/OverviewDQTestReport/OverviewDQTestReport';
import OverviewDQSLAReport from './OverviewDataQualityReport/OverviewDQSLAReport/OverviewDQSLAReport';
import OverviewExpectations from './OverviewExpectations/OverviewExpectations';
import OverviewGroups from './OverviewGroups/OverviewGroups';
import OverviewSkeleton from './OverviewSkeleton/OverviewSkeleton';
import OverviewDescription from './OverviewDescription/OverviewDescription';
import OverviewMetadata from './OverviewMetadata/OverviewMetadata';
import OverviewStats from './OverviewStats/OverviewStats';
import OverviewTags from './OverviewTags/OverviewTags';
import { SectionContainer } from './OverviewStyles';
import OverviewGeneral from './OverviewGeneral/OverviewGeneral';
import OverviewTerms from './OverviewTerms/OverviewTerms';
import OverviewAttachments from './OverviewAttachments/OverviewAttachments';

const Overview: React.FC = () => {
  const { dataEntityId } = useDataEntityRouteParams();

  const dataEntityDetails = useAppSelector(getDataEntityDetails(dataEntityId));
  const { isDataset } = useAppSelector(getIsDataEntityBelongsToClass(dataEntityId));
  const datasetQualityTestReport = useAppSelector(getDatasetTestReport(dataEntityId));
  const resourcePermissions = useAppSelector(
    getResourcePermissions(PermissionResourceType.DATA_ENTITY, dataEntityId)
  );

  const { isLoading: isDataEntityDetailsFetching } = useAppSelector(
    getDataEntityDetailsFetchingStatuses
  );

  const termRefs = useMemo(
    () => dataEntityDetails.terms?.map(linkedTerm => linkedTerm.term),
    [dataEntityDetails.terms]
  );

  return (
    <>
      {dataEntityDetails && !isDataEntityDetailsFetching ? (
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={9}>
            <SectionContainer elevation={9}>
              <OverviewStats />
            </SectionContainer>
            {hasDataQualityTestExpectations(dataEntityDetails?.expectation) && (
              <SectionContainer square elevation={0}>
                <OverviewExpectations
                  parameters={dataEntityDetails.expectation}
                  linkedUrlList={dataEntityDetails.linkedUrlList}
                />
              </SectionContainer>
            )}
            <SectionContainer square elevation={0}>
              <WithPermissionsProvider
                allowedPermissions={[Permission.DATA_ENTITY_DESCRIPTION_UPDATE]}
                resourcePermissions={resourcePermissions}
                render={() => <OverviewDescription termRefs={termRefs} />}
              />
            </SectionContainer>
            <SectionContainer square elevation={0}>
              <WithPermissionsProvider
                allowedPermissions={[Permission.DATA_ENTITY_ATTACHMENT_MANAGE]}
                resourcePermissions={resourcePermissions}
                Component={OverviewAttachments}
              />
            </SectionContainer>
            <SectionContainer square elevation={0}>
              <WithPermissionsProvider
                allowedPermissions={[
                  Permission.DATA_ENTITY_CUSTOM_METADATA_CREATE,
                  Permission.DATA_ENTITY_CUSTOM_METADATA_UPDATE,
                  Permission.DATA_ENTITY_CUSTOM_METADATA_DELETE,
                ]}
                resourcePermissions={resourcePermissions}
                Component={OverviewMetadata}
              />
            </SectionContainer>
            <OverviewMetrics showOverview={isDataset} />
          </Grid>
          <Grid item xs={3}>
            <SectionContainer square elevation={0}>
              <WithPermissionsProvider
                allowedPermissions={[
                  Permission.DATA_ENTITY_OWNERSHIP_CREATE,
                  Permission.DATA_ENTITY_OWNERSHIP_UPDATE,
                  Permission.DATA_ENTITY_OWNERSHIP_DELETE,
                ]}
                resourcePermissions={resourcePermissions}
                Component={OverviewGeneral}
              />
            </SectionContainer>
            {isDataset && datasetQualityTestReport?.total ? (
              <SectionContainer square elevation={0}>
                <OverviewDQSLAReport dataEntityId={dataEntityId} />
                <OverviewDQTestReport dataEntityId={dataEntityId} />
              </SectionContainer>
            ) : null}
            <SectionContainer square elevation={0}>
              <WithPermissionsProvider
                allowedPermissions={[
                  Permission.DATA_ENTITY_ADD_TO_GROUP,
                  Permission.DATA_ENTITY_DELETE_FROM_GROUP,
                ]}
                resourcePermissions={resourcePermissions}
                render={() => (
                  <OverviewGroups
                    dataEntityGroups={dataEntityDetails.dataEntityGroups}
                    dataEntityId={dataEntityId}
                  />
                )}
              />
            </SectionContainer>
            <SectionContainer square elevation={0}>
              <WithPermissionsProvider
                allowedPermissions={[Permission.DATA_ENTITY_TAGS_UPDATE]}
                resourcePermissions={resourcePermissions}
                render={() => <OverviewTags tags={dataEntityDetails.tags} />}
              />
            </SectionContainer>
            <SectionContainer square elevation={0}>
              <WithPermissionsProvider
                allowedPermissions={[
                  Permission.DATA_ENTITY_ADD_TERM,
                  Permission.DATA_ENTITY_DELETE_TERM,
                ]}
                resourcePermissions={resourcePermissions}
                render={() => (
                  <OverviewTerms
                    terms={dataEntityDetails.terms}
                    dataEntityId={dataEntityId}
                  />
                )}
              />
            </SectionContainer>
          </Grid>
        </Grid>
      ) : null}
      {isDataEntityDetailsFetching ? (
        <SkeletonWrapper
          renderContent={({ randWidth }) => <OverviewSkeleton width={randWidth()} />}
        />
      ) : null}
    </>
  );
};
export default Overview;