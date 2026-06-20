import type { RequiredField, SerializeDateToNumber } from 'redux/interfaces';
import type { AlertApiGetAlertsListRequest } from 'generated-sources';
import { AlertStatus, AlertViewType } from 'generated-sources';
import { alertsListSize } from 'redux/thunks';

// Mirrors components/shared/elements/Activity/common.ts for the alerts surface. The page is a
// single query-param-tab view (no per-tab sub-routes) whose state lives entirely in the URL, parsed
// by useQueryParams<AlertsQuery>. `type` (the All / My Objects / Downstream / Upstream tab) is the
// only always-present discriminator, hence Required.
export type AlertsQuery = RequiredField<
  SerializeDateToNumber<AlertApiGetAlertsListRequest>,
  'type'
>;

export type AlertsSingleFilterNames = keyof Pick<
  AlertsQuery,
  'datasourceId' | 'namespaceId' | 'status'
>;
export type AlertsMultipleFilterNames = keyof Pick<AlertsQuery, 'tagIds' | 'ownerIds'>;

// The global Alerts view opens on OPEN alerts across all time: status defaults to OPEN and the period
// is intentionally left unset (begin/endDate omitted) so the unfiltered view is "all open alerts",
// not "open alerts in the last N days". A user widens to resolved history by changing the Status
// filter or picking a Period.
export const defaultAlertsQuery: AlertsQuery = {
  // `page` is required by the generated request type; the list component always overrides it per
  // fetch (1 on a query change, +1 on scroll), so the default is just a placeholder.
  page: 1,
  size: alertsListSize,
  type: AlertViewType.ALL,
  status: AlertStatus.OPEN,
};
