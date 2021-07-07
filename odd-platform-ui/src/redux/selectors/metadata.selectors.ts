import { createSelector } from 'reselect';
import { RootState, MetaDataState } from 'redux/interfaces';
import { MetadataFieldValue } from 'generated-sources';
import { createFetchingSelector } from './loader-selectors';
import { getDataEntityId } from './dataentity.selectors';

const metaDataState = ({ metaData }: RootState): MetaDataState => metaData;

// Details
const getDataEntityMetadataCreateFetchingStatus = createFetchingSelector(
  'POST_DATA_ENTITY_METADATA'
);
const getDataEntityMetadataUpdateFetchingStatus = createFetchingSelector(
  'PUT_DATA_ENTITY_METADATA'
);

const getDataEntityMetadataDeleteFetchingStatus = createFetchingSelector(
  'DELETE_DATA_ENTITY_METADATA'
);

export const getDataEntityMetadataCreateFetching = createSelector(
  getDataEntityMetadataCreateFetchingStatus,
  status => status === 'fetching'
);

export const getDataEntityMetadataUpdateFetching = createSelector(
  getDataEntityMetadataUpdateFetchingStatus,
  status => status === 'fetching'
);

export const getDataEntityMetadataDeleteFetching = createSelector(
  getDataEntityMetadataDeleteFetchingStatus,
  status => status === 'fetching'
);

const getDataEntityMetaDataState = createSelector(
  metaDataState,
  getDataEntityId,
  (metadata, dataEntityId) => metadata.dataEntityMetadata[dataEntityId]
);

export const getDataEntityPredefinedMetadataList = createSelector(
  getDataEntityMetaDataState,
  metadataState => {
    if (!metadataState) {
      return [];
    }
    return metadataState.allIds?.reduce<MetadataFieldValue[]>(
      (matadataList, id) => {
        if (metadataState.byId[id].field.origin === 'EXTERNAL') {
          matadataList.push(metadataState.byId[id]);
        }
        return matadataList;
      },
      []
    );
  }
);

export const getDataEntityCustomMetadataList = createSelector(
  getDataEntityMetaDataState,
  metadataState => {
    if (!metadataState) {
      return [];
    }
    return metadataState.allIds?.reduce<MetadataFieldValue[]>(
      (matadataList, id) => {
        if (metadataState.byId[id].field.origin === 'INTERNAL') {
          matadataList.push(metadataState.byId[id]);
        }
        return matadataList;
      },
      []
    );
  }
);

const getMetaDataListState = createSelector(
  metaDataState,
  metadata => metadata.metadataFields
);

export const getMetadataFieldList = createSelector(
  getMetaDataListState,
  metadataState => metadataState || []
);
