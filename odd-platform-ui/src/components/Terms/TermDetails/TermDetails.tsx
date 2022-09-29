import { Grid, Typography } from '@mui/material';
import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { formatDistanceToNowStrict } from 'date-fns';
import { TimeGapIcon, EditIcon, KebabIcon } from 'components/shared/Icons';
import {
  SkeletonWrapper,
  AppTabs,
  AppTabItem,
  AppLoadingPage,
  AppButton,
  AppIconButton,
  AppMenuItem,
  AppPopover,
  ConfirmationDialog,
  EntityTypeItem,
} from 'components/shared';
import { useAppParams, useAppPaths } from 'lib/hooks';
import {
  getTermDetails,
  getTermDetailsFetchingStatuses,
  getTermSearchId,
} from 'redux/selectors';
import { deleteTerm, fetchTermDetails } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import TermsForm from '../TermSearch/TermForm/TermsForm';
import TermDetailsSkeleton from './TermDetailsSkeleton/TermDetailsSkeleton';
import { TermDetailsComponentWrapper } from './TermDetailsStyles';

// lazy components
const Overview = React.lazy(
  () => import('components/Terms/TermDetails/Overview/Overview')
);
const LinkedItemsList = React.lazy(
  () => import('components/Terms/TermDetails/TermLinkedItemsList/LinkedItemsList')
);

const TermDetailsView: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { termId, viewType } = useAppParams();
  const { termSearchPath, termDetailsOverviewPath, termDetailsLinkedItemsPath } =
    useAppPaths();

  const { isLoading: isTermDetailsFetching, isNotLoaded: isTermDetailsNotFetched } =
    useAppSelector(getTermDetailsFetchingStatuses);

  const termSearchId = useAppSelector(getTermSearchId);

  const termDetails = useAppSelector(state => getTermDetails(state, termId));

  React.useEffect(() => {
    dispatch(fetchTermDetails({ termId }));
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
    setSelectedTab(viewType ? tabs.findIndex(tab => tab.value === viewType) : 0);
  }, [tabs, viewType]);

  const handleTermDelete = (id: number) => () =>
    dispatch(deleteTerm({ termId: id })).then(() =>
      history.push(termSearchPath(termSearchId))
    );

  return (
    <TermDetailsComponentWrapper>
      {termDetails && !isTermDetailsFetching && (
        <>
          <Grid container alignItems='center' flexWrap='nowrap'>
            <Grid container alignItems='center'>
              <Typography variant='h1' noWrap sx={{ mr: 1 }}>
                {termDetails.name}
              </Typography>
              <EntityTypeItem entityTypeName='DCT' />
            </Grid>
            <Grid container justifyContent='flex-end'>
              {termDetails.updatedAt && (
                <>
                  <TimeGapIcon />
                  <Typography variant='body1' sx={{ ml: 1 }}>
                    {formatDistanceToNowStrict(termDetails.updatedAt, {
                      addSuffix: true,
                    })}
                  </Typography>
                </>
              )}
              <TermsForm
                term={termDetails}
                btnCreateEl={
                  <AppButton
                    size='medium'
                    color='primaryLight'
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
                    size='medium'
                    color='primaryLight'
                    icon={<KebabIcon />}
                    onClick={onClick}
                    sx={{ ml: 1 }}
                  />
                )}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: -5, horizontal: 67 }}
              >
                <ConfirmationDialog
                  actionTitle='Are you sure you want to delete this term?'
                  actionName='Delete term'
                  actionText={
                    <>&quot;{termDetails.name}&quot; will be deleted permanently.</>
                  }
                  onConfirm={handleTermDelete(termDetails.id)}
                  actionBtn={<AppMenuItem onClick={() => {}}>Delete</AppMenuItem>}
                />
              </AppPopover>
            </Grid>
          </Grid>
          {tabs.length && selectedTab >= 0 && (
            <AppTabs
              type='primary'
              items={tabs}
              selectedTab={selectedTab}
              handleTabChange={() => {}}
              sx={{ mt: 2 }}
            />
          )}
        </>
      )}
      {isTermDetailsFetching && (
        <SkeletonWrapper
          renderContent={({ randWidth }) => <TermDetailsSkeleton width={randWidth()} />}
        />
      )}
      {!isTermDetailsNotFetched && (
        <React.Suspense fallback={<AppLoadingPage />}>
          <Switch>
            <Route exact path='/terms/:termId/overview' component={Overview} />
            <Route exact path='/terms/:termId/linked-items' component={LinkedItemsList} />
          </Switch>
        </React.Suspense>
      )}
    </TermDetailsComponentWrapper>
  );
};

export default TermDetailsView;
