import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Grid } from '@mui/material';
import { AppLoadingPage, AppTabItem, AppTabs, RestrictedRoute } from 'components/shared';
import { useAppParams, useAppPaths, usePermissions } from 'lib/hooks';
import { Permission } from 'generated-sources';
import WithPermissionsProvider from 'components/shared/contexts/Permission/WithPermissionsProvider';
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
  const { viewType } = useAppParams();
  const { managementPath } = useAppPaths();
  const { hasAccessTo } = usePermissions({});

  const [tabs] = React.useState<AppTabItem[]>([
    { name: 'Namespaces', link: managementPath('namespaces') },
    { name: 'Datasources', link: managementPath('datasources') },
    { name: 'Collectors', link: managementPath('collectors') },
    { name: 'Owners', link: managementPath('owners') },
    { name: 'Tags', link: managementPath('tags') },
    { name: 'Labels', link: managementPath('labels') },
    {
      name: 'Associations',
      link: managementPath('associations'),
      hidden: !hasAccessTo(Permission.OWNER_ASSOCIATION_MANAGE),
    },
    { name: 'Roles', link: managementPath('roles') },
    { name: 'Policies', link: managementPath('policies') },
  ]);

  const [selectedTab, setSelectedTab] = React.useState<number>(-1);

  React.useEffect(() => {
    setSelectedTab(
      viewType ? tabs.findIndex(tab => tab.name.toLowerCase() === viewType) : 0
    );
  }, [tabs, viewType]);

  return (
    <S.Container container wrap='nowrap'>
      <S.SidebarContainer item xs={3}>
        <Grid sx={{ p: 0.5 }}>
          {tabs.length && selectedTab >= 0 ? (
            <AppTabs
              orientation='vertical'
              type='menu'
              items={tabs}
              selectedTab={selectedTab}
              handleTabChange={() => {}}
            />
          ) : null}
        </Grid>
      </S.SidebarContainer>
      <S.ContentContainer item xs={9}>
        <React.Suspense fallback={<AppLoadingPage />}>
          <Switch>
            <Route
              exact
              path='/management/namespaces'
              render={() => (
                <WithPermissionsProvider
                  permissions={[
                    Permission.NAMESPACE_UPDATE,
                    Permission.NAMESPACE_DELETE,
                    Permission.NAMESPACE_CREATE,
                  ]}
                  Component={NamespaceList}
                />
              )}
            />
            <Route
              exact
              path='/management/datasources'
              render={() => (
                <WithPermissionsProvider
                  permissions={[
                    Permission.DATA_SOURCE_CREATE,
                    Permission.DATA_SOURCE_UPDATE,
                    Permission.DATA_SOURCE_DELETE,
                    Permission.DATA_SOURCE_TOKEN_REGENERATE,
                  ]}
                  Component={DataSourcesList}
                />
              )}
            />
            <Route
              exact
              path='/management/collectors'
              render={() => (
                <WithPermissionsProvider
                  permissions={[
                    Permission.COLLECTOR_CREATE,
                    Permission.COLLECTOR_UPDATE,
                    Permission.COLLECTOR_DELETE,
                    Permission.COLLECTOR_TOKEN_REGENERATE,
                  ]}
                  Component={CollectorsList}
                />
              )}
            />
            <Route
              exact
              path='/management/owners'
              render={() => (
                <WithPermissionsProvider
                  permissions={[
                    Permission.OWNER_CREATE,
                    Permission.OWNER_UPDATE,
                    Permission.OWNER_DELETE,
                  ]}
                  Component={OwnersList}
                />
              )}
            />
            <Route
              exact
              path='/management/tags'
              render={() => (
                <WithPermissionsProvider
                  permissions={[
                    Permission.TAG_CREATE,
                    Permission.TAG_UPDATE,
                    Permission.TAG_DELETE,
                  ]}
                  Component={TagsList}
                />
              )}
            />
            <Route
              exact
              path='/management/labels'
              render={() => (
                <WithPermissionsProvider
                  permissions={[
                    Permission.LABEL_CREATE,
                    Permission.LABEL_UPDATE,
                    Permission.LABEL_DELETE,
                  ]}
                  Component={LabelsList}
                />
              )}
            />
            <RestrictedRoute
              isAllowedTo={hasAccessTo(Permission.OWNER_ASSOCIATION_MANAGE)}
              redirectTo='/management/namespaces'
              exact
              path='/management/associations/:viewType?'
              component={OwnerAssociationsList}
            />
            <Route
              exact
              path='/management/roles'
              render={() => (
                <WithPermissionsProvider
                  permissions={[
                    Permission.ROLE_CREATE,
                    Permission.ROLE_UPDATE,
                    Permission.ROLE_DELETE,
                  ]}
                  Component={RolesList}
                />
              )}
            />
            <Route
              exact
              path='/management/policies'
              render={() => (
                <WithPermissionsProvider
                  permissions={[
                    Permission.POLICY_CREATE,
                    Permission.POLICY_UPDATE,
                    Permission.POLICY_DELETE,
                  ]}
                  Component={PolicyList}
                />
              )}
            />
            <Route
              exact
              path={[
                '/management/policies/createPolicy',
                '/management/policies/:policyId',
              ]}
              render={() => (
                <WithPermissionsProvider
                  permissions={[Permission.POLICY_UPDATE]}
                  Component={PolicyDetails}
                />
              )}
            />
            <Redirect exact from='/management' to='/management/namespaces' />
          </Switch>
        </React.Suspense>
      </S.ContentContainer>
    </S.Container>
  );
};

export default Management;
