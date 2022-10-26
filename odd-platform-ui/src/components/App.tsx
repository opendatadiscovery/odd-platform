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
const TermDetails = React.lazy(() => import('./Terms/TermDetails/TermDetails'));
const Overview = React.lazy(() => import('./Overview/Overview'));
const Search = React.lazy(() => import('./Search/Search'));
const TermSearch = React.lazy(() => import('./Terms/TermSearch/TermSearch'));
const Alerts = React.lazy(() => import('./Alerts/Alerts'));
const Activity = React.lazy(() => import('./Activity/Activity'));

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(fetchDataEntitiesClassesAndTypes());
  }, []);

  const { isPathEmbedded } = useAppPaths();

  return (
    <div className='App'>
      {!isPathEmbedded && <AppToolbar />}
      <div style={{ paddingTop: `${toolbarHeight}px` }}>
        <React.Suspense fallback={<AppLoadingPage />}>
          <Switch>
            <Route exact path='/' component={Overview} />
            <Route path='/alerts/:viewType?' component={Alerts} />
            <Route
              path='/management/:viewType?'
              render={() => (
                <PermissionProvider
                  permissions={[
                    // Permission.ROLE_MANAGEMENT,
                    Permission.NAMESPACE_CREATE,
                    Permission.NAMESPACE_UPDATE,
                    Permission.NAMESPACE_DELETE,
                    // Permission.POLICY_MANAGEMENT,
                    Permission.OWNER_ASSOCIATION_MANAGE,
                    Permission.TAG_UPDATE,
                    Permission.TAG_CREATE,
                    Permission.TAG_DELETE,
                    Permission.OWNER_CREATE,
                    Permission.OWNER_UPDATE,
                    Permission.OWNER_DELETE,
                    Permission.LABEL_CREATE,
                    Permission.LABEL_UPDATE,
                    Permission.LABEL_DELETE,
                    Permission.DATA_SOURCE_CREATE,
                    Permission.DATA_SOURCE_UPDATE,
                    Permission.DATA_SOURCE_DELETE,
                    Permission.DATA_SOURCE_TOKEN_REGENERATE,
                    Permission.COLLECTOR_CREATE,
                    Permission.COLLECTOR_DELETE,
                    Permission.COLLECTOR_UPDATE,
                    Permission.COLLECTOR_TOKEN_REGENERATE,
                  ]}
                >
                  <Management />
                </PermissionProvider>
              )}
            />
            <Route exact path='/termsearch/:termSearchId?' component={TermSearch} />
            <Route
              exact
              path={['/search/:searchId?', '/embedded/search/:searchId?']}
              component={Search}
            />
            <Route path='/terms/:termId/:viewType?' component={TermDetails} />
            <Route
              path={[
                '/dataentities/:dataEntityId/:viewType?',
                '/embedded/dataentities/:dataEntityId/:viewType?',
              ]}
              component={DataEntityDetails}
            />
            <Route path='/activity' component={Activity} />
          </Switch>
        </React.Suspense>
      </div>
    </div>
  );
};

export default App;
