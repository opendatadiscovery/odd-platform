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
  | 'associations';

export type OwnerAssociationRequestsViewType = 'New' | 'Resolved';

export type CRUDType = 'created' | 'updated' | 'deleted';
