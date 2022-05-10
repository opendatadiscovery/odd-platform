import { ThunkAction } from '@reduxjs/toolkit';
import { ActionType } from 'typesafe-actions';
import {
  Alert,
  AlertTotals,
  AppInfo,
  AssociatedOwner,
  DataEntity,
  DataEntityRef,
  DataEntityClass,
  DataEntityType,
  DataQualityTest,
  DataQualityTestRun,
  DataSetField,
  DataSetTestReport,
  DataSetVersion,
  DataSource,
  Collector,
  EnumValue,
  Label,
  MetadataField,
  MetadataFieldValue,
  Namespace,
  Owner,
  Ownership,
  Tag,
  Term,
  TermRef,
  TermDetails,
  TermRefList,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { DataSetQualityTestsStatusCount } from 'redux/interfaces/dataQualityTest';
// eslint-disable-next-line lodash/import-scope
import { Dictionary } from 'lodash';
import { DataSetStructureTypesCount } from './datasetStructure';
import {
  FacetOptionsByName,
  SearchFacetsByName,
  SearchTotalsByName,
} from './search';
import { DataEntityLineageById } from './dataentityLineage';
import { CurrentPageInfo } from './common';
import { DataEntityDetailsState } from './dataentities';
import { LoaderState } from './loader';
import {
  TermSearchFacetOptionsByName,
  TermSearchFacetsByName,
} from './termSearch';

export interface DataSourcesState {
  byId: { [dataSourceId: string]: DataSource };
  allIds: DataSource['id'][];
  pageInfo?: CurrentPageInfo;
}

export interface CollectorsState {
  byId: { [collectorId: string]: Collector };
  allIds: Collector['id'][];
  pageInfo?: CurrentPageInfo;
}

export interface TagsState {
  byId: { [tagId: number]: Tag };
  allIds: Tag['id'][];
  pageInfo?: CurrentPageInfo;
}

export interface LabelsState {
  byId: { [labelId: number]: Label };
  allIds: Label['id'][];
  pageInfo?: CurrentPageInfo;
}

export interface NamespacesState {
  byId: { [namespaceId: string]: Namespace };
  allIds: Namespace['id'][];
  pageInfo?: CurrentPageInfo;
}

export interface DataEntityGroupLinkedListState {
  linkedItemsIdsByDataEntityGroupId: {
    [dataEntityGroupId: string]: number[];
  };
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
  fieldById: {
    [fieldId: number]: DataSetField;
  };
  allFieldIdsByVersion: {
    [versionId: number]: {
      [parentFieldId: number]: DataSetField['id'][];
    };
  };
  statsByVersionId: {
    [versionId: number]: DataSetStructureTypesCount;
  };
  latestVersionByDataset: {
    [datasetId: string]: DataSetVersion['id'];
  };
  fieldEnumsByFieldId: {
    [fieldId: number]: EnumValue[];
  };
}

export interface DataQualityTestState {
  qualityTestsById: {
    [qualityTestId: string]: DataQualityTest;
  };
  allSuiteNamesByDatasetId: {
    [datasetId: string]: {
      [suiteName: string]: DataQualityTest['id'][];
    };
  };
  qualityTestRunsById: {
    [qualityTestRunId: string]: DataQualityTestRun;
  };
  allTestRunIdsByTestId: {
    [qualityTestId: string]: DataQualityTestRun['id'][];
  };
  qualityTestRunsPageInfo: CurrentPageInfo;
  datasetTestReportByEntityId: {
    [dataEntityId: string]: DataSetTestReport;
  };
  testReportBySuiteName: {
    [suiteName: string]: DataSetQualityTestsStatusCount;
  };
}

export interface DataEntityLineageState {
  [dataEntityId: string]: DataEntityLineageById;
}

export interface OwnersState {
  byId: { [ownerId: number]: Owner };
  allIds: number[];
  pageInfo?: CurrentPageInfo;
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

export interface DataEntitiesState {
  byId: {
    [dataEntityId: string]: DataEntity & DataEntityDetailsState;
  };
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

export interface SearchState {
  searchId: string;
  query: string;
  myObjects: boolean;
  facets: FacetOptionsByName;
  isFacetsStateSynced: boolean;
  totals: SearchTotalsByName;
  results: {
    items: DataEntity[];
    pageInfo: CurrentPageInfo;
  };
  suggestions: DataEntityRef[];
  facetState: SearchFacetsByName;
}

export interface AlertsState {
  totals: AlertTotals;
  pageInfo: CurrentPageInfo;
  byId: {
    [alertId: string]: Alert;
  };
  allIds: Alert['id'][];
  alertIdsByDataEntityId: {
    [dataEntityId: string]: Alert['id'][];
  };
}

export interface ProfileState {
  owner?: AssociatedOwner;
}

export interface AppInfoState {
  appInfo?: AppInfo;
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
  results: {
    items: Term[];
    pageInfo: CurrentPageInfo;
  };
  suggestions: TermRefList;
  facetState: TermSearchFacetsByName;
}

export interface TermGroupLinkedListState {
  linkedItemsIdsByTermId: {
    [termId: string]: number[];
  };
  pageInfo?: CurrentPageInfo;
}

export type RootState = {
  appInfo: AppInfoState;
  dataSources: DataSourcesState;
  search: SearchState;
  loader: LoaderState;
  dataEntities: DataEntitiesState;
  tags: TagsState;
  metaData: MetaDataState;
  owners: OwnersState;
  datasetStructure: DatasetStructureState;
  labels: LabelsState;
  namespaces: NamespacesState;
  dataEntityLineage: DataEntityLineageState;
  profile: ProfileState;
  dataQualityTest: DataQualityTestState;
  alerts: AlertsState;
  dataEntityGroupLinkedList: DataEntityGroupLinkedListState;
  termLinkedList: TermGroupLinkedListState;
  collectors: CollectorsState;
  terms: TermsState;
  termSearch: TermSearchState;
};

export type Action = ActionType<typeof actions>;

export type ThunkResult<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  undefined,
  Action
>;

export type PromiseThunkResult<ReturnType = void> = ThunkResult<
  Promise<ReturnType>
>;
