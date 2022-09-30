import {
  Configuration,
  DataEntityApi,
  DataEntityApiCreateDataEntityMetadataFieldValueRequest,
  DataEntityApiDeleteDataEntityMetadataFieldValueRequest,
  DataEntityApiUpsertDataEntityMetadataFieldValueRequest,
  MetadataApi,
  MetadataApiGetMetadataFieldListRequest,
  MetadataField,
  MetadataFieldValue,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { createAsyncThunk } from '@reduxjs/toolkit';

const apiClientConf = new Configuration(BASE_PARAMS);
const dataEntityApi = new DataEntityApi(apiClientConf);
const metadataApi = new MetadataApi(apiClientConf);

export const createDataEntityCustomMetadata = createAsyncThunk<
  { dataEntityId: number; metadataList: Array<MetadataFieldValue> },
  DataEntityApiCreateDataEntityMetadataFieldValueRequest
>(actions.createDataEntityMetadataAction, async ({ dataEntityId, metadataObject }) => {
  const { items } = await dataEntityApi.createDataEntityMetadataFieldValue({
    dataEntityId,
    metadataObject,
  });
  return { dataEntityId, metadataList: items };
});

export const updateDataEntityCustomMetadata = createAsyncThunk<
  {
    dataEntityId: number;
    metadataFieldId: number;
    metadata: MetadataFieldValue;
  },
  DataEntityApiUpsertDataEntityMetadataFieldValueRequest
>(
  actions.updateDataEntityMetadataAction,
  async (params: DataEntityApiUpsertDataEntityMetadataFieldValueRequest) => {
    const metadata = await dataEntityApi.upsertDataEntityMetadataFieldValue(params);
    return {
      dataEntityId: params.dataEntityId,
      metadataFieldId: params.metadataFieldId,
      metadata,
    };
  }
);

export const deleteDataEntityCustomMetadata = createAsyncThunk<
  { dataEntityId: number; metadataFieldId: number },
  DataEntityApiDeleteDataEntityMetadataFieldValueRequest
>(actions.deleteDataEntityMetadataAction, async ({ dataEntityId, metadataFieldId }) => {
  await dataEntityApi.deleteDataEntityMetadataFieldValue({
    dataEntityId,
    metadataFieldId,
  });
  return { dataEntityId, metadataFieldId };
});

export const searchMetadata = createAsyncThunk<
  { metadataFields: Array<MetadataField> },
  MetadataApiGetMetadataFieldListRequest
>(actions.searchMetadataAction, async ({ query }) => {
  const { items } = await metadataApi.getMetadataFieldList({ query });
  return { metadataFields: items };
});
