import { createSelector } from '@reduxjs/toolkit';
import type { MetaDataState, RootState } from 'redux/interfaces';
import type { MetadataFieldValue } from 'generated-sources';
import * as actions from 'redux/actions';
import { emptyArr } from 'lib/constants';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';

const metaDataState = ({ metaData }: RootState): MetaDataState => metaData;

// Details
export const getDataEntityMetadataCreatingStatuses = createStatusesSelector(
  actions.createDataEntityMetadataAction
);

const getDataEntityMetaDataState = (dataEntityId: number) =>
  createSelector(metaDataState, metadata => metadata.dataEntityMetadata[dataEntityId]);

export const getDataEntityPredefinedMetadataList = (dataEntityId: number) =>
  createSelector(getDataEntityMetaDataState(dataEntityId), metadataState => {
    if (!metadataState) return emptyArr;

    return metadataState.allIds?.reduce<MetadataFieldValue[]>((metadataList, id) => {
      if (metadataState.byId[id].field.origin === 'EXTERNAL') {
        metadataList.push(metadataState.byId[id]);
      }
      return metadataList;
    }, []);
  });

export const getDataEntityCustomMetadataList = (dataEntityId: number) =>
  createSelector(getDataEntityMetaDataState(dataEntityId), metadataState => {
    if (!metadataState) return emptyArr;

    return metadataState.allIds?.reduce<MetadataFieldValue[]>((metadataList, id) => {
      if (metadataState.byId[id].field.origin === 'INTERNAL') {
        metadataList.push(metadataState.byId[id]);
      }
      return metadataList;
    }, []);
  });
