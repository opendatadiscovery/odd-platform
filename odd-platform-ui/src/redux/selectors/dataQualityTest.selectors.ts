import { createSelector } from '@reduxjs/toolkit';
import {
  DataEntitiesState,
  DataQualityTestState,
  RootState,
} from 'redux/interfaces';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';

import isEmpty from 'lodash/isEmpty';
import { getDataEntityId } from './dataentity.selectors';

const getDataQualityTestState = ({
  dataQualityTest,
}: RootState): DataQualityTestState => dataQualityTest;

export const getDataQATestId = (
  _: RootState,
  dataQATestId: number | string
) => dataQATestId;

const getDataEntitiesState = ({
  dataEntities,
}: RootState): DataEntitiesState => dataEntities;

export const getDatasetTestReportFetchingStatuses = createStatusesSelector(
  actions.fetchDataSetQualityTestReportActionType
);

export const getDatasetTestListFetchingStatuses = createStatusesSelector(
  actions.fetchDataSetQualityTestListActionType
);

export const getDatasetTestReport = createSelector(
  getDataQualityTestState,
  getDataEntityId,
  (dataQualityTestState, dataEntityId) =>
    dataQualityTestState.datasetTestReportByEntityId[dataEntityId]
);

export const getDatasetQualityTestsBySuiteNames = createSelector(
  getDataQualityTestState,
  getDataEntityId,
  (dataQualityTestState, dataEntityId) => {
    if (
      isEmpty(dataQualityTestState.allSuiteNamesByDatasetId[dataEntityId])
    ) {
      return {};
    }
    const suitNamesByDatasetId = Object.entries(
      dataQualityTestState.allSuiteNamesByDatasetId[dataEntityId]
    ).map(([key, values]) => {
      const newValues = values.map(
        id => dataQualityTestState.qualityTestsById[id]
      );
      return [key, newValues];
    });
    return Object.fromEntries(suitNamesByDatasetId);
  }
);

export const getTestReportListBySuiteName = createSelector(
  getDataQualityTestState,
  dataQualityTestState => dataQualityTestState.testReportBySuiteName
);

export const getQualityTestByTestId = createSelector(
  getDataQualityTestState,
  getDataQATestId,
  (dataQualityTestState, dataQATestId) =>
    dataQualityTestState.qualityTestsById[dataQATestId]
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
