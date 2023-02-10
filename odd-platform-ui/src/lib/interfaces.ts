// router view types
export type AlertViewType = 'all' | 'my' | 'dependents';
export type TermsViewType = 'overview' | 'linked-items';
export type TestReportViewType = 'overview' | 'history';
export type ManagementViewType =
  | ':viewType'
  | 'namespaces'
  | 'datasources'
  | 'collectors'
  | 'owners'
  | 'tags'
  | 'labels'
  | 'associations'
  | 'roles'
  | 'policies';
export type OwnerAssociationRequestsViewType = ':viewType' | 'New' | 'Resolved';

export type EventType = 'created' | 'added' | 'assigned' | 'updated' | 'deleted';

export type DatasetFieldKey = 'primary' | 'sort' | 'nullable';
