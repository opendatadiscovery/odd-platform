import {
  DataEntityApi,
  MetadataApi,
  Configuration,
  MetadataFieldValue,
  MetadataFieldValueList,
  MetadataFieldList,
  MetadataField,
  DataEntityApiCreateDataEntityMetadataFieldValueRequest,
  DataEntityApiUpsertDataEntityMetadataFieldValueRequest,
  DataEntityApiDeleteDataEntityMetadataFieldValueRequest,
  MetadataApiGetMetadataFieldListRequest,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { PartialEntityUpdateParams } from 'redux/interfaces';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new DataEntityApi(apiClientConf);
const metadataClient = new MetadataApi(apiClientConf);

export const createDataEntityCustomMetadata = createThunk<
  DataEntityApiCreateDataEntityMetadataFieldValueRequest,
  MetadataFieldValueList,
  PartialEntityUpdateParams<MetadataFieldValue[]>
>(
  (params: DataEntityApiCreateDataEntityMetadataFieldValueRequest) =>
    apiClient.createDataEntityMetadataFieldValue(params),
  actions.createDataEntityMetadataAction,
  (
    result: MetadataFieldValueList,
    request: DataEntityApiCreateDataEntityMetadataFieldValueRequest
  ) => ({
    entityId: request.dataEntityId,
    value: result.items,
  })
);

export const updateDataEntityCustomMetadata = createThunk<
  DataEntityApiUpsertDataEntityMetadataFieldValueRequest,
  MetadataFieldValue,
  PartialEntityUpdateParams<MetadataFieldValue>
>(
  (params: DataEntityApiUpsertDataEntityMetadataFieldValueRequest) =>
    apiClient.upsertDataEntityMetadataFieldValue(params),
  actions.updateDataEntityMetadataAction,
  (
    result: MetadataFieldValue,
    request: DataEntityApiUpsertDataEntityMetadataFieldValueRequest
  ) => ({
    entityId: request.dataEntityId,
    value: result,
  })
);

export const deleteDataEntityCustomMetadata = createThunk<
  DataEntityApiDeleteDataEntityMetadataFieldValueRequest,
  void,
  PartialEntityUpdateParams<number>
>(
  (params: DataEntityApiDeleteDataEntityMetadataFieldValueRequest) =>
    apiClient.deleteDataEntityMetadataFieldValue(params),
  actions.deleteDataEntityMetadataAction,
  (
    _,
    request: DataEntityApiDeleteDataEntityMetadataFieldValueRequest
  ) => ({
    entityId: request.dataEntityId,
    value: request.metadataFieldId,
  })
);

export const searchMetadata = createThunk<
  MetadataApiGetMetadataFieldListRequest,
  MetadataFieldList,
  MetadataField[]
>(
  (params: MetadataApiGetMetadataFieldListRequest) =>
    metadataClient.getMetadataFieldList(params),
  actions.searchMetadataAction,
  (result: MetadataFieldList) => result.items
);
