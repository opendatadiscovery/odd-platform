import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { toolbarHeight } from 'lib/constants';
import { AppSuspenseWrapper, AppToolbar } from 'components/shared';
import { useAppDispatch } from 'redux/lib/hooks';
import {
  fetchActiveFeatures,
  fetchAppInfo,
  fetchAppLinks,
  fetchDataEntitiesClassesAndTypes,
  fetchIdentity,
  fetchTagsList,
} from 'redux/thunks';
import { useAppPaths } from 'lib/hooks';
import { Toaster } from 'react-hot-toast';
import ManagementRoutes from './Management/ManagementRoutes/ManagementRoutes';

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
    ManagementRoutes: ManagementRoutesEnum,
    SearchRoutes,
    basePath,
    TermsRoutes,
    DataEntityRoutes,
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
    dispatch(fetchTagsList({ page: 1, size: 20 }));
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
              path={getNonExactPath(ManagementRoutesEnum.management)}
              element={<Management />}
            >
              <Route
                path={getNonExactParamPath(ManagementRoutesEnum.managementViewTypeParam)}
                element={<ManagementRoutes />}
              />
            </Route>
            <Route
              path={getNonExactPath(TermsRoutes.termSearch)}
              element={<TermSearch />}
            >
              <Route path={TermsRoutes.termSearchIdParam} />
            </Route>
            <Route path={getNonExactPath(AlertsRoutes.alerts)} element={<Alerts />}>
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
            <Route
              path={getNonExactPath(DataEntityRoutes.dataentities)}
              element={<DataEntityDetails />}
            >
              <Route path={getNonExactParamPath(DataEntityRoutes.dataEntityIdParam)}>
                <Route
                  path={getNonExactParamPath(DataEntityRoutes.dataEntityViewTypeParam)}
                />
              </Route>
            </Route>
          </Routes>
        </AppSuspenseWrapper>
      </div>
    </div>
  );
};

export default App;
