import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { toolbarHeight } from 'lib/constants';
import { AppLoadingPage, AppToolbar } from 'components/shared';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchDataEntitiesClassesAndTypes } from 'redux/thunks';
import { useAppPaths } from 'lib/hooks';
import { PermissionProvider } from 'components/shared/contexts';
import { Permission } from 'generated-sources';

// lazy components
const Management = React.lazy(() => import('./Management/Management'));
const DataEntityDetails = React.lazy(
  () => import('./DataEntityDetails/DataEntityDetails')
);
const TermDetails = React.lazy(
  () => import('./Terms/TermDetails/TermDetails')
);
const Overview = React.lazy(() => import('./Overview/Overview'));
const Search = React.lazy(() => import('./Search/Search'));
const TermSearch = React.lazy(
  () => import('./Terms/TermSearch/TermSearch')
);
const Alerts = React.lazy(() => import('./Alerts/Alerts'));
const Activity = React.lazy(() => import('./Activity/Activity'));

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(fetchDataEntitiesClassesAndTypes());
  }, []);

  const { isPathEmbedded } = useAppPaths();

  return (
    <PermissionProvider permissions={[Permission.MANAGEMENT_CONTROL]}>
      <div className="App">
        {!isPathEmbedded && <AppToolbar />}
        <div style={{ paddingTop: `${toolbarHeight}px` }}>
          <React.Suspense fallback={<AppLoadingPage />}>
            <Switch>
              <Route exact path="/" component={Overview} />
              <Route path="/alerts/:viewType?" component={Alerts} />
              <Route
                path="/management/:viewType?"
                component={Management}
              />
              <Route
                exact
                path="/termsearch/:termSearchId?"
                component={TermSearch}
              />
              <Route
                exact
                path={[
                  '/search/:searchId?',
                  '/embedded/search/:searchId?',
                ]}
                component={Search}
              />
              <Route
                path="/terms/:termId/:viewType?"
                component={TermDetails}
              />
              <Route
                path={[
                  '/dataentities/:dataEntityId/:viewType?',
                  '/embedded/dataentities/:dataEntityId/:viewType?',
                ]}
                render={() => (
                  <PermissionProvider
                    permissions={[Permission.DATA_ENTITY_EDIT]}
                  >
                    <DataEntityDetails />
                  </PermissionProvider>
                )}
              />
              <Route path="/activity" component={Activity} />
            </Switch>
          </React.Suspense>
        </div>
      </div>
    </PermissionProvider>
  );
};

export default App;
