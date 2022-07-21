import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { toolbarHeight } from 'lib/constants';
import AppLoadingPage from 'components/shared/AppLoadingPage/AppLoadingPage';
import { useAppDispatch } from 'lib/redux/hooks';
import { fetchDataEntitiesClassesAndTypes } from 'redux/thunks';
import AppToolbarContainer from './shared/AppToolbar/AppToolbarContainer';

// lazy components
const Management = React.lazy(() => import('./Management/Management'));
const DataEntityDetails = React.lazy(
  () => import('./DataEntityDetails/DataEntityDetails')
);
const TermDetails = React.lazy(
  () => import('./Terms/TermDetails/TermDetails')
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
const Alerts = React.lazy(() => import('./Alerts/Alerts'));
const Activity = React.lazy(() => import('./Activity/Activity'));

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
            <Route path="/alerts/:viewType?" component={Alerts} />
            <Route path="/management/:viewType?" component={Management} />
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
              component={TermDetails}
            />
            <Route
              path="/dataentities/:dataEntityId/:viewType?"
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
