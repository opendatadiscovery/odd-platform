import React, { lazy, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { toolbarHeight } from 'lib/constants';
import { AppSuspenseWrapper, AppToolbar } from 'components/shared/elements';
import { useAppDispatch } from 'redux/lib/hooks';
import {
  fetchActiveFeatures,
  fetchDataEntitiesClassesAndTypes,
  fetchIdentity,
  fetchTagsList,
} from 'redux/thunks';
import { useAppPaths } from 'lib/hooks';

// lazy elements
const Management = lazy(() => import('./Management/Management'));
const ManagementRoutes = lazy(
  () => import('./Management/ManagementRoutes/ManagementRoutes')
);
const DataEntityDetails = lazy(() => import('./DataEntityDetails/DataEntityDetails'));
const TermDetails = lazy(() => import('./Terms/TermDetails/TermDetails'));
const Overview = lazy(() => import('./Overview/Overview'));
const Search = lazy(() => import('./Search/Search'));
const TermSearch = lazy(() => import('./Terms/TermSearch/TermSearch'));
const Alerts = lazy(() => import('./Alerts/Alerts'));
const Activity = lazy(() => import('./Activity/Activity'));
const DirectoryRoutes = lazy(() => import('./Directory/DirectoryRoutes'));
const DataQuality = lazy(() => import('./DataQuality/DataQuality'));
const DataModeling = lazy(() => import('./DataModelling/DataModelling'));

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
    DirectoryRoutes: DirectoryRoutesEnum,
    DataModellingRoutes,
    DataQualityRoutes,
    getNonExactPath,
    getNonExactParamPath,
  } = useAppPaths();

  useEffect(() => {
    dispatch(fetchDataEntitiesClassesAndTypes()).catch(() => {});
    dispatch(fetchIdentity()).catch(() => {});
    dispatch(fetchActiveFeatures()).catch(() => {});
    dispatch(fetchTagsList({ page: 1, size: 10 })).catch(() => {});
  }, []);

  return (
    <div className='App'>
      <Toaster position='bottom-right' toastOptions={{ custom: { duration: 6000 } }} />
      {!isPathEmbedded && <AppToolbar />}
      <div style={{ paddingTop: `${toolbarHeight}px` }}>
        <AppSuspenseWrapper>
          <Routes>
            <Route path={basePath} element={<Overview />} />
            <Route path={getNonExactPath(SearchRoutes.search)} element={<Search />} />
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
            />
            <Route path={getNonExactPath(AlertsRoutes.alerts)} element={<Alerts />} />
            <Route
              path={getNonExactPath(ActivityRoutes.activity)}
              element={<Activity />}
            />
            <Route path={getNonExactPath(TermsRoutes.terms)} element={<TermDetails />}>
              <Route path={getNonExactParamPath(TermsRoutes.termIdParam)} />
            </Route>
            <Route
              path={getNonExactPath(DataEntityRoutes.dataentities)}
              element={<DataEntityDetails />}
            >
              <Route path={getNonExactParamPath(DataEntityRoutes.dataEntityIdParam)} />
            </Route>
            <Route
              path={getNonExactPath(DirectoryRoutesEnum.directory)}
              element={<DirectoryRoutes />}
            />
            <Route
              path={getNonExactPath(DataQualityRoutes.dataQuality)}
              element={<DataQuality />}
            />
            <Route
              path={getNonExactPath(DataModellingRoutes.dataModelling)}
              element={<DataModeling />}
            />
          </Routes>
        </AppSuspenseWrapper>
      </div>
    </div>
  );
};

export default App;
