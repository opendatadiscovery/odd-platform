import type { SerializeDateToNumber } from 'redux/interfaces';
import type { DataEntityApiGetDataEntityAlertsListRequest } from 'generated-sources';
import { alertsListSize } from 'redux/thunks';

// Per-entity (Data Entity > Alerts tab) query. Mirrors the per-entity Activity filter pattern: the
// state lives on the URL and is read with useQueryParams. dataEntityId is supplied by the route, not
// the query, so it is omitted here.
export type DataEntityAlertsQuery = Omit<
  SerializeDateToNumber<DataEntityApiGetDataEntityAlertsListRequest>,
  'dataEntityId'
>;

// Unlike the global Alerts view, the per-entity tab defaults to NO status filter (all statuses,
// all time) so an entity's resolved alert history stays visible by default; the user narrows with
// the Status / Period filters.
export const defaultDataEntityAlertsQuery: DataEntityAlertsQuery = {
  page: 1,
  size: alertsListSize,
};
