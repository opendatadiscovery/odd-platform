import type { EntityState } from '@reduxjs/toolkit';
import type {
  ActivityCountInfo,
  AlertTotals,
  AssociatedOwner,
  Collector,
  DataEntity as GeneratedDataEntity,
  DataEntityClass,
  DataEntityRef,
  DataEntityRun,
  DataEntitySearchHighlight,
  DataEntityType,
  DataQualityTest,
  DataSetSLAReport,
  DataSetTestReport,
  DataSetVersion,
  DataSource,
  Feature,
  Label,
  MetadataField,
  MetadataFieldValue,
  Namespace,
  Owner,
  OwnerAssociationRequest,
  Ownership,
  Permission,
  PermissionResourceType,
  Policy,
  PolicyDetails,
  Role,
  Tag,
  Term,
  TermDetails,
  TermRef,
  ActivityType,
  EnumValueList,
  DataSetField,
} from 'generated-sources';
import type { DataSetQualityTestsStatusCount } from './dataQualityTest';
import type { CurrentPageInfo, Dictionary, PageInfo, PaginatedResponse } from './common';
import type { DataSetStructureTypesCount } from './datasetStructure';
import type { DataEntityLineageById } from './dataentityLineage';
import type { DataEntity, DataEntityDetailsState } from './dataentities';
import type { Alert, AlertsConfig } from './alerts';
import type { Activity } from './activities';
import type {
  FacetOptionsByName,
  SearchFacetsByName,
  SearchTotalsByName,
} from './dataEntitySearch';
import type { TermSearchFacetOptionsByName, TermSearchFacetsByName } from './termSearch';
import type { Message, MessagesByDate } from './dataCollaboration';

export interface DataSourcesState extends EntityState<DataSource> {
  pageInfo: CurrentPageInfo;
}

export interface CollectorsState extends EntityState<Collector> {
  pageInfo: CurrentPageInfo;
}

export interface TagsState extends EntityState<Tag> {
  pageInfo: CurrentPageInfo;
}

export interface LabelsState extends EntityState<Label> {
  pageInfo: CurrentPageInfo;
}

export interface NamespacesState extends EntityState<Namespace> {
  pageInfo?: CurrentPageInfo;
}

export interface DataEntityGroupLinkedListState {
  linkedItemsIdsByDataEntityGroupId: { [dataEntityGroupId: string]: number[] };
  pageInfo?: CurrentPageInfo;
}

export interface MetaDataState {
  dataEntityMetadata: {
    [dataEntityId: string]: {
      byId: { [metadataFiledId: string]: MetadataFieldValue };
      allIds: number[];
    };
  };
  metadataFields: MetadataField[];
}

export interface DatasetStructureState {
  fieldById: { [fieldId: number]: DataSetField };
  allFieldIdsByVersion: {
    [versionId: number]: { [parentFieldId: number]: DataSetField['id'][] };
  };
  statsByVersionId: {
    [versionId: number]: { typeStats: DataSetStructureTypesCount };
  };
  latestVersionByDataset: { [datasetId: string]: DataSetVersion['id'] };
  fieldEnumsByFieldId: { [fieldId: number]: EnumValueList };
}

export interface DataQualityTestState {
  qualityTestsById: { [qualityTestId: string]: DataQualityTest };
  allSuiteNamesByDatasetId: {
    [datasetId: string]: { [suiteName: string]: DataQualityTest['id'][] };
  };
  qualityTestRunsPageInfo: CurrentPageInfo;
  datasetTestReportByEntityId: { [dataEntityId: string]: DataSetTestReport };
  datasetSLAReportByEntityId: { [dataEntityId: string]: DataSetSLAReport };
  testReportBySuiteName: { [suiteName: string]: DataSetQualityTestsStatusCount };
}

export interface DataEntityRunState extends EntityState<DataEntityRun> {
  pageInfo: CurrentPageInfo;
}

