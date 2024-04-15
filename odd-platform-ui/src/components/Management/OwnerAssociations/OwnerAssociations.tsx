import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useGetOwnerAssociationRequestList } from 'lib/hooks/api/ownerAssociationRequest';
import { OwnerAssociationRequestStatusParam, Permission } from 'generated-sources';
import { WithPermissionsProvider } from 'components/shared/contexts';
import OwnerAssociationsTabs from './OwnerAssociationsTabs/OwnerAssociationsTabs';
import OwnerAssociationsHeader from './OwnerAssociationsHeader/OwnerAssociationsHeader';
import OwnerAssociationsAtomProvider from './OwnerAssociationsStore/OwnerAssociationsProvider';

const OwnerAssociationsNew = React.lazy(
  () => import('./OwnerAssociationsList/OwnerAssociationsNew/OwnerAssociationsNew')
);
const OwnerAssociationsResolved = React.lazy(
  () =>
    import('./OwnerAssociationsList/OwnerAssociationsResolved/OwnerAssociationsResolved')
);
const OwnerAssociationsActive = React.lazy(
  () => import('./OwnerAssociationsList/OwnerAssociationsActive/OwnerAssociationsActive')
);

const OwnerAssociations: React.FC = () => {
  const size = 30;

  const { data: activeRequests } = useGetOwnerAssociationRequestList({
    query: '',
    status: OwnerAssociationRequestStatusParam.APPROVED,
    size,
  });
  const { data: newRequests } = useGetOwnerAssociationRequestList({
    query: '',
    status: OwnerAssociationRequestStatusParam.PENDING,
    size,
  });

  const totalActive = useMemo(
    () => activeRequests?.pages[0].pageInfo.total,
    [activeRequests?.pages]
  );
  const totalNew = useMemo(
    () => newRequests?.pages[0].pageInfo.total,
    [newRequests?.pages]
  );

  return (
    <OwnerAssociationsAtomProvider>
      <Grid container flexDirection='column' alignItems='center'>
        <WithPermissionsProvider
          allowedPermissions={[Permission.OWNER_RELATION_MANAGE]}
          resourcePermissions={[]}
          Component={OwnerAssociationsHeader}
        />
        <Grid sx={{ width: '100%' }}>
          <OwnerAssociationsTabs
            size={size}
            newRequestsTabHint={totalNew}
            activeAssociationsTabHint={totalActive}
          />
        </Grid>
        <Routes>
          <Route path='' element={<Navigate to='new' />} />
          <Route path='active' element={<OwnerAssociationsActive size={size} />} />
          <Route path='new' element={<OwnerAssociationsNew size={size} />} />
          <Route path='history' element={<OwnerAssociationsResolved size={size} />} />
        </Routes>
      </Grid>
    </OwnerAssociationsAtomProvider>
  );
};

export default OwnerAssociations;
