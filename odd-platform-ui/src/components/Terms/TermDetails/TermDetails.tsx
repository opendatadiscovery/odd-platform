import { Typography } from '@mui/material';
import React from 'react';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  termDetailsLinkedItemsPath,
  termDetailsOverviewPath,
  termSearchPath,
} from 'lib/paths';
import {
  TermApiDeleteTermRequest,
  TermApiGetTermDetailsRequest,
  TermDetails,
} from 'generated-sources';
import { ErrorState, FetchStatus } from 'redux/interfaces';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import TimeGapIcon from 'components/shared/Icons/TimeGapIcon';
import TermDetailsSkeleton from 'components/Terms/TermDetails/TermDetailsSkeleton/TermDetailsSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import AppErrorPage from 'components/shared/AppErrorPage/AppErrorPage';
import AppLoadingPage from 'components/shared/AppLoadingPage/AppLoadingPage';
import LabelItem from 'components/shared/LabelItem/LabelItem';
import EditIcon from 'components/shared/Icons/EditIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import KebabIcon from 'components/shared/Icons/KebabIcon';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import AppPopover from 'components/shared/AppPopover/AppPopover';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import TermsFormContainer from 'components/Terms/TermSearch/TermForm/TermsFormContainer';
import {
  TermDetailsComponentWrapper,
  TermDetailsHeadingRightWrapper,
  TermDetailsHeadingWrapper,
} from './TermDetailsStyles';

// lazy components
const OverviewContainer = React.lazy(
  () => import('components/Terms/TermDetails/Overview/OverviewContainer')
);
const LinkedItemsContainer = React.lazy(
  () =>
    import(
      'components/Terms/TermDetails/TermLinkedItemsList/LinkedItemsListContainer'
    )
);

interface TermDetailsProps {
  viewType: string;
  termId: number;
  termSearchId: string;
  termDetails: TermDetails;
  fetchTermDetails: (params: TermApiGetTermDetailsRequest) => void;
  termFetchingStatus: FetchStatus;
  termFetchingError?: ErrorState;
  deleteTerm: (params: TermApiDeleteTermRequest) => Promise<void>;
}

const TermDetailsView: React.FC<TermDetailsProps> = ({
  viewType,
  termId,
  termSearchId,
  termDetails,
  fetchTermDetails,
  termFetchingStatus,
  termFetchingError,
  deleteTerm,
}) => {
  const history = useHistory();

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
        hint: termDetails?.entitiesUsingCount,
        hidden: !termDetails?.entitiesUsingCount,
        value: 'linked-items',
      },
    ]);
  }, [termId, termDetails?.entitiesUsingCount]);

  const [selectedTab, setSelectedTab] = React.useState<number>(-1);

  React.useEffect(() => {
    setSelectedTab(
      viewType ? tabs.findIndex(tab => tab.value === viewType) : 0
    );
  }, [tabs, viewType]);

  const handleTermDelete = (id: number) => () =>
    deleteTerm({ termId: id }).then(() =>
      history.push(termSearchPath(termSearchId))
    );

  return (
    <TermDetailsComponentWrapper>
      {termDetails && termFetchingStatus !== 'fetching' && (
        <>
          <TermDetailsHeadingWrapper>
            <Typography variant="h1" noWrap sx={{ mr: 1 }}>
              {termDetails.name}{' '}
              <LabelItem labelName="DCT" variant="body1" />
            </Typography>
            <TermDetailsHeadingRightWrapper>
              {termDetails.updatedAt && (
                <>
                  <TimeGapIcon />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {formatDistanceToNowStrict(termDetails.updatedAt, {
                      addSuffix: true,
                    })}
                  </Typography>
                </>
              )}
              <TermsFormContainer
                term={termDetails}
                btnCreateEl={
                  <AppButton
                    size="medium"
                    color="primaryLight"
                    startIcon={<EditIcon />}
                    sx={{ ml: 1 }}
                  >
                    Edit
                  </AppButton>
                }
              />
              <AppPopover
                renderOpenBtn={({ onClick, ariaDescribedBy }) => (
                  <AppIconButton
                    ariaDescribedBy={ariaDescribedBy}
                    size="medium"
                    color="primaryLight"
                    icon={<KebabIcon />}
                    onClick={onClick}
                    sx={{ ml: 1 }}
                  />
                )}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: -5, horizontal: 67 }}
              >
                <ConfirmationDialog
                  actionTitle="Are you sure you want to delete this term?"
                  actionName="Delete term"
                  actionText={
                    <>
                      &quot;{termDetails.name}&quot; will be deleted
                      permanently.
                    </>
                  }
                  onConfirm={handleTermDelete(termDetails.id)}
                  actionBtn={
                    <AppMenuItem onClick={() => {}}>Delete</AppMenuItem>
                  }
                />
              </AppPopover>
            </TermDetailsHeadingRightWrapper>
          </TermDetailsHeadingWrapper>
          {tabs.length && selectedTab >= 0 && (
            <AppTabs
              type="primary"
              items={tabs}
              selectedTab={selectedTab}
              handleTabChange={() => {}}
              sx={{ mt: 2 }}
            />
          )}
        </>
      )}
      {termFetchingStatus === 'fetching' && (
        <SkeletonWrapper
          renderContent={({ randomSkeletonPercentWidth }) => (
            <TermDetailsSkeleton width={randomSkeletonPercentWidth()} />
          )}
        />
      )}
      {termFetchingStatus !== 'errorFetching' && (
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
          </Switch>
        </React.Suspense>
      )}
      <AppErrorPage
        fetchStatus={termFetchingStatus}
        error={termFetchingError}
      />
    </TermDetailsComponentWrapper>
  );
};

export default TermDetailsView;
