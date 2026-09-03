import React, { lazy, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { toolbarHeight } from 'lib/constants';
import { buildSearchLink } from 'lib/hooks';
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
  favoritesPath,
  lookupTablesPath,
  managementPath,
  searchPath,
  termsPath,
  termsSearchPath,
} from 'routes';
import { WithPermissionsProvider } from './shared/contexts';
import { Permission } from '../generated-sources';

/**
 * ST-7 (#1841) — where the retired `/favorites` tab now sends people. Built once, through the canonical
 * serialiser rather than as a literal, so the landing URL is byte-identical to what `Search.tsx`'s facet→URL
 * mirror would write; a hand-built string diverges and the mirror rewrites it, dropping the filter the
 * redirect exists to apply. Same construction as the Catalog Overview panel's "View all"
 * (`FavoritesColumn.tsx`) — one idiom, two call sites.
 */
const favoritesSearchLink = buildSearchLink({ favorites: 'yes' });

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
            {/* ST-7 (#1841) — the bespoke Favorites tab is retired in favour of the Catalog search's
                Favorites filter. The ROUTE stays, as a redirect: there is no catch-all route in this
                Routes tree, so deleting it outright would render the toolbar over a blank page for every
                bookmark and shared link that already points here. */}
            <Route path={favoritesPath()} element={<Navigate replace to={favoritesSearchLink} />} />
            <Route path={searchPath()}>
              <Route index element={<Search />} />
              <Route path=':searchId' element={<Search />} />
            </Route>
            <Route path={`${managementPath()}/*`} element={<Management />} />
            <Route path={termsSearchPath()}>
              <Route index element={<TermSearch />} />
              <Route path=':termSearchId' element={<TermSearch />} />
            </Route>
            <Route path={alertsPath()} element={<Alerts />} />
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
