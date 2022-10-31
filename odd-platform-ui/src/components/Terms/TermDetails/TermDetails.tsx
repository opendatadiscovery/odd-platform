import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import {
  AppButton,
  AppIconButton,
  AppLoadingPage,
  AppMenuItem,
  AppPopover,
  ConfirmationDialog,
  EntityTypeItem,
  SkeletonWrapper,
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
import { Grid, Typography } from '@mui/material';
import { EditIcon, KebabIcon, TimeGapIcon } from 'components/shared/Icons';
import { formatDistanceToNowStrict } from 'date-fns';
import TermsForm from '../TermSearch/TermForm/TermsForm';
import TermDetailsSkeleton from './TermDetailsSkeleton/TermDetailsSkeleton';
import TermDetailsTabs from './TermDetailsTabs/TermDetailsTabs';
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
  const { termId } = useAppParams();
  const { termSearchPath } = useAppPaths();

  const { isLoading: isTermDetailsFetching, isLoaded: isTermDetailsFetched } =
    useAppSelector(getTermDetailsFetchingStatuses);

  const termSearchId = useAppSelector(getTermSearchId);
  const termDetails = useAppSelector(getTermDetails(termId));

  React.useEffect(() => {
    dispatch(fetchTermDetails({ termId }));
    dispatch(
      fetchResourcePermissions({
        resourceId: termId,
        permissionResourceType: PermissionResourceType.TERM,
      })
    );
  }, [termId]);

  const handleTermDelete = React.useCallback(
    (id: number) => () =>
      dispatch(deleteTerm({ termId: id })).then(() =>
        history.push(termSearchPath(termSearchId))
      ),
    [termSearchId]
  );

  const updatedAt = React.useMemo(
    () =>
      termDetails.updatedAt && (
        <>
          <TimeGapIcon />
          <Typography variant='body1' sx={{ ml: 1 }}>
            {formatDistanceToNowStrict(termDetails.updatedAt, { addSuffix: true })}
          </Typography>
        </>
      ),
    [termDetails.updatedAt]
  );

  return (
    <TermDetailsComponentWrapper>
      {termDetails.id && !isTermDetailsFetching ? (
        <>
          <Grid container alignItems='center' flexWrap='nowrap'>
            <Grid container alignItems='center'>
              <Typography variant='h1' noWrap sx={{ mr: 1 }}>
                {termDetails.name}
              </Typography>
              <EntityTypeItem entityTypeName='DCT' />
            </Grid>
            <Grid container justifyContent='flex-end'>
              {updatedAt}
              <PermissionProvider permissions={[Permission.TERM_UPDATE]}>
                <WithPermissions
                  permissionTo={Permission.TERM_UPDATE}
                  resourceId={termId}
                  resourceType={PermissionResourceType.TERM}
                >
                  <TermsForm
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
                </WithPermissions>
              </PermissionProvider>
              <PermissionProvider permissions={[Permission.TERM_DELETE]}>
                <WithPermissions
                  permissionTo={Permission.TERM_DELETE}
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
          <TermDetailsTabs />
        </>
      ) : null}
      {isTermDetailsFetching ? (
        <SkeletonWrapper
          renderContent={({ randWidth }) => <TermDetailsSkeleton width={randWidth()} />}
        />
      ) : null}
      {isTermDetailsFetched && (
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
