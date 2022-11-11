import React from 'react';
import { useAppParams } from 'lib/hooks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { Grid } from '@mui/material';
import { fetchPolicyDetails, fetchPolicySchema } from 'redux/thunks';
import { AppLoadingPage, AppErrorPage } from 'components/shared';
import {
  getPolicyDetails,
  getPolicyDetailsFetchingError,
  getPolicyDetailsFetchingStatuses,
  getPolicySchema,
  getPolicySchemaFetchingError,
  getPolicySchemaFetchingStatuses,
} from 'redux/selectors';
import PolicyForm from './PolicyForm/PolicyForm';

const PolicyDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const { policyId } = useAppParams();

  const policyDet = useAppSelector(state => getPolicyDetails(state, policyId));
  const schema = useAppSelector(getPolicySchema);

  const { isLoading: isDetailsFetching, isNotLoaded: isDetailsNotFetched } =
    useAppSelector(getPolicyDetailsFetchingStatuses);
  const { isLoading: isSchemaFetching, isNotLoaded: isSchemaNotFetched } = useAppSelector(
    getPolicySchemaFetchingStatuses
  );
  const policyDetailsFetchingError = useAppSelector(getPolicyDetailsFetchingError);
  const policySchemaFetchingError = useAppSelector(getPolicySchemaFetchingError);

  const showLoadingPage = React.useMemo(
    () => isDetailsFetching || isSchemaFetching,
    [isDetailsFetching, isSchemaFetching]
  );

  const showPolicyForm = React.useMemo(
    () =>
      !(isDetailsNotFetched || isSchemaNotFetched) &&
      !(isDetailsFetching || isSchemaFetching),
    [isDetailsFetching, isSchemaFetching, isDetailsNotFetched, isSchemaNotFetched]
  );

  React.useEffect(() => {
    dispatch(fetchPolicySchema());
    if (policyId) {
      dispatch(fetchPolicyDetails({ policyId }));
    }
  }, [fetchPolicyDetails, policyId]);

  return (
    <Grid container>
      {showLoadingPage ? <AppLoadingPage /> : null}
      {showPolicyForm ? (
        <PolicyForm
          schema={schema}
          policyId={policyDet?.id}
          name={policyDet?.name || ''}
          policy={policyDet?.policy || ''}
        />
      ) : null}
      <AppErrorPage
        isNotContentLoaded={isDetailsNotFetched || isSchemaNotFetched}
        error={policyDetailsFetchingError || policySchemaFetchingError}
      />
    </Grid>
  );
};

export default PolicyDetails;
