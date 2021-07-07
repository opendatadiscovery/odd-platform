import { createAsyncAction } from 'typesafe-actions';
import { DataEntityLineage } from 'generated-sources';
import { PartialDataEntityUpdateParams } from 'redux/interfaces/dataentities';

export const fetchDataEntityLineageAction = createAsyncAction(
  'GET_DATA_ENTITY_LINEAGE__REQUEST',
  'GET_DATA_ENTITY_LINEAGE__SUCCESS',
  'GET_DATA_ENTITY_LINEAGE__FAILURE'
)<
  undefined,
  PartialDataEntityUpdateParams<DataEntityLineage>,
  undefined
>();
