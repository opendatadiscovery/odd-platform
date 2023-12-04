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
import { dataModellingPath } from 'routes/dataModellingRoutes';
import { alertsPath } from 'routes/alertsRoutes';
import { managementPath } from 'routes/managementRoutes';
import { dataQualityPath } from 'routes/dataQualityRoutes';

// lazy elements
const Management = lazy(() => import('./Management/Management'));
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
    SearchRoutes,
    basePath,
    TermsRoutes,
    ActivityRoutes,
    DirectoryRoutes: DirectoryRoutesEnum,
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
            <Route path={getNonExactPath(managementPath())} element={<Management />} />
            <Route
              path={getNonExactPath(TermsRoutes.termSearch)}
              element={<TermSearch />}
            />
            <Route path={getNonExactPath(alertsPath())} element={<Alerts />} />
            <Route
              path={getNonExactPath(ActivityRoutes.activity)}
              element={<Activity />}
            />
            <Route path={getNonExactPath(TermsRoutes.terms)} element={<TermDetails />}>
              <Route path={getNonExactParamPath(TermsRoutes.termIdParam)} />
            </Route>
            <Route
              path={getNonExactPath('/dataentities/:dataEntityId')}
              element={<DataEntityDetails />}
            />
            <Route
              path={getNonExactPath(DirectoryRoutesEnum.directory)}
              element={<DirectoryRoutes />}
            />
            <Route path={getNonExactPath(dataQualityPath())} element={<DataQuality />} />
            <Route
              path={getNonExactPath(dataModellingPath())}
              element={<DataModeling />}
            />
          </Routes>
        </AppSuspenseWrapper>
      </div>
    </div>
  );
};

export default App;
