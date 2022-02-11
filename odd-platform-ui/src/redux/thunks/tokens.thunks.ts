import {
  Configuration,
  Token,
  TokenApi,
  // TokenApiGetTokensListRequest,
  TokenApiUpdateTokenRequest,
  // TokenList,
} from 'generated-sources';
import { BASE_PARAMS } from 'lib/constants';
// import { PaginatedResponse } from 'redux/interfaces';
import * as actions from '../actions';
import { createThunk } from './base.thunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new TokenApi(apiClientConf);

// export const fetchTokensList = createThunk<
//   TokenApiGetTokensListRequest,
//   TokenList,
//   PaginatedResponse<TokenList>
// >(
//   (params: TokenApiGetTokensListRequest) =>
//     apiClient.getTokensList(params),
//   actions.fetchTokensAction,
//   (
//     response: TokenList,
//     request: TokenApiGetTokensListRequest,
//   ) => ({
//     ...response,
//     pageInfo: {
//       ...response.pageInfo,
//       page: request.page,
//       hasNext: request.size * request.page < response.pageInfo.total,
//     }
//   })
// );

export const updateToken = createThunk<
  TokenApiUpdateTokenRequest,
  Token,
  Token
>(
  (params: TokenApiUpdateTokenRequest) => apiClient.updateToken(params),
  actions.updateTokenAction,
  (result: Token) => result
);
