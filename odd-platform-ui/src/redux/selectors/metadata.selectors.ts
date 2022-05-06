import { createSelector } from '@reduxjs/toolkit';
import { RootState, MetaDataState } from 'redux/interfaces';
import { MetadataFieldValue } from 'generated-sources';
import * as actions from 'redux/actions';
import { createLegacyFetchingSelector } from './loader-selectors';
import { getDataEntityId } from './dataentity.selectors';

const metaDataState = ({ metaData }: RootState): MetaDataState => metaData;

// Details
const getDataEntityMetadataCreateFetchingStatus =
  createLegacyFetchingSelector(actions.createDataEntityMetadataAction);
const getDataEntityMetadataUpdateFetchingStatus =
  createLegacyFetchingSelector(actions.updateDataEntityMetadataAction);

const getDataEntityMetadataDeleteFetchingStatus =
  createLegacyFetchingSelector(actions.deleteDataEntityMetadataAction);

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
