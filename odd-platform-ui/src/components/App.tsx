import React from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom-v5-compat';
import { toolbarHeight } from 'lib/constants';
import { AppLoadingPage, AppToolbar } from 'components/shared';
import { useAppDispatch } from 'redux/lib/hooks';
import {
  fetchActiveFeatures,
  fetchAppInfo,
  fetchAppLinks,
  fetchDataEntitiesClassesAndTypes,
  fetchIdentity,
} from 'redux/thunks';
import { useAppPaths } from 'lib/hooks';
import { Permission } from 'generated-sources';
import { WithPermissionsProvider } from 'components/shared/contexts';
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
    baseTermSearchPath,
    termSearchPath,
    termDetailsPath,
    activityPath,
    dataEntityDetailsPath,
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
        {/* <React.Suspense fallback={<AppLoadingPage />}> */}
        {/*   <Switch> */}
        {/*     <Route exact path={basePath} component={Overview} /> */}
        {/*     <Route path={[alertsBasePath(), alertsPath()]} component={Alerts} /> */}
        {/*     <Route */}
        {/*       path={[managementPath()]} */}
        {/*       render={() => ( */}
        {/*         <WithPermissionsProvider */}
        {/*           allowedPermissions={[Permission.OWNER_ASSOCIATION_MANAGE]} */}
        {/*           resourcePermissions={[]} */}
        {/*           Component={Management} */}
        {/*         /> */}
        {/*       )} */}
        {/*     /> */}
        {/*     <Route exact path={[baseSearchPath(), searchPath()]} component={Search} /> */}
        {/*     <Route */}
        {/*       exact */}
        {/*       path={[baseTermSearchPath(), termSearchPath()]} */}
        {/*       component={TermSearch} */}
        {/*     /> */}
        {/*     <Route path={termDetailsPath()} component={TermDetails} /> */}
        {/*     <Route path={dataEntityDetailsPath()} component={DataEntityDetails} /> */}
        {/*     <Route path={activityPath()} component={Activity} /> */}
        {/*     <Redirect */}
        {/*       from={baseManagementPath()} */}
        {/*       to={managementPath(ManagementRoutes.namespaces)} */}
        {/*     /> */}
        {/*   </Switch> */}
        {/* </React.Suspense> */}
        <React.Suspense fallback={<AppLoadingPage />}>
          <Routes>
            <Route path={basePath} element={<Overview />} />
            <Route
              key='Alerts'
              path={getNonExactPath(AlertsRoutes.alerts)}
              element={<Alerts />}
            >
              <Route path={AlertsRoutes.alertsViewTypeParam} />
            </Route>
            <Route
              path={getNonExactPath(ManagementRoutes.management)}
              element={
                <WithPermissionsProvider
                  allowedPermissions={[Permission.OWNER_ASSOCIATION_MANAGE]}
                  resourcePermissions={[]}
                  Component={Management}
                />
              }
            >
              <Route
                path={getNonExactParamPath(ManagementRoutes.managementViewTypeParam)}
              />
            </Route>
            <Route path={getNonExactPath(SearchRoutes.search)} element={<Search />}>
              <Route path={SearchRoutes.searchIdParam} />
            </Route>
            {/* <Route */}
            {/*   exact */}
            {/*   path={[baseTermSearchPath(), termSearchPath()]} */}
            {/*   component={TermSearch} */}
            {/* /> */}
            <Route path={termDetailsPath()} element={<TermDetails />} />
            {/* <Route path={dataEntityDetailsPath()} element={<DataEntityDetails />} /> */}
            <Route path='dataentities' element={<DataEntityDetails />}>
              <Route path=':dataEntityViewType' />
            </Route>
            <Route path={activityPath()} element={<Activity />} />
          </Routes>
        </React.Suspense>
      </div>
    </div>
  );
};

export default App;
