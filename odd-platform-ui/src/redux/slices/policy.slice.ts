import { PoliciesState } from 'redux/interfaces/state';
import { Policy, PolicyDetails } from 'generated-sources';
import { policyActTypePrefix } from 'redux/actions';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';

export const policyAdapter = createEntityAdapter<Policy>({
  selectId: policy => policy.id,
});

export const policyDetailsAdapter = createEntityAdapter<PolicyDetails>({
  selectId: policyDetails => policyDetails.id,
});

export const initialState: PoliciesState = {
  policies: {
    pageInfo: { total: 0, page: 0, hasNext: true },
    ...policyAdapter.getInitialState(),
  },
  policyDetails: { ...policyDetailsAdapter.getInitialState() },
};

export const policiesSlice = createSlice({
  name: policyActTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(thunks.fetchPolicyList.fulfilled, (state, { payload }) => {
      const { items, pageInfo } = payload;

      policyAdapter.setMany(state.policies, items);
      state.policies.pageInfo = pageInfo;
    });
    builder.addCase(thunks.createPolicy.fulfilled, (state, { payload }) => {
      policyAdapter.addOne(state.policies, payload);
    });
    builder.addCase(thunks.updatePolicy.fulfilled, (state, { payload }) => {
      policyAdapter.upsertOne(state.policies, payload);
    });
    builder.addCase(thunks.deletePolicy.fulfilled, (state, { payload }) => {
      policyAdapter.removeOne(state.policies, payload);
    });
    builder.addCase(thunks.fetchPolicyDetails.fulfilled, (state, { payload }) => {
      policyDetailsAdapter.setOne(state.policyDetails, payload);
    });
  },
});

export default policiesSlice.reducer;
