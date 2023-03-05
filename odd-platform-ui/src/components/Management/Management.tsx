import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { AppLoadingPage, RestrictedRoute } from 'components/shared';
import { useAppPaths, usePermissions } from 'lib/hooks';
import { Permission } from 'generated-sources';
import { WithPermissionsProvider } from 'components/shared/contexts';
import ManagementTabs from './ManagementTabs/ManagementTabs';
import * as S from './ManagementStyles';

// lazy components
const NamespaceList = React.lazy(() => import('./NamespaceList/NamespaceList'));
const OwnersList = React.lazy(() => import('./OwnersList/OwnersList'));
const LabelsList = React.lazy(() => import('./LabelsList/LabelsList'));
const TagsList = React.lazy(() => import('./TagsList/TagsList'));
const DataSourcesList = React.lazy(() => import('./DataSourcesList/DataSourcesList'));
const CollectorsList = React.lazy(() => import('./CollectorsList/CollectorsList'));
const OwnerAssociationsList = React.lazy(
  () => import('./OwnerAssociations/OwnerAssociations')
);
const RolesList = React.lazy(() => import('./RolesList/RolesList'));
const PolicyList = React.lazy(() => import('./PolicyList/PolicyList'));
const PolicyDetails = React.lazy(
  () => import('./PolicyList/PolicyDetails/PolicyDetails')
);

const Management: React.FC = () => {
  const {
    managementPath,
    managementOwnerAssociationsPath,
    createPolicyPath,
    policyDetailsPath,
    ManagementRoutes,
  } = useAppPaths();
  const { hasAccessTo } = usePermissions();

  return (
    <S.Container container wrap='nowrap'>
      <S.SidebarContainer item xs={3}>
        <ManagementTabs />
      </S.SidebarContainer>
      <S.ContentContainer item xs={9}>
        <React.Suspense fallback={<AppLoadingPage />}>
          <Switch>
            <Route
              exact
              path={managementPath(ManagementRoutes.namespaces)}
              render={() => (
                <WithPermissionsProvider
                  allowedPermissions={[
                    Permission.NAMESPACE_UPDATE,
                    Permission.NAMESPACE_DELETE,
                    Permission.NAMESPACE_CREATE,
                  ]}
                  resourcePermissions={[]}
                  Component={NamespaceList}
                />
              )}
            />
            <Route
              exact
              path={managementPath(ManagementRoutes.datasources)}
              render={() => (
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
              )}
            />
            <Route
              exact
              path={managementPath(ManagementRoutes.collectors)}
              render={() => (
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
              )}
            />
            <Route
              exact
              path={managementPath(ManagementRoutes.owners)}
              render={() => (
                <WithPermissionsProvider
                  allowedPermissions={[
                    Permission.OWNER_CREATE,
                    Permission.OWNER_UPDATE,
                    Permission.OWNER_DELETE,
                  ]}
                  resourcePermissions={[]}
                  Component={OwnersList}
                />
              )}
            />
            <Route
              exact
              path={managementPath(ManagementRoutes.tags)}
              render={() => (
                <WithPermissionsProvider
                  allowedPermissions={[
                    Permission.TAG_CREATE,
                    Permission.TAG_UPDATE,
                    Permission.TAG_DELETE,
                  ]}
                  resourcePermissions={[]}
                  Component={TagsList}
                />
              )}
            />
            <Route
              exact
              path={managementPath(ManagementRoutes.labels)}
              render={() => (
                <WithPermissionsProvider
                  allowedPermissions={[
                    Permission.LABEL_CREATE,
                    Permission.LABEL_UPDATE,
                    Permission.LABEL_DELETE,
                  ]}
                  resourcePermissions={[]}
                  Component={LabelsList}
                />
              )}
            />
            <RestrictedRoute
              isAllowedTo={hasAccessTo(Permission.OWNER_ASSOCIATION_MANAGE)}
              redirectTo={managementPath(ManagementRoutes.namespaces)}
              path={managementOwnerAssociationsPath()}
              component={OwnerAssociationsList}
            />
            <Route
              exact
              path={managementPath(ManagementRoutes.roles)}
              render={() => (
                <WithPermissionsProvider
                  allowedPermissions={[
                    Permission.ROLE_CREATE,
                    Permission.ROLE_UPDATE,
                    Permission.ROLE_DELETE,
                  ]}
                  resourcePermissions={[]}
                  Component={RolesList}
                />
              )}
            />
            <Route
              exact
              path={managementPath(ManagementRoutes.policies)}
              render={() => (
                <WithPermissionsProvider
                  allowedPermissions={[
                    Permission.POLICY_CREATE,
                    Permission.POLICY_UPDATE,
                    Permission.POLICY_DELETE,
                  ]}
                  resourcePermissions={[]}
                  Component={PolicyList}
                />
              )}
            />
            <Route
              exact
              path={[createPolicyPath(), policyDetailsPath()]}
              render={() => (
                <WithPermissionsProvider
                  allowedPermissions={[Permission.POLICY_UPDATE]}
                  resourcePermissions={[]}
                  Component={PolicyDetails}
                />
              )}
            />
            <Redirect
              exact
              from={managementPath(ManagementRoutes.associations)}
              to={managementOwnerAssociationsPath(ManagementRoutes.associationsNew)}
            />
          </Switch>
        </React.Suspense>
      </S.ContentContainer>
    </S.Container>
  );
};

export default Management;
