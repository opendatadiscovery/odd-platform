import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Grid } from '@mui/material';
import {
  AppLoadingPage,
  AppTabItem,
  AppTabs,
  RestrictedRoute,
} from 'components/shared';
import { useAppParams, useAppPaths, usePermissions } from 'lib/hooks';
import * as S from './ManagementStyles';

// lazy components
const NamespaceList = React.lazy(
  () => import('./NamespaceList/NamespaceList')
);
const OwnersList = React.lazy(() => import('./OwnersList/OwnersList'));
const LabelsList = React.lazy(() => import('./LabelsList/LabelsList'));
const TagsList = React.lazy(() => import('./TagsList/TagsList'));
const DataSourcesList = React.lazy(
  () => import('./DataSourcesList/DataSourcesList')
);
const CollectorsList = React.lazy(
  () => import('./CollectorsList/CollectorsList')
);
const OwnerAssociationsList = React.lazy(
  () => import('./OwnerAssociations/OwnerAssociations')
);

const Management: React.FC = () => {
  const { viewType } = useAppParams();
  const { managementPath } = useAppPaths();
  const { isAdmin } = usePermissions({});

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
      hidden: !isAdmin,
    },
  ]);

  const [selectedTab, setSelectedTab] = React.useState<number>(-1);

  React.useEffect(() => {
    setSelectedTab(
      viewType
        ? tabs.findIndex(tab => tab.name.toLowerCase() === viewType)
        : 0
    );
  }, [tabs, viewType]);

  return (
    <S.Container container wrap="nowrap">
      <S.SidebarContainer item xs={3}>
        <Grid sx={{ p: 0.5 }}>
          {tabs.length && selectedTab >= 0 ? (
            <AppTabs
              orientation="vertical"
              type="menu"
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
              path="/management/namespaces"
              component={NamespaceList}
            />
            <Route
              exact
              path="/management/datasources"
              component={DataSourcesList}
            />
            <Route
              exact
              path="/management/collectors"
              component={CollectorsList}
            />
            <Route
              exact
              path="/management/owners"
              component={OwnersList}
            />
            <Route exact path="/management/tags" component={TagsList} />
            <Route
              exact
              path="/management/labels"
              component={LabelsList}
            />
            <RestrictedRoute
              isAllowedTo={isAdmin}
              redirectTo="/management/namespaces"
              exact
              path="/management/associations/:viewType?"
              component={OwnerAssociationsList}
            />
            <Redirect
              exact
              from="/management"
              to="/management/namespaces"
            />
          </Switch>
        </React.Suspense>
      </S.ContentContainer>
    </S.Container>
  );
};

export default Management;
