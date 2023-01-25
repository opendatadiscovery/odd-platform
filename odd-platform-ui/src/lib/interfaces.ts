// router view types
export type AlertViewType = 'all' | 'my' | 'dependents';
export type TermsViewType = 'overview' | 'linked-items';
export type TestReportViewType = 'overview' | 'history';
export type ManagementViewType =
  | 'namespaces'
  | 'datasources'
  | 'collectors'
  | 'owners'
  | 'tags'
  | 'labels'
  | 'associations'
  | 'roles'
  | 'policies';

export type OwnerAssociationRequestsViewType = 'New' | 'Resolved';

export type EventType = 'created' | 'added' | 'assigned' | 'updated' | 'deleted';

export type DatasetFieldKey = 'primary' | 'sort' | 'nullable';
