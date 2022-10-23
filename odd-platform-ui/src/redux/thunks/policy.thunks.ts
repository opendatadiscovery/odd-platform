import {
  Configuration,
  Policy,
  PolicyApi,
  PolicyApiCreatePolicyRequest,
  PolicyApiDeletePolicyRequest,
  PolicyApiGetPolicyDetailsRequest,
  PolicyApiGetPolicyListRequest,
  PolicyApiUpdatePolicyRequest,
  PolicyDetails,
} from 'generated-sources';
import { CurrentPageInfo } from 'redux/interfaces/common';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const policyApi = new PolicyApi(apiClientConf);

export const fetchPolicyList = createAsyncThunk<
  { items: Array<Policy>; pageInfo: CurrentPageInfo },
  PolicyApiGetPolicyListRequest
>(actions.fetchPolicyListActType, async ({ page, size, query }) => {
  const { items, pageInfo } = await policyApi.getPolicyList({ page, size, query });

  return { items, pageInfo: { ...pageInfo, page } };
});

export const createPolicy = createAsyncThunk<PolicyDetails, PolicyApiCreatePolicyRequest>(
  actions.createPolicyActType,
  async params => policyApi.createPolicy(params)
);

export const updatePolicy = createAsyncThunk<PolicyDetails, PolicyApiUpdatePolicyRequest>(
  actions.updatePolicyActType,
  async ({ policyId, policyFormData }) =>
    policyApi.updatePolicy({ policyId, policyFormData })
);

export const deletePolicy = createAsyncThunk<number, PolicyApiDeletePolicyRequest>(
  actions.deletePolicyActType,
  async ({ policyId }) => {
    await policyApi.deletePolicy({ policyId });

    return policyId;
  }
);

export const fetchPolicyDetails = createAsyncThunk<
  PolicyDetails,
  PolicyApiGetPolicyDetailsRequest
>(actions.fetchPolicyDetailsActType, async ({ policyId }) =>
  policyApi.getPolicyDetails({ policyId })
);

export const fetchPolicySchema = createAsyncThunk<Record<string, unknown>, void>(
  actions.fetchPolicySchemaActType,
  async () => {
    const schema = await policyApi.getPolicySchema();
    try {
      return JSON.parse(schema);
    } catch (e) {
      throw new Error(e?.toString());
    }
  }
);
