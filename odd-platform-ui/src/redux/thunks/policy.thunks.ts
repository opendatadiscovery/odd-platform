import {
  Configuration,
  ErrorApi,
  type Policy,
  PolicyApi,
  type PolicyApiCreatePolicyRequest,
  type PolicyApiDeletePolicyRequest,
  type PolicyApiGetPolicyDetailsRequest,
  type PolicyApiGetPolicyListRequest,
  type PolicyApiUpdatePolicyRequest,
  type PolicyDetails,
} from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const policyApi = new PolicyApi(apiClientConf);

// TODO handle
export const fetchPolicyList = createAsyncThunk<
  { items: Array<Policy>; pageInfo: CurrentPageInfo },
  PolicyApiGetPolicyListRequest
>(actions.fetchPolicyListActType, async ({ page, size, query }) => {
  const { items, pageInfo } = await policyApi.getPolicyList({ page, size, query });

  return { items, pageInfo: { ...pageInfo, page } };
});

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

// TODO handle
export const fetchPolicyDetails = createAsyncThunk<
  PolicyDetails,
  PolicyApiGetPolicyDetailsRequest
>(actions.fetchPolicyDetailsActType, async ({ policyId }) =>
  policyApi.getPolicyDetails({ policyId })
);

export const fetchPolicySchema = handleResponseAsyncThunk<Record<string, unknown>, void>(
  actions.fetchPolicySchemaActType,
  async () => {
    const schema = await policyApi.getPolicySchema();
    try {
      return JSON.parse(schema);
    } catch (e) {
      throw new Error(e?.toString());
    }
  },
  {}
);
