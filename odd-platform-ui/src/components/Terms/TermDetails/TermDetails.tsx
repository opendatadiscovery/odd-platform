import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppErrorPage, SkeletonWrapper } from 'components/shared/elements';
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
import TermDetailsRoutes from './TermDetailsRoutes/TermDetailsRoutes';

const TermDetailsView: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { termId } = useAppParams();
  const { termSearchPath } = useAppPaths();

  const { isLoading: isTermDetailsFetching, isNotLoaded: isTermDetailsNotFetched } =
    useAppSelector(getTermDetailsFetchingStatuses);
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
      {termDetails.id && !isTermDetailsNotFetched ? (
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
          <TermDetailsRoutes />
        </>
      ) : null}
      {isTermDetailsFetching ? (
        <SkeletonWrapper
          renderContent={({ randWidth }) => <TermDetailsSkeleton width={randWidth()} />}
        />
      ) : null}
      <AppErrorPage
        showError={isTermDetailsNotFetched}
        error={termDetailsFetchingErrors}
      />
    </TermDetailsComponentWrapper>
  );
};

export default TermDetailsView;
