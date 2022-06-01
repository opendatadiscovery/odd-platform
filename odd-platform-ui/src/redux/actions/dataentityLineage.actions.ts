import { createAsyncAction } from 'typesafe-actions';
import { PartialEntityUpdateParams } from 'redux/interfaces';
import { LineageStreamParams } from 'redux/interfaces/dataentityLineage';
import { createActionType } from 'lib/redux/helpers';

export const fetchDataEntityUpstreamLineageAction = createAsyncAction(
  'GET_DATA_ENTITY_UPSTREAM_LINEAGE__REQUEST',
  'GET_DATA_ENTITY_UPSTREAM_LINEAGE__SUCCESS',
  'GET_DATA_ENTITY_UPSTREAM_LINEAGE__FAILURE'
)<undefined, PartialEntityUpdateParams<LineageStreamParams>, undefined>();

export const fetchDataEntityDownstreamLineageAction = createAsyncAction(
  'GET_DATA_ENTITY_DOWNSTREAM_LINEAGE__REQUEST',
  'GET_DATA_ENTITY_DOWNSTREAM_LINEAGE__SUCCESS',
  'GET_DATA_ENTITY_DOWNSTREAM_LINEAGE__FAILURE'
)<undefined, PartialEntityUpdateParams<LineageStreamParams>, undefined>();

export const dataEntityLineageActionTypePrefix = 'dataEntityLineage';

export const fetchDataEntityUpstreamLineageActionType = createActionType(
  dataEntityLineageActionTypePrefix,
  'fetchDataEntityUpstreamLineage'
);

export const fetchDataEntityDownstreamLineageActionType = createActionType(
  dataEntityLineageActionTypePrefix,
  'fetchDataEntityDownstreamLineage'
);
