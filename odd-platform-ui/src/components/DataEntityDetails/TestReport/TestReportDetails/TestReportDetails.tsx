import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  AppCircularProgress,
  type AppTabItem,
  AppTabs,
  AppTooltip,
} from 'components/shared/elements';
import { getQualityTestByTestId, getResourcePermissions } from 'redux/selectors';
import { useAppSelector } from 'redux/lib/hooks';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { Permission, PermissionResourceType } from 'generated-sources';
import {
  dataEntityDetailsPath,
  dataEntityTestReportsPath,
  useDataEntityRouteParams,
} from 'routes';
import useSetSelectedTab from 'components/shared/elements/AppTabs/useSetSelectedTab';

// lazy elements
const TestReportDetailsOverview = React.lazy(
  () => import('./TestReportDetailsOverview/TestReportDetailsOverview')
);
const TestReportDetailsHistory = React.lazy(
  () => import('./TestReportDetailsHistory/TestReportDetailsHistory')
);

const TestReportDetails: React.FC = () => {
  const { t } = useTranslation();
  const { dataQATestId, dataEntityId } = useDataEntityRouteParams();
  const qualityTest = useAppSelector(getQualityTestByTestId(dataQATestId));
  const resourcePermissions = useAppSelector(
    getResourcePermissions(PermissionResourceType.DATA_ENTITY, dataEntityId)
  );

  const tabs = React.useMemo<AppTabItem[]>(
    () => [
      {
        name: t('Overview'),
        link: dataEntityTestReportsPath(dataEntityId, dataQATestId),
      },
      {
        name: t('History'),
        link: dataEntityTestReportsPath(dataEntityId, dataQATestId, 'history'),
      },
    ],
    [dataEntityId, dataQATestId, t]
  );

  const selectedTab = useSetSelectedTab(tabs);

  return (
    <Grid container sx={{ p: 2 }}>
      <Grid container alignItems='center' wrap='nowrap'>
        <Grid container maxWidth='80%'>
          <AppTooltip title={qualityTest?.internalName || qualityTest?.externalName}>
            <Typography noWrap variant='h2'>
              {qualityTest?.internalName || qualityTest?.externalName}
            </Typography>
          </AppTooltip>
        </Grid>
        <Button
          text={t('Go to page')}
          to={dataEntityDetailsPath(dataQATestId)}
          buttonType='tertiary-m'
          sx={{ ml: 2, flexShrink: 0 }}
        />
      </Grid>
      <Grid
        container
        justifyContent='center'
        alignItems='center'
        flexDirection='column'
        sx={{ mt: 2 }}
      >
        {tabs.length && selectedTab >= 0 ? (
          <AppTabs
            type='secondary'
            items={tabs}
            selectedTab={selectedTab}
            sx={{ width: '100%' }}
            tabSx={{ flexGrow: 1 }}
          />
        ) : null}
        <React.Suspense fallback={<AppCircularProgress sx={{ mt: 5 }} size={40} />}>
          <Routes>
            <Route path=':testReportViewType'>
              <Route
                path='overview'
                element={
                  <WithPermissionsProvider
                    allowedPermissions={[Permission.DATASET_TEST_RUN_SET_SEVERITY]}
                    resourcePermissions={resourcePermissions}
                    Component={TestReportDetailsOverview}
                  />
                }
              />
              <Route path='history' element={<TestReportDetailsHistory />} />
              <Route path='' element={<Navigate to='overview' />} />
            </Route>
          </Routes>
        </React.Suspense>
      </Grid>
    </Grid>
  );
};

export default TestReportDetails;
