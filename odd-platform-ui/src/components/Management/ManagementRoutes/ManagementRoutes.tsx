import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import { AppSuspenseWrapper, RestrictedRoute } from 'components/shared/elements';
import { useAppPaths, usePermissions } from 'lib/hooks';

const NamespaceList = React.lazy(() => import('../NamespaceList/NamespaceList'));
const OwnersList = React.lazy(() => import('../OwnersList/OwnersList'));
const LabelsList = React.lazy(() => import('../LabelsList/LabelsList'));
const TagsList = React.lazy(() => import('../TagsList/TagsList'));
const DataSourcesList = React.lazy(() => import('../DataSourcesList/DataSourcesList'));
const CollectorsList = React.lazy(() => import('../CollectorsList/CollectorsList'));
const OwnerAssociations = React.lazy(
  () => import('../OwnerAssociations/OwnerAssociations')
);
const RolesList = React.lazy(() => import('../RolesList/RolesList'));
const PolicyList = React.lazy(() => import('../PolicyList/PolicyList'));
const PolicyDetails = React.lazy(
  () => import('../PolicyList/PolicyDetails/PolicyDetails')
);
const Integrations = React.lazy(() => import('../Integrations/Integrations'));

const ManagementRoutes: React.FC = () => {
  const { ManagementRoutes: ManagementRoutesEnum, getNonExactParamPath } = useAppPaths();
  const { hasAccessTo } = usePermissions();

  return (
    <AppSuspenseWrapper>
      <Routes>
        <Route
          path={ManagementRoutesEnum.namespaces}
          element={
            <WithPermissionsProvider
              allowedPermissions={[
                Permission.NAMESPACE_UPDATE,
                Permission.NAMESPACE_DELETE,
                Permission.NAMESPACE_CREATE,
              ]}
              resourcePermissions={[]}
              Component={NamespaceList}
            />
          }
        />
        <Route
          path={ManagementRoutesEnum.datasources}
          element={
            <WithPermissionsProvider
              allowedPermissions={[
                Permission.DATA_SOURCE_CREATE,
                Permission.DATA_SOURCE_UPDATE,
                Permission.DATA_SOURCE_DELETE,
                Permission.DATA_SOURCE_TOKEN_REGENERATE,
              ]}
              resourcePermissions={[]}
              Component={DataSourcesList}
            />
          }
        />
        <Route
          path={ManagementRoutesEnum.collectors}
          element={
            <WithPermissionsProvider
              allowedPermissions={[
                Permission.COLLECTOR_CREATE,
                Permission.COLLECTOR_UPDATE,
                Permission.COLLECTOR_DELETE,
                Permission.COLLECTOR_TOKEN_REGENERATE,
              ]}
              resourcePermissions={[]}
              Component={CollectorsList}
            />
          }
        />
        <Route
          path={ManagementRoutesEnum.owners}
          element={
            <WithPermissionsProvider
              allowedPermissions={[
                Permission.OWNER_CREATE,
                Permission.OWNER_UPDATE,
                Permission.OWNER_DELETE,
              ]}
              resourcePermissions={[]}
              Component={OwnersList}
            />
          }
        />
        <Route
          path={ManagementRoutesEnum.tags}
          element={
            <WithPermissionsProvider
              allowedPermissions={[
                Permission.TAG_CREATE,
                Permission.TAG_UPDATE,
                Permission.TAG_DELETE,
              ]}
              resourcePermissions={[]}
              Component={TagsList}
            />
          }
        />
        <Route
          path={ManagementRoutesEnum.labels}
          element={
            <WithPermissionsProvider
              allowedPermissions={[
                Permission.LABEL_CREATE,
                Permission.LABEL_UPDATE,
                Permission.LABEL_DELETE,
              ]}
              resourcePermissions={[]}
              Component={LabelsList}
            />
          }
        />
        <Route
          path={getNonExactParamPath(ManagementRoutesEnum.associations)}
          element={
            <RestrictedRoute
              isAllowedTo={hasAccessTo(Permission.OWNER_ASSOCIATION_MANAGE)}
              redirectTo={`../${ManagementRoutesEnum.namespaces}`}
              component={OwnerAssociations}
            />
          }
        >
          <Route path={ManagementRoutesEnum.associationsViewTypeParam} />
        </Route>

        <Route
          path={ManagementRoutesEnum.roles}
          element={
            <WithPermissionsProvider
              allowedPermissions={[
                Permission.ROLE_CREATE,
                Permission.ROLE_UPDATE,
                Permission.ROLE_DELETE,
              ]}
              resourcePermissions={[]}
              Component={RolesList}
            />
          }
        />
        <Route
          path={ManagementRoutesEnum.policies}
          element={
            <WithPermissionsProvider
              allowedPermissions={[
                Permission.POLICY_CREATE,
                Permission.POLICY_UPDATE,
                Permission.POLICY_DELETE,
              ]}
              resourcePermissions={[]}
              Component={PolicyList}
            />
          }
        />
        <Route
          path={`${ManagementRoutesEnum.policies}/${ManagementRoutesEnum.policyIdParam}`}
          element={
            <WithPermissionsProvider
              allowedPermissions={[Permission.POLICY_UPDATE]}
              resourcePermissions={[]}
              Component={PolicyDetails}
            />
          }
        />
        <Route
          path={getNonExactParamPath(ManagementRoutesEnum.integrations)}
          element={<Integrations />}
        />
        <Route
          path='/'
          element={<Navigate to={ManagementRoutesEnum.namespaces} replace />}
        />
      </Routes>
    </AppSuspenseWrapper>
  );
};

export default ManagementRoutes;
