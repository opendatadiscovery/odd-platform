import { ThunkAction } from '@reduxjs/toolkit';
import { ActionType } from 'typesafe-actions';
import { Dictionary } from 'lodash';
import {
  DataSource,
  DataEntity,
  DataEntityDetails,
  MetadataField,
  Tag,
  Label,
  MetadataFieldValue,
  Owner,
  DataSetField,
  DataSetVersion,
  Ownership,
  DataEntityType,
  DataEntitySubType,
  DataEntityRef,
  AssociatedOwner,
  DataQualityTest,
  DataQualityTestRun,
  DataSetTestReport,
  AlertTotals,
  Alert,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { DataSetQualityTestsStatusCount } from 'redux/interfaces/dataQualityTest';
import { LoaderState } from './loader';
import { DataSetStructureTypesCount } from './datasetStructure';
import {
  SearchTotalsByName,
  SearcFacetsByName,
  FacetOptionsByName,
} from './search';
import { DataEntityLineageById } from './dataentityLineage';
import { CurrentPageInfo } from './common';

export interface DataSourcesState {
  byId: { [dataSourceId: string]: DataSource };
  allIds: number[];
  pageInfo?: CurrentPageInfo;
}

export interface TagsState {
  byId: { [tagId: number]: Tag };
  allIds: number[];
  pageInfo?: CurrentPageInfo;
}

export interface LabelsState {
  byId: { [labelId: number]: Label };
  allIds: number[];
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
  ownership: {
    [dataEntityId: string]: {
      byId: { [ownershipId: string]: Ownership };
      allIds: number[];
    };
  };
}

export interface DataEntitiesState {
  byId: {
    [dataEntityId: string]: DataEntity & DataEntityDetails;
  };
  allIds: number[];
  my: DataEntityRef[];
  myUpstream: DataEntityRef[];
  myDownstream: DataEntityRef[];
  popular: DataEntityRef[];
  typesDict: {
    types: Dictionary<DataEntityType>;
    subtypes: Dictionary<DataEntitySubType>;
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
  facetState: SearcFacetsByName;
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

export type RootState = {
  dataSources: DataSourcesState;
  search: SearchState;
  loader: LoaderState;
  dataEntities: DataEntitiesState;
  tags: TagsState;
  metaData: MetaDataState;
  owners: OwnersState;
  datasetStructure: DatasetStructureState;
  labels: LabelsState;
  dataEntityLineage: DataEntityLineageState;
  profile: ProfileState;
  dataQualityTest: DataQualityTestState;
  alerts: AlertsState;
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
