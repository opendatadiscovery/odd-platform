import { createSelector } from '@reduxjs/toolkit';
import type { DataEntityLineageState, RootState } from 'redux/interfaces';
import {
  createErrorSelector,
  createStatusesSelector,
} from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';

const dataEntitiesState = ({ dataEntityLineage }: RootState): DataEntityLineageState =>
  dataEntityLineage;

export const getUpstreamLineageFetchingStatuses = createStatusesSelector(
  actions.fetchDataEntityUpstreamLineageActionType
);
export const getUpstreamLineageFetchingError = createErrorSelector(
  actions.fetchDataEntityUpstreamLineageActionType
);

export const getDownstreamLineageFetchingStatuses = createStatusesSelector(
  actions.fetchDataEntityDownstreamLineageActionType
);
export const getDownstreamLineageFetchingError = createErrorSelector(
  actions.fetchDataEntityDownstreamLineageActionType
);

export const getDataEntityLineage = (dataEntityId: number) =>
  createSelector(dataEntitiesState, dataEntityLineage => dataEntityLineage[dataEntityId]);
