import {
  Configuration,
  DataEntityApi,
  type DataEntityApiCreateDataEntityMetadataFieldValueRequest,
  type DataEntityApiDeleteDataEntityMetadataFieldValueRequest,
  type DataEntityApiUpsertDataEntityMetadataFieldValueRequest,
  MetadataApi,
  type MetadataApiGetMetadataFieldListRequest,
  type MetadataField,
  type MetadataFieldValue,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const dataEntityApi = new DataEntityApi(apiClientConf);
const metadataApi = new MetadataApi(apiClientConf);

export const createDataEntityCustomMetadata = handleResponseAsyncThunk<
  { dataEntityId: number; metadataList: Array<MetadataFieldValue> },
  DataEntityApiCreateDataEntityMetadataFieldValueRequest
>(
  actions.createDataEntityMetadataAction,
  async ({ dataEntityId, metadataObject }) => {
    const { items } = await dataEntityApi.createDataEntityMetadataFieldValue({
      dataEntityId,
      metadataObject,
    });
    return { dataEntityId, metadataList: items };
  },
  {
    setSuccessOptions: ({ metadataObject }) => ({
      id: `Metadata-creating-${metadataObject[0].name}`,
      message: `Metadata ${metadataObject[0].name} successfully created.`,
    }),
  }
);

export const updateDataEntityCustomMetadata = handleResponseAsyncThunk<
  {
    dataEntityId: number;
    metadataFieldId: number;
    metadata: MetadataFieldValue;
  },
  DataEntityApiUpsertDataEntityMetadataFieldValueRequest
>(
  actions.updateDataEntityMetadataAction,
  async params => {
    const metadata = await dataEntityApi.upsertDataEntityMetadataFieldValue(params);
    return {
      dataEntityId: params.dataEntityId,
      metadataFieldId: params.metadataFieldId,
      metadata,
    };
  },
  {
    setSuccessOptions: ({ metadataFieldId }) => ({
      id: `Metadata-updating-${metadataFieldId}`,
      message: `Metadata successfully updated.`,
    }),
  }
);

export const deleteDataEntityCustomMetadata = handleResponseAsyncThunk<
  { dataEntityId: number; metadataFieldId: number },
  DataEntityApiDeleteDataEntityMetadataFieldValueRequest
>(
  actions.deleteDataEntityMetadataAction,
  async ({ dataEntityId, metadataFieldId }) => {
    await dataEntityApi.deleteDataEntityMetadataFieldValue({
      dataEntityId,
      metadataFieldId,
    });
    return { dataEntityId, metadataFieldId };
  },
  {
    setSuccessOptions: ({ metadataFieldId }) => ({
      id: `Metadata-deleting-${metadataFieldId}`,
      message: `Metadata successfully deleted.`,
    }),
  }
);

export const searchMetadata = handleResponseAsyncThunk<
  { metadataFields: Array<MetadataField> },
  MetadataApiGetMetadataFieldListRequest
>(
  actions.searchMetadataAction,
  async ({ query }) => {
    const { items } = await metadataApi.getMetadataFieldList({ query });
    return { metadataFields: items };
  },
  {}
);
