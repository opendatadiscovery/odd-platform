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

export interface NamespacesState extends EntityState<Namespace> {
  pageInfo?: CurrentPageInfo;
}

export interface DataEntityGroupLinkedListState {
  linkedItemsIdsByDataEntityGroupId: Record<string, number[]>;
  pageInfo?: CurrentPageInfo;
}

export interface MetaDataState {
  dataEntityMetadata: Record<
    string,
    {
      byId: Record<string, MetadataFieldValue>;
      allIds: number[];
    }
  >;
  metadataFields: MetadataField[];
}

export interface DatasetStructureState {
  fieldById: Record<number, DataSetField>;
  allFieldIdsByVersion: Record<number, Record<number, DataSetField['id'][]>>;
  statsByVersionId: Record<number, { typeStats: DataSetStructureTypesCount }>;
  latestVersionByDataset: Record<string, DataSetVersion['id']>;
  fieldEnumsByFieldId: Record<number, EnumValueList>;
}

export interface DataQualityTestState {
  qualityTestsById: Record<string, DataQualityTest>;
  allSuiteNamesByDatasetId: Record<string, Record<string, DataQualityTest['id'][]>>;
  qualityTestRunsPageInfo: CurrentPageInfo;
  datasetTestReportByEntityId: Record<string, DataSetTestReport>;
  datasetSLAReportByEntityId: Record<string, DataSetSLAReport>;
  testReportBySuiteName: Record<string, DataSetQualityTestsStatusCount>;
}

export interface DataEntityRunState extends EntityState<DataEntityRun> {
  pageInfo: CurrentPageInfo;
}

export type DataEntityLineageState = Record<string, DataEntityLineageById>;

export interface OwnersState {
  byId: Record<number, Owner>;
  allIds: number[];
  pageInfo: CurrentPageInfo;
  ownershipDataEntity: Record<
    string,
    {
      byId: Record<string, Ownership>;
      allIds: number[];
    }
  >;
  ownershipTermDetails: Record<
    string,
    {
      byId: Record<string, Ownership>;
      allIds: number[];
    }
  >;
}

export interface DataCollaborationState {
  messages: { messagesByDate: MessagesByDate; pageInfo: PageInfo<string> };
  relatedMessages: { messages: Message[]; pageInfo: PageInfo<string> };
}

export interface DataEntitiesState {
  byId: Record<string, GeneratedDataEntity & DataEntityDetailsState>;
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
  dataEntitySearchHighlightById: Record<number, DataEntitySearchHighlight>;
}

export interface AlertsState {
  alerts: PaginatedResponse<Alert[]> & { totals: AlertTotals };
  dataEntityAlerts: Record<number, PaginatedResponse<Alert[]> & { alertCount: number }>;
  configs: EntityState<AlertsConfig>;
}

export interface ProfileState {
  owner: AssociatedOwner;
  permissions: Record<PermissionResourceType, Record<number, Permission[]>>;
}

export interface OwnerAssociationState {
  newRequests: { pageInfo: CurrentPageInfo } & EntityState<OwnerAssociationRequest>;
  resolvedRequests: { pageInfo: CurrentPageInfo } & EntityState<OwnerAssociationRequest>;
}

export interface AppInfoState {
  activeFeatures: Feature[];
}

export interface TermsState {
  byId: Record<string, TermDetails>;
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
  linkedItemsIdsByTermId: Record<string, number[]>;
  pageInfo: CurrentPageInfo;
}

export interface ActivitiesState {
  activities: {
    activitiesByType: Record<
      ActivityType,
      {
        itemsByDate: Record<string, Activity[]>;
        pageInfo: PageInfo<number>;
      }
    >;
    counts: ActivityCountInfo;
  };
  dataEntityActivities: Record<
    number,
    {
      itemsByDate: Record<string, Activity[]>;
      pageInfo: PageInfo<number>;
    }
  >;
}

export interface RolesState extends EntityState<Role> {
  pageInfo: CurrentPageInfo;
}

export interface PoliciesState {
  policies: { pageInfo: CurrentPageInfo } & EntityState<Policy>;
  policyDetails: EntityState<PolicyDetails>;
  policySchema: Record<string, unknown>;
}
