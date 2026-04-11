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
import {
  activityPath,
  alertsPath,
  dataEntitiesPath,
  dataModellingPath,
  dataQualityPath,
  directoryPath,
  lookupTablesPath,
  managementPath,
  searchPath,
  termsPath,
  termsSearchPath,
} from 'routes';
import { WithPermissionsProvider } from './shared/contexts';
import { Permission } from '../generated-sources';

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
const LookupTables = lazy(() => import('./MasterData/LookupTables'));

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchDataEntitiesClassesAndTypes()).catch(() => {});
    dispatch(fetchIdentity()).catch(() => {});
    dispatch(fetchActiveFeatures()).catch(() => {});
    dispatch(fetchTagsList({ page: 1, size: 10 })).catch(() => {});
  }, []);

  return (
    <div className='App'>
      <Toaster position='bottom-right' toastOptions={{ custom: { duration: 6000 } }} />
      <AppToolbar />
      <div style={{ paddingTop: `${toolbarHeight}px` }}>
        <AppSuspenseWrapper>
          <Routes>
            <Route path='/' element={<Overview />} />
            <Route path={`${searchPath()}/*`} element={<Search />} />
            <Route path={`${managementPath()}/*`} element={<Management />} />
            <Route path={`${termsSearchPath()}/*`} element={<TermSearch />} />
            <Route path={`${alertsPath()}/*`} element={<Alerts />} />
            <Route path={activityPath()} element={<Activity />} />
            <Route path={termsPath()}>
              <Route path=':termId/*' element={<TermDetails />} />
            </Route>
            <Route path={dataEntitiesPath()}>
              <Route path=':dataEntityId/*' element={<DataEntityDetails />} />
            </Route>
            <Route path={`${directoryPath()}/*`} element={<DirectoryRoutes />} />
            <Route path={dataQualityPath()} element={<DataQuality />} />
            <Route path={`${dataModellingPath()}/*`} element={<DataModeling />} />
            <Route
              path={lookupTablesPath()}
              element={
                <WithPermissionsProvider
                  allowedPermissions={[
                    Permission.LOOKUP_TABLE_CREATE,
                    Permission.LOOKUP_TABLE_UPDATE,
                    Permission.LOOKUP_TABLE_DELETE,
                  ]}
                  resourcePermissions={[]}
                  Component={LookupTables}
                />
              }
            />
          </Routes>
        </AppSuspenseWrapper>
      </div>
    </div>
  );
};

export default App;
