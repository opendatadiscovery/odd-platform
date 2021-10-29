import { PromiseThunkResult, Action } from 'redux/interfaces';
import { ErrorState } from '../interfaces';

export const createThunk = <
  ReqParamsType,
  ResType,
  SuccessActionParamsType = ResType
>(
  thunkRequest: (requestParameters: ReqParamsType) => Promise<ResType>,
  action: {
    request: () => Action;
    success: (actionParams: SuccessActionParamsType) => Action;
    failure: (e: ErrorState) => Action;
  },
  getSuccessActionParams: (
    response: ResType,
    reqParams: ReqParamsType
  ) => SuccessActionParamsType
) => (
  params: ReqParamsType
): PromiseThunkResult<ResType> => async dispatch => {
  const reqPromise = thunkRequest(params);
  dispatch(action.request());
  try {
    const result: ResType = await reqPromise;
    dispatch(action.success(getSuccessActionParams(result, params)));
  } catch (e) {
    dispatch(
      action.failure({ statusCode: e?.status, statusText: e?.statusText })
    );
  }
  return reqPromise;
};
