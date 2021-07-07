import { createAsyncAction } from 'typesafe-actions';
import { DataSetStructure } from 'generated-sources';
import { PartialDataEntityUpdateParams } from 'redux/interfaces/dataentities';
import {
  UpdateDataSetFieldInternalDescriptionParams,
  UpdateDataSetFieldLabelsParams,
} from 'redux/interfaces/datasetStructure';

export const fetchDataSetStructureAction = createAsyncAction(
  'GET_DATA_SET_STRUCTURE__REQUEST',
  'GET_DATA_SET_STRUCTURE__SUCCESS',
  'GET_DATA_SET_STRUCTURE__FAILURE'
)<
  undefined,
  PartialDataEntityUpdateParams<{
    datasetStructure: DataSetStructure;
    latest?: boolean;
  }>,
  undefined
>();

export const updateDataSetFieldInternalDescriptionParamsAction = createAsyncAction(
  'PUT_DATA_SET_FIELD_INTERNAL_DESCRIPTION__REQUEST',
  'PUT_DATA_SET_FIELD_INTERNAL_DESCRIPTION__SUCCESS',
  'PUT_DATA_SET_FIELD_INTERNAL_DESCRIPTION__FAILURE'
)<undefined, UpdateDataSetFieldInternalDescriptionParams, undefined>();

export const updateDataSetFieldLabelsParamsAction = createAsyncAction(
  'PUT_DATA_SET_FIELD_LABELS__REQUEST',
  'PUT_DATA_SET_FIELD_LABELS__SUCCESS',
  'PUT_DATA_SET_FIELD_LABELS__FAILURE'
)<undefined, UpdateDataSetFieldLabelsParams, undefined>();
