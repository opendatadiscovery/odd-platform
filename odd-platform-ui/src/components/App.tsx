import React from 'react';
import { Route, Routes } from 'react-router-dom-v5-compat';
import { toolbarHeight } from 'lib/constants';
import { AppSuspenseWrapper, AppToolbar } from 'components/shared';
import { useAppDispatch } from 'redux/lib/hooks';
import {
  fetchActiveFeatures,
  fetchAppInfo,
  fetchAppLinks,
  fetchDataEntitiesClassesAndTypes,
  fetchIdentity,
} from 'redux/thunks';
import { useAppPaths } from 'lib/hooks';
import { Toaster } from 'react-hot-toast';

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

  const {
    isPathEmbedded,
    ManagementRoutes,
    SearchRoutes,
    basePath,
    TermsRoutes,
    activityPath,
    dataEntityDetailsPath,
    ActivityRoutes,
    AlertsRoutes,
    getNonExactPath,
    getNonExactParamPath,
  } = useAppPaths();

  React.useEffect(() => {
    dispatch(fetchDataEntitiesClassesAndTypes());
    dispatch(fetchIdentity());
    dispatch(fetchAppInfo());
    dispatch(fetchActiveFeatures());
    dispatch(fetchAppLinks());
  }, []);

  return (
    <div className='App'>
      <Toaster position='bottom-right' toastOptions={{ custom: { duration: 6000 } }} />
      {!isPathEmbedded && <AppToolbar />}
      <div style={{ paddingTop: `${toolbarHeight}px` }}>
        <AppSuspenseWrapper>
          <Routes>
            <Route path={basePath} element={<Overview />} />
            <Route path={getNonExactPath(SearchRoutes.search)} element={<Search />}>
              <Route path={SearchRoutes.searchIdParam} />
            </Route>
            <Route
              path={getNonExactPath(ManagementRoutes.management)}
              element={<Management />}
            >
              <Route
                path={getNonExactParamPath(ManagementRoutes.managementViewTypeParam)}
              />
            </Route>
            <Route
              path={getNonExactPath(TermsRoutes.termSearch)}
              element={<TermSearch />}
            >
              <Route path={TermsRoutes.termSearchIdParam} />
            </Route>
            <Route
              key='Alerts'
              path={getNonExactPath(AlertsRoutes.alerts)}
              element={<Alerts />}
            >
              <Route path={AlertsRoutes.alertsViewTypeParam} />
            </Route>
            <Route
              path={getNonExactPath(ActivityRoutes.activity)}
              element={<Activity />}
            />

            <Route path={getNonExactPath(TermsRoutes.terms)} element={<TermDetails />}>
              <Route path={getNonExactParamPath(TermsRoutes.termIdParam)}>
                <Route path={TermsRoutes.termsViewTypeParam} />
              </Route>
            </Route>
            {/* <Route path={dataEntityDetailsPath()} element={<DataEntityDetails />} /> */}
            <Route path='dataentities' element={<DataEntityDetails />}>
              <Route path=':dataEntityViewType' />
            </Route>
          </Routes>
        </AppSuspenseWrapper>
      </div>
    </div>
  );
};

export default App;
