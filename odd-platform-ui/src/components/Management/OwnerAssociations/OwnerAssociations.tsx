import React from 'react';
import { Grid } from '@mui/material';
import { Navigate, Route, Routes, useLocation, useMatch } from 'react-router-dom';
import { useAtom } from 'jotai';
import { fetchOwnerAssociationRequestList } from 'redux/thunks';
import {
  getNewOwnerAssociationRequestsPageInfo,
  getResolvedOwnerAssociationRequestsPageInfo,
} from 'redux/selectors';
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
  const match = useMatch(useLocation().pathname);

  const [query] = useAtom(queryAtom);

  const size = 30;

  const active = React.useMemo(() => {
    if (match) {
      return match.pathname.includes('new');
    }
    return false;
  }, [match?.pathname]);

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
          <Route path='' element={<Navigate to='new' />} />
          <Route path='new' element={<OwnerAssociationsNew size={size} />} />
          <Route path='resolved' element={<OwnerAssociationsResolved size={size} />} />
        </Routes>
      </Grid>
    </OwnerAssociationsAtomProvider>
  );
};

export default OwnerAssociations;
