import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import {
  AppButton,
  AppIconButton,
  AppLoadingPage,
  AppMenuItem,
  AppPopover,
  AppTabItem,
  ConfirmationDialog,
  EntityTypeItem,
  AppTabs,
} from 'components/shared';
import { useAppParams, useAppPaths } from 'lib/hooks';
import {
  getTermDetails,
  getTermDetailsFetchingStatuses,
  getTermSearchId,
} from 'redux/selectors';
import { deleteTerm, fetchResourcePermissions, fetchTermDetails } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { Permission, PermissionResourceType } from 'generated-sources';
import { PermissionProvider, WithPermissions } from 'components/shared/contexts';
import TermsForm from 'components/Terms/TermSearch/TermForm/TermsForm';
import { Grid, Typography } from '@mui/material';
import { EditIcon, KebabIcon, TimeGapIcon } from 'components/shared/Icons';
import { formatDistanceToNowStrict } from 'date-fns';
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

  React.useEffect(() => {
    dispatch(fetchTermDetails({ termId }));
    dispatch(
      fetchResourcePermissions({
        resourceId: termId,
        permissionResourceType: PermissionResourceType.TERM,
      })
    );
  }, [fetchTermDetails, termId, fetchResourcePermissions]);

  const { isLoading: isTermDetailsFetching, isNotLoaded: isTermDetailsNotFetched } =
    useAppSelector(getTermDetailsFetchingStatuses);

  const termSearchId = useAppSelector(getTermSearchId);

  const termDetails = useAppSelector(state => getTermDetails(state, termId));

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
              <PermissionProvider permissions={[Permission.TERM_UPDATE]}>
                <WithPermissions
                  resourceId={termId}
                  resourceType={PermissionResourceType.TERM}
                  renderContent={({ isAllowedTo: editTerm }) =>
                    editTerm ? (
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
                    ) : null
                  }
                />
              </PermissionProvider>
              <PermissionProvider permissions={[Permission.TERM_DELETE]}>
                <WithPermissions
                  resourceId={termId}
                  resourceType={PermissionResourceType.TERM}
                  renderContent={({ isAllowedTo: delTerm }) =>
                    delTerm ? (
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
                            <>
                              &quot;{termDetails.name}&quot; will be deleted permanently.
                            </>
                          }
                          onConfirm={handleTermDelete(termDetails.id)}
                          actionBtn={<AppMenuItem>Delete</AppMenuItem>}
                        />
                      </AppPopover>
                    ) : null
                  }
                />
              </PermissionProvider>
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
