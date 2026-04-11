import { createSelector } from '@reduxjs/toolkit';
import {
  createErrorSelector,
  createStatusesSelector,
} from 'redux/selectors/loader-selectors';
import type { CurrentPageInfo, PoliciesState, RootState } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { policyAdapter, policyDetailsAdapter } from 'redux/slices/policy.slice';

export const policiesState = ({ policies }: RootState): PoliciesState => policies;

export const getPoliciesFetchingStatuses = createStatusesSelector(
  actions.fetchPolicyListActType
);
export const getPolicyCreatingStatuses = createStatusesSelector(
  actions.createPolicyActType
);
export const getPolicyUpdatingStatuses = createStatusesSelector(
  actions.updatePolicyActType
);
export const getPolicyDeletingStatuses = createStatusesSelector(
  actions.deletePolicyActType
);

export const getPolicyDetailsFetchingStatuses = createStatusesSelector(
  actions.fetchPolicyDetailsActType
);
export const getPolicyDetailsFetchingError = createErrorSelector(
  actions.fetchPolicyDetailsActType
);

export const { selectAll: getPoliciesList } = policyAdapter.getSelectors<RootState>(
  state => state.policies.policies
);

export const getPoliciesListPageInfo = createSelector(
  policiesState,
  (policyState): CurrentPageInfo => policyState.policies.pageInfo
);

export const { selectById: getPolicyDetails } =
  policyDetailsAdapter.getSelectors<RootState>(state => state.policies.policyDetails);

export const getPolicySchema = createSelector(
  policiesState,
  policyState => policyState.policySchema
);

export const getPolicySchemaFetchingStatuses = createStatusesSelector(
  actions.fetchPolicySchemaActType
);
export const getPolicySchemaFetchingError = createErrorSelector(
  actions.fetchPolicySchemaActType
);
