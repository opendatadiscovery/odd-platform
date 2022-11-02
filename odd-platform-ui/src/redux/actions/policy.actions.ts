import { createActionType } from 'redux/lib/helpers';

export const policyActTypePrefix = 'policy';

export const fetchPolicyListActType = createActionType(
  policyActTypePrefix,
  'fetchPolicies'
);
export const createPolicyActType = createActionType(policyActTypePrefix, 'createPolicy');
export const updatePolicyActType = createActionType(policyActTypePrefix, 'updatePolicy');
export const deletePolicyActType = createActionType(policyActTypePrefix, 'deletePolicy');
export const fetchPolicyDetailsActType = createActionType(
  policyActTypePrefix,
  'fetchPolicyDetails'
);
export const fetchPolicySchemaActType = createActionType(
  policyActTypePrefix,
  'fetchPolicySchema'
);
