import { createSelector } from '@reduxjs/toolkit';
import type {
  DataEntitiesState,
  DataQualityTestState,
  RootState,
  DatasetQualityTestList,
} from 'redux/interfaces';
import {
  createErrorSelector,
  createStatusesSelector,
} from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';
import isEmpty from 'lodash/isEmpty';

const getDataQualityTestState = ({ dataQualityTest }: RootState): DataQualityTestState =>
  dataQualityTest;

export const getDataQATestId = (_: RootState, dataQATestId: number | string) =>
  dataQATestId;

const getDataEntitiesState = ({ dataEntities }: RootState): DataEntitiesState =>
  dataEntities;

export const getDatasetTestReportFetchingStatuses = createStatusesSelector(
  actions.fetchDataSetQualityTestReportActionType
);

export const getDatasetSLAReportFetchingStatuses = createStatusesSelector(
  actions.fetchDataSetQualitySLAReportActionType
);

export const getDatasetTestListFetchingStatuses = createStatusesSelector(
  actions.fetchDataSetQualityTestListActionType
);
export const getDatasetTestListFetchingError = createErrorSelector(
  actions.fetchDataSetQualityTestListActionType
);

export const getDatasetTestReport = (dataEntityId: number) =>
  createSelector(
    getDataQualityTestState,
    dataQualityTestState => dataQualityTestState.datasetTestReportByEntityId[dataEntityId]
  );

export const getDatasetSLAReport = (dataEntityId: number) =>
  createSelector(
    getDataQualityTestState,
    dataQualityTestState =>
      dataQualityTestState.datasetSLAReportByEntityId[dataEntityId] || undefined
  );

export const getDatasetTestReportTotal = (dataEntityId: number) =>
  createSelector(
    getDataQualityTestState,
    dataQualityTestState =>
      dataQualityTestState.datasetTestReportByEntityId[dataEntityId]?.total
  );

export const getDatasetQualityTestsBySuiteNames = (dataEntityId: number) =>
  createSelector(
    getDataQualityTestState,
    (dataQualityTestState): DatasetQualityTestList | undefined => {
      if (isEmpty(dataQualityTestState.allSuiteNamesByDatasetId[dataEntityId])) {
        return undefined;
      }
      const suitNamesByDatasetId = Object.entries(
        dataQualityTestState.allSuiteNamesByDatasetId[dataEntityId]
      ).map(([key, values]) => {
        const newValues = values.map(id => dataQualityTestState.qualityTestsById[id]);
        return [key, newValues];
      });
      return Object.fromEntries(suitNamesByDatasetId);
    }
  );

export const getTestReportListBySuiteName = createSelector(
  getDataQualityTestState,
  dataQualityTestState => dataQualityTestState.testReportBySuiteName
);

export const getQualityTestByTestId = (dataQATestId: number) =>
  createSelector(
    getDataQualityTestState,
    dataQualityTestState => dataQualityTestState.qualityTestsById[dataQATestId]
  );

export const getQualityTestNameByTestId = createSelector(
  getDataEntitiesState,
  getDataQualityTestState,
  getDataQATestId,
  (dataEntitiesState, dataQualityTestState, dataQATestId) =>
    dataEntitiesState.byId[dataQATestId]?.internalName ||
    dataEntitiesState.byId[dataQATestId]?.externalName ||
    dataQualityTestState.qualityTestsById[dataQATestId]?.internalName ||
    dataQualityTestState.qualityTestsById[dataQATestId]?.externalName
);
