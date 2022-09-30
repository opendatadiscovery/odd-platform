import { createActionType } from 'redux/lib/helpers';

export const dataEntityLineageActionTypePrefix = 'dataEntityLineage';

export const fetchDataEntityUpstreamLineageActionType = createActionType(
  dataEntityLineageActionTypePrefix,
  'fetchDataEntityUpstreamLineage'
);

export const fetchDataEntityDownstreamLineageActionType = createActionType(
  dataEntityLineageActionTypePrefix,
  'fetchDataEntityDownstreamLineage'
);
