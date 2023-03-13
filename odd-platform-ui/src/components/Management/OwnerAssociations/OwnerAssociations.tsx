import React from 'react';
import { Grid } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { fetchOwnerAssociationRequestList } from 'redux/thunks';
import { useAtom } from 'jotai';
import {
  getNewOwnerAssociationRequestsPageInfo,
  getResolvedOwnerAssociationRequestsPageInfo,
} from 'redux/selectors';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import OwnerAssociationsTabs from './OwnerAssociationsTabs/OwnerAssociationsTabs';
import OwnerAssociationsHeader from './OwnerAssociationsHeader/OwnerAssociationsHeader';
import { queryAtom } from './OwnerAssociationsStore/OwnerAssociationsAtoms';
import OwnerAssociationsAtomProvider from './OwnerAssociationsStore/OwnerAssociationsProvider';

const OwnerAssociationsNew = React.lazy(
  () => import('./OwnerAssociationsList/OwnerAssociationsNew/OwnerAssociationsNew')
);
const OwnerAssociationsResolved = React.lazy(
  () =>
    import('./OwnerAssociationsList/OwnerAssociationsResolved/OwnerAssociationsResolved')
);

const OwnerAssociations: React.FC = () => {
  const dispatch = useAppDispatch();
  const { associationsViewType } = useAppParams();
  const { ManagementRoutes } = useAppPaths();

  const [query] = useAtom(queryAtom);

  const size = 30;

  const active = React.useMemo(
    () => associationsViewType === ManagementRoutes.associationsNew,
    [associationsViewType]
  );

  const newRequestsPageInfo = useAppSelector(getNewOwnerAssociationRequestsPageInfo);
  const resolvedRequestsPageInfo = useAppSelector(
    getResolvedOwnerAssociationRequestsPageInfo
  );

  const total = React.useMemo(
    () => newRequestsPageInfo.total + resolvedRequestsPageInfo.total,
    [newRequestsPageInfo.total + resolvedRequestsPageInfo.total]
  );

  React.useEffect(() => {
    if (!query) {
      dispatch(fetchOwnerAssociationRequestList({ page: 1, size, active: true }));
      dispatch(fetchOwnerAssociationRequestList({ page: 1, size, active: false }));
    }
  }, []);

  return (
    <OwnerAssociationsAtomProvider>
      <Grid container flexDirection='column' alignItems='center'>
        <OwnerAssociationsHeader total={total} size={size} active={active} />
        <Grid sx={{ width: '100%' }}>
          <OwnerAssociationsTabs
            size={size}
            newRequestsTabHint={newRequestsPageInfo.total}
          />
        </Grid>
        <Routes>
          <Route
            path={ManagementRoutes.associationsNew}
            element={<OwnerAssociationsNew size={size} />}
          />
          <Route
            path={ManagementRoutes.associationsResolved}
            element={<OwnerAssociationsResolved size={size} />}
          />
          <Route path='/' element={<Navigate to={ManagementRoutes.associationsNew} />} />
        </Routes>
      </Grid>
    </OwnerAssociationsAtomProvider>
  );
};

export default OwnerAssociations;
