import React from 'react';
import { useAppParams } from 'lib/hooks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { Grid } from '@mui/material';
import { fetchPolicyDetails, fetchPolicySchema } from 'redux/thunks';
import { AppLoadingPage } from 'components/shared';
import {
  getPolicyDetails,
  getPolicyDetailsFetchingStatuses,
  getPolicySchema,
  getPolicySchemaFetchingStatuses,
} from 'redux/selectors';
import PolicyForm from './PolicyForm/PolicyForm';

const PolicyDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const { policyId } = useAppParams();

  const policyDet = useAppSelector(state => getPolicyDetails(state, policyId));
  const schema = useAppSelector(getPolicySchema);

  const { isLoading: isDetailsFetching } = useAppSelector(
    getPolicyDetailsFetchingStatuses
  );
  const { isLoading: isSchemaFetching } = useAppSelector(getPolicySchemaFetchingStatuses);

  React.useEffect(() => {
    dispatch(fetchPolicySchema());
    if (policyId) {
      dispatch(fetchPolicyDetails({ policyId }));
    }
  }, [fetchPolicyDetails, policyId]);

  return (
    <Grid container>
      {isDetailsFetching || isSchemaFetching ? (
        <AppLoadingPage />
      ) : (
        <PolicyForm
          schema={schema}
          policyId={policyDet?.id}
          name={policyDet?.name || ''}
          policy={policyDet?.policy || ''}
        />
      )}
    </Grid>
  );
};

export default PolicyDetails;
