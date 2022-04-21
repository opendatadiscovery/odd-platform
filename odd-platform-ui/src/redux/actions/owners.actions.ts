import { createAsyncAction } from 'typesafe-actions';
import { OwnerList, Owner, Ownership, RoleList } from 'generated-sources';
import {
  PaginatedResponse,
  PartialEntityUpdateParams,
  PartialTermDetailsUpdateParams,
} from 'redux/interfaces';

export const fetchOwnersAction = createAsyncAction(
  'GET_OWNERS__REQUEST',
  'GET_OWNERS__SUCCESS',
  'GET_OWNERS__FAILURE'
)<undefined, PaginatedResponse<OwnerList>, undefined>();

export const createOwnerAction = createAsyncAction(
  'POST_OWNERS__REQUEST',
  'POST_OWNERS__SUCCESS',
  'POST_OWNERS__FAILURE'
)<undefined, Owner, undefined>();

export const updateOwnerAction = createAsyncAction(
  'PUT_OWNER__REQUEST',
  'PUT_OWNER__SUCCESS',
  'PUT_OWNER__FAILURE'
)<undefined, Owner, undefined>();

export const deleteOwnerAction = createAsyncAction(
  'DELETE_OWNER__REQUEST',
  'DELETE_OWNER__SUCCESS',
  'DELETE_OWNER__FAILURE'
)<undefined, number, undefined>();

export const createDataEntityOwnershipAction = createAsyncAction(
  'POST_DATA_ENTITY_OWNERSHIP__REQUEST',
  'POST_DATA_ENTITY_OWNERSHIP__SUCCESS',
  'POST_DATA_ENTITY_OWNERSHIP__FAILURE'
)<undefined, PartialEntityUpdateParams<Ownership>, undefined>();

export const updateDataEntityOwnershipAction = createAsyncAction(
  'PUT_DATA_ENTITY_OWNERSHIP__REQUEST',
  'PUT_DATA_ENTITY_OWNERSHIP__SUCCESS',
  'PUT_DATA_ENTITY_OWNERSHIP__FAILURE'
)<undefined, PartialEntityUpdateParams<Ownership>, undefined>();

export const deleteDataEntityOwnershipAction = createAsyncAction(
  'DELETE_DATA_ENTITY_OWNERSHIP__REQUEST',
  'DELETE_DATA_ENTITY_OWNERSHIP__SUCCESS',
  'DELETE_DATA_ENTITY_OWNERSHIP__FAILURE'
)<undefined, PartialEntityUpdateParams<number>, undefined>();

export const createTermDetailsOwnershipAction = createAsyncAction(
  'POST_TERM_DETAILS_OWNERSHIP__REQUEST',
  'POST_TERM_DETAILS_OWNERSHIP__SUCCESS',
  'POST_TERM_DETAILS_OWNERSHIP__FAILURE'
)<undefined, PartialTermDetailsUpdateParams<Ownership>, undefined>();

export const updateTermDetailsOwnershipAction = createAsyncAction(
  'PUT_TERM_DETAILS_OWNERSHIP__REQUEST',
  'PUT_TERM_DETAILS_OWNERSHIP__SUCCESS',
  'PUT_TERM_DETAILS_OWNERSHIP__FAILURE'
)<undefined, PartialTermDetailsUpdateParams<Ownership>, undefined>();

export const deleteTermDetailsOwnershipAction = createAsyncAction(
  'DELETE_TERM_DETAILS_OWNERSHIP__REQUEST',
  'DELETE_TERM_DETAILS_OWNERSHIP__SUCCESS',
  'DELETE_TERM_DETAILS_OWNERSHIP__FAILURE'
)<undefined, PartialTermDetailsUpdateParams<number>, undefined>();

export const fetchRolesAction = createAsyncAction(
  'GET_OWNERSHIP_ROLES__REQUEST',
  'GET_OWNERSHIP_ROLES__SUCCESS',
  'GET_OWNERSHIP_ROLES__FAILURE'
)<undefined, RoleList, undefined>();
