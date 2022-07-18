import { EntityState, ThunkAction } from '@reduxjs/toolkit';
import { ActionType } from 'typesafe-actions';
import {
  Alert,
  AlertTotals,
  AppInfo,
  AssociatedOwner,
  Collector,
  DataEntity,
  DataEntityClass,
  DataEntityRef,
  DataEntityRun,
  DataEntityType,
  DataQualityTest,
  DataSetField,
  DataSetTestReport,
  DataSetVersion,
  DataSource,
  EnumValue,
  Label,
  MetadataField,
  MetadataFieldValue,
  Namespace,
  Owner,
  Ownership,
  Tag,
  Term,
  TermDetails,
  TermRefList,
  DataEntityUsageInfo,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { DataSetQualityTestsStatusCount } from 'redux/interfaces/dataQualityTest';
// eslint-disable-next-line lodash/import-scope
import { Dictionary } from 'lodash';
import { store } from 'redux/store';
import { DataSetStructureTypesCount } from './datasetStructure';
import {
  FacetOptionsByName,
  SearchFacetsByName,
  SearchTotalsByName,
} from './search';
import { DataEntityLineageById } from './dataentityLineage';
import { CurrentPageInfo } from './common';
import { DataEntityDetailsState } from './dataentities';
import {
  TermSearchFacetOptionsByName,
  TermSearchFacetsByName,
} from './termSearch';

export interface DataSourcesState extends EntityState<DataSource> {
  pageInfo?: CurrentPageInfo;
}

export interface CollectorsState extends EntityState<Collector> {
  pageInfo?: CurrentPageInfo;
}

export interface TagsState extends EntityState<Tag> {
  pageInfo?: CurrentPageInfo;
}

export interface LabelsState extends EntityState<Label> {
  pageInfo?: CurrentPageInfo;
}

export interface NamespacesState extends EntityState<Namespace> {
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
    [qualityTestRunId: string]: DataEntityRun;
  };
  allTestRunIdsByTestId: {
    [qualityTestId: string]: DataEntityRun['id'][];
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
  dataEntityUsageInfo: DataEntityUsageInfo;
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

export interface AlertsState extends EntityState<Alert> {
  totals: AlertTotals;
  pageInfo: CurrentPageInfo;
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

export interface TermLinkedListState {
  linkedItemsIdsByTermId: {
    [termId: string]: number[];
  };
  pageInfo?: CurrentPageInfo;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

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
