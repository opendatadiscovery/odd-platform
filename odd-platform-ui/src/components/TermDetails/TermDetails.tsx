import { Grid, Typography } from '@mui/material';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  termDetailsLinkedItemsPath,
  termDetailsOverviewPath,
} from 'lib/paths';
import {
  TermApiGetTermDetailsRequest,
  TermDetails,
} from 'generated-sources';
import { ErrorState, FetchStatus } from 'redux/interfaces';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import TimeGapIcon from 'components/shared/Icons/TimeGapIcon';
import TermDetailsSkeleton from 'components/TermDetails/TermDetailsSkeleton/TermDetailsSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import AppErrorPage from 'components/shared/AppErrorPage/AppErrorPage';
import AppLoadingPage from 'components/shared/AppLoadingPage/AppLoadingPage';
import LabelItem from 'components/shared/LabelItem/LabelItem';
import {
  TermDetailsWrapper,
  TermDetailsCaption,
} from './TermDetailsStyles';

// lazy components
const OverviewContainer = React.lazy(
  () => import('./Overview/OverviewContainer')
);
const LinkedItemsContainer = React.lazy(
  () => import('./Overview/OverviewContainer')
  // () => import('./LinkedItems/LinkedItemsContainer')
);

interface TermDetailsProps {
  viewType: string;
  termId: number;
  termDetails: TermDetails;
  fetchTermDetails: (params: TermApiGetTermDetailsRequest) => void;
  termFetchingStatus: FetchStatus;
  termFetchingError?: ErrorState;
  openAlertsCount: number;
}

const TermDetailsView: React.FC<TermDetailsProps> = ({
  viewType,
  termId,
  termDetails,
  fetchTermDetails,
  termFetchingStatus,
  termFetchingError,
  openAlertsCount,
}) => {
  React.useEffect(() => {
    fetchTermDetails({ termId });
  }, [fetchTermDetails, termId]);

  const [tabs, setTabs] = React.useState<AppTabItem[]>([]);

  React.useEffect(() => {
    setTabs([
      {
        name: 'Overview',
        link: termDetailsOverviewPath(termId),
        value: 'overview',
      },
      {
        name: 'Linked items',
        link: termDetailsLinkedItemsPath(termId),
        hidden: !termDetails?.entitiesUsingCount,
        value: 'linked-items',
      },
    ]);
  }, [termId, termDetails, openAlertsCount]);

  const [selectedTab, setSelectedTab] = React.useState<number>(-1);

  React.useEffect(() => {
    setSelectedTab(
      viewType ? tabs.findIndex(tab => tab.value === viewType) : 0
    );
  }, [tabs, viewType]);

  return (
    <TermDetailsWrapper>
      {termDetails && termFetchingStatus !== 'fetching' ? (
        <>
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            wrap="nowrap"
          >
            <TermDetailsCaption item>
              <Grid container item alignItems="center">
                <Typography variant="h1" noWrap sx={{ mr: 1 }}>
                  {termDetails.name}
                </Typography>
              </Grid>
              {termDetails.name && (
                <Grid container alignItems="center">
                  <LabelItem labelName="Original" variant="body1" />
                  <Typography variant="body1" sx={{ ml: 0.5 }} noWrap>
                    {termDetails.name}
                  </Typography>
                </Grid>
              )}
            </TermDetailsCaption>
            <Grid container item alignItems="center" width="auto">
              {termDetails.updatedAt ? (
                <>
                  <TimeGapIcon />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {formatDistanceToNowStrict(termDetails.updatedAt, {
                      addSuffix: true,
                    })}
                  </Typography>
                </>
              ) : null}
            </Grid>
          </Grid>
          <Grid sx={{ mt: 2 }}>
            {tabs.length && selectedTab >= 0 ? (
              <AppTabs
                type="primary"
                items={tabs}
                selectedTab={selectedTab}
                handleTabChange={() => {}}
              />
            ) : null}
          </Grid>
        </>
      ) : null}
      {termFetchingStatus === 'fetching' ? (
        <SkeletonWrapper
          renderContent={({ randomSkeletonPercentWidth }) => (
            <TermDetailsSkeleton width={randomSkeletonPercentWidth()} />
          )}
        />
      ) : null}
      {termFetchingStatus !== 'errorFetching' ? (
        <React.Suspense fallback={<AppLoadingPage />}>
          <Switch>
            <Route
              exact
              path="/terms/:termId/overview"
              component={OverviewContainer}
            />
            <Route
              exact
              path="/terms/:termId/linked-items"
              component={LinkedItemsContainer}
            />
            <Redirect from="/terms/:termId" to="/terms/:termId/overview" />
          </Switch>
        </React.Suspense>
      ) : null}
      <AppErrorPage
        fetchStatus={termFetchingStatus}
        error={termFetchingError}
      />
    </TermDetailsWrapper>
  );
};

export default TermDetailsView;
