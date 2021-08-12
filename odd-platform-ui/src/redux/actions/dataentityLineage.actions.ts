import { createAsyncAction } from 'typesafe-actions';
import { DataEntityLineage } from 'generated-sources';
import { PartialEntityUpdateParams } from 'redux/interfaces';

export const fetchDataEntityLineageAction = createAsyncAction(
  'GET_DATA_ENTITY_LINEAGE__REQUEST',
  'GET_DATA_ENTITY_LINEAGE__SUCCESS',
  'GET_DATA_ENTITY_LINEAGE__FAILURE'
)<undefined, PartialEntityUpdateParams<DataEntityLineage>, undefined>();
