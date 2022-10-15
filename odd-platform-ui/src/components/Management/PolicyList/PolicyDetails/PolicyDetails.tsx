import React from 'react';
import { useAppParams, usePermissions } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';

const PolicyDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAdmin } = usePermissions({});
  const { policyId } = useAppParams();

  return <div>{policyId ? `update policy id ${policyId}` : 'create policy'}</div>;
};

export default PolicyDetails;
