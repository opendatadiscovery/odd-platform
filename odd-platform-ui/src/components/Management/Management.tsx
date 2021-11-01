import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Grid } from '@mui/material';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import AppLoadingPage from 'components/shared/AppLoadingPage/AppLoadingPage';
import { StylesType } from './ManagementStyles';

// lazy components
const NamespaceListContainer = React.lazy(
  () => import('./NamespaceList/NamespaceListContainer')
);
const OwnersListContainer = React.lazy(
  () => import('./OwnersList/OwnersListContainer')
);
const LabelsListContainer = React.lazy(
  () => import('./LabelsList/LabelsListContainer')
);
const TagsListContainer = React.lazy(
  () => import('./TagsList/TagsListContainer')
);
const DataSourcesListContainer = React.lazy(
  () => import('./DataSourcesList/DataSourcesListContainer')
);

interface ManagementProps extends StylesType {
  viewType: string;
}

const Management: React.FC<ManagementProps> = ({ classes, viewType }) => {
  const [tabs] = React.useState<AppTabItem[]>([
    { name: 'Namespaces', link: '/management/namespaces' },
    { name: 'Datasources', link: '/management/datasources' },
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
    <div className={classes.container}>
      <Grid container className={classes.contentContainer} wrap="nowrap">
        <Grid item xs={3} className={classes.sidebarContainer}>
          <div className={classes.sidebar}>
            <div className={classes.tabsContainer}>
              {tabs.length && selectedTab >= 0 ? (
                <AppTabs
                  orientation="vertical"
                  type="menu"
                  items={tabs}
                  selectedTab={selectedTab}
                  handleTabChange={() => {}}
                />
              ) : null}
            </div>
          </div>
        </Grid>
        <Grid item xs={9} className={classes.content}>
          <React.Suspense fallback={<AppLoadingPage />}>
            <Switch>
              <Route
                exact
                path="/management/namespaces"
                component={NamespaceListContainer}
              />
              <Route
                exact
                path="/management/datasources"
                component={DataSourcesListContainer}
              />
              <Route
                exact
                path="/management/owners"
                component={OwnersListContainer}
              />
              <Route
                exact
                path="/management/tags"
                component={TagsListContainer}
              />
              <Route
                exact
                path="/management/labels"
                component={LabelsListContainer}
              />
              <Redirect
                exact
                from="/management"
                to="/management/namespaces"
              />
            </Switch>
          </React.Suspense>
        </Grid>
      </Grid>
    </div>
  );
};

export default Management;