export interface DataEntityLineageState {
  [dataEntityId: string]: DataEntityLineageById;
}

export interface OwnersState {
  byId: { [ownerId: number]: Owner };
  allIds: number[];
  pageInfo: CurrentPageInfo;
  ownershipDataEntity: {
    [dataEntityId: string]: {
      byId: { [ownershipId: string]: Ownership };
      allIds: number[];
    };
  };
  ownershipTermDetails: {
    [termId: string]: {
      byId: { [ownershipId: string]: Ownership };
      allIds: number[];
    };
  };
}

export interface DataCollaborationState {
  messages: { messagesByDate: MessagesByDate; pageInfo: PageInfo<string> };
  relatedMessages: { messages: Message[]; pageInfo: PageInfo<string> };
}

export interface DataEntitiesState {
  byId: { [dataEntityId: string]: GeneratedDataEntity & DataEntityDetailsState };
  allIds: number[];
  my: DataEntityRef[];
  myUpstream: DataEntityRef[];
  myDownstream: DataEntityRef[];
  popular: DataEntityRef[];
  classesAndTypesDict: {
    entityTypes: Dictionary<DataEntityType>;
    entityClasses: Dictionary<DataEntityClass>;
  };
}

export interface DataEntitySearchState {
  searchId: string;
  query: string;
  myObjects: boolean;
  facets: FacetOptionsByName;
  isFacetsStateSynced: boolean;
  totals: SearchTotalsByName;
  results: { items: DataEntity[]; pageInfo: CurrentPageInfo };
  suggestions: DataEntityRef[];
  facetState: SearchFacetsByName;
  dataEntitySearchHighlightById: { [dataEntityId: number]: DataEntitySearchHighlight };
}

export interface AlertsState {
  alerts: PaginatedResponse<Alert[]> & { totals: AlertTotals };
  dataEntityAlerts: {
    [dataEntityId: number]: PaginatedResponse<Alert[]> & { alertCount: number };
  };
  configs: EntityState<AlertsConfig>;
}

export interface ProfileState {
  owner: AssociatedOwner;
  permissions: {
    [key in PermissionResourceType]: { [resourceId: number]: Permission[] };
  };
}

export interface OwnerAssociationState {
  newRequests: { pageInfo: CurrentPageInfo } & EntityState<OwnerAssociationRequest>;
  resolvedRequests: { pageInfo: CurrentPageInfo } & EntityState<OwnerAssociationRequest>;
}

export interface AppInfoState {
  activeFeatures: Feature[];
}

export interface TermsState {
  byId: { [termId: string]: TermDetails };
  allIds: Term['id'][];
  pageInfo?: CurrentPageInfo;
}

export interface TermSearchState {
  termSearchId: string;
  query: string;
  facets: TermSearchFacetOptionsByName;
  isFacetsStateSynced: boolean;
  results: { items: Term[]; pageInfo: CurrentPageInfo };
  suggestions: TermRef[];
  facetState: TermSearchFacetsByName;
}

export interface TermLinkedListState {
  linkedItemsIdsByTermId: { [termId: string]: number[] };
  pageInfo: CurrentPageInfo;
}

export interface ActivitiesState {
  activities: {
    activitiesByType: {
      [key in ActivityType]: {
        itemsByDate: { [date: string]: Activity[] };
        pageInfo: PageInfo<number>;
      };
    };
    counts: ActivityCountInfo;
  };
  dataEntityActivities: {
    [dataEntityId: number]: {
      itemsByDate: { [date: string]: Activity[] };
      pageInfo: PageInfo<number>;
    };
  };
}

export interface RolesState extends EntityState<Role> {
  pageInfo: CurrentPageInfo;
}

export interface PoliciesState {
  policies: { pageInfo: CurrentPageInfo } & EntityState<Policy>;
  policyDetails: EntityState<PolicyDetails>;
  policySchema: Record<string, unknown>;
}
