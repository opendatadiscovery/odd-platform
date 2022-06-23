import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Grid } from '@mui/material';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import AppLoadingPage from 'components/shared/AppLoadingPage/AppLoadingPage';
import * as S from './ManagementStyles';

// lazy components
const NamespaceList = React.lazy(
  () => import('./NamespaceList/NamespaceList')
);
const OwnersListContainer = React.lazy(
  () => import('./OwnersList/OwnersListContainer')
);

const LabelsList = React.lazy(() => import('./LabelsList/LabelsList'));
const TagsList = React.lazy(() => import('./TagsList/TagsList'));

const DataSourcesList = React.lazy(
  () => import('./DataSourcesList/DataSourcesList')
);

const CollectorsList = React.lazy(
  () => import('./CollectorsList/CollectorsList')
);

interface ManagementProps {
  viewType: string;
}

const Management: React.FC<ManagementProps> = ({ viewType }) => {
  const [tabs] = React.useState<AppTabItem[]>([
    { name: 'Namespaces', link: '/management/namespaces' },
    { name: 'Datasources', link: '/management/datasources' },
    { name: 'Collectors', link: '/management/collectors' },
    { name: 'Owners', link: '/management/owners' },
    { name: 'Tags', link: '/management/tags' },
    { name: 'Labels', link: '/management/labels' },
  ]);

  const [selectedTab, setSelectedTab] = React.useState<number>(-1);

  React.useEffect(() => {
    setSelectedTab(
      viewType
        ? tabs.findIndex(tab => tab.name.toLowerCase() === viewType)
        : 0
    );
  }, [tabs]);

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
              component={OwnersListContainer}
            />
            <Route exact path="/management/tags" component={TagsList} />
            <Route
              exact
              path="/management/labels"
              component={LabelsList}
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
