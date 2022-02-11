import { createAsyncAction } from 'typesafe-actions';
import { Token } from 'generated-sources';

// export const fetchTokensAction = createAsyncAction(
//   'GET_TOKEN_LIST__REQUEST',
//   'GET_TOKEN_LIST__SUCCESS',
//   'GET_TOKEN_LIST__FAILURE'
// )<undefined, PaginatedResponse<TokenList>, undefined>();

export const updateTokenAction = createAsyncAction(
  'PUT_TOKEN__REQUEST',
  'PUT_TOKEN__SUCCESS',
  'PUT_TOKEN__FAILURE'
)<undefined, Token, undefined>();
