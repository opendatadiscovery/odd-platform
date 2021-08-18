import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { DataEntityTypeDictionary } from 'generated-sources';
import { toolbarHeight } from 'lib/constants';
import ManagementContainer from './Management/ManagementContainer';
import DataEntityDetailsContainer from './DataEntityDetails/DataEntityDetailsContainer';
import OverviewContainer from './Overview/OverviewContainer';
import SearchContainer from './Search/SearchContainer';
import AppLoadingSpinnerContainer from './shared/AppLoadingSpinner/AppLoadingSpinnerContainer';
import AppToolbarContainer from './shared/AppToolbar/AppToolbarContainer';
import AlertsContainer from './Alerts/AlertsContainer';

interface AppProps {
  fetchDataEntitiesTypes: () => Promise<DataEntityTypeDictionary>;
}

const App: React.FC<AppProps> = ({ fetchDataEntitiesTypes }) => {
  useEffect(() => {
    fetchDataEntitiesTypes();
  }, []);
  return (
    <div className="App">
      <AppLoadingSpinnerContainer />
      <Switch>
        <Route path={['/']} component={AppToolbarContainer} />
      </Switch>
      <div style={{ paddingTop: `${toolbarHeight}px` }}>
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
      </div>
    </div>
  );
};

export default App;
