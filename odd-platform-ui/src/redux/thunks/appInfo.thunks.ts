import type { Feature } from 'generated-sources';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { featureApi } from 'lib/api';

export const fetchActiveFeatures = handleResponseAsyncThunk<Feature[]>(
  actions.fetchActiveFeaturesActionType,
  async () => {
    const { items } = await featureApi.getActiveFeatures();
    return items;
  },
  {}
);
