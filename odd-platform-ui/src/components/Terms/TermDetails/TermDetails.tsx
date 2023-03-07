import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { useNavigate } from 'react-router-dom-v5-compat';
import { AppErrorPage, AppLoadingPage, SkeletonWrapper } from 'components/shared';
import { useAppParams, useAppPaths } from 'lib/hooks';
import {
  getResourcePermissions,
  getTermDetails,
  getTermDetailsFetchingErrors,
  getTermDetailsFetchingStatuses,
  getTermSearchId,
} from 'redux/selectors';
import { deleteTerm, fetchResourcePermissions, fetchTermDetails } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { Permission, PermissionResourceType } from 'generated-sources';
import { WithPermissionsProvider } from 'components/shared/contexts';
import TermDetailsHeader from './TermDetailsHeader/TermDetailsHeader';
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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { termId } = useAppParams();
  const { termSearchPath, termDetailsLinkedItemsPath, termDetailsOverviewPath } =
    useAppPaths();

  const {
    isLoading: isTermDetailsFetching,
    isLoaded: isTermDetailsFetched,
    isNotLoaded: isTermDetailsNotFetched,
  } = useAppSelector(getTermDetailsFetchingStatuses);
  const termDetailsFetchingErrors = useAppSelector(getTermDetailsFetchingErrors);

  const termSearchId = useAppSelector(getTermSearchId);
  const termDetails = useAppSelector(getTermDetails(termId));
  const termPermissions = useAppSelector(
    getResourcePermissions(PermissionResourceType.TERM, termId)
  );

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
        navigate(termSearchPath(termSearchId))
      ),
    [termSearchId]
  );

  return (
    <TermDetailsComponentWrapper>
      {termDetails.id && !isTermDetailsFetching ? (
        <>
          <WithPermissionsProvider
            allowedPermissions={[Permission.TERM_UPDATE, Permission.TERM_DELETE]}
            resourcePermissions={termPermissions}
            render={() => (
              <TermDetailsHeader
                name={termDetails.name}
                updatedAt={termDetails.updatedAt}
                termId={termDetails.id}
                handleTermDelete={handleTermDelete}
              />
            )}
          />
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
            <Route exact path={termDetailsOverviewPath()} component={Overview} />
            <Route
              exact
              path={termDetailsLinkedItemsPath()}
              component={LinkedItemsList}
            />
          </Switch>
        </React.Suspense>
      )}
      <AppErrorPage
        showError={isTermDetailsNotFetched}
        error={termDetailsFetchingErrors}
      />
    </TermDetailsComponentWrapper>
  );
};

export default TermDetailsView;
