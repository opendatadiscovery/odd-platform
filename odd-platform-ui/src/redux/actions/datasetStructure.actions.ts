import { createAsyncAction } from 'typesafe-actions';
import { DataSetStructure, EnumValueList } from 'generated-sources';
import {
  PartialEntityUpdateParams,
  UpdateDataSetFieldFormDataParams,
} from 'redux/interfaces';

export const fetchDataSetStructureAction = createAsyncAction(
  'GET_DATA_SET_STRUCTURE__REQUEST',
  'GET_DATA_SET_STRUCTURE__SUCCESS',
  'GET_DATA_SET_STRUCTURE__FAILURE'
)<
  undefined,
  PartialEntityUpdateParams<{
    datasetStructure: DataSetStructure;
    latest?: boolean;
  }>,
  undefined
>();

export const updateDataSetFieldFormDataParamsAction = createAsyncAction(
  'PUT_DATA_SET_FIELD_FORM_DATA__REQUEST',
  'PUT_DATA_SET_FIELD_FORM_DATA__SUCCESS',
  'PUT_DATA_SET_FIELD_FORM_DATA__FAILURE'
)<undefined, UpdateDataSetFieldFormDataParams, undefined>();

export const fetchDataSetFieldEnumAction = createAsyncAction(
  'GET_DATA_SET_FIELD_ENUM__REQUEST',
  'GET_DATA_SET_FIELD_ENUM__SUCCESS',
  'GET_DATA_SET_FIELD_ENUM__FAILURE'
)<undefined, PartialEntityUpdateParams<EnumValueList>, undefined>();

export const createDataSetFieldEnumAction = createAsyncAction(
  'POST_DATA_SET_FIELD_ENUM__REQUEST',
  'POST_DATA_SET_FIELD_ENUM__SUCCESS',
  'POST_DATA_SET_FIELD_ENUM__FAILURE'
)<undefined, PartialEntityUpdateParams<EnumValueList>, undefined>();
