import type {
  Policy,
  PolicyApiCreatePolicyRequest,
  PolicyApiDeletePolicyRequest,
  PolicyApiGetPolicyDetailsRequest,
  PolicyApiGetPolicyListRequest,
  PolicyApiUpdatePolicyRequest,
  PolicyDetails,
} from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { policyApi } from 'lib/api';

export const fetchPolicyList = handleResponseAsyncThunk<
  { items: Array<Policy>; pageInfo: CurrentPageInfo },
  PolicyApiGetPolicyListRequest
>(
  actions.fetchPolicyListActType,
  async ({ page, size, query }) => {
    const { items, pageInfo } = await policyApi.getPolicyList({ page, size, query });

    return { items, pageInfo: { ...pageInfo, page } };
  },
  {}
);

export const createPolicy = handleResponseAsyncThunk<
  PolicyDetails,
  PolicyApiCreatePolicyRequest
>(
  actions.createPolicyActType,
  async ({ policyFormData }) => await policyApi.createPolicy({ policyFormData }),
  {
    setSuccessOptions: ({ policyFormData }) => ({
      id: `policy-creating-${policyFormData.name}`,
      message: `Policy ${policyFormData.name} successfully created.`,
    }),
  }
);

export const updatePolicy = handleResponseAsyncThunk<
  PolicyDetails,
  PolicyApiUpdatePolicyRequest
>(
  actions.updatePolicyActType,
  async ({ policyId, policyFormData }) =>
    await policyApi.updatePolicy({ policyId, policyFormData }),
  {
    setSuccessOptions: ({ policyFormData }) => ({
      id: `policy-updating-${policyFormData.name}`,
      message: `Policy ${policyFormData.name} successfully updated.`,
    }),
  }
);

export const deletePolicy = handleResponseAsyncThunk<
  number,
  PolicyApiDeletePolicyRequest
>(
  actions.deletePolicyActType,
  async ({ policyId }) => {
    await policyApi.deletePolicy({ policyId });

    return policyId;
  },
  {
    setSuccessOptions: ({ policyId }) => ({
      id: `policy-deleting-${policyId}`,
      message: `Policy successfully deleted.`,
    }),
  }
);

export const fetchPolicyDetails = handleResponseAsyncThunk<
  PolicyDetails,
  PolicyApiGetPolicyDetailsRequest
>(
  actions.fetchPolicyDetailsActType,
  async ({ policyId }) => policyApi.getPolicyDetails({ policyId }),
  { switchOffErrorMessage: true }
);

export const fetchPolicySchema = handleResponseAsyncThunk<Record<string, unknown>, void>(
  actions.fetchPolicySchemaActType,
  async () => {
    try {
      return (await policyApi.getPolicySchema()) as unknown as Record<string, unknown>;
    } catch (e) {
      throw new Error(e?.toString());
    }
  },
  { switchOffErrorMessage: true }
);
