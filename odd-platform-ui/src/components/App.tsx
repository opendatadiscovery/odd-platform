import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { toolbarHeight } from 'lib/constants';
import { AppLoadingPage, AppToolbar } from 'components/shared';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchDataEntitiesClassesAndTypes } from 'redux/thunks';
import { useAppPaths } from 'lib/hooks/useAppPaths';

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
const TermSearchContainer = React.lazy(
  () => import('./Terms/TermSearch/TermSearchContainer')
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
    <div className="App">
      {!isPathEmbedded && <AppToolbar />}
      <div style={{ paddingTop: `${toolbarHeight}px` }}>
        <React.Suspense fallback={<AppLoadingPage />}>
          <Switch>
            <Route exact path="/" component={Overview} />
            <Route path="/alerts/:viewType?" component={Alerts} />
            <Route path="/management/:viewType?" component={Management} />
            <Route
              exact
              path="/termsearch/:termSearchId?"
              component={TermSearchContainer}
            />
            <Route
              exact
              path={['/search/:searchId?', '/embedded/search/:searchId?']}
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
              component={DataEntityDetails}
            />
            <Route path="/activity" component={Activity} />
          </Switch>
        </React.Suspense>
      </div>
    </div>
  );
};

export default App;
