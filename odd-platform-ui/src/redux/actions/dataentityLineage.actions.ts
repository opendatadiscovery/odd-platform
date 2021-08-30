import { createAsyncAction } from 'typesafe-actions';
import { DataEntityLineage } from 'generated-sources';
import { PartialEntityUpdateParams } from 'redux/interfaces';

export const fetchDataEntityUpstreamLineageAction = createAsyncAction(
  'GET_DATA_ENTITY_UPSTREAM_LINEAGE__REQUEST',
  'GET_DATA_ENTITY_UPSTREAM_LINEAGE__SUCCESS',
  'GET_DATA_ENTITY_UPSTREAM_LINEAGE__FAILURE'
)<
  undefined,
  PartialEntityUpdateParams<{
    dataEntityLineage: DataEntityLineage;
    rootNodeId?: number;
  }>,
  undefined
>();

export const fetchDataEntityDownstreamLineageAction = createAsyncAction(
  'GET_DATA_ENTITY_DOWNSTREAM_LINEAGE__REQUEST',
  'GET_DATA_ENTITY_DOWNSTREAM_LINEAGE__SUCCESS',
  'GET_DATA_ENTITY_DOWNSTREAM_LINEAGE__FAILURE'
)<
  undefined,
  PartialEntityUpdateParams<{
    dataEntityLineage: DataEntityLineage;
    rootNodeId?: number;
  }>,
  undefined
>();
