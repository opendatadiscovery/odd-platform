import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { toolbarHeight } from 'lib/constants';
import AppLoadingPage from 'components/shared/AppLoadingPage/AppLoadingPage';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchDataEntitiesClassesAndTypes } from 'redux/thunks';
import AppToolbarContainer from './shared/AppToolbar/AppToolbarContainer';

// lazy components
const ManagementContainer = React.lazy(
  () => import('./Management/ManagementContainer')
);
const DataEntityDetailsContainer = React.lazy(
  () => import('./DataEntityDetails/DataEntityDetailsContainer')
);
const OverviewContainer = React.lazy(
  () => import('./Overview/OverviewContainer')
);
const SearchContainer = React.lazy(
  () => import('./Search/SearchContainer')
);
const AlertsContainer = React.lazy(
  () => import('./Alerts/AlertsContainer')
);

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(fetchDataEntitiesClassesAndTypes());
  }, []);

  return (
    <div className="App">
      <AppToolbarContainer />
      <div style={{ paddingTop: `${toolbarHeight}px` }}>
        <React.Suspense fallback={<AppLoadingPage />}>
          <Switch>
            <Route exact path="/" component={OverviewContainer} />
            <Route path="/alerts/:viewType?" component={AlertsContainer} />
            <Route
              path="/management/:viewType?"
              component={ManagementContainer}
            />
            <Route
              exact
              path="/search/:searchId?"
              component={SearchContainer}
            />
            <Route
              path="/dataentities/:dataEntityId/:viewType?"
              component={DataEntityDetailsContainer}
            />
          </Switch>
        </React.Suspense>
      </div>
    </div>
  );
};

export default App;
