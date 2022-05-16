import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { DataEntityClassAndTypeDictionary } from 'generated-sources';
import { toolbarHeight } from 'lib/constants';
import AppLoadingPage from 'components/shared/AppLoadingPage/AppLoadingPage';
import AppToolbarContainer from './shared/AppToolbar/AppToolbarContainer';

// lazy components
const ManagementContainer = React.lazy(
  () => import('./Management/ManagementContainer')
);
const DataEntityDetailsContainer = React.lazy(
  () => import('./DataEntityDetails/DataEntityDetailsContainer')
);
const TermDetailsContainer = React.lazy(
  () => import('./Terms/TermDetails/TermDetailsContainer')
);
const OverviewContainer = React.lazy(
  () => import('./Overview/OverviewContainer')
);
const SearchContainer = React.lazy(
  () => import('./Search/SearchContainer')
);
const TermSearchContainer = React.lazy(
  () => import('./Terms/TermSearch/TermSearchContainer')
);
const AlertsContainer = React.lazy(
  () => import('./Alerts/AlertsContainer')
);

interface AppProps {
  fetchDataEntitiesClassesAndTypes: () => Promise<DataEntityClassAndTypeDictionary>;
}

const App: React.FC<AppProps> = ({ fetchDataEntitiesClassesAndTypes }) => {
  useEffect(() => {
    fetchDataEntitiesClassesAndTypes();
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
              path="/termsearch/:termSearchId?"
              component={TermSearchContainer}
            />
            <Route
              exact
              path="/search/:searchId?"
              component={SearchContainer}
            />
            <Route
              path="/terms/:termId/:viewType?"
              component={TermDetailsContainer}
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
